import React, { useState, useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { commissionService, getPeriodId, getPeriodLabel } from '../../services/commissionService';
import {
  Coins,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Upload,
  QrCode,
  Download,
  Plus,
  Ban,
  Eye,
  X,
  FileText,
  CreditCard,
  Building2,
  Banknote,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  Search,
  Filter,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export const AdminCommissionSettlements = () => {
  const {
    orders,
    currentAdminUser,
    showToast
  } = useStore();

  const [payments, setPayments] = useState([]);
  const [upiConfig, setUpiConfig] = useState(() => commissionService.getReceivingUpiConfig());
  const [activePeriodId, setActivePeriodId] = useState(() => getPeriodId(new Date()));
  const [copiedUpi, setCopiedUpi] = useState(false);

  // Modals
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isAdjustmentModalOpen, setIsAdjustmentModalOpen] = useState(false);
  const [isDisputeModalOpen, setIsDisputeModalOpen] = useState(false);
  const [proofPreviewUrl, setProofPreviewUrl] = useState(null);
  const [voidModalPayment, setVoidModalPayment] = useState(null);
  const [voidReason, setVoidReason] = useState('');

  // Payment Form state
  const [payAmount, setPayAmount] = useState('');
  const [payMethod, setPayMethod] = useState('UPI');
  const [payDate, setPayDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [payRef, setPayRef] = useState('');
  const [payNote, setPayNote] = useState('');
  const [payProofUrl, setPayProofUrl] = useState('');
  const [isSubmittingPay, setIsSubmittingPay] = useState(false);

  // Adjustment Form state
  const [adjAmount, setAdjAmount] = useState('');
  const [adjType, setAdjType] = useState('CORRECTION');
  const [adjReason, setAdjReason] = useState('');

  // Dispute Form state
  const [disputeReason, setDisputeReason] = useState('');

  // Config Form state
  const [cfgUpiId, setCfgUpiId] = useState(upiConfig.ownerUpiId || '');
  const [cfgName, setCfgName] = useState(upiConfig.ownerName || '');
  const [cfgPhone, setCfgPhone] = useState(upiConfig.ownerPhone || '');
  const [cfgQrUrl, setCfgQrUrl] = useState(upiConfig.ownerQrCodeUrl || '');

  // Search & Filter in Payments
  const [paymentSearch, setPaymentSearch] = useState('');
  const [paymentFilterStatus, setPaymentFilterStatus] = useState('ALL');

  // Real-time listener for payments
  useEffect(() => {
    const unsub = commissionService.subscribeToPayments((livePayments) => {
      setPayments(livePayments);
    });
    return () => {
      if (typeof unsub === 'function') unsub();
    };
  }, []);

  // Compute all settlements
  const settlements = commissionService.getSettlementsOverview(orders);
  const currentSettlement = settlements.find((s) => s.periodId === activePeriodId) || settlements[0] || {
    periodId: activePeriodId,
    periodLabel: getPeriodLabel(activePeriodId),
    grossCommission: 0,
    totalCompletedQuantity: 0,
    paidAmount: 0,
    pendingAmount: 0,
    status: 'PENDING',
    payments: []
  };

  // Grand totals across all periods
  const totalEarnedAllTime = settlements.reduce((sum, s) => sum + (s.grossCommission || 0), 0);
  const totalPaidAllTime = settlements.reduce((sum, s) => sum + (s.paidAmount || 0), 0);
  const totalPendingAllTime = Math.max(0, totalEarnedAllTime - totalPaidAllTime);

  // Copy UPI ID
  const handleCopyUpi = () => {
    if (upiConfig.ownerUpiId) {
      try {
        navigator.clipboard.writeText(upiConfig.ownerUpiId);
        setCopiedUpi(true);
        showToast('UPI ID copied to clipboard!');
        setTimeout(() => setCopiedUpi(false), 2000);
      } catch (e) {
        showToast(`UPI: ${upiConfig.ownerUpiId}`);
      }
    }
  };

  // Image / Proof Upload Handler
  const handleProofFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      showToast('Please upload an image smaller than 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setPayProofUrl(event.target?.result || '');
      showToast('Payment proof screenshot attached!');
    };
    reader.readAsDataURL(file);
  };

  // Record Payment
  const handleRecordPaymentSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(payAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      showToast('Please enter a valid payment amount (> ₹0).', 'error');
      return;
    }

    if (amountNum > currentSettlement.pendingAmount && currentSettlement.pendingAmount > 0) {
      const confirmOverpay = window.confirm(
        `Entered amount (₹${amountNum}) exceeds the pending balance (₹${currentSettlement.pendingAmount}). Proceed with overpayment?`
      );
      if (!confirmOverpay) return;
    }

    setIsSubmittingPay(true);
    try {
      await commissionService.recordPayment({
        settlementId: currentSettlement.settlementId,
        periodId: currentSettlement.periodId,
        amount: amountNum,
        paymentDate: payDate,
        paymentMethod: payMethod,
        paymentReference: payRef.trim(),
        paymentNote: payNote.trim(),
        paymentProofUrl: payProofUrl,
        createdBy: currentAdminUser?.name || 'Shop Admin'
      });

      showToast(`Recorded ₹${amountNum} payment successfully!`);
      setIsPaymentModalOpen(false);
      setPayAmount('');
      setPayRef('');
      setPayNote('');
      setPayProofUrl('');
    } catch (err) {
      showToast(err.message || 'Failed to record payment.', 'error');
    } finally {
      setIsSubmittingPay(false);
    }
  };

  // Void Payment
  const handleVoidPaymentSubmit = async (e) => {
    e.preventDefault();
    if (!voidModalPayment) return;
    if (!voidReason.trim()) {
      showToast('Please specify a reason for voiding this payment.', 'error');
      return;
    }

    try {
      await commissionService.voidPayment(
        voidModalPayment.paymentId,
        voidReason.trim(),
        currentAdminUser?.name || 'Shop Admin'
      );
      showToast(`Payment of ₹${voidModalPayment.amount} has been marked VOIDED.`);
      setVoidModalPayment(null);
      setVoidReason('');
    } catch (err) {
      showToast(err.message || 'Failed to void payment.', 'error');
    }
  };

  // Add Adjustment
  const handleAdjustmentSubmit = async (e) => {
    e.preventDefault();
    const amountNum = parseFloat(adjAmount);
    if (isNaN(amountNum) || amountNum === 0) {
      showToast('Adjustment amount cannot be zero.', 'error');
      return;
    }
    if (!adjReason.trim()) {
      showToast('Please provide a reason for the adjustment.', 'error');
      return;
    }

    try {
      await commissionService.addAdjustment({
        periodId: currentSettlement.periodId,
        amount: amountNum,
        type: adjType,
        reason: adjReason.trim(),
        createdBy: currentAdminUser?.name || 'Shop Admin'
      });
      showToast('Audit adjustment recorded successfully.');
      setIsAdjustmentModalOpen(false);
      setAdjAmount('');
      setAdjReason('');
    } catch (err) {
      showToast(err.message || 'Failed to add adjustment.', 'error');
    }
  };

  // Dispute Settlement
  const handleDisputeSubmit = async (e) => {
    e.preventDefault();
    if (!disputeReason.trim()) {
      showToast('Please provide a dispute reason.', 'error');
      return;
    }

    try {
      await commissionService.markSettlementDisputed(
        currentSettlement.periodId,
        disputeReason.trim(),
        currentAdminUser?.name || 'Shop Admin'
      );
      showToast('Settlement flagged as DISPUTED.');
      setIsDisputeModalOpen(false);
      setDisputeReason('');
    } catch (err) {
      showToast(err.message || 'Failed to update dispute status.', 'error');
    }
  };

  // Resolve Dispute
  const handleResolveDispute = async () => {
    try {
      await commissionService.resolveSettlementDispute(currentSettlement.periodId);
      showToast('Dispute resolved.');
    } catch (err) {
      showToast(err.message || 'Failed to resolve dispute.', 'error');
    }
  };

  // Save UPI Config
  const handleSaveUpiConfig = (e) => {
    e.preventDefault();
    const updated = commissionService.saveReceivingUpiConfig({
      ownerUpiId: cfgUpiId.trim(),
      ownerName: cfgName.trim(),
      ownerPhone: cfgPhone.trim(),
      ownerQrCodeUrl: cfgQrUrl.trim()
    });
    setUpiConfig(updated);
    setIsConfigModalOpen(false);
    showToast('Receiving UPI details updated successfully!');
  };

  // Export CSV
  const handleExportSettlements = () => {
    const csv = commissionService.exportSettlementsToCsv(settlements);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `new_ratna_commission_settlements_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Settlement report exported to CSV!');
  };

  const handleExportPayments = () => {
    const csv = commissionService.exportPaymentsToCsv(payments);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `new_ratna_commission_payments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    showToast('Payment history exported to CSV!');
  };

  // Filtered Payments list
  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      !paymentSearch ||
      (p.paymentReference && p.paymentReference.toLowerCase().includes(paymentSearch.toLowerCase())) ||
      (p.paymentNote && p.paymentNote.toLowerCase().includes(paymentSearch.toLowerCase())) ||
      (p.periodId && getPeriodLabel(p.periodId).toLowerCase().includes(paymentSearch.toLowerCase()));

    const matchesStatus =
      paymentFilterStatus === 'ALL' ||
      (paymentFilterStatus === 'PAID' && p.status === 'PAID') ||
      (paymentFilterStatus === 'VOIDED' && p.status === 'VOIDED');

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PAID':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#dcfce7', color: '#15803d', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 800 }}>
            <CheckCircle2 size={13} /> PAID
          </span>
        );
      case 'PARTIALLY_PAID':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fef3c7', color: '#b45309', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 800 }}>
            <Clock size={13} /> PARTIALLY PAID
          </span>
        );
      case 'DISPUTED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#fee2e2', color: '#b91c1c', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 800 }}>
            <AlertTriangle size={13} /> DISPUTED
          </span>
        );
      case 'VOIDED':
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#f1f5f9', color: '#64748b', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 800 }}>
            <Ban size={13} /> VOIDED
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: '#e0f2fe', color: '#0369a1', padding: '3px 10px', borderRadius: 'var(--radius-full)', fontSize: '0.78rem', fontWeight: 800 }}>
            <Clock size={13} /> PENDING
          </span>
        );
    }
  };

  return (
    <div className="admin-settlement-page" style={{ padding: '0.5rem 0' }}>
      {/* Header Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: 34, height: 34, borderRadius: 'var(--radius-sm)', background: 'var(--gold-light)', color: 'var(--gold-hover)', border: '1px solid var(--gold-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Coins size={18} />
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Commission Settlement
            </h2>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            ₹2 × completed sold quantity • Separate Shop ↔ App Owner Settlement • Customer is never charged
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => setIsConfigModalOpen(true)}
            title="Configure Receiving UPI details"
          >
            <QrCode size={14} /> Receiving UPI
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={handleExportSettlements}
            title="Export settlements to CSV"
          >
            <Download size={14} /> Export CSV
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => {
              setPayAmount(currentSettlement.pendingAmount > 0 ? String(currentSettlement.pendingAmount) : '');
              setIsPaymentModalOpen(true);
            }}
          >
            <Plus size={15} /> Record Payment
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            Total Commission Earned
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'var(--font-heading)', marginTop: '0.25rem' }}>
            ₹{totalEarnedAllTime}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            All-time completed orders (₹2 / unit)
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            Total Paid to Owner
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#15803d', fontFamily: 'var(--font-heading)', marginTop: '0.25rem' }}>
            ₹{totalPaidAllTime}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Verified settled payments
          </div>
        </div>

        <div style={{ background: '#fffcf5', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1.5px solid var(--gold-border)', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gold-hover)', letterSpacing: '0.04em' }}>
            Total Outstanding Balance
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: totalPendingAllTime > 0 ? '#b45309' : '#15803d', fontFamily: 'var(--font-heading)', marginTop: '0.25rem' }}>
            ₹{totalPendingAllTime}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Pending shop commission payment
          </div>
        </div>

        <div style={{ background: '#fff', borderRadius: 'var(--radius-md)', padding: '1.25rem', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-xs)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
            Active Period ({currentSettlement.periodLabel})
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: 900, color: 'var(--text-main)', fontFamily: 'var(--font-heading)', marginTop: '0.25rem' }}>
            ₹{currentSettlement.pendingAmount}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
            Gross: ₹{currentSettlement.grossCommission} • Paid: ₹{currentSettlement.paidAmount}
          </div>
        </div>
      </div>

      {/* Spotlight Period Card */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--border-medium)', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div>
              <span style={{ fontSize: '0.72rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gold-hover)', letterSpacing: '0.05em' }}>
                CURRENT SETTLEMENT PERIOD
              </span>
              <h3 style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--text-main)', margin: '0.1rem 0' }}>
                {currentSettlement.periodLabel}
              </h3>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                {currentSettlement.periodStart} to {currentSettlement.periodEnd} • Monthly Cycle
              </div>
            </div>
            {getStatusBadge(currentSettlement.status)}
          </div>

          {/* Period selector dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>Period:</span>
            <select
              className="form-select"
              style={{ padding: '0.35rem 0.75rem', fontSize: '0.85rem', width: 'auto' }}
              value={activePeriodId}
              onChange={(e) => setActivePeriodId(e.target.value)}
            >
              {settlements.map((s) => (
                <option key={s.periodId} value={s.periodId}>
                  {s.periodLabel} ({s.status})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Breakdown Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', background: 'var(--bg-page)', padding: '1.15rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Completed Units</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
              {currentSettlement.totalCompletedQuantity} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>qty</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>From {currentSettlement.orderCount} completed orders</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Commission Rate</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)', marginTop: 2 }}>
              ₹{currentSettlement.commissionRate} <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>/ item</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Standard rate</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Commission</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--text-main)', marginTop: 2 }}>
              ₹{currentSettlement.grossCommission}
            </div>
            {currentSettlement.adjustments?.length > 0 && (
              <div style={{ fontSize: '0.72rem', color: 'var(--gold-hover)', fontWeight: 700 }}>Includes {currentSettlement.adjustments.length} audit adj</div>
            )}
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Already Paid</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#15803d', marginTop: 2 }}>
              ₹{currentSettlement.paidAmount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{currentSettlement.payments?.length || 0} valid payments</div>
          </div>

          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remaining Pending</div>
            <div style={{ fontSize: '1.35rem', fontWeight: 900, color: currentSettlement.pendingAmount > 0 ? 'var(--primary)' : '#15803d', marginTop: 2 }}>
              ₹{currentSettlement.pendingAmount}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Due for settlement</div>
          </div>
        </div>

        {/* Dispute Notice if present */}
        {currentSettlement.disputeReason && (
          <div style={{ background: '#fef2f2', border: '1.5px solid #fca5a5', borderRadius: 'var(--radius-sm)', padding: '0.85rem 1rem', marginBottom: '1.25rem', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
              <AlertTriangle size={18} style={{ color: '#dc2626', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.88rem' }}>Settlement Disputed:</div>
                <div style={{ color: '#7f1d1d', fontSize: '0.82rem', marginTop: 2 }}>"{currentSettlement.disputeReason}"</div>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-sm btn-secondary"
              onClick={handleResolveDispute}
              style={{ fontSize: '0.75rem' }}
            >
              Resolve Dispute
            </button>
          </div>
        )}

        {/* Payment Instructions & Action Toolbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', background: '#fffdf5', border: '1px solid var(--gold-border)', borderRadius: 'var(--radius-sm)', padding: '0.95rem 1.15rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
            <CreditCard size={20} style={{ color: 'var(--gold-hover)' }} />
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.9rem', color: 'var(--text-main)' }}>
                Pay Commission via UPI: <code style={{ background: '#fff', padding: '2px 6px', borderRadius: 4, border: '1px solid var(--border-subtle)', color: 'var(--primary)', fontWeight: 800 }}>{upiConfig.ownerUpiId || 'Not Configured'}</code>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Receiver: <strong>{upiConfig.ownerName}</strong> • After transfer, record reference/UTR below.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleCopyUpi}
              style={{ fontSize: '0.78rem' }}
            >
              {copiedUpi ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
              <span>{copiedUpi ? 'Copied!' : 'Copy UPI'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => setIsAdjustmentModalOpen(true)}
              style={{ fontSize: '0.78rem' }}
            >
              <RotateCcw size={13} /> Adjust
            </button>

            {!currentSettlement.disputeReason && (
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setIsDisputeModalOpen(true)}
                style={{ fontSize: '0.78rem', color: '#b91c1c' }}
              >
                <AlertCircle size={13} /> Dispute
              </button>
            )}

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                setPayAmount(currentSettlement.pendingAmount > 0 ? String(currentSettlement.pendingAmount) : '');
                setIsPaymentModalOpen(true);
              }}
            >
              <Plus size={14} /> Record Payment
            </button>
          </div>
        </div>
      </div>

      {/* Payment History Section */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.5rem', marginBottom: '1.75rem', boxShadow: 'var(--shadow-xs)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', margin: 0 }}>
              Payment Transaction History
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: '0.15rem 0 0 0' }}>
              Audited payment records (Records are never permanently deleted)
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search UTR / note..."
                value={paymentSearch}
                onChange={(e) => setPaymentSearch(e.target.value)}
                style={{ padding: '0.4rem 0.75rem 0.4rem 2rem', fontSize: '0.82rem', width: 200 }}
              />
              <Search size={13} style={{ position: 'absolute', left: '0.65rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>

            <select
              className="form-select"
              value={paymentFilterStatus}
              onChange={(e) => setPaymentFilterStatus(e.target.value)}
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.82rem', width: 'auto' }}
            >
              <option value="ALL">All Statuses</option>
              <option value="PAID">Paid Only</option>
              <option value="VOIDED">Voided Only</option>
            </select>

            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleExportPayments}
              title="Export payment records to CSV"
            >
              <Download size={13} /> Export Payments
            </button>
          </div>
        </div>

        {filteredPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', background: 'var(--bg-page)', borderRadius: 'var(--radius-md)' }}>
            <CreditCard size={32} style={{ color: 'var(--text-muted)', opacity: 0.5, margin: '0 auto 0.5rem auto' }} />
            <div style={{ fontWeight: 700, color: 'var(--text-main)', fontSize: '0.95rem' }}>No payments recorded yet</div>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              When the shop pays the app owner commission, click "Record Payment" to log the transaction.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
              <thead>
                <tr style={{ borderBottom: '1.5px solid var(--border-medium)', background: 'var(--bg-page)', textAlign: 'left' }}>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Date</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Period</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Amount</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Method</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>UTR / Reference</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Status</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Proof</th>
                  <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((p) => (
                  <tr key={p.paymentId} style={{ borderBottom: '1px solid var(--border-subtle)', opacity: p.status === 'VOIDED' ? 0.6 : 1 }}>
                    <td style={{ padding: '0.75rem', fontWeight: 600 }}>{p.paymentDate}</td>
                    <td style={{ padding: '0.75rem', color: 'var(--text-body)' }}>{getPeriodLabel(p.periodId)}</td>
                    <td style={{ padding: '0.75rem', fontWeight: 800, color: p.status === 'VOIDED' ? 'var(--text-muted)' : '#15803d', fontFamily: 'var(--font-heading)', fontSize: '0.95rem' }}>
                      ₹{p.amount}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      <span style={{ background: 'var(--bg-muted)', padding: '2px 6px', borderRadius: 4, fontWeight: 700, fontSize: '0.75rem' }}>
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: '0.75rem', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {p.paymentReference || 'N/A'}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {getStatusBadge(p.status)}
                      {p.voidReason && (
                        <div style={{ fontSize: '0.7rem', color: '#b91c1c', marginTop: 2 }}>
                          Reason: {p.voidReason}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {p.paymentProofUrl ? (
                        <button
                          type="button"
                          onClick={() => setProofPreviewUrl(p.paymentProofUrl)}
                          style={{ color: 'var(--primary)', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: '0.78rem' }}
                        >
                          <Eye size={13} /> View Proof
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>No proof</span>
                      )}
                    </td>
                    <td style={{ padding: '0.75rem' }}>
                      {p.status !== 'VOIDED' && (
                        <button
                          type="button"
                          onClick={() => {
                            setVoidModalPayment(p);
                            setVoidReason('');
                          }}
                          style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 3 }}
                        >
                          <Ban size={12} /> Void
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Historical Settlement Periods Table */}
      <div style={{ background: '#fff', borderRadius: 'var(--radius-lg)', border: '1px solid var(--border-subtle)', padding: '1.5rem', boxShadow: 'var(--shadow-xs)' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
          Historical Settlement Periods
        </h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Monthly commission reconciliation & audit ledger
        </p>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1.5px solid var(--border-medium)', background: 'var(--bg-page)', textAlign: 'left' }}>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Period</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Units Sold</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Rate</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Gross Comm.</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Paid</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Pending</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Status</th>
                <th style={{ padding: '0.65rem 0.75rem', fontWeight: 800, color: 'var(--text-muted)' }}>Select</th>
              </tr>
            </thead>
            <tbody>
              {settlements.map((s) => (
                <tr key={s.periodId} style={{ borderBottom: '1px solid var(--border-subtle)', background: s.periodId === activePeriodId ? 'var(--primary-light)' : 'transparent' }}>
                  <td style={{ padding: '0.75rem', fontWeight: 700 }}>
                    {s.periodLabel}
                    {s.periodId === getPeriodId(new Date()) && (
                      <span style={{ marginLeft: 6, fontSize: '0.7rem', color: 'var(--primary)', background: '#fff', padding: '1px 5px', borderRadius: 4, fontWeight: 800, border: '1px solid var(--primary-light-2)' }}>
                        CURRENT
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{s.totalCompletedQuantity}</td>
                  <td style={{ padding: '0.75rem' }}>₹{s.commissionRate}</td>
                  <td style={{ padding: '0.75rem', fontWeight: 800 }}>₹{s.grossCommission}</td>
                  <td style={{ padding: '0.75rem', color: '#15803d', fontWeight: 700 }}>₹{s.paidAmount}</td>
                  <td style={{ padding: '0.75rem', color: s.pendingAmount > 0 ? 'var(--primary)' : '#15803d', fontWeight: 800 }}>
                    ₹{s.pendingAmount}
                  </td>
                  <td style={{ padding: '0.75rem' }}>{getStatusBadge(s.status)}</td>
                  <td style={{ padding: '0.75rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary btn-sm"
                      style={{ fontSize: '0.75rem', padding: '0.25rem 0.6rem' }}
                      onClick={() => setActivePeriodId(s.periodId)}
                    >
                      {s.periodId === activePeriodId ? 'Viewing' : 'View'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================
          MODAL 1: RECORD PAYMENT MODAL
          =================================================================== */}
      {isPaymentModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsPaymentModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
            <div className="modal-header">
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', color: 'var(--gold-hover)', letterSpacing: '0.04em' }}>
                  Commission Settlement
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '0.1rem 0 0 0' }}>
                  Record Payment ({currentSettlement.periodLabel})
                </h3>
              </div>
              <button type="button" className="drawer-close-btn" onClick={() => setIsPaymentModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div style={{ background: 'var(--bg-page)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1.25rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Gross:</span> <strong>₹{currentSettlement.grossCommission}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Already Paid:</span> <strong style={{ color: '#15803d' }}>₹{currentSettlement.paidAmount}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Pending:</span> <strong style={{ color: 'var(--primary)' }}>₹{currentSettlement.pendingAmount}</strong>
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">
                      Payment Amount (₹) <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 1300"
                      min="1"
                      step="any"
                      value={payAmount}
                      onChange={(e) => setPayAmount(e.target.value)}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Payment Date</label>
                    <input
                      type="date"
                      className="form-input"
                      value={payDate}
                      onChange={(e) => setPayDate(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Payment Method</label>
                    <select
                      className="form-select"
                      value={payMethod}
                      onChange={(e) => setPayMethod(e.target.value)}
                    >
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="BANK_TRANSFER">Bank Transfer (NEFT / IMPS)</option>
                      <option value="CASH">Cash Settlement</option>
                      <option value="OTHER">Other Method</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      UTR / UPI Reference {payMethod === 'UPI' && <span style={{ color: 'var(--gold-hover)', fontSize: '0.75rem' }}>(Recommended)</span>}
                    </label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 123456789012"
                      value={payRef}
                      onChange={(e) => setPayRef(e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Payment Note (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. October partial commission settlement via HDFC UPI"
                    value={payNote}
                    onChange={(e) => setPayNote(e.target.value)}
                  />
                </div>

                {/* Proof Screenshot Upload */}
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Upload Payment Proof / Screenshot</label>
                  <div style={{ border: '1.5px dashed var(--border-medium)', borderRadius: 'var(--radius-sm)', padding: '1rem', textAlign: 'center', background: '#fafaf9' }}>
                    {payProofUrl ? (
                      <div>
                        <img
                          src={payProofUrl}
                          alt="Payment Proof Preview"
                          style={{ maxHeight: 120, margin: '0 auto 0.5rem auto', borderRadius: 4, objectFit: 'contain' }}
                        />
                        <button
                          type="button"
                          className="btn btn-secondary btn-sm"
                          onClick={() => setPayProofUrl('')}
                          style={{ fontSize: '0.75rem', color: '#dc2626' }}
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div>
                        <Upload size={24} style={{ color: 'var(--text-muted)', margin: '0 auto 0.35rem auto' }} />
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-body)', fontWeight: 600 }}>
                          Click to upload UPI screenshot (PNG/JPG up to 2MB)
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleProofFileUpload}
                          style={{ marginTop: '0.5rem', fontSize: '0.8rem' }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsPaymentModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ flex: 1 }}
                  disabled={isSubmittingPay}
                >
                  {isSubmittingPay ? 'Saving...' : 'Save Payment Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 2: RECEIVING UPI CONFIG MODAL
          =================================================================== */}
      {isConfigModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsConfigModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                App Owner Receiving UPI Details
              </h3>
              <button type="button" className="drawer-close-btn" onClick={() => setIsConfigModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUpiConfig}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  These receiving details are shown only inside the shopkeeper admin settlement portal for commission transfers. Customers never see this data.
                </p>

                <div className="form-group">
                  <label className="form-label">Owner UPI ID <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. yourname@okhdfcbank"
                    value={cfgUpiId}
                    onChange={(e) => setCfgUpiId(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Account Holder Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. New Ratna App Operations"
                    value={cfgName}
                    onChange={(e) => setCfgName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Contact Phone</label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="e.g. 9820198201"
                    value={cfgPhone}
                    onChange={(e) => setCfgPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsConfigModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save UPI Config
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 3: AUDIT ADJUSTMENT MODAL
          =================================================================== */}
      {isAdjustmentModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsAdjustmentModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                Audit Adjustment ({currentSettlement.periodLabel})
              </h3>
              <button type="button" className="drawer-close-btn" onClick={() => setIsAdjustmentModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAdjustmentSubmit}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Adjustments provide a transparent audit log for manual bonuses, corrections, reversals, or dispute settlements.
                </p>

                <div className="form-group">
                  <label className="form-label">Adjustment Type</label>
                  <select
                    className="form-select"
                    value={adjType}
                    onChange={(e) => setAdjType(e.target.value)}
                  >
                    <option value="CORRECTION">CORRECTION (Manual audit balance fix)</option>
                    <option value="BONUS">BONUS (Festival incentive / Extra credit)</option>
                    <option value="REVERSAL">REVERSAL (Cancelled order credit clawback)</option>
                    <option value="REFUND">REFUND (Fee refund / Waiver)</option>
                    <option value="DISPUTE">DISPUTE (Settlement dispute resolution)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Adjustment Amount (₹) <span style={{ color: '#dc2626' }}>*</span> (Use negative for deductions, e.g. -100)
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="form-input"
                    placeholder="e.g. 200 or -150"
                    value={adjAmount}
                    onChange={(e) => setAdjAmount(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Reason / Audit Note <span style={{ color: '#dc2626' }}>*</span></label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="State reason for audit adjustment..."
                    value={adjReason}
                    onChange={(e) => setAdjReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAdjustmentModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  Save Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 4: DISPUTE SETTLEMENT MODAL
          =================================================================== */}
      {isDisputeModalOpen && (
        <div className="modal-backdrop" onClick={() => setIsDisputeModalOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#b91c1c' }}>
                Dispute Settlement ({currentSettlement.periodLabel})
              </h3>
              <button type="button" className="drawer-close-btn" onClick={() => setIsDisputeModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleDisputeSubmit}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Marking this period as DISPUTED flags it for review. Commission amounts remain preserved and are not deleted.
                </p>

                <div className="form-group">
                  <label className="form-label">Dispute Reason <span style={{ color: '#dc2626' }}>*</span></label>
                  <textarea
                    className="form-textarea"
                    rows={3}
                    placeholder="e.g. Payment reference 123456 could not be verified by owner..."
                    value={disputeReason}
                    onChange={(e) => setDisputeReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsDisputeModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#dc2626' }}>
                  Flag as Disputed
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 5: VOID PAYMENT MODAL
          =================================================================== */}
      {voidModalPayment && (
        <div className="modal-backdrop" onClick={() => setVoidModalPayment(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 450 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#b91c1c' }}>
                Void Payment #{voidModalPayment.paymentId}
              </h3>
              <button type="button" className="drawer-close-btn" onClick={() => setVoidModalPayment(null)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleVoidPaymentSubmit}>
              <div className="modal-body" style={{ padding: '1.25rem' }}>
                <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', fontSize: '0.85rem' }}>
                  <div>Amount to Void: <strong>₹{voidModalPayment.amount}</strong></div>
                  <div>Reference: <strong>{voidModalPayment.paymentReference || 'N/A'}</strong></div>
                  <div style={{ color: '#991b1b', fontSize: '0.78rem', marginTop: 3 }}>
                    Payment will remain in audit logs marked as VOIDED.
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Reason for Voiding <span style={{ color: '#dc2626' }}>*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Duplicate entry / Incorrect UTR entered"
                    value={voidReason}
                    onChange={(e) => setVoidReason(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer" style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setVoidModalPayment(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, background: '#dc2626' }}>
                  Confirm Void
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================
          MODAL 6: PROOF SCREENSHOT PREVIEW MODAL
          =================================================================== */}
      {proofPreviewUrl && (
        <div className="modal-backdrop" onClick={() => setProofPreviewUrl(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 540 }}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>
                Payment Proof Screenshot
              </h3>
              <button type="button" className="drawer-close-btn" onClick={() => setProofPreviewUrl(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body" style={{ padding: '1rem', textAlign: 'center' }}>
              <img
                src={proofPreviewUrl}
                alt="Payment Proof"
                style={{ width: '100%', maxHeight: 480, objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
