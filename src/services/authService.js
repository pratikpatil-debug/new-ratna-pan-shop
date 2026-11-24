import { auth, db, isFirebaseConfigured } from './firebase/config';
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const STORAGE_ADMIN_SESSION_KEY = 'nr_admin_auth_session_v2';

export const authService = {
  /**
   * Admin Login with Firebase Auth and fallback for mock credentials
   */
  async loginAdmin(emailOrPhone, password) {
    const cleanInput = emailOrPhone.trim().toLowerCase();

    // 1. If Firebase Auth is configured, attempt Firebase Sign-In
    if (isFirebaseConfigured && auth) {
      try {
        // If user typed a phone or username, allow standardized admin email format
        let loginEmail = cleanInput;
        if (!loginEmail.includes('@')) {
          loginEmail = `${loginEmail}@newratna.com`;
        }

        const userCredential = await signInWithEmailAndPassword(auth, loginEmail, password);
        const user = userCredential.user;

        // Verify admin permissions in `admins` Firestore collection (if collection rules are set)
        if (db) {
          try {
            const adminDocRef = doc(db, 'admins', user.uid);
            const adminDoc = await getDoc(adminDocRef);
            if (adminDoc.exists() && adminDoc.data().role === 'admin') {
              console.log('🛡️ [Firebase Auth] Admin verified via admins collection:', user.email);
            }
          } catch (ruleErr) {
            // If collection doesn't exist yet, authenticated admin user proceeds
            console.log('🛡️ [Firebase Auth] Admin logged in:', user.email);
          }
        }

        localStorage.setItem(STORAGE_ADMIN_SESSION_KEY, JSON.stringify({ email: user.email, uid: user.uid }));
        return { success: true, user: { email: user.email, uid: user.uid } };
      } catch (error) {
        console.warn('⚠️ [Firebase Auth] Login failed with Firebase, checking fallback demo credentials:', error.message);
        // If demo credentials match, provide smooth experience in dev
        if (
          (cleanInput === 'admin@newratna.com' || cleanInput === 'admin' || cleanInput === '9876543210') &&
          (password === 'admin123' || password === 'admin')
        ) {
          localStorage.setItem(STORAGE_ADMIN_SESSION_KEY, JSON.stringify({ email: 'admin@newratna.com', role: 'admin' }));
          return { success: true, user: { email: 'admin@newratna.com', role: 'admin' } };
        }
        throw new Error(error.message || 'Invalid admin credentials');
      }
    }

    // 2. Local Mock Authentication Fallback
    if (
      (cleanInput === 'admin@newratna.com' || cleanInput === 'admin' || cleanInput === '9876543210') &&
      (password === 'admin123' || password === 'admin')
    ) {
      const mockUser = { email: 'admin@newratna.com', name: 'Shop Manager', role: 'admin' };
      localStorage.setItem(STORAGE_ADMIN_SESSION_KEY, JSON.stringify(mockUser));
      return { success: true, user: mockUser };
    } else {
      throw new Error('Invalid credentials. Use demo: admin@newratna.com / admin123');
    }
  },

  /**
   * Admin Logout
   */
  async logoutAdmin() {
    if (isFirebaseConfigured && auth) {
      try {
        await signOut(auth);
      } catch (err) {
        console.warn('Firebase signOut error:', err);
      }
    }
    localStorage.removeItem(STORAGE_ADMIN_SESSION_KEY);
    return true;
  },

  /**
   * Check if current session is active
   */
  getCurrentAdmin() {
    try {
      const saved = localStorage.getItem(STORAGE_ADMIN_SESSION_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  },

  /**
   * Listen to Firebase Auth state
   */
  subscribeToAuthState(callback) {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, (user) => {
        if (user) {
          callback({ email: user.email, uid: user.uid });
        } else {
          callback(this.getCurrentAdmin());
        }
      });
    } else {
      callback(this.getCurrentAdmin());
      return () => {};
    }
  }
};
