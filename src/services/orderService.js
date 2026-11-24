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
  runTransaction,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { INITIAL_ORDERS, INITIAL_PRODUCTS } from '../data/initialProducts.js';
import { notificationService } from './notificationService.js';
import { getLocalProducts, saveLocalProducts } from './productService.js';

// Local storage keys for mock/fallback mode
const STORAGE_ORDERS_KEY = 'nr_firebase_orders_cache_v3';
const STORAGE_SEQ_KEY = 'nr_order_seq';

const orderMemoryStore = new Map();

const safeOrderGet = (key) => {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
  } catch (e) {}
  return orderMemoryStore.get(key) || null;
};

const safeOrderSet = (key, val) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, val);
  } catch (e) {}
  orderMemoryStore.set(key, val);
};

// Helper for local mock orders storage
const getLocalOrders = () => {
  try {
    const data = safeOrderGet(STORAGE_ORDERS_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Failed to read local orders:', err);
  }
  // Initialize with INITIAL_ORDERS
  const mapped = INITIAL_ORDERS.map((o) => ({
    id: String(o.id),
    token: parseInt(o.id, 10) || 1001,
    tokenNumber: parseInt(o.id, 10) || 1001,
    customerName: o.customerName,
    mobile: o.phone,
    mobileNumber: o.phone,
    phone: o.phone,
    items: o.items.map((it) => ({
      productId: it.id,
      name: it.name,
      productName: it.name,
      price: it.price,
      quantity: it.quantity,
      customizableNote: it.customizableNote || ''
    })),
    total: o.grandTotal,
    paymentMethod: 'pay_at_counter',
    paymentStatus: o.paymentStatus || 'Pending Payment at Counter',
    status: o.status,
    orderStatus: String(o.status || 'PLACED').toUpperCase(),
    stockRestored: false,
    createdAt: o.createdAt,
    updatedAt: o.createdAt,
    prepTimeMinutes: o.prepTimeMinutes || 10,
    specialInstructions: o.specialInstructions || '',
    pickupLocation: 'New Ratna Pan Shop — Shop Counter',
    pickupOnly: true
  }));
  safeOrderSet(STORAGE_ORDERS_KEY, JSON.stringify(mapped));
  return mapped;
};

const localOrderListeners = new Set();

const saveLocalOrders = (orders) => {
  try {
    safeOrderSet(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nr_orders_updated', { detail: orders }));
    }
    localOrderListeners.forEach((listener) => {
      try {
        listener(orders);
      } catch (err) {
        console.error('Order listener error:', err);
      }
    });
  } catch (err) {
    console.error('Failed to save local orders:', err);
  }
};

export const orderService = {
  /**
   * Atomic Order Creation in Firestore.
   * Uses a Firestore transaction on `products` and `settings/orderCounter` to:
   * 1. Check current available stock for each ordered item.
   * 2. Reject if any item is out of stock or insufficient.
   * 3. Decrement stock atomically.
   * 4. Safely increment token counter (#101, #102, ...).
   * 5. Create order document.
   */
  async createOrder({ customerName, mobile, mobileNumber, items, total, subtotal, discount = 0, appliedOffer = null, prepTimeMinutes, specialInstructions }) {
    const rawMobile = mobileNumber || mobile || '';
    const cleanMobile = String(rawMobile).replace(/[^0-9]/g, '');

    if (!cleanMobile || cleanMobile.length < 10) {
      throw new Error('Please provide a valid 10-digit mobile number for order pickup verification.');
    }

    const finalCustomerName = (customerName || '').trim() || 'Valued Customer';

    const sanitizedItems = items.map((it) => {
      const pId = it.productId || it.id || 'prod';
      const pName = it.productName || it.name || 'Paan';
      const pImg = it.imageUrl || it.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
      return {
        id: pId,
        productId: pId,
        name: pName,
        productName: pName,
        price: Number(it.price) || 0,
        quantity: Math.max(1, Number(it.quantity) || 1),
        imageUrl: typeof pImg === 'string' ? pImg.replace('e_grayscale,', '') : pImg,
        image: typeof pImg === 'string' ? pImg.replace('e_grayscale,', '') : pImg,
        customizableNote: it.customizableNote || ''
      };
    });

    if (sanitizedItems.length === 0) {
      throw new Error('Your cart is empty. Please add items before placing order.');
    }

    const calculatedSubtotal = Number(subtotal) || sanitizedItems.reduce((sum, it) => sum + it.price * it.quantity, 0);
    const calculatedDiscount = Math.max(0, Number(discount) || 0);
    const calculatedTotal = Math.max(0, Number(total) !== undefined ? Number(total) : calculatedSubtotal - calculatedDiscount);

    if (isFirebaseConfigured && db) {
      try {
        const counterRef = doc(db, 'settings', 'orderCounter');
        const legacyCounterRef = doc(db, 'counters', 'orders');

        const createdOrder = await runTransaction(db, async (transaction) => {
          // 1. Verify and reserve stock for all items
          const productStockUpdates = [];
          for (const item of sanitizedItems) {
            if (item.productId) {
              const prodRef = doc(db, 'products', item.productId);
              const prodSnap = await transaction.get(prodRef);
              if (prodSnap.exists()) {
                const prodData = prodSnap.data();
                const currentStock = prodData.stockQuantity !== undefined ? Number(prodData.stockQuantity) : 0;
                const isAvailable = prodData.available !== undefined ? prodData.available : (prodData.isAvailable !== undefined ? prodData.isAvailable : true);

                if (!isAvailable || currentStock <= 0) {
                  throw new Error(`Sorry, "${item.name}" is currently Sold Out.`);
                }
                if (currentStock < item.quantity) {
                  throw new Error(`Sorry, "${item.name}" only has ${currentStock} left in stock. Please adjust your quantity.`);
                }
                productStockUpdates.push({
                  prodRef,
                  newStock: Math.max(0, currentStock - item.quantity)
                });
              }
            }
          }

          // 2. Read counter (from settings/orderCounter or counters/orders)
          let nextToken = 101;
          const counterSnap = await transaction.get(counterRef);
          if (counterSnap.exists()) {
            const data = counterSnap.data();
            nextToken = (data.lastToken || data.lastTokenNumber || 100) + 1;
          } else {
            const legacySnap = await transaction.get(legacyCounterRef);
            if (legacySnap.exists()) {
              const data = legacySnap.data();
              nextToken = (data.lastToken || 1000) + 1;
            }
          }

          // 3. Atomically decrement product stock
          for (const update of productStockUpdates) {
            transaction.update(update.prodRef, {
              stockQuantity: update.newStock,
              updatedAt: serverTimestamp()
            });
          }

          // 4. Update counters atomically
          const counterPayload = {
            lastToken: nextToken,
            lastTokenNumber: nextToken,
            updatedAt: serverTimestamp()
          };
          transaction.set(counterRef, counterPayload, { merge: true });
          transaction.set(legacyCounterRef, counterPayload, { merge: true });

          // 5. Create order document with token as the primary identifier
          const orderId = String(nextToken);
          const orderRef = doc(db, 'orders', orderId);

          const orderPayload = {
            id: orderId,
            orderId: orderId,
            token: nextToken,
            tokenNumber: nextToken,
            customerName: finalCustomerName,
            mobileNumber: cleanMobile,
            mobile: cleanMobile,
            phone: cleanMobile,
            items: sanitizedItems,
            subtotal: calculatedSubtotal,
            discount: calculatedDiscount,
            appliedOffer: appliedOffer
              ? {
                  id: appliedOffer.id || '',
                  title: appliedOffer.title || '',
                  discountValue: Number(appliedOffer.discountValue) || calculatedDiscount
                }
              : null,
            total: calculatedTotal,
            grandTotal: calculatedTotal,
            orderStatus: 'PLACED',
            status: 'placed',
            paymentMethod: 'pay_at_counter',
            paymentStatus: 'Pending Payment at Counter',
            pickupOnly: true,
            pickupLocation: 'New Ratna Pan Shop — Shop Counter',
            stockRestored: false,
            createdAt: new Date().toISOString(),
            createdAtTimestamp: serverTimestamp(),
            updatedAt: new Date().toISOString(),
            updatedAtTimestamp: serverTimestamp(),
            prepTimeMinutes: prepTimeMinutes || 10,
            specialInstructions: specialInstructions || ''
          };

          transaction.set(orderRef, orderPayload);
          return orderPayload;
        });

        // Trigger customer SMS / WhatsApp notification for Order Placed
        await notificationService.sendOrderStatusNotification(createdOrder, 'placed');

        return createdOrder;
      } catch (error) {
        console.error('❌ [Firestore] Failed to create order in transaction:', error);
        throw new Error(error.message || 'Failed to place order. Please try again.');
      }
    } else {
      // Local Prototype / Mock Mode Fallback with atomic stock deduction
      const currentProducts = getLocalProducts();

      // Check stock availability
      for (const item of sanitizedItems) {
        const prod = currentProducts.find((p) => p.id === item.productId);
        if (prod) {
          const stock = prod.stockQuantity !== undefined ? Number(prod.stockQuantity) : 0;
          const available = prod.isAvailable !== false && prod.available !== false;
          if (!available || stock <= 0) {
            throw new Error(`Sorry, "${item.name}" is currently Sold Out.`);
          }
          if (stock < item.quantity) {
            throw new Error(`Sorry, "${item.name}" only has ${stock} left in stock. Please adjust your quantity.`);
          }
        }
      }

      // Decrement product stock in local storage
      const updatedProducts = currentProducts.map((p) => {
        const matchingItem = sanitizedItems.find((it) => it.productId === p.id);
        if (matchingItem) {
          const stock = p.stockQuantity !== undefined ? Number(p.stockQuantity) : 0;
          return {
            ...p,
            stockQuantity: Math.max(0, stock - matchingItem.quantity)
          };
        }
        return p;
      });
      saveLocalProducts(updatedProducts);

      let currentSeq = 1004;
      try {
        const saved = safeOrderGet(STORAGE_SEQ_KEY);
        currentSeq = saved ? parseInt(saved, 10) : 1004;
      } catch {
        currentSeq = 1004;
      }

      const newToken = currentSeq;
      const newOrderId = String(newToken);

      try {
        safeOrderSet(STORAGE_SEQ_KEY, (currentSeq + 1).toString());
      } catch (err) {
        console.warn('Storage unavailable for sequence update:', err);
      }

      const newOrder = {
        id: newOrderId,
        orderId: newOrderId,
        token: newToken,
        tokenNumber: newToken,
        customerName: finalCustomerName,
        mobileNumber: cleanMobile,
        mobile: cleanMobile,
        phone: cleanMobile,
        items: sanitizedItems,
        subtotal: calculatedSubtotal,
        discount: calculatedDiscount,
        appliedOffer: appliedOffer
          ? {
              id: appliedOffer.id || '',
              title: appliedOffer.title || '',
              discountValue: Number(appliedOffer.discountValue) || calculatedDiscount
            }
          : null,
        total: calculatedTotal,
        grandTotal: calculatedTotal,
        orderStatus: 'PLACED',
        status: 'placed',
        paymentMethod: 'pay_at_counter',
        paymentStatus: 'Pending Payment at Counter',
        pickupOnly: true,
        pickupLocation: 'New Ratna Pan Shop — Shop Counter',
        stockRestored: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        prepTimeMinutes: prepTimeMinutes || 10,
        specialInstructions: specialInstructions || ''
      };

      const currentOrders = getLocalOrders();
      const updated = [newOrder, ...currentOrders];
      saveLocalOrders(updated);

      // Notification
      await notificationService.sendOrderStatusNotification(newOrder, 'placed');

      return newOrder;
    }
  },

  /**
   * Real-time subscription to all orders (Admin Portal)
   */
  subscribeToOrders(onUpdate, onError) {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const orders = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              const rawStatus = data.status || data.orderStatus || 'placed';
              const normalizedStatus = String(rawStatus).toLowerCase();

              return {
                ...data,
                id: docSnap.id,
                orderId: data.orderId || docSnap.id,
                token: data.token || data.tokenNumber || parseInt(docSnap.id, 10) || 101,
                tokenNumber: data.tokenNumber || data.token || parseInt(docSnap.id, 10) || 101,
                customerName: data.customerName || 'Valued Customer',
                mobileNumber: data.mobileNumber || data.mobile || data.phone || '',
                mobile: data.mobileNumber || data.mobile || data.phone || '',
                phone: data.mobileNumber || data.mobile || data.phone || '',
                status: normalizedStatus === 'received' ? 'placed' : normalizedStatus,
                orderStatus: (data.orderStatus || normalizedStatus).toUpperCase(),
                grandTotal: data.total !== undefined ? data.total : (data.grandTotal || 0),
                total: data.total !== undefined ? data.total : (data.grandTotal || 0),
                items: (data.items || []).map((it) => ({
                  ...it,
                  id: it.productId || it.id,
                  productId: it.productId || it.id,
                  name: it.productName || it.name,
                  productName: it.productName || it.name,
                  price: Number(it.price) || 0,
                  quantity: Number(it.quantity) || 1,
                  image: it.imageUrl || it.image,
                  imageUrl: it.imageUrl || it.image
                }))
              };
            });
            onUpdate(orders);
          },
          (error) => {
            console.error('❌ [Firestore Orders Listener Error]:', error);
            if (onError) onError(error);
          }
        );
        return unsubscribe;
      } catch (err) {
        console.error('Failed to attach Firestore listener:', err);
        if (onError) onError(err);
      }
    }

    // Fallback: local subscription
    const pushLocal = (currentOrdersList) => {
      const orders = (currentOrdersList || getLocalOrders()).map((o) => ({
        ...o,
        phone: o.mobileNumber || o.mobile || o.phone,
        mobileNumber: o.mobileNumber || o.mobile || o.phone,
        grandTotal: o.total !== undefined ? o.total : o.grandTotal,
        total: o.total !== undefined ? o.total : o.grandTotal
      }));
      onUpdate(orders);
    };

    pushLocal();

    const localListener = (orders) => {
      pushLocal(orders);
    };
    localOrderListeners.add(localListener);

    return () => {
      localOrderListeners.delete(localListener);
    };
  },

  /**
   * Real-time subscription to orders by customer mobile number (Customer Order Tracking)
   */
  subscribeToOrdersByPhone(mobileNumber, onUpdate, onError) {
    const cleanPhone = String(mobileNumber || '').replace(/[^0-9]/g, '');

    if (!cleanPhone || cleanPhone.length < 10) {
      onUpdate([]);
      return () => {};
    }

    const normalizeOrderData = (data, id) => {
      const rawStatus = data.status || data.orderStatus || 'placed';
      const normalizedStatus = String(rawStatus).toLowerCase();
      const tokenVal = data.tokenNumber || data.token || parseInt(id, 10) || 101;
      const subtotalVal = data.subtotal !== undefined ? Number(data.subtotal) : (data.items || []).reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
      const discountVal = Number(data.discount) || 0;
      const totalVal = data.total !== undefined ? Number(data.total) : (data.grandTotal !== undefined ? Number(data.grandTotal) : subtotalVal - discountVal);

      return {
        ...data,
        id: id,
        orderId: data.orderId || id,
        token: tokenVal,
        tokenNumber: tokenVal,
        customerName: data.customerName || 'Valued Customer',
        phone: data.mobileNumber || data.mobile || data.phone || cleanPhone,
        mobileNumber: data.mobileNumber || data.mobile || data.phone || cleanPhone,
        status: normalizedStatus === 'received' ? 'placed' : (normalizedStatus === 'collected' ? 'completed' : normalizedStatus),
        orderStatus: (data.orderStatus || normalizedStatus).toUpperCase(),
        subtotal: subtotalVal,
        discount: discountVal,
        total: totalVal,
        grandTotal: totalVal,
        paymentStatus: data.paymentStatus || (normalizedStatus === 'completed' || normalizedStatus === 'collected' ? 'Paid & Collected' : 'Pending Payment at Counter'),
        pickupOnly: data.pickupOnly !== false,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt || data.createdAt || new Date().toISOString(),
        items: (data.items || []).map((it) => {
          const pName = it.productName || it.name || 'Paan';
          const pPrice = Number(it.price) || 0;
          const pQty = Number(it.quantity) || 1;
          const pImg = it.imageUrl || it.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
          return {
            ...it,
            id: it.productId || it.id || 'prod',
            productId: it.productId || it.id || 'prod',
            name: pName,
            productName: pName,
            price: pPrice,
            quantity: pQty,
            itemTotal: pPrice * pQty,
            image: typeof pImg === 'string' ? pImg.replace('e_grayscale,', '') : pImg,
            imageUrl: typeof pImg === 'string' ? pImg.replace('e_grayscale,', '') : pImg
          };
        })
      };
    };

    if (isFirebaseConfigured && db) {
      try {
        const q = query(
          collection(db, 'orders'),
          where('mobileNumber', '==', cleanPhone)
        );

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const list = snapshot.docs.map((docSnap) => normalizeOrderData(docSnap.data(), docSnap.id));
            // Sort newest orders first
            list.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
            onUpdate(list);
          },
          (err) => {
            console.error('❌ [Firestore OrdersByPhone Listener Error]:', err);
            // Fallback try with 'mobile' field
            try {
              const qAlt = query(collection(db, 'orders'), where('mobile', '==', cleanPhone));
              const unsubAlt = onSnapshot(
                qAlt,
                (snapAlt) => {
                  const listAlt = snapAlt.docs.map((docSnap) => normalizeOrderData(docSnap.data(), docSnap.id));
                  listAlt.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
                  onUpdate(listAlt);
                },
                (altErr) => {
                  if (onError) onError(altErr);
                }
              );
              return unsubAlt;
            } catch (fallbackErr) {
              if (onError) onError(fallbackErr);
            }
          }
        );

        return unsubscribe;
      } catch (err) {
        console.error('Failed to attach phone orders listener:', err);
        if (onError) onError(err);
      }
    }

    // Fallback: local subscription
    const findAndPush = (currentOrdersList) => {
      const orders = currentOrdersList || getLocalOrders();
      const filtered = orders.filter((o) => {
        const p = String(o.mobileNumber || o.mobile || o.phone || '').replace(/[^0-9]/g, '');
        return p === cleanPhone || p.endsWith(cleanPhone) || cleanPhone.endsWith(p);
      }).map((o) => normalizeOrderData(o, o.id || o.orderId));
      filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      onUpdate(filtered);
    };

    findAndPush();

    const localListener = (orders) => {
      findAndPush(orders);
    };
    localOrderListeners.add(localListener);

    return () => {
      localOrderListeners.delete(localListener);
    };
  },

  /**
   * Fetch single order by ID or Token
   */
  async getOrderById(orderId) {
    const idStr = String(orderId);
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDoc(doc(db, 'orders', idStr));
        if (snap.exists()) {
          const data = snap.data();
          return {
            ...data,
            id: snap.id,
            orderId: data.orderId || snap.id,
            status: data.status || data.orderStatus || 'placed',
            orderStatus: data.orderStatus || data.status || 'PLACED'
          };
        }
      } catch (err) {
        console.warn('getOrderById error:', err);
      }
    }
    const orders = getLocalOrders();
    return orders.find((o) => String(o.id) === idStr || String(o.token) === idStr || String(o.tokenNumber) === idStr) || null;
  },

  /**
   * Real-time subscription to a single order (Customer Tracking)
   */
  subscribeToOrder(tokenOrId, onUpdate, onError) {
    const idStr = String(tokenOrId);
    const tokenNum = parseInt(idStr, 10);

    if (isFirebaseConfigured && db) {
      try {
        const docRef = doc(db, 'orders', idStr);
        const unsubscribe = onSnapshot(
          docRef,
          (snapshot) => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              const rawStatus = data.status || data.orderStatus || 'placed';
              const normalizedStatus = String(rawStatus).toLowerCase();

              onUpdate({
                ...data,
                id: snapshot.id,
                orderId: data.orderId || snapshot.id,
                token: data.token || data.tokenNumber || tokenNum,
                tokenNumber: data.tokenNumber || data.token || tokenNum,
                phone: data.mobileNumber || data.mobile || data.phone || '',
                mobileNumber: data.mobileNumber || data.mobile || data.phone || '',
                status: normalizedStatus === 'received' ? 'placed' : normalizedStatus,
                orderStatus: (data.orderStatus || normalizedStatus).toUpperCase(),
                total: data.total !== undefined ? data.total : (data.grandTotal || 0)
              });
            } else if (!isNaN(tokenNum)) {
              // Fallback query by token field
              const q = query(collection(db, 'orders'), where('token', '==', tokenNum));
              getDocs(q).then((querySnap) => {
                if (!querySnap.empty) {
                  const docSnap = querySnap.docs[0];
                  const data = docSnap.data();
                  const rawStatus = data.status || data.orderStatus || 'placed';
                  const normalizedStatus = String(rawStatus).toLowerCase();

                  onUpdate({
                    ...data,
                    id: docSnap.id,
                    orderId: data.orderId || docSnap.id,
                    token: data.token || data.tokenNumber || tokenNum,
                    tokenNumber: data.tokenNumber || data.token || tokenNum,
                    phone: data.mobileNumber || data.mobile || data.phone || '',
                    mobileNumber: data.mobileNumber || data.mobile || data.phone || '',
                    status: normalizedStatus === 'received' ? 'placed' : normalizedStatus,
                    orderStatus: (data.orderStatus || normalizedStatus).toUpperCase(),
                    total: data.total !== undefined ? data.total : (data.grandTotal || 0)
                  });
                } else {
                  onUpdate(null);
                }
              });
            } else {
              onUpdate(null);
            }
          },
          (error) => {
            console.error('❌ [Firestore Order Listener Error]:', error);
            if (onError) onError(error);
          }
        );
        return unsubscribe;
      } catch (err) {
        console.error('Failed to attach single order listener:', err);
        if (onError) onError(err);
      }
    }

    // Fallback: local subscription
    const findAndPush = (currentOrdersList) => {
      const orders = currentOrdersList || getLocalOrders();
      const match = orders.find((o) => String(o.id) === idStr || String(o.token) === idStr || String(o.tokenNumber) === idStr);
      if (match) {
        onUpdate({
          ...match,
          phone: match.mobileNumber || match.mobile || match.phone,
          mobileNumber: match.mobileNumber || match.mobile || match.phone,
          total: match.total !== undefined ? match.total : match.grandTotal
        });
      } else {
        onUpdate(null);
      }
    };

    findAndPush();

    const localListener = (orders) => {
      findAndPush(orders);
    };
    localOrderListeners.add(localListener);

    return () => {
      localOrderListeners.delete(localListener);
    };
  },

  /**
   * Update Order Status in Firestore (Admin Action)
   * Supports: PLACED, ACCEPTED, PREPARING, READY, COMPLETED, CANCELLED
   */
  async updateOrderStatus(orderId, newStatus) {
    const idStr = String(orderId);
    const normalizedStatus = String(newStatus).toLowerCase();
    const upperStatus = String(newStatus).toUpperCase();

    let paymentStatusUpdate = undefined;
    if (normalizedStatus === 'completed' || normalizedStatus === 'collected') {
      paymentStatusUpdate = 'Paid & Collected';
    }

    if (isFirebaseConfigured && db) {
      try {
        const orderRef = doc(db, 'orders', idStr);

        await runTransaction(db, async (transaction) => {
          const orderSnap = await transaction.get(orderRef);
          if (!orderSnap.exists()) {
            throw new Error(`Order #${orderId} not found.`);
          }

          const orderData = orderSnap.data();
          const currentStatus = String(orderData.status || orderData.orderStatus || '').toLowerCase();

          // Prevent illegal backwards transition if order is already completed
          if ((currentStatus === 'completed' || currentStatus === 'collected') && (normalizedStatus === 'preparing' || normalizedStatus === 'accepted' || normalizedStatus === 'placed')) {
            throw new Error(`Order #${orderId} is already Completed and cannot be reverted to ${newStatus}.`);
          }

          const updatePayload = {
            status: normalizedStatus === 'received' ? 'placed' : normalizedStatus,
            orderStatus: upperStatus === 'RECEIVED' ? 'PLACED' : upperStatus,
            updatedAt: new Date().toISOString(),
            updatedAtTimestamp: serverTimestamp()
          };
          if (paymentStatusUpdate) {
            updatePayload.paymentStatus = paymentStatusUpdate;
          }

          // If cancelled / rejected and stock was not already restored, return ordered quantities back to stock
          const isCancelling = normalizedStatus === 'cancelled' || normalizedStatus === 'rejected';
          if (isCancelling && orderData.stockRestored !== true) {
            updatePayload.stockRestored = true;

            const items = orderData.items || [];
            for (const item of items) {
              const pId = item.productId || item.id;
              if (pId) {
                const prodRef = doc(db, 'products', pId);
                const prodSnap = await transaction.get(prodRef);
                if (prodSnap.exists()) {
                  const currentStock = prodSnap.data().stockQuantity !== undefined ? Number(prodSnap.data().stockQuantity) : 0;
                  transaction.update(prodRef, {
                    stockQuantity: currentStock + (Number(item.quantity) || 1),
                    updatedAt: serverTimestamp()
                  });
                }
              }
            }
          }

          transaction.update(orderRef, updatePayload);
        });

        // Fetch fresh order for notification
        try {
          const snap = await getDoc(orderRef);
          if (snap.exists()) {
            const freshData = snap.data();
            await notificationService.sendOrderStatusNotification(freshData, normalizedStatus);
          }
        } catch (notifErr) {
          console.warn('⚠️ [Notification] Notification failed (order status updated successfully):', notifErr);
        }

        return true;
      } catch (error) {
        console.error('❌ [Firestore] Failed to update order status:', error);
        throw new Error(error.message || 'Could not update order. Please try again.');
      }
    } else {
      // Local fallback
      const orders = getLocalOrders();
      const existing = orders.find((o) => String(o.id) === idStr || String(o.token) === idStr || String(o.tokenNumber) === idStr);
      if (existing) {
        const curStatus = String(existing.status || existing.orderStatus || '').toLowerCase();
        if ((curStatus === 'completed' || curStatus === 'collected') && (normalizedStatus === 'preparing' || normalizedStatus === 'accepted' || normalizedStatus === 'placed')) {
          throw new Error(`Order #${orderId} is already Completed and cannot be reverted to ${newStatus}.`);
        }
      }

      let updatedOrder = null;
      let itemsToRestore = null;

      const updated = orders.map((o) => {
        if (String(o.id) === idStr || String(o.token) === idStr || String(o.tokenNumber) === idStr) {
          const modified = {
            ...o,
            status: normalizedStatus === 'received' ? 'placed' : normalizedStatus,
            orderStatus: upperStatus === 'RECEIVED' ? 'PLACED' : upperStatus,
            updatedAt: new Date().toISOString()
          };
          if (paymentStatusUpdate) {
            modified.paymentStatus = paymentStatusUpdate;
          }

          const isCancelling = normalizedStatus === 'cancelled' || normalizedStatus === 'rejected';
          if (isCancelling && o.stockRestored !== true) {
            modified.stockRestored = true;
            itemsToRestore = o.items || [];
          }

          updatedOrder = modified;
          return modified;
        }
        return o;
      });

      saveLocalOrders(updated);

      // Restore stock locally if cancelled
      if (itemsToRestore && itemsToRestore.length > 0) {
        const currentProducts = getLocalProducts();
        const restoredProducts = currentProducts.map((p) => {
          const match = itemsToRestore.find((it) => (it.productId || it.id) === p.id);
          if (match) {
            const currentStock = p.stockQuantity !== undefined ? Number(p.stockQuantity) : 0;
            return {
              ...p,
              stockQuantity: currentStock + (Number(match.quantity) || 1)
            };
          }
          return p;
        });
        saveLocalProducts(restoredProducts);
      }

      if (updatedOrder) {
        try {
          await notificationService.sendOrderStatusNotification(updatedOrder, normalizedStatus);
        } catch (notifErr) {
          console.warn('⚠️ [Notification] Notification failed (order status updated successfully):', notifErr);
        }
      }

      return true;
    }
  }
};

