import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import FarmerDashboard from './pages/FarmerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import DealFlow from './pages/DealFlow';
import Notifications from './pages/Notifications';

function App() {
  const { isAuthenticated, isFarmer, isBuyer } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-cream">
      <Navbar />
      <Routes>
        {/* Public */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to={isFarmer ? '/farmer/dashboard' : '/buyer/dashboard'} replace />
            ) : (
              <Landing />
            )
          }
        />
        <Route path="/login" element={isAuthenticated ? <Navigate to={isFarmer ? '/farmer/dashboard' : '/buyer/dashboard'} replace /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to={isFarmer ? '/farmer/dashboard' : '/buyer/dashboard'} replace /> : <Register />} />

        {/* Farmer */}
        <Route path="/farmer/dashboard" element={<ProtectedRoute role="farmer"><FarmerDashboard /></ProtectedRoute>} />
        <Route path="/listings/create" element={<ProtectedRoute role="farmer"><CreateListing /></ProtectedRoute>} />

        {/* Buyer */}
        <Route path="/buyer/dashboard" element={<ProtectedRoute role="buyer"><BuyerDashboard /></ProtectedRoute>} />

        {/* Shared (authenticated) */}
        <Route path="/listings/:id" element={<ListingDetail />} />
        <Route path="/deals" element={<ProtectedRoute><DealFlow /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute><Notifications /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;
