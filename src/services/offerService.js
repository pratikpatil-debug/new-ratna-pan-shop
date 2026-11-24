import { db, isFirebaseConfigured } from './firebase/config.js';
import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  query,
  onSnapshot,
  serverTimestamp
} from 'firebase/firestore';
import { INITIAL_OFFERS } from '../data/initialOffers.js';

const STORAGE_OFFERS_KEY = 'nr_firebase_offers_cache_v1';

const getLocalOffers = () => {
  try {
    const data = localStorage.getItem(STORAGE_OFFERS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to read local offers cache:', err);
  }
  localStorage.setItem(STORAGE_OFFERS_KEY, JSON.stringify(INITIAL_OFFERS));
  return [...INITIAL_OFFERS];
};

const saveLocalOffers = (offers) => {
  try {
    localStorage.setItem(STORAGE_OFFERS_KEY, JSON.stringify(offers));
    window.dispatchEvent(new CustomEvent('nr_offers_updated', { detail: offers }));
  } catch (err) {
    console.error('Failed to save local offers:', err);
  }
};

/**
 * Checks if a date falls within startDate and endDate strings (YYYY-MM-DD or ISO).
 */
export const isOfferDateValid = (startDate, endDate, targetDate = new Date()) => {
  if (!startDate && !endDate) return true;
  const now = new Date(targetDate);
  // Normalize to date comparison at midnight
  const todayStr = now.toISOString().split('T')[0];

  if (startDate) {
    const startStr = String(startDate).split('T')[0];
    if (todayStr < startStr) return false;
  }
  if (endDate) {
    const endStr = String(endDate).split('T')[0];
    if (todayStr > endStr) return false;
  }
  return true;
};

export const offerService = {
  /**
   * Real-time subscription to Offers collection in Firestore
   */
  subscribeToOffers(onUpdate, onError) {
    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'offers'));
        const unsubscribe = onSnapshot(
          q,
          async (snapshot) => {
            if (snapshot.empty) {
              console.log('🌱 [Firestore Offers] Collection is empty. Auto-seeding initial offers...');
              await this.seedInitialOffers();
              return;
            }

            const offers = snapshot.docs.map((docSnap) => {
              const data = docSnap.data();
              return {
                ...data,
                id: docSnap.id,
                title: data.title || 'Special Deal',
                description: data.description || '',
                discountType: data.discountType || 'flat',
                discountValue: Number(data.discountValue) || 0,
                minimumQuantity: Number(data.minimumQuantity) || 1,
                applicableCategory: data.applicableCategory || 'all',
                applicableProductIds: Array.isArray(data.applicableProductIds) ? data.applicableProductIds : [],
                startDate: data.startDate || '',
                endDate: data.endDate || '',
                enabled: data.enabled !== false,
                createdAt: data.createdAt || new Date().toISOString(),
                updatedAt: data.updatedAt || new Date().toISOString()
              };
            });

            console.log(`CUSTOMER / APP: Offers snapshot received (${offers.length} offers)`);
            onUpdate(offers);
          },
          (error) => {
            console.error('❌ [Firestore Offers Listener Error]:', error);
            if (onError) onError(error);
          }
        );
        return unsubscribe;
      } catch (err) {
        console.error('Failed to subscribe to offers in Firestore:', err);
        if (onError) onError(err);
      }
    }

    // Fallback: local storage subscription
    const pushLocal = () => {
      const offers = getLocalOffers();
      console.log(`CUSTOMER / APP: Local offers snapshot (${offers.length} offers)`);
      onUpdate(offers);
    };
    pushLocal();

    const handleCustomEvent = (e) => {
      if (e.detail) {
        console.log(`CUSTOMER / APP: Local offers update event (${e.detail.length} offers)`);
        onUpdate(e.detail);
      }
    };

    window.addEventListener('nr_offers_updated', handleCustomEvent);
    return () => {
      window.removeEventListener('nr_offers_updated', handleCustomEvent);
    };
  },

  /**
   * Seed Initial 3 Offers to Firestore
   */
  async seedInitialOffers() {
    if (!isFirebaseConfigured || !db) return;
    try {
      for (const offer of INITIAL_OFFERS) {
        const offerRef = doc(db, 'offers', offer.id);
        await setDoc(
          offerRef,
          {
            ...offer,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
      }
      console.log('✅ [Firestore Offers] Successfully seeded initial offers.');
    } catch (err) {
      console.warn('⚠️ [Firestore Offers] Seeding skipped or encountered error:', err);
    }
  },

  /**
   * Create new Offer
   */
  async createOffer(offerData) {
    const id = offerData.id || `offer-${Date.now()}`;
    const payload = {
      id,
      title: offerData.title.trim(),
      description: (offerData.description || '').trim(),
      discountType: offerData.discountType || 'flat',
      discountValue: Math.max(0, Number(offerData.discountValue) || 0),
      minimumQuantity: Math.max(1, Number(offerData.minimumQuantity) || 1),
      applicableCategory: offerData.applicableCategory || 'all',
      applicableProductIds: Array.isArray(offerData.applicableProductIds) ? offerData.applicableProductIds : [],
      startDate: offerData.startDate || '',
      endDate: offerData.endDate || '',
      enabled: offerData.enabled !== false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    if (isFirebaseConfigured && db) {
      try {
        const offerRef = doc(db, 'offers', id);
        await setDoc(offerRef, {
          ...payload,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        return payload;
      } catch (error) {
        console.error('❌ [Firestore] Failed to create offer:', error);
        throw new Error(error.message || 'Failed to create offer');
      }
    } else {
      const current = getLocalOffers();
      const updated = [payload, ...current];
      saveLocalOffers(updated);
      return payload;
    }
  },

  /**
   * Edit existing Offer
   */
  async updateOffer(offerId, updatedData) {
    if (!offerId) throw new Error('Offer ID is required');

    const cleanPayload = {};
    if (updatedData.title !== undefined) cleanPayload.title = updatedData.title.trim();
    if (updatedData.description !== undefined) cleanPayload.description = updatedData.description.trim();
    if (updatedData.discountType !== undefined) cleanPayload.discountType = updatedData.discountType;
    if (updatedData.discountValue !== undefined) cleanPayload.discountValue = Math.max(0, Number(updatedData.discountValue) || 0);
    if (updatedData.minimumQuantity !== undefined) cleanPayload.minimumQuantity = Math.max(1, Number(updatedData.minimumQuantity) || 1);
    if (updatedData.applicableCategory !== undefined) cleanPayload.applicableCategory = updatedData.applicableCategory;
    if (updatedData.applicableProductIds !== undefined) cleanPayload.applicableProductIds = Array.isArray(updatedData.applicableProductIds) ? updatedData.applicableProductIds : [];
    if (updatedData.startDate !== undefined) cleanPayload.startDate = updatedData.startDate;
    if (updatedData.endDate !== undefined) cleanPayload.endDate = updatedData.endDate;
    if (updatedData.enabled !== undefined) cleanPayload.enabled = Boolean(updatedData.enabled);

    if (isFirebaseConfigured && db) {
      try {
        const offerRef = doc(db, 'offers', offerId);
        await setDoc(
          offerRef,
          {
            ...cleanPayload,
            updatedAt: serverTimestamp()
          },
          { merge: true }
        );
        return true;
      } catch (error) {
        console.error('❌ [Firestore] Failed to update offer:', error);
        throw new Error(error.message || 'Failed to update offer');
      }
    } else {
      const current = getLocalOffers();
      const updated = current.map((o) =>
        o.id === offerId
          ? {
              ...o,
              ...cleanPayload,
              updatedAt: new Date().toISOString()
            }
          : o
      );
      saveLocalOffers(updated);
      return true;
    }
  },

  /**
   * Toggle Offer Enabled / Disabled
   */
  async toggleOffer(offerId, currentEnabled) {
    const nextEnabled = !currentEnabled;
    return this.updateOffer(offerId, { enabled: nextEnabled });
  },

  /**
   * Delete Offer
   */
  async deleteOffer(offerId) {
    if (isFirebaseConfigured && db) {
      try {
        const offerRef = doc(db, 'offers', offerId);
        await deleteDoc(offerRef);
        return true;
      } catch (error) {
        console.error('❌ [Firestore] Failed to delete offer:', error);
        throw new Error(error.message || 'Failed to delete offer');
      }
    } else {
      const current = getLocalOffers();
      const updated = current.filter((o) => o.id !== offerId);
      saveLocalOffers(updated);
      return true;
    }
  },

  /**
   * Core Offer Evaluation Engine
   * Evaluates cart contents against active offers.
   * Returns:
   * - appliedOffer: The best qualified offer object (or null)
   * - discount: Numeric discount amount (never exceeds eligible subtotal, never makes cart negative)
   * - progressOffer: Offer object closest to being unlocked (or null)
   * - progressMessage: Human-friendly string (e.g., 'Add 1 more eligible Paan to unlock ₹20 OFF.')
   * - progressNeeded: Number of additional items needed
   */
  evaluateCartOffers(cart = [], offers = []) {
    if (!Array.isArray(cart) || cart.length === 0 || !Array.isArray(offers) || offers.length === 0) {
      return {
        appliedOffer: null,
        discount: 0,
        progressOffer: null,
        progressMessage: '',
        progressNeeded: 0,
        qualifiedOffers: []
      };
    }

    const today = new Date();

    // 1. Filter only enabled and currently valid offers
    const activeOffers = offers.filter((offer) => {
      if (offer.enabled === false) return false;
      return isOfferDateValid(offer.startDate, offer.endDate, today);
    });

    if (activeOffers.length === 0) {
      return {
        appliedOffer: null,
        discount: 0,
        progressOffer: null,
        progressMessage: '',
        progressNeeded: 0,
        qualifiedOffers: []
      };
    }

    const qualifiedList = [];
    const pendingList = [];

    for (const offer of activeOffers) {
      // Find matching items in cart
      const matchingItems = cart.filter((item) => {
        if (!item.product) return false;

        // Specific product IDs
        if (Array.isArray(offer.applicableProductIds) && offer.applicableProductIds.length > 0) {
          return offer.applicableProductIds.includes(item.product.id);
        }

        // Category matching
        if (offer.applicableCategory && offer.applicableCategory !== 'all') {
          return item.product.category === offer.applicableCategory;
        }

        // 'all' category matches all paan items
        return true;
      });

      const matchingQuantity = matchingItems.reduce((sum, it) => sum + (Number(it.quantity) || 0), 0);
      const matchingSubtotal = matchingItems.reduce(
        (sum, it) => sum + (Number(it.product.price) || 0) * (Number(it.quantity) || 0),
        0
      );

      const minQty = Math.max(1, Number(offer.minimumQuantity) || 1);

      if (matchingQuantity >= minQty) {
        // Calculate discount value
        let discount = 0;
        if (offer.discountType === 'percentage') {
          discount = Math.round((matchingSubtotal * (Number(offer.discountValue) || 0)) / 100);
        } else {
          // Flat discount
          discount = Number(offer.discountValue) || 0;
        }

        // Must never exceed matching subtotal
        const clampedDiscount = Math.min(discount, matchingSubtotal);

        qualifiedList.push({
          offer,
          discount: clampedDiscount,
          matchingQuantity,
          matchingSubtotal
        });
      } else {
        const needed = minQty - matchingQuantity;
        pendingList.push({
          offer,
          needed,
          matchingQuantity,
          potentialDiscount: Number(offer.discountValue) || 0
        });
      }
    }

    // 2. Determine best applied offer (highest discount, then highest minQty)
    let bestApplied = null;
    if (qualifiedList.length > 0) {
      qualifiedList.sort((a, b) => {
        if (b.discount !== a.discount) return b.discount - a.discount;
        return (b.offer.minimumQuantity || 0) - (a.offer.minimumQuantity || 0);
      });
      bestApplied = qualifiedList[0];
    }

    // 3. Determine best progress offer for non-qualified or next-tier offer
    let progressOffer = null;
    let progressMessage = '';
    let progressNeeded = 0;

    if (pendingList.length > 0) {
      // Prioritize smallest `needed` items, then highest potential discount
      pendingList.sort((a, b) => {
        if (a.needed !== b.needed) return a.needed - b.needed;
        return b.potentialDiscount - a.potentialDiscount;
      });

      const candidate = pendingList[0];
      progressOffer = candidate.offer;
      progressNeeded = candidate.needed;

      let categoryName = 'eligible Paan';
      if (candidate.offer.applicableCategory === 'meetha') {
        categoryName = 'Meetha Paan';
      } else if (candidate.offer.applicableCategory === 'royal') {
        categoryName = 'Royal Special Paan';
      } else if (candidate.offer.applicableCategory === 'flavored') {
        categoryName = 'Flavored Paan';
      } else if (candidate.offer.applicableCategory === 'traditional') {
        categoryName = 'Traditional Paan';
      }

      const itemWord = candidate.needed === 1 ? categoryName : `${categoryName}s`;
      progressMessage = `Add ${candidate.needed} more ${itemWord} to unlock ₹${candidate.offer.discountValue} OFF.`;
    }

    return {
      appliedOffer: bestApplied ? bestApplied.offer : null,
      discount: bestApplied ? bestApplied.discount : 0,
      progressOffer,
      progressMessage,
      progressNeeded,
      qualifiedOffers: qualifiedList
    };
  }
};
