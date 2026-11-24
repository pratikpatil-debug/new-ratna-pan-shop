import React from 'react';
import { useStore } from './context/StoreContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { ToastNotification } from './components/common/ToastNotification';
import { AgeVerificationModal } from './components/common/AgeVerificationModal';
import { ViewSwitchBanner } from './components/common/ViewSwitchBanner';
import { ScrollProgressBar } from './components/common/ScrollProgressBar';
import { ScrollReveal } from './components/common/ScrollReveal';
import { RoyalOpeningAnimation } from './components/common/RoyalOpeningAnimation';

// Customer Components
import { LivePaanBackground } from './components/customer/LivePaanBackground';
import { PaanLeafAssemblyExperience } from './components/customer/PaanLeafAssemblyExperience';
import { GoldenCursorTrail } from './components/common/GoldenCursorTrail';
import { QuickReorderBanner } from './components/customer/QuickReorderBanner';
import { ExpressBuyModal } from './components/customer/ExpressBuyModal';
import { HeroBanner } from './components/customer/HeroBanner';
import { MenuPreviewSection } from './components/customer/MenuPreviewSection';
import { CategoryPills } from './components/customer/CategoryPills';
import { OffersSection } from './components/customer/OffersSection';
import { CraftsmanshipSection } from './components/customer/CraftsmanshipSection';
import { ProductCard } from './components/customer/ProductCard';
import { ProductModal } from './components/customer/ProductModal';
import { CartDrawer } from './components/customer/CartDrawer';
import { CheckoutView } from './components/customer/CheckoutView';
import { OrderConfirmation } from './components/customer/OrderConfirmation';
import { OrderTrackingView } from './components/customer/OrderTrackingView';
import { CustomPaanBuilderModal } from './components/customer/CustomPaanBuilderModal';
import { FlavorQuizModal } from './components/customer/FlavorQuizModal';
import { CounterPassModal } from './components/customer/CounterPassModal';
import { QuickFloatingMenu } from './components/common/QuickFloatingMenu';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin';
import { AdminDashboard } from './components/admin/AdminDashboard';



export function AppContent() {
  const {
    activeView,
    products,
    selectedCategory,
    categories,
    searchQuery,
    isLoadingProducts,
    favorites = []
  } = useStore();

  // Filter products by selected category and search
  const filteredProducts = products.filter((prod) => {
    const matchesCategory =
      selectedCategory === 'all'
        ? true
        : selectedCategory === 'favorites'
        ? favorites.includes(prod.id)
        : prod.category === selectedCategory;

    const matchesSearch =
      !searchQuery ||
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.ingredients && prod.ingredients.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const selectedCategoryObj = categories.find((c) => c.id === selectedCategory);

  const getSectionTitle = () => {
    if (searchQuery) return `Search Results for "${searchQuery}"`;
    if (selectedCategory === 'favorites') return 'Saved Favorites ❤️';
    if (selectedCategoryObj) return selectedCategoryObj.name;
    return 'Specialties Menu';
  };

  const getSectionSubtitle = () => {
    if (selectedCategory === 'favorites') {
      return 'Your personal handpicked collection. Quick-add to order with a single click.';
    }
    return 'Handcrafted with fresh ingredients, pure gulkand, and authentic spices.';
  };

  return (
    <div className="app-container">
      {/* Royal Site Opening Animation */}
      <RoyalOpeningAnimation />

      {/* 1. Admin Portal Views */}
      {activeView === 'admin-login' && <AdminLogin />}
      {activeView.startsWith('admin-') && activeView !== 'admin-login' && <AdminDashboard />}

      {/* 2. Customer Views */}
      {activeView.startsWith('customer') && (
        <>
          <LivePaanBackground />
          <GoldenCursorTrail />
          <ScrollProgressBar />
          <Header />

          {/* Customer Home / Menu Page */}
          {activeView === 'customer-home' && (
            <main>
              <QuickReorderBanner />
              <HeroBanner />
              <PaanLeafAssemblyExperience>
                <MenuPreviewSection />
              </PaanLeafAssemblyExperience>
              <OffersSection />
              <CategoryPills />

              {/* Products Catalog */}
              <section className="products-section">
                <div className="container">
                  <ScrollReveal animation="fade-up" className="section-header">
                    <div>
                      <h3 className="section-title">
                        {getSectionTitle()}
                      </h3>
                      <p className="section-subtitle">
                        {getSectionSubtitle()}
                      </p>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                      {isLoadingProducts ? 'Loading menu...' : `Showing ${filteredProducts.length} items`}
                    </div>
                  </ScrollReveal>

                  {isLoadingProducts ? (
                    <div style={{ textAlign: 'center', padding: '3.5rem 1rem' }}>
                      <div className="cart-spin" style={{ width: 36, height: 36, border: '3px solid var(--border-medium)', borderTopColor: 'var(--primary)', borderRadius: '50%', margin: '0 auto 1rem auto' }}></div>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>Loading fresh menu items...</p>
                    </div>
                  ) : filteredProducts.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#fff', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>
                        {selectedCategory === 'favorites' ? '❤️' : '🍃'}
                      </div>
                      <h4 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.25rem' }}>
                        {selectedCategory === 'favorites' ? 'No favorites saved yet' : 'No products found'}
                      </h4>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                        {selectedCategory === 'favorites'
                          ? 'Click the heart icon on any paan card or modal to save it here for fast reordering!'
                          : 'Try searching for a different keyword like "Maghai", "Chocolate", "Saunf", or "Thandai".'}
                      </p>
                    </div>
                  ) : (
                    <div className="products-grid">
                      {filteredProducts.map((product, idx) => (
                        <ProductCard key={product.id} product={product} index={idx} />
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {/* Authentic Craftsmanship & Heritage Trust Section */}
              <CraftsmanshipSection />
            </main>
          )}

          {/* Customer Checkout Page */}
          {activeView === 'customer-checkout' && <CheckoutView />}

          {/* Customer Order Confirmation Receipt */}
          {activeView === 'customer-confirmation' && <OrderConfirmation />}

          {/* Customer Live Tracking Page */}
          {activeView === 'customer-tracking' && <OrderTrackingView />}

          <Footer />
        </>
      )}

      {/* Global Drawers & Modals */}
      <CartDrawer />
      <ProductModal />
      <ExpressBuyModal />
      <CustomPaanBuilderModal />
      <FlavorQuizModal />
      <CounterPassModal />
      <QuickFloatingMenu />
      <AgeVerificationModal />
      <ToastNotification />
      <ViewSwitchBanner />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
