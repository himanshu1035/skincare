import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LandingPage } from './components/LandingPage';
import { CheckoutPage } from './components/CheckoutPage';
import { TrackOrderPage } from './components/TrackOrderPage';
import { AdminPage } from './components/AdminPage';
import { AuthPage } from './components/AuthPage';
import { AccountPage } from './components/AccountPage';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/track" element={<TrackOrderPage />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route path="/account" element={<AccountPage />} />
      </Routes>
    </Router>
  );
};

export default App;
