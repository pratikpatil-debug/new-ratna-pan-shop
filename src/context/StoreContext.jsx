import React, { createContext, useContext, useState, useEffect } from 'react';
import { INITIAL_PRODUCTS, INITIAL_CATEGORIES, INITIAL_SHOP_CONFIG, INITIAL_ORDERS } from '../data/initialProducts';
import { INITIAL_OFFERS } from '../data/initialOffers';
import { isFirebaseConfigured } from '../services/firebase/config';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import { offerService } from '../services/offerService';
import { authService } from '../services/authService';
import { notificationService } from '../services/notificationService';

const StoreContext = createContext(null);

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};

export const StoreProvider = ({ children }) => {
  // 1. Products State (synced via productService live subscription)
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);

  // 2. Categories & Search
  const [categories] = useState(INITIAL_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 3. Offers State (synced via offerService live subscription)
  const [offers, setOffers] = useState(INITIAL_OFFERS);
  const [isLoadingOffers, setIsLoadingOffers] = useState(true);

  // 4. Shop Configuration (Shop Counter Pickup Only)
  const [shopConfig, setShopConfig] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_shop_config_v2');
      const parsed = saved ? JSON.parse(saved) : {};
      return { ...INITIAL_SHOP_CONFIG, ...parsed, logoUrl: '/logo.png' };
    } catch {
      return INITIAL_SHOP_CONFIG;
    }
  });

  // 5. Cart state
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_cart_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  // 6. Orders state (synced via orderService live subscription)
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Current tracked order ID / Token
  const [trackedOrderId, setTrackedOrderId] = useState(() => {
    try {
      return localStorage.getItem('nr_last_order_id_v2') || (INITIAL_ORDERS[0]?.id ?? '1001');
    } catch {
      return '1001';
    }
  });

  // Express Fast-Buy State
  const [expressBuyProduct, setExpressBuyProduct] = useState(null);

  // Last ordered item for 1-Click Fast Reordering
  const [lastOrderedItem, setLastOrderedItem] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_last_ordered_item_v2');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // 7. Navigation & View Routing
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined') {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        const isAuth = Boolean(authService.getCurrentAdmin());
        return isAuth ? 'admin-dashboard' : 'admin-login';
      }
    }
    return 'customer-home';
  });

  // 8. Admin Authentication state
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return Boolean(authService.getCurrentAdmin());
  });
  const [currentAdminUser, setCurrentAdminUser] = useState(() => {
    return authService.getCurrentAdmin();
  });

  // Admin Selected Order Detail Modal
  const [selectedAdminOrder, setSelectedAdminOrder] = useState(null);

  // 9. Toasts
  const [toasts, setToasts] = useState([]);

  // 10. Modals & Interactive Studio
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [showAgeDisclaimer, setShowAgeDisclaimer] = useState(false);
  const [isCustomPaanModalOpen, setIsCustomPaanModalOpen] = useState(false);
  const [isFlavorQuizOpen, setIsFlavorQuizOpen] = useState(false);
  const [counterPassOrder, setCounterPassOrder] = useState(null);

  // 11. Customer Favorites / Wishlist
  const [favorites, setFavorites] = useState(() => {
    try {
      const saved = localStorage.getItem('nr_favorites_v2');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const toggleFavorite = (productId) => {
    setFavorites((prev) => {
      const exists = prev.includes(productId);
      const updated = exists ? prev.filter((id) => id !== productId) : [...prev, productId];
      try {
        localStorage.setItem('nr_favorites_v2', JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      showToast(exists ? 'Removed from favorites' : 'Saved to favorites ❤️', 'info');
      return updated;
    });
  };

  const isFavorite = (productId) => favorites.includes(productId);

  // 12. Dynamic Typography / Font Theme ('royal' | 'modern' | 'classic')
  const [fontTheme, setFontThemeState] = useState(() => {
    try {
      return localStorage.getItem('nr_font_theme') || 'royal';
    } catch {
      return 'royal';
    }
  });

  const setFontTheme = (theme) => {
    setFontThemeState(theme);
    try {
      localStorage.setItem('nr_font_theme', theme);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-font-mode', theme);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-font-mode', fontTheme);
    }
  }, [fontTheme]);

  // ----------------------------------------------------
  // REAL-TIME FIRESTORE / LOCAL SUBSCRIPTIONS
  // ----------------------------------------------------

  // Subscribe to live Products
  useEffect(() => {
    setIsLoadingProducts(true);
    const unsubscribe = productService.subscribeToProducts(
      (liveProducts) => {
        setProducts(liveProducts);
        setIsLoadingProducts(false);
      },
      (err) => {
        console.error('Products subscription error:', err);
        setIsLoadingProducts(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Subscribe to live Offers
  useEffect(() => {
    setIsLoadingOffers(true);
    const unsubscribe = offerService.subscribeToOffers(
      (liveOffers) => {
        setOffers(liveOffers);
        setIsLoadingOffers(false);
      },
      (err) => {
        console.error('Offers subscription error:', err);
        setIsLoadingOffers(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Synchronize cart items with live products (price, name, image, stock, availability)
  useEffect(() => {
    if (products.length > 0 && cart.length > 0) {
      setCart((prevCart) =>
        prevCart.map((item) => {
          const live = products.find((p) => p.id === item.product.id);
          if (live) {
            return {
              ...item,
              product: live
            };
          }
          return item;
        })
      );
    }
  }, [products]);

  // Synchronize active quickViewProduct modal in real time
  useEffect(() => {
    if (quickViewProduct) {
      const fresh = products.find((p) => p.id === quickViewProduct.id);
      if (fresh) {
        setQuickViewProduct(fresh);
      }
    }
  }, [products]);

  // Subscribe to live Orders (Admin & shared state)
  useEffect(() => {
    setIsLoadingOrders(true);
    const unsubscribe = orderService.subscribeToOrders(
      (liveOrders) => {
        setOrders(liveOrders);
        setIsLoadingOrders(false);

        // Keep selected modal order synchronized in real time
        setSelectedAdminOrder((prev) => {
          if (!prev) return null;
          const fresh = liveOrders.find((o) => String(o.id) === String(prev.id) || String(o.token) === String(prev.token));
          return fresh || prev;
        });
      },
      (err) => {
        console.error('Orders subscription error:', err);
        setIsLoadingOrders(false);
      }
    );

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Subscribe to Firebase Auth state
  useEffect(() => {
    const unsubscribe = authService.subscribeToAuthState((adminUser) => {
      if (adminUser) {
        setIsAdminAuthenticated(true);
        setCurrentAdminUser(adminUser);
      } else {
        setIsAdminAuthenticated(false);
        setCurrentAdminUser(null);
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Persist Cart & ShopConfig
  useEffect(() => {
    try {
      localStorage.setItem('nr_cart_v2', JSON.stringify(cart));
    } catch (e) {
      console.error(e);
    }
  }, [cart]);

  useEffect(() => {
    try {
      localStorage.setItem('nr_shop_config_v2', JSON.stringify(shopConfig));
    } catch (e) {
      console.error(e);
    }
  }, [shopConfig]);

  // Handle URL hash changes
  useEffect(() => {
    const handleHash = () => {
      if (window.location.hash === '#admin' || window.location.pathname === '/admin') {
        setActiveView(isAdminAuthenticated ? 'admin-dashboard' : 'admin-login');
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, [isAdminAuthenticated]);

  // Toast Helper
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3800);
  };

  // ----------------------------------------------------
  // CART OPERATIONS & OFFERS EVALUATION
  // ----------------------------------------------------
  const addToCart = (product, quantity = 1, customizableNote = '') => {
    const isAvailable = product.isAvailable !== false && product.available !== false;
    const availableStock = product.stockQuantity !== undefined ? Number(product.stockQuantity) : 0;

    if (!isAvailable) {
      showToast(`"${product.name}" is currently unavailable.`, 'error');
      return false;
    }

    if (availableStock <= 0) {
      showToast(`"${product.name}" is currently Sold Out.`, 'error');
      return false;
    }

    // Find current total quantity for this product in cart (across customization variants)
    const currentInCart = cart
      .filter((item) => item.product.id === product.id)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (currentInCart + quantity > availableStock) {
      showToast(`Only ${availableStock} available.`, 'error');
      return false;
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.customizableNote === customizableNote
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        return [...prev, { product, quantity, customizableNote }];
      }
    });
    showToast(`Added "${product.name}" to your order!`);
    return true;
  };

  const addCustomPaanToCart = (customPaan) => {
    const customItem = {
      id: `custom-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: customPaan.name || 'Bespoke Royal Paan',
      category: 'royal',
      price: Number(customPaan.price) || 85,
      stockQuantity: 99,
      description: customPaan.description || 'Custom handcrafted paan made to your exact preference.',
      image: customPaan.image || 'https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_300,h_300,c_fit/FOOD_CATALOG/IMAGES/CMS/2024/8/27/14a25a25-80fc-4d44-a42e-62004d697657_e5aab33e-4d64-40fa-bb8c-fc5b8b49e006.jpg_compressed',
      ingredients: customPaan.ingredients || '',
      tags: ['Bespoke Custom', 'Handcrafted'],
      isAvailable: true,
      available: true,
      customizable: true
    };

    setCart((prev) => [...prev, { product: customItem, quantity: 1, customizableNote: customPaan.customizableNote || customPaan.ingredients || '' }]);
    setIsCartOpen(true);
    showToast(`Added "${customItem.name}" to your order!`, 'success');
  };

  const updateCartQuantity = (productId, newQuantity, customizableNote = '') => {
    if (newQuantity <= 0) {
      removeFromCart(productId, customizableNote);
      return;
    }

    const liveProduct = products.find((p) => p.id === productId);
    const availableStock = liveProduct?.stockQuantity !== undefined ? Number(liveProduct.stockQuantity) : 0;

    // Check total if other variants exist
    const otherVariantsQty = cart
      .filter((item) => item.product.id === productId && item.customizableNote !== customizableNote)
      .reduce((sum, item) => sum + item.quantity, 0);

    if (newQuantity + otherVariantsQty > availableStock) {
      showToast(`Only ${availableStock} available.`, 'error');
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.customizableNote === customizableNote) {
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const removeFromCart = (productId, customizableNote = '') => {
    setCart((prev) => prev.filter((item) => !(item.product.id === productId && item.customizableNote === customizableNote)));
    showToast('Item removed from order', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + (item.product.price || 0) * item.quantity, 0);
  const cartTotalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Real-time evaluation of active offers against cart items
  const offerEvaluation = offerService.evaluateCartOffers(cart, offers);
  const appliedOffer = offerEvaluation.appliedOffer;
  const cartDiscount = offerEvaluation.discount;
  const cartFinalTotal = Math.max(0, cartSubtotal - cartDiscount);
  const offerProgressMessage = offerEvaluation.progressMessage;
  const offerProgressOffer = offerEvaluation.progressOffer;
  const offerProgressNeeded = offerEvaluation.progressNeeded;

  // ----------------------------------------------------
  // ORDER MANAGEMENT (Firestore Atomic Creation & Status)
  // ----------------------------------------------------
  const placeOrder = async ({ customerName, phone, specialInstructions }) => {
    try {
      const createdOrder = await orderService.createOrder({
        customerName: customerName.trim(),
        mobile: phone.trim(),
        items: cart.map((item) => ({
          id: item.product.id,
          productId: item.product.id,
          name: item.product.name,
          price: item.product.price,
          quantity: item.quantity,
          customizableNote: item.customizableNote || '',
          image: item.product.image
        })),
        subtotal: cartSubtotal,
        discount: cartDiscount,
        appliedOffer: appliedOffer,
        total: cartFinalTotal,
        prepTimeMinutes: shopConfig.avgPrepMinutes,
        specialInstructions: specialInstructions || ''
      });

      const tokenStr = String(createdOrder.token || createdOrder.id);
      setTrackedOrderId(tokenStr);
      localStorage.setItem('nr_last_order_id_v2', tokenStr);
      localStorage.setItem('nr_customer_name_v2', customerName.trim());
      localStorage.setItem('nr_customer_phone_v2', phone.trim());

      // Save last ordered summary for 1-Click Fast Reorder
      if (cart.length > 0) {
        try {
          const summaryItem = {
            product: cart[0].product,
            quantity: cart[0].quantity,
            customizableNote: cart[0].customizableNote || '',
            date: new Date().toISOString()
          };
          setLastOrderedItem(summaryItem);
          localStorage.setItem('nr_last_ordered_item_v2', JSON.stringify(summaryItem));
        } catch (e) {}
      }

      clearCart();
      setActiveView('customer-confirmation');
      showToast(`Token #${tokenStr} sent to shop!`, 'success');
      return createdOrder;
    } catch (err) {
      console.error('Order placement failure:', err);
      showToast(err.message || 'Could not place order. Please try again.', 'error');
      // Do not clear cart on failure so the customer can retry without losing their order!
      throw err;
    }
  };

  // Instant 1-Tap Express Counter Order
  const expressPlaceOrder = async ({ product, quantity = 1, customizableNote = '', customerName, phone, specialInstructions = '' }) => {
    try {
      const subtotal = Number(product.price || 0) * Number(quantity);
      const createdOrder = await orderService.createOrder({
        customerName: customerName.trim(),
        mobile: phone.trim(),
        items: [
          {
            id: product.id,
            productId: product.id,
            name: product.name,
            price: product.price,
            quantity: Number(quantity),
            customizableNote: customizableNote || '',
            image: product.image
          }
        ],
        subtotal: subtotal,
        discount: 0,
        appliedOffer: null,
        total: subtotal,
        prepTimeMinutes: shopConfig.avgPrepMinutes,
        specialInstructions: specialInstructions ? `⚡ Express: ${specialInstructions}` : '⚡ Instant Counter Pickup'
      });

      const tokenStr = String(createdOrder.token || createdOrder.id);
      setTrackedOrderId(tokenStr);
      localStorage.setItem('nr_last_order_id_v2', tokenStr);
      localStorage.setItem('nr_customer_name_v2', customerName.trim());
      localStorage.setItem('nr_customer_phone_v2', phone.trim());

      const summaryItem = {
        product,
        quantity: Number(quantity),
        customizableNote: customizableNote || '',
        date: new Date().toISOString()
      };
      setLastOrderedItem(summaryItem);
      localStorage.setItem('nr_last_ordered_item_v2', JSON.stringify(summaryItem));

      setExpressBuyProduct(null);
      setActiveView('customer-confirmation');
      showToast(`⚡ Express Token #${tokenStr} placed successfully!`, 'success');
      return createdOrder;
    } catch (err) {
      console.error('Express order failure:', err);
      showToast(err.message || 'Could not place express order.', 'error');
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      const statusLabels = {
        received: 'Order Received',
        accepted: 'Accepted',
        preparing: 'Preparing',
        ready: 'READY FOR PICKUP',
        collected: 'Collected',
        rejected: 'Declined'
      };
      showToast(`Token #${orderId} marked as ${statusLabels[newStatus] || newStatus}`, 'info');
    } catch (err) {
      console.error('Status update failure:', err);
      showToast(err.message || 'Could not update order. Please try again.', 'error');
    }
  };

  const sendCustomerNotification = (order, eventType) => {
    return notificationService.sendOrderStatusNotification(order, eventType);
  };

  // ----------------------------------------------------
  // PRODUCT INVENTORY MANAGEMENT
  // ----------------------------------------------------
  const addProduct = async (productData) => {
    try {
      const newProduct = await productService.addProduct(productData);
      setProducts((prev) => [newProduct, ...prev.filter((p) => p.id !== newProduct.id)]);
      showToast(`Product "${newProduct.name}" added to menu!`);
      return newProduct;
    } catch (err) {
      showToast(`Failed to add product: ${err.message}`, 'error');
    }
  };

  const editProduct = async (productId, updatedData) => {
    try {
      // Optimistically update local state immediately
      setProducts((prev) =>
        prev.map((p) => {
          if (p.id === productId) {
            return {
              ...p,
              ...updatedData,
              price: updatedData.price !== undefined ? Number(updatedData.price) : p.price,
              stockQuantity: updatedData.stockQuantity !== undefined ? Number(updatedData.stockQuantity) : p.stockQuantity,
              available: updatedData.isAvailable !== undefined ? Boolean(updatedData.isAvailable) : p.available,
              isAvailable: updatedData.isAvailable !== undefined ? Boolean(updatedData.isAvailable) : p.isAvailable
            };
          }
          return p;
        })
      );
      await productService.editProduct(productId, updatedData);
      showToast('Product updated successfully!');
    } catch (err) {
      showToast(`Failed to update product: ${err.message}`, 'error');
    }
  };

  const adjustProductStock = async (productId, deltaOrNewValue, isAbsolute = false) => {
    try {
      const newQty = await productService.adjustStock(productId, deltaOrNewValue, isAbsolute);
      setProducts((prev) =>
        prev.map((p) => (p.id === productId ? { ...p, stockQuantity: newQty } : p))
      );
      showToast(`Stock updated to ${newQty}`, 'info');
      return newQty;
    } catch (err) {
      showToast(`Failed to update stock: ${err.message}`, 'error');
    }
  };

  const toggleProductAvailability = async (productId) => {
    const target = products.find((p) => p.id === productId);
    if (!target) return;
    try {
      const nextStatus = await productService.toggleAvailability(productId, target.isAvailable);
      setProducts((prev) =>
        prev.map((p) =>
          p.id === productId ? { ...p, available: nextStatus, isAvailable: nextStatus } : p
        )
      );
      showToast(`"${target.name}" is now ${nextStatus ? 'Available' : 'Unavailable'}`);
    } catch (err) {
      showToast(`Failed to update availability: ${err.message}`, 'error');
    }
  };

  const deleteProduct = async (productId) => {
    try {
      await productService.deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      showToast('Product removed from menu.', 'info');
    } catch (err) {
      showToast(`Failed to delete product: ${err.message}`, 'error');
    }
  };

  const uploadProductImage = async (file, productId) => {
    return productService.uploadProductImage(file, productId);
  };

  // ----------------------------------------------------
  // OFFERS & DEALS MANAGEMENT (Admin CRUD)
  // ----------------------------------------------------
  const createOffer = async (offerData) => {
    try {
      const newOffer = await offerService.createOffer(offerData);
      setOffers((prev) => [newOffer, ...prev.filter((o) => o.id !== newOffer.id)]);
      showToast(`Offer "${newOffer.title}" created successfully!`);
      return newOffer;
    } catch (err) {
      showToast(`Failed to create offer: ${err.message}`, 'error');
      throw err;
    }
  };

  const editOffer = async (offerId, updatedData) => {
    try {
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, ...updatedData } : o))
      );
      await offerService.updateOffer(offerId, updatedData);
      showToast('Offer updated successfully!');
      return true;
    } catch (err) {
      showToast(`Failed to update offer: ${err.message}`, 'error');
      throw err;
    }
  };

  const toggleOfferStatus = async (offerId) => {
    const target = offers.find((o) => o.id === offerId);
    if (!target) return;
    try {
      const nextStatus = !target.enabled;
      setOffers((prev) =>
        prev.map((o) => (o.id === offerId ? { ...o, enabled: nextStatus } : o))
      );
      await offerService.toggleOffer(offerId, target.enabled);
      showToast(`Offer "${target.title}" is now ${nextStatus ? 'Enabled' : 'Disabled'}`);
      return nextStatus;
    } catch (err) {
      showToast(`Failed to toggle offer: ${err.message}`, 'error');
    }
  };

  const deleteOffer = async (offerId) => {
    try {
      await offerService.deleteOffer(offerId);
      setOffers((prev) => prev.filter((o) => o.id !== offerId));
      showToast('Offer deleted successfully.', 'info');
      return true;
    } catch (err) {
      showToast(`Failed to delete offer: ${err.message}`, 'error');
      throw err;
    }
  };

  // ----------------------------------------------------
  // ADMIN AUTHENTICATION
  // ----------------------------------------------------
  const adminLogin = async (emailOrPhone, password) => {
    try {
      const result = await authService.loginAdmin(emailOrPhone, password);
      if (result.success) {
        setIsAdminAuthenticated(true);
        setCurrentAdminUser(result.user);
        setActiveView('admin-dashboard');
        showToast('Welcome back, Shop Manager!');
        return true;
      }
      return false;
    } catch (err) {
      showToast(err.message || 'Invalid admin credentials.', 'error');
      return false;
    }
  };

  const adminLogout = async () => {
    await authService.logoutAdmin();
    setIsAdminAuthenticated(false);
    setCurrentAdminUser(null);
    setActiveView('customer-home');
    showToast('Logged out of Admin Portal');
  };

  const value = {
    // Backend Status
    isFirebaseActive: isFirebaseConfigured,
    isLoadingProducts,
    isLoadingOrders,
    isLoadingOffers,

    // Products & Categories
    products,
    categories,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    addProduct,
    editProduct,
    adjustProductStock,
    toggleProductAvailability,
    deleteProduct,
    uploadProductImage,

    // Offers & Deals
    offers,
    appliedOffer,
    cartDiscount,
    cartFinalTotal,
    offerProgressMessage,
    offerProgressOffer,
    offerProgressNeeded,
    createOffer,
    editOffer,
    toggleOfferStatus,
    deleteOffer,

    // Shop Config
    shopConfig,
    setShopConfig,

    // Cart
    cart,
    isCartOpen,
    setIsCartOpen,
    addToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    cartSubtotal,
    cartTotalItems,

    // Orders & Express Fast Buy
    orders,
    trackedOrderId,
    setTrackedOrderId,
    placeOrder,
    expressPlaceOrder,
    expressBuyProduct,
    setExpressBuyProduct,
    lastOrderedItem,
    setLastOrderedItem,
    updateOrderStatus,

    // Admin Details
    selectedAdminOrder,
    setSelectedAdminOrder,
    sendCustomerNotification,

    // Navigation & Views
    activeView,
    setActiveView,

    // Admin Auth
    isAdminAuthenticated,
    currentAdminUser,
    adminLogin,
    adminLogout,

    // UI Utilities & Modals
    toasts,
    showToast,
    quickViewProduct,
    setQuickViewProduct,
    showAgeDisclaimer,
    setShowAgeDisclaimer,

    // New Features & Studio
    favorites,
    toggleFavorite,
    isFavorite,
    fontTheme,
    setFontTheme,
    isCustomPaanModalOpen,
    setIsCustomPaanModalOpen,
    isFlavorQuizOpen,
    setIsFlavorQuizOpen,
    counterPassOrder,
    setCounterPassOrder,
    addCustomPaanToCart
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

