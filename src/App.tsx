import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { CheckoutPage } from './components/CheckoutPage';
import { TrackOrderPage } from './components/TrackOrderPage';
import { AdminPage } from './components/AdminPage';
import { AuthPage } from './components/AuthPage';
import { AccountPage } from './components/AccountPage';
import { OrdersPage } from './components/OrdersPage';

import { OrderSuccessPage } from './components/OrderSuccessPage';
import { UPIPaymentPage } from './components/UPIPaymentPage';
import { PolicyPage } from './components/PolicyPage';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pay" element={<UPIPaymentPage />} />
        <Route path="/track" element={<TrackOrderPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/account" element={<AccountPage />} />
        <Route path="/orders" element={<OrdersPage />} />
        <Route path="/order-success" element={<OrderSuccessPage />} />
        <Route path="/privacy-policy" element={<PolicyPage title="Privacy Policy" type="privacy" />} />
        <Route path="/shipping-policy" element={<PolicyPage title="Shipping Policy" type="shipping" />} />
        <Route path="/terms" element={<PolicyPage title="Terms & Conditions" type="terms" />} />
      </Routes>
    </Router>
  );
};

export default App;
