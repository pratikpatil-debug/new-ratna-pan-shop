# New Ratna Pan Shop - Web Application (Shop Pickup Model)

A clean, modern, and responsive web application built for **New Ratna Pan Shop**. The application is tailored specifically for the **Shop Counter Pickup** business model where customers place their orders online while at or near the shop and collect freshly prepared paan directly from the shop counter.

---

## 🌟 Key Business Model & Features

### 1. Customer Experience (Shop Counter Pickup)
- **Hero Section:**
  - **Headline:** *"Fresh Paan, Made Your Way."*
  - **Subheading:** *"Handcrafted fresh paan and mouth fresheners, prepared fresh when you order."*
  - **CTA Buttons:** *"Explore Menu"* and *"View Cart"*.
  - **Trust/Info Row:** *"Freshly Prepared"*, *"Shop Pickup"*, and *"Quick Service"*.
- **Category Navigation:** Horizontally scrollable category pills (*All*, *Meetha Paan*, *Flavored Paan*, *Royal Paan*, *Traditional Paan*, *Mouth Fresheners*, *Beverages*).
- **Product Cards:** High-quality imagery, tags (*Bestseller*, *100% Tobacco Free*), prices, and modern **"Add +"** button with instant visual feedback and quantity steppers.
- **Cart Drawer:** Header *"Your Order"*, itemized list, quantity adjustment, subtotal, and total (strictly NO delivery charges).
- **Streamlined Checkout:**
  - Prominent **SHOP PICKUP** spotlight card: *"Place your order online and collect it from the New Ratna Pan Shop counter."*
  - Customer name and mobile number fields.
  - Payment method: **Pay at Counter (Cash / UPI)**.
- **Order Confirmation:**
  - **✓ Order Received**
  - *"Your order has been sent to the shop."*
  - Order ID (`#NRP-XXXX`), Pickup location (*New Ratna Pan Shop*), and **"Track Order"** CTA.
- **Live 5-Step Vertical Order Tracking:**
  - `✓ Order Received`
  - `○ Order Accepted`
  - `○ Preparing`
  - `○ Ready for Pickup` *(Highlighted prominently with counter call banner: "Your order is ready! Please collect it from the shop counter.")*
  - `○ Collected`

---

### 2. Shop Admin Portal
- **Login:** Clean access with **1-Click Auto-Fill Demo Credentials** (`admin@newratna.com` / `admin123`).
- **Real-Time Orders Processing:**
  - Step-by-step workflow: **Accept Order** → **Start Preparing Fresh** → **Mark as READY FOR PICKUP** → **Handover & Mark as Collected**.
  - One-click customer phone calling and **Print KOT Receipt**.
- **Menu & Inventory:** Add new products, update prices, and toggle **In Stock / Out of Stock**.
- **Shop Settings:** Operational hours, counter pickup prep time, and live **Counter Payment UPI QR Code** preview.

---

## 🚀 Running the App

The Vite dev server is running locally at:
**[http://localhost:3000/](http://localhost:3000/)**

```bash
npm run dev
```

To build for production:
```bash
npm run build
npm run preview
```

---

## 🔐 Admin Credentials

| Field | Value |
|---|---|
| **Portal Link** | Header "Admin" link or floating bottom-left button |
| **Email** | `admin@newratna.com` |
| **Password** | `admin123` |
| **Fast Demo Login** | Click the **"Auto-Fill & Login"** button |
