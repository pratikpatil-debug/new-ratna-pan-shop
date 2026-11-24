import { db, storage, isFirebaseConfigured } from './firebase/config.js';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  increment
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { INITIAL_PRODUCTS } from '../data/initialProducts.js';

const STORAGE_PRODUCTS_KEY = 'nr_firebase_products_catalog_v5';

const memoryStore = new Map();

const safeGetItem = (key) => {
  try {
    if (typeof localStorage !== 'undefined') return localStorage.getItem(key);
  } catch (e) {}
  return memoryStore.get(key) || null;
};

const safeSetItem = (key, val) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(key, val);
  } catch (e) {}
  memoryStore.set(key, val);
};

export const getLocalProducts = () => {
  try {
    const data = safeGetItem(STORAGE_PRODUCTS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Restore all 29 products in exact sequence and URLs, preserving existing stockQuantity & availability
        const merged = INITIAL_PRODUCTS.map((initProd) => {
          const existing = parsed.find((p) => p.id === initProd.id || p.name === initProd.name);
          const stockQty = existing && existing.stockQuantity !== undefined ? Number(existing.stockQuantity) : (Number(initProd.stockQuantity) || 0);
          const isAvail = existing && (existing.isAvailable !== undefined || existing.available !== undefined)
            ? (existing.isAvailable !== undefined ? Boolean(existing.isAvailable) : Boolean(existing.available))
            : (initProd.isAvailable ?? true);

          return {
            ...initProd,
            stockQuantity: isNaN(stockQty) ? 0 : Math.max(0, stockQty),
            available: isAvail,
            isAvailable: isAvail,
            image: typeof initProd.image === 'string' ? initProd.image.replace('e_grayscale,', '') : initProd.image
          };
        });
        return merged.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
      }
    }
  } catch (err) {
    console.error('Failed to read local products cache:', err);
  }
  safeSetItem(STORAGE_PRODUCTS_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return [...INITIAL_PRODUCTS].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
};

export const saveLocalProducts = (products) => {
  try {
    const sorted = [...products].sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
    safeSetItem(STORAGE_PRODUCTS_KEY, JSON.stringify(sorted));
    if (typeof window !== 'undefined' && typeof CustomEvent !== 'undefined') {
      window.dispatchEvent(new CustomEvent('nr_products_updated', { detail: sorted }));
    }
  } catch (err) {
    console.error('Failed to save local products:', err);
  }
};

export const productService = {
  /**
   * Fetch all products from Firestore or local fallback
   */
  async getProducts() {
    if (isFirebaseConfigured && db) {
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (!snap.empty) {
          const list = snap.docs.map((d) => {
            const data = d.data();
            const stockQty = data.stockQuantity !== undefined ? Number(data.stockQuantity) : 0;
            const isAvail = data.isAvailable !== undefined ? Boolean(data.isAvailable) : (data.available !== undefined ? Boolean(data.available) : true);
            return {
              ...data,
              id: d.id,
              price: Number(data.price) || 0,
              stockQuantity: isNaN(stockQty) ? 0 : Math.max(0, stockQty),
              available: isAvail,
              isAvailable: isAvail,
              image: typeof data.image === 'string' ? data.image.replace('e_grayscale,', '') : data.image
            };
          });
          return list.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));
        }
      } catch (err) {
        console.warn('getProducts error:', err);
      }
    }
    return getLocalProducts();
  },

  /**
   * Real-time subscription to Products collection (Single Source of Truth)
   */
  subscribeToProducts(onUpdate, onError) {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'products'));
        const unsubscribe = onSnapshot(
          q,
          async (snapshot) => {
            if (snapshot.empty) {
              console.log('🌱 [Firestore Products] Collection is empty. Auto-seeding 29 catalog products...');
              await this.seedInitialProducts();
              return;
            }

            const products = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              const stockQty = data.stockQuantity !== undefined 
                ? Number(data.stockQuantity) 
                : (data.stock !== undefined ? Number(data.stock) : 0);
              const isAvailable = data.available !== undefined 
                ? Boolean(data.available) 
                : (data.isAvailable !== undefined ? Boolean(data.isAvailable) : true);

              const rawImg = data.image || 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80';
              const cleanImg = typeof rawImg === 'string' ? rawImg.replace('e_grayscale,', '') : rawImg;

              return {
                ...data,
                id: docSnap.id,
                displayOrder: Number(data.displayOrder) || 999,
                name: data.name || '',
                category: data.category || 'meetha',
                price: Number(data.price) || 0,
                description: data.description || '',
                image: cleanImg,
                stockQuantity: isNaN(stockQty) ? 0 : Math.max(0, stockQty),
                available: isAvailable,
                isAvailable: isAvailable,
                tags: Array.isArray(data.tags) ? data.tags : [],
                ingredients: data.ingredients || '',
                prepTime: data.prepTime || '2 mins',
                customizable: data.customizable !== false
              };
            });

            // Maintain exact 1-29 catalog sequence (not alphabetical, not price sorted)
            products.sort((a, b) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999));

            console.log(`CUSTOMER / APP: Products snapshot received (${products.length} products in sequence)`);
            onUpdate(products);
          },
          (error) => {
            console.error('❌ [Firestore Products Listener Error]:', error);
            if (onError) onError(error);
          }
        );
        return unsubscribe;
      } catch (err) {
        console.error('Failed to subscribe to products in Firestore:', err);
        if (onError) onError(err);
      }
    }

    // Fallback: local subscription
    const pushLocal = () => {
      const prods = getLocalProducts();
      console.log(`CUSTOMER / APP: Local products snapshot received (${prods.length} products)`);
      onUpdate(prods);
    };
    pushLocal();

    const handleCustomEvent = (e) => {
      if (e.detail) {
        console.log(`CUSTOMER / APP: Local products update event (${e.detail.length} products)`);
        onUpdate(e.detail);
      }
    };

    window.addEventListener('nr_products_updated', handleCustomEvent);
    return () => {
      window.removeEventListener('nr_products_updated', handleCustomEvent);
    };
  },

  /**
   * Restore & Sync 29 Catalog Products into Firestore while strictly preserving existing stockQuantity and availability
   */
  async seedInitialProducts() {
    if (!isFirebaseConfigured || !db) return;
    try {
      // 1. Read existing products to preserve existing stockQuantity and availability
      const existingSnap = await getDocs(collection(db, 'products'));
      const existingMap = new Map();
      for (const docSnap of existingSnap.docs) {
        existingMap.set(docSnap.id, docSnap.data());
      }

      // 2. Set/update all 29 initial products with exact sequence, full-color images, prices, preserving stock
      for (const prod of INITIAL_PRODUCTS) {
        const prodRef = doc(db, 'products', prod.id);
        const existingData = existingMap.get(prod.id);

        const currentStock = existingData && existingData.stockQuantity !== undefined
          ? Number(existingData.stockQuantity)
          : (Number(prod.stockQuantity) || 0);

        const currentAvailable = existingData && (existingData.isAvailable !== undefined || existingData.available !== undefined)
          ? (existingData.isAvailable !== undefined ? Boolean(existingData.isAvailable) : Boolean(existingData.available))
          : (prod.isAvailable ?? true);

        const cleanImg = typeof prod.image === 'string' ? prod.image.replace('e_grayscale,', '') : prod.image;

        await setDoc(prodRef, {
          id: prod.id,
          displayOrder: prod.displayOrder,
          name: prod.name,
          category: prod.category,
          price: Number(prod.price),
          stockQuantity: isNaN(currentStock) ? 0 : Math.max(0, currentStock),
          description: prod.description,
          image: cleanImg,
          tags: prod.tags || [],
          available: currentAvailable,
          isAvailable: currentAvailable,
          prepTime: prod.prepTime || '2 mins',
          ingredients: prod.ingredients || '',
          customizable: Boolean(prod.customizable),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }
      console.log('✅ [Firestore Products] Successfully synced 29 catalog products in Firestore with preserved stock.');
    } catch (err) {
      console.warn('⚠️ [Firestore Products] Seeding skipped or encountered error:', err);
    }
  },

  /**
   * Upload product image to Firebase Storage and return download URL
   */
  async uploadProductImage(file, productId = 'prod') {
    if (!file) throw new Error('No image file provided');

    if (isFirebaseConfigured && storage) {
      try {
        const sanitizedName = file.name ? file.name.replace(/[^a-zA-Z0-9.-]/g, '_') : 'image.jpg';
        const storagePath = `products/${productId}_${Date.now()}_${sanitizedName}`;
        const imageRef = ref(storage, storagePath);
        
        console.log(`Uploading image to Firebase Storage: ${storagePath}`);
        const snapshot = await uploadBytes(imageRef, file);
        const downloadUrl = await getDownloadURL(snapshot.ref);
        console.log(`Image uploaded successfully. Download URL: ${downloadUrl}`);
        return downloadUrl;
      } catch (error) {
        console.error('❌ [Firebase Storage] Upload failed:', error);
        throw new Error(error.message || 'Image upload failed. Please try again or provide an Image URL.');
      }
    } else {
      // Local fallback: convert to base64 Data URL
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsDataURL(file);
      });
    }
  },

  /**
   * Add a new product
   */
  async addProduct(productData) {
    const id = productData.id || `prod-${Date.now()}`;
    const stockQty = Number(productData.stockQuantity !== undefined ? productData.stockQuantity : 0) || 0;
    const isAvail = productData.isAvailable !== undefined 
      ? Boolean(productData.isAvailable) 
      : (productData.available !== undefined ? Boolean(productData.available) : true);

    const payload = {
      id,
      name: productData.name.trim(),
      category: productData.category || 'meetha',
      price: Number(productData.price) || 0,
      stockQuantity: Math.max(0, stockQty),
      description: productData.description || '',
      image: productData.image || 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80',
      tags: Array.isArray(productData.tags) ? productData.tags : [],
      available: isAvail,
      isAvailable: isAvail,
      prepTime: productData.prepTime || '2 mins',
      ingredients: productData.ingredients || '',
      customizable: Boolean(productData.customizable)
    };

    if (isFirebaseConfigured && db) {
      try {
        const prodRef = doc(db, 'products', id);
        await setDoc(prodRef, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return payload;
      } catch (error) {
        console.error('❌ [Firestore] Failed to add product:', error);
        throw new Error(error.message || 'Failed to add product');
      }
    } else {
      const current = getLocalProducts();
      const updated = [payload, ...current];
      saveLocalProducts(updated);
      return payload;
    }
  },

  /**
   * Update existing product document in place (Same document products/{productId})
   */
  async editProduct(productId, updatedData) {
    if (!productId) {
      throw new Error('Product ID is required for updating');
    }

    const cleanPayload = {};
    if (updatedData.name !== undefined) cleanPayload.name = updatedData.name.trim();
    if (updatedData.category !== undefined) cleanPayload.category = updatedData.category;
    if (updatedData.price !== undefined) cleanPayload.price = Number(updatedData.price) || 0;
    if (updatedData.description !== undefined) cleanPayload.description = updatedData.description;
    if (updatedData.image !== undefined) cleanPayload.image = updatedData.image;
    if (updatedData.tags !== undefined) cleanPayload.tags = Array.isArray(updatedData.tags) ? updatedData.tags : [];
    if (updatedData.prepTime !== undefined) cleanPayload.prepTime = updatedData.prepTime;
    if (updatedData.ingredients !== undefined) cleanPayload.ingredients = updatedData.ingredients;
    if (updatedData.customizable !== undefined) cleanPayload.customizable = Boolean(updatedData.customizable);

    if (updatedData.available !== undefined) {
      cleanPayload.available = Boolean(updatedData.available);
      cleanPayload.isAvailable = Boolean(updatedData.available);
    } else if (updatedData.isAvailable !== undefined) {
      cleanPayload.available = Boolean(updatedData.isAvailable);
      cleanPayload.isAvailable = Boolean(updatedData.isAvailable);
    }

    // Canonical stockQuantity as strict NUMBER
    if (updatedData.stockQuantity !== undefined) {
      cleanPayload.stockQuantity = Math.max(0, Number(updatedData.stockQuantity) || 0);
    }

    if (isFirebaseConfigured && db) {
      try {
        const prodRef = doc(db, 'products', productId);
        await setDoc(
          prodRef,
          {
            ...cleanPayload,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );

        // Verification read
        const verifySnap = await getDoc(prodRef);
        if (verifySnap.exists()) {
          console.log(`[Firestore Product Verified]: ${productId}`, verifySnap.data());
        }
        return true;
      } catch (error) {
        console.error('❌ [Firestore] Failed to update product:', error);
        throw new Error(error.message || 'Failed to update product');
      }
    } else {
      const current = getLocalProducts();
      const updated = current.map((p) =>
        p.id === productId
          ? {
              ...p,
              ...cleanPayload,
              price: cleanPayload.price !== undefined ? cleanPayload.price : p.price,
              stockQuantity: cleanPayload.stockQuantity !== undefined ? cleanPayload.stockQuantity : (Number(p.stockQuantity) || 0),
              available: cleanPayload.available !== undefined ? cleanPayload.available : (p.available ?? true),
              isAvailable: cleanPayload.isAvailable !== undefined ? cleanPayload.isAvailable : (p.isAvailable ?? true)
            }
          : p
      );
      saveLocalProducts(updated);
      return true;
    }
  },

  /**
   * Adjust stock quantity by delta (+1, -1, +5, etc.) or set directly as numeric stockQuantity
   */
  async adjustStock(productId, deltaOrNewValue, isAbsolute = false) {
    if (isFirebaseConfigured && db) {
      try {
        const prodRef = doc(db, 'products', productId);
        let newVal = 0;
        if (isAbsolute) {
          newVal = Math.max(0, Number(deltaOrNewValue) || 0);
        } else {
          const snap = await getDoc(prodRef);
          if (snap.exists()) {
            const current = Number(snap.data().stockQuantity) || 0;
            newVal = Math.max(0, current + Number(deltaOrNewValue));
          } else {
            newVal = Math.max(0, Number(deltaOrNewValue) || 0);
          }
        }

        await setDoc(
          prodRef,
          {
            stockQuantity: newVal,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );

        // Verification read
        const verifySnap = await getDoc(prodRef);
        if (verifySnap.exists()) {
          console.log(`[Firestore stockQuantity verified]: ${productId} -> ${verifySnap.data().stockQuantity}`);
        }
        return newVal;
      } catch (error) {
        console.error('❌ [Firestore] Failed to adjust stock:', error);
        throw new Error(error.message || 'Failed to update stock');
      }
    } else {
      const current = getLocalProducts();
      let updatedVal = 0;
      const updated = current.map((p) => {
        if (p.id === productId) {
          const currentQty = Number(p.stockQuantity) || 0;
          updatedVal = isAbsolute ? Math.max(0, Number(deltaOrNewValue) || 0) : Math.max(0, currentQty + Number(deltaOrNewValue));
          return {
            ...p,
            stockQuantity: updatedVal
          };
        }
        return p;
      });
      saveLocalProducts(updated);
      return updatedVal;
    }
  },

  /**
   * Toggle in-stock / out-of-stock availability (does NOT touch stockQuantity)
   */
  async toggleAvailability(productId, currentAvailable) {
    const nextAvailable = !currentAvailable;
    if (isFirebaseConfigured && db) {
      try {
        const prodRef = doc(db, 'products', productId);
        await setDoc(
          prodRef,
          {
            available: nextAvailable,
            isAvailable: nextAvailable,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
        return nextAvailable;
      } catch (error) {
        console.error('❌ [Firestore] Failed to toggle product availability:', error);
        throw new Error(error.message || 'Failed to toggle availability');
      }
    } else {
      const current = getLocalProducts();
      const updated = current.map((p) => (p.id === productId ? { ...p, available: nextAvailable, isAvailable: nextAvailable } : p));
      saveLocalProducts(updated);
      return nextAvailable;
    }
  },

  /**
   * Delete product
   */
  async deleteProduct(productId) {
    if (isFirebaseConfigured && db) {
      try {
        const prodRef = doc(db, 'products', productId);
        await deleteDoc(prodRef);
        console.log(`ADMIN: Product deleted: ${productId}`);
        return true;
      } catch (error) {
        console.error('❌ [Firestore] Failed to delete product:', error);
        throw new Error(error.message || 'Failed to delete product');
      }
    } else {
      const current = getLocalProducts();
      const updated = current.filter((p) => p.id !== productId);
      saveLocalProducts(updated);
      console.log(`ADMIN: Product deleted locally: ${productId}`);
      return true;
    }
  }
};

