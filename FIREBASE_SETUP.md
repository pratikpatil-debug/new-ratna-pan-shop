# 🔥 Firebase Setup & Integration Guide — New Ratna Pan Shop

This application is fully integrated with **Firebase (Cloud Firestore & Firebase Authentication)** with a clean, modular architecture and automatic local/prototype fallback.

---

## 📁 Architecture Overview

```
src/
  services/
    firebase/
      config.js            <- Firebase App, Auth, and Firestore initialization with safe fallback
    orderService.js        <- Atomic sequential token counter (#1001), real-time onSnapshot listeners, CRUD
    productService.js      <- Products collection, live sync, add/edit/toggle availability, auto-seed
    authService.js         <- Firebase Authentication & Admin role verification with demo fallback
    notificationService.js <- Modular customer SMS/WhatsApp notification dispatcher
firestore.rules            <- Production-grade security rules protecting orders, products, and admin access
.env.example               <- Template for Firebase API keys & project credentials
```

---

## 🚀 Quick Setup Steps

### 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add project** and name it (e.g. `new-ratna-pan-shop`).
3. (Optional) Disable Google Analytics for prototype or enable it if preferred.

---

### 2. Enable Cloud Firestore
1. In the Firebase console sidebar, navigate to **Build** → **Firestore Database**.
2. Click **Create database**.
3. Choose your database location (e.g. `asia-south1` for Mumbai/India or `us-central1`).
4. Start in **Production mode** (security rules will be deployed in Step 4).

---

### 3. Enable Firebase Authentication
1. Navigate to **Build** → **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab, enable **Email/Password**.
4. Create an Admin user under the **Users** tab:
   - **Email:** `admin@newratna.com` (or your shop email)
   - **Password:** `admin123` (or your chosen secure password)

---

### 4. Deploy Firestore Security Rules
Copy the contents of `firestore.rules` and paste them into:
**Firebase Console** → **Firestore Database** → **Rules** tab → Click **Publish**.

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    function isAdmin() {
      return request.auth != null && (
        exists(/databases/$(database)/documents/admins/$(request.auth.uid)) ||
        request.auth.token.admin == true
      );
    }

    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    match /counters/{counterId} {
      allow read: if true;
      allow write: if request.resource.data.lastToken is int &&
                     request.resource.data.lastToken >= 1000;
    }

    match /orders/{orderId} {
      allow read, update, delete: if isAdmin();
      allow read: if true;
      allow create: if request.resource.data.status == 'received' &&
                       request.resource.data.token is int &&
                       request.resource.data.customerName is string &&
                       request.resource.data.mobile is string &&
                       request.resource.data.total is number &&
                       request.resource.data.items is list;
    }

    match /admins/{adminId} {
      allow read: if request.auth != null && request.auth.uid == adminId;
      allow write: if false;
    }
  }
}
```

---

### 5. Register Web App & Add Keys to `.env`
1. In Firebase Console, go to **Project settings** (⚙️ gear icon) → **General**.
2. Scroll to **Your apps** and click the Web icon (`</>`).
3. Register app with name `New Ratna Web`.
4. Copy the `firebaseConfig` keys.
5. In your project root, create a `.env` file (or `.env.local`):

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=new-ratna-pan-shop.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=new-ratna-pan-shop
VITE_FIREBASE_STORAGE_BUCKET=new-ratna-pan-shop.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

---

## 🔒 Atomic Token Numbering (#1001, #1002...)

The app uses an atomic Firestore transaction on the `counters/orders` document:
- When a customer places an order, the transaction reads `counters/orders.lastToken`, increments it by 1, and writes the new order with that exact token.
- This guarantees that two simultaneous orders will **never** receive duplicate tokens.

---

## 🔄 Real-time Features
- **Customer Order Tracking:** Uses `onSnapshot` to listen to status changes (`received` → `accepted` → `preparing` → `ready` → `collected`) with zero manual page refreshes.
- **Admin Dashboard:** Incoming order queue automatically updates instantly when new orders arrive.
- **Products Catalog:** Live updates to prices, availability toggles, and new items across all customer devices.

---

## 🛡️ Prototype / Development Mode Fallback
If `.env` is not yet configured, the app automatically runs in **Local Prototype Mode** with:
- Mock localStorage persistence
- Demo Admin credentials (`admin@newratna.com` / `admin123`)
- Initial seed catalog and sample orders
- Formatted console logger for SMS / WhatsApp pickup alerts
