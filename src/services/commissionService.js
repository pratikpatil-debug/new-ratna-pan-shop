import { db, isFirebaseConfigured } from './firebase/config.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';

export const COMMISSION_RATE = 2; // ₹2 per completed sold unit

const STORAGE_SETTLEMENTS_KEY = 'nr_commission_settlements_v1';
const STORAGE_PAYMENTS_KEY = 'nr_commission_payments_v1';
const STORAGE_COMMISSIONS_KEY = 'nr_commissions_v1';
const STORAGE_UPI_CONFIG_KEY = 'nr_receiving_upi_config_v1';

const commissionMemoryStore = new Map();

const safeGet = (key) => {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
  } catch (e) {}
  return commissionMemoryStore.get(key) || null;
};

const safeSet = (key, val) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, val);
  } catch (e) {}
  commissionMemoryStore.set(key, val);
};

// Date & Period formatting utilities
export const getPeriodId = (dateInput) => {
  const d = dateInput ? new Date(dateInput) : new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

export const getPeriodLabel = (periodId) => {
  if (!periodId) return '';
  const [year, month] = periodId.split('-');
  const date = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return date.toLocaleString('default', { month: 'long', year: 'numeric' });
};

export const getPeriodRange = (periodId) => {
  const [yearStr, monthStr] = (periodId || getPeriodId()).split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const lastDay = new Date(year, month, 0).getDate();
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
  return { start, end };
};

// Local storage helpers
const getLocalSettlements = () => {
  try {
    const data = safeGet(STORAGE_SETTLEMENTS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [];
};

const saveLocalSettlements = (settlements) => {
  safeSet(STORAGE_SETTLEMENTS_KEY, JSON.stringify(settlements));
};

const getLocalPayments = () => {
  try {
    const data = safeGet(STORAGE_PAYMENTS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [];
};

const saveLocalPayments = (payments) => {
  safeSet(STORAGE_PAYMENTS_KEY, JSON.stringify(payments));
};

const getLocalCommissions = () => {
  try {
    const data = safeGet(STORAGE_COMMISSIONS_KEY);
    if (data) return JSON.parse(data);
  } catch (e) {}
  return [];
};

const saveLocalCommissions = (commissions) => {
  safeSet(STORAGE_COMMISSIONS_KEY, JSON.stringify(commissions));
};

const localListeners = new Set();
const notifyLocalListeners = () => {
  localListeners.forEach((fn) => {
    try {
      fn();
    } catch (e) {}
  });
};

export const commissionService = {
  COMMISSION_RATE,

  /**
   * Get receiving UPI configuration for App Owner
   */
  getReceivingUpiConfig() {
    try {
      const data = safeGet(STORAGE_UPI_CONFIG_KEY);
      if (data) return JSON.parse(data);
    } catch (e) {}
    return {
      ownerUpiId: 'newratna.owner@okhdfcbank',
      ownerName: 'App Owner (New Ratna Operations)',
      ownerPhone: '9820198201',
      ownerQrCodeUrl: ''
    };
  },

  /**
   * Update receiving UPI configuration (Admin only)
   */
  saveReceivingUpiConfig(config) {
    const updated = {
      ownerUpiId: config.ownerUpiId || '',
      ownerName: config.ownerName || '',
      ownerPhone: config.ownerPhone || '',
      ownerQrCodeUrl: config.ownerQrCodeUrl || '',
      updatedAt: new Date().toISOString()
    };
    safeSet(STORAGE_UPI_CONFIG_KEY, JSON.stringify(updated));
    return updated;
  },

  /**
   * Compute commission records from completed orders
   */
  calculateCommissionsFromOrders(orders = []) {
    const completedOrders = orders.filter((o) => {
      const status = String(o.status || o.orderStatus || '').toLowerCase();
      return status === 'completed' || status === 'collected';
    });

    return completedOrders.map((order) => {
      const items = order.items || [];
      const totalSoldQuantity = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      const earnedCommission = totalSoldQuantity * COMMISSION_RATE;
      const orderDate = order.completedAt || order.updatedAt || order.createdAt || new Date().toISOString();
      const periodId = getPeriodId(orderDate);

      return {
        commissionId: `comm_${order.id}`,
        orderId: String(order.id),
        tokenNumber: order.tokenNumber || order.token || order.id,
        customerName: order.customerName || 'Valued Customer',
        totalSoldQuantity,
        commissionRate: COMMISSION_RATE,
        earnedCommission,
        orderTotal: order.total !== undefined ? order.total : (order.grandTotal || 0),
        status: 'EARNED',
        periodId,
        orderDate,
        createdAt: orderDate
      };
    });
  },

  /**
   * Build complete settlement period statistics
   */
  computeSettlementState(periodId, completedOrders = [], payments = [], adjustments = [], disputeReason = null) {
    const periodCommissions = completedOrders.filter((o) => {
      const orderDate = o.completedAt || o.updatedAt || o.createdAt || new Date().toISOString();
      return getPeriodId(orderDate) === periodId;
    });

    const totalCompletedQuantity = periodCommissions.reduce((sum, order) => {
      const items = order.items || [];
      return sum + items.reduce((s, it) => s + (Number(it.quantity) || 1), 0);
    }, 0);

    const baseGrossCommission = totalCompletedQuantity * COMMISSION_RATE;

    // Apply adjustments (bonus, correction, reversal)
    const netAdjustments = adjustments.reduce((sum, adj) => sum + (Number(adj.amount) || 0), 0);
    const grossCommission = Math.max(0, baseGrossCommission + netAdjustments);

    // Sum valid (non-voided) payments for this period
    const validPayments = payments.filter((p) => p.periodId === periodId && p.status !== 'VOIDED');
    const paidAmount = validPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
    const pendingAmount = Math.max(0, grossCommission - paidAmount);

    let status = 'PENDING';
    if (disputeReason) {
      status = 'DISPUTED';
    } else if (grossCommission > 0 && paidAmount >= grossCommission) {
      status = 'PAID';
    } else if (paidAmount > 0 && paidAmount < grossCommission) {
      status = 'PARTIALLY_PAID';
    } else {
      status = 'PENDING';
    }

    const range = getPeriodRange(periodId);

    return {
      settlementId: `settlement_${periodId}`,
      periodId,
      periodLabel: getPeriodLabel(periodId),
      periodStart: range.start,
      periodEnd: range.end,
      grossCommission,
      baseGrossCommission,
      totalCompletedQuantity,
      commissionRate: COMMISSION_RATE,
      paidAmount,
      pendingAmount,
      status,
      disputeReason: disputeReason || null,
      adjustments: adjustments || [],
      payments: validPayments,
      allPayments: payments.filter((p) => p.periodId === periodId),
      orderCount: periodCommissions.length,
      updatedAt: new Date().toISOString()
    };
  },

  /**
   * Get all settlements across past and current periods
   */
  getSettlementsOverview(orders = []) {
    const completedOrders = orders.filter((o) => {
      const status = String(o.status || o.orderStatus || '').toLowerCase();
      return status === 'completed' || status === 'collected';
    });

    const allPayments = getLocalPayments();
    const storedSettlements = getLocalSettlements();

    // Identify all distinct periods present in orders or payments or current month
    const periodsSet = new Set();
    periodsSet.add(getPeriodId(new Date()));

    // Also include previous month
    const prevMonth = new Date();
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    periodsSet.add(getPeriodId(prevMonth));

    completedOrders.forEach((o) => {
      const d = o.completedAt || o.updatedAt || o.createdAt;
      if (d) periodsSet.add(getPeriodId(d));
    });

    allPayments.forEach((p) => {
      if (p.periodId) periodsSet.add(p.periodId);
    });

    storedSettlements.forEach((s) => {
      if (s.periodId) periodsSet.add(s.periodId);
    });

    const sortedPeriods = Array.from(periodsSet).sort().reverse();

    return sortedPeriods.map((periodId) => {
      const stored = storedSettlements.find((s) => s.periodId === periodId) || {};
      return this.computeSettlementState(
        periodId,
        completedOrders,
        allPayments,
        stored.adjustments || [],
        stored.disputeReason || null
      );
    });
  },

  /**
   * Record a new settlement payment
   */
  async recordPayment({
    settlementId,
    periodId,
    amount,
    paymentDate,
    paymentMethod = 'UPI',
    paymentReference = '',
    paymentNote = '',
    paymentProofUrl = '',
    createdBy = 'Admin'
  }) {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      throw new Error('Payment amount must be greater than ₹0.');
    }

    const cleanRef = String(paymentReference || '').trim();

    // Idempotency check: prevent duplicate reference in non-voided payments
    if (cleanRef) {
      const allPayments = getLocalPayments();
      const duplicate = allPayments.find(
        (p) =>
          p.status !== 'VOIDED' &&
          p.periodId === periodId &&
          String(p.paymentReference || '').trim().toLowerCase() === cleanRef.toLowerCase()
      );
      if (duplicate) {
        throw new Error(`A payment with reference "${cleanRef}" has already been recorded for this period.`);
      }
    }

    const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const newPayment = {
      paymentId,
      settlementId: settlementId || `settlement_${periodId}`,
      periodId,
      amount: numAmount,
      paymentDate: paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: paymentMethod.toUpperCase(),
      paymentReference: cleanRef,
      paymentNote: paymentNote.trim(),
      paymentProofUrl: paymentProofUrl || '',
      status: 'PAID',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy
    };

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'commissionPayments', paymentId), {
          ...newPayment,
          createdAtTimestamp: serverTimestamp()
        });
      } catch (err) {
        console.warn('Firestore payment record fallback to local:', err);
      }
    }

    const localPayments = getLocalPayments();
    localPayments.unshift(newPayment);
    saveLocalPayments(localPayments);
    notifyLocalListeners();

    return newPayment;
  },

  /**
   * Mark a payment as VOIDED (Never delete payment records permanently)
   */
  async voidPayment(paymentId, voidReason = '', voidedBy = 'Admin') {
    if (!voidReason || !voidReason.trim()) {
      throw new Error('A reason is required to void a recorded payment.');
    }

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'commissionPayments', paymentId), {
          status: 'VOIDED',
          voidReason: voidReason.trim(),
          voidedBy,
          voidedAt: new Date().toISOString(),
          updatedAtTimestamp: serverTimestamp()
        });
      } catch (err) {
        console.warn('Firestore void payment fallback to local:', err);
      }
    }

    const localPayments = getLocalPayments();
    const idx = localPayments.findIndex((p) => p.paymentId === paymentId);
    if (idx > -1) {
      localPayments[idx] = {
        ...localPayments[idx],
        status: 'VOIDED',
        voidReason: voidReason.trim(),
        voidedBy,
        voidedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      saveLocalPayments(localPayments);
      notifyLocalListeners();
      return localPayments[idx];
    }
    throw new Error('Payment record not found.');
  },

  /**
   * Update payment proof URL
   */
  async updatePaymentProof(paymentId, paymentProofUrl) {
    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'commissionPayments', paymentId), {
          paymentProofUrl: paymentProofUrl || '',
          updatedAt: new Date().toISOString(),
          updatedAtTimestamp: serverTimestamp()
        });
      } catch (err) {
        console.warn('Firestore update proof fallback to local:', err);
      }
    }

    const localPayments = getLocalPayments();
    const idx = localPayments.findIndex((p) => p.paymentId === paymentId);
    if (idx > -1) {
      localPayments[idx].paymentProofUrl = paymentProofUrl || '';
      localPayments[idx].updatedAt = new Date().toISOString();
      saveLocalPayments(localPayments);
      notifyLocalListeners();
      return localPayments[idx];
    }
  },

  /**
   * Add an audit adjustment to a settlement
   */
  async addAdjustment({ periodId, amount, type = 'CORRECTION', reason = '', createdBy = 'Admin' }) {
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount === 0) {
      throw new Error('Adjustment amount cannot be zero.');
    }
    if (!reason || !reason.trim()) {
      throw new Error('A reason is required for adjustments.');
    }

    const adjustmentId = `adj_${Date.now()}`;
    const newAdj = {
      id: adjustmentId,
      amount: numAmount,
      type: type.toUpperCase(),
      reason: reason.trim(),
      createdBy,
      createdAt: new Date().toISOString()
    };

    const storedSettlements = getLocalSettlements();
    let settlement = storedSettlements.find((s) => s.periodId === periodId);
    if (!settlement) {
      settlement = {
        settlementId: `settlement_${periodId}`,
        periodId,
        adjustments: [],
        disputeReason: null
      };
      storedSettlements.push(settlement);
    }

    settlement.adjustments = settlement.adjustments || [];
    settlement.adjustments.push(newAdj);
    settlement.updatedAt = new Date().toISOString();

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'commissionSettlements', `settlement_${periodId}`), settlement, { merge: true });
      } catch (err) {
        console.warn('Firestore adjustment record fallback to local:', err);
      }
    }

    saveLocalSettlements(storedSettlements);
    notifyLocalListeners();
    return newAdj;
  },

  /**
   * Flag settlement as disputed
   */
  async markSettlementDisputed(periodId, disputeReason = '', disputedBy = 'Admin') {
    if (!disputeReason || !disputeReason.trim()) {
      throw new Error('A dispute reason is required.');
    }

    const storedSettlements = getLocalSettlements();
    let settlement = storedSettlements.find((s) => s.periodId === periodId);
    if (!settlement) {
      settlement = {
        settlementId: `settlement_${periodId}`,
        periodId,
        adjustments: [],
        disputeReason: null
      };
      storedSettlements.push(settlement);
    }

    settlement.disputeReason = disputeReason.trim();
    settlement.disputedBy = disputedBy;
    settlement.disputedAt = new Date().toISOString();
    settlement.status = 'DISPUTED';

    if (isFirebaseConfigured && db) {
      try {
        await setDoc(doc(db, 'commissionSettlements', `settlement_${periodId}`), settlement, { merge: true });
      } catch (err) {
        console.warn('Firestore dispute update fallback to local:', err);
      }
    }

    saveLocalSettlements(storedSettlements);
    notifyLocalListeners();
    return settlement;
  },

  /**
   * Resolve a settlement dispute
   */
  async resolveSettlementDispute(periodId) {
    const storedSettlements = getLocalSettlements();
    const settlement = storedSettlements.find((s) => s.periodId === periodId);
    if (settlement) {
      settlement.disputeReason = null;
      settlement.disputedAt = null;
      settlement.disputedBy = null;

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'commissionSettlements', `settlement_${periodId}`), settlement, { merge: true });
        } catch (err) {}
      }

      saveLocalSettlements(storedSettlements);
      notifyLocalListeners();
      return settlement;
    }
  },

  /**
   * Real-time subscription to commission payments
   */
  subscribeToPayments(onUpdate, onError) {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'commissionPayments'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const list = snapshot.docs.map((docSnap) => ({
              ...docSnap.data(),
              paymentId: docSnap.id
            }));
            saveLocalPayments(list);
            onUpdate(list);
          },
          (err) => {
            console.error('Payments subscription error:', err);
            onUpdate(getLocalPayments());
            if (onError) onError(err);
          }
        );
        return unsubscribe;
      } catch (e) {
        if (onError) onError(e);
      }
    }

    onUpdate(getLocalPayments());
    const listener = () => onUpdate(getLocalPayments());
    localListeners.add(listener);
    return () => localListeners.delete(listener);
  },

  /**
   * Export settlements to CSV format
   */
  exportSettlementsToCsv(settlements = []) {
    const headers = [
      'Settlement Period',
      'Period Start',
      'Period End',
      'Completed Quantity',
      'Commission Rate',
      'Gross Commission (Rs)',
      'Paid Amount (Rs)',
      'Pending Amount (Rs)',
      'Status'
    ];

    const rows = settlements.map((s) => [
      `"${s.periodLabel}"`,
      s.periodStart,
      s.periodEnd,
      s.totalCompletedQuantity,
      `Rs ${s.commissionRate}`,
      s.grossCommission,
      s.paidAmount,
      s.pendingAmount,
      s.status
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  },

  /**
   * Export payments to CSV format
   */
  exportPaymentsToCsv(payments = []) {
    const headers = [
      'Payment ID',
      'Date',
      'Period',
      'Amount (Rs)',
      'Method',
      'UTR / Reference',
      'Status',
      'Note',
      'Recorded By'
    ];

    const rows = payments.map((p) => [
      p.paymentId,
      p.paymentDate,
      `"${getPeriodLabel(p.periodId)}"`,
      p.amount,
      p.paymentMethod,
      `"${p.paymentReference || 'N/A'}"`,
      p.status,
      `"${(p.paymentNote || '').replace(/"/g, '""')}"`,
      `"${p.createdBy || 'Admin'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    return csvContent;
  }
};
