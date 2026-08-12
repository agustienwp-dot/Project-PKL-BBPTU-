import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AnimalsPage from './pages/AnimalsPage';
import AnimalFormPage from './pages/AnimalFormPage';
import AnimalDetailPage from './pages/AnimalDetailPage';
import AvailablePage from './pages/AvailablePage';
import SoldPage from './pages/SoldPage';
import CagesPage from './pages/CagesPage';
import CageDetailPage from './pages/CageDetailPage';
import SalesPage from './pages/SalesPage';
import NewSalePage from './pages/NewSalePage';
import SaleDetailPage from './pages/SaleDetailPage';
import BuyersPage from './pages/BuyersPage';
import BuyerDetailPage from './pages/BuyerDetailPage';
import ReportsPage from './pages/ReportsPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Guest Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes inside Main Dashboard Layout */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/animals" element={<AnimalsPage />} />
              <Route path="/animals/new" element={<AnimalFormPage />} />
              <Route path="/animals/:id" element={<AnimalDetailPage />} />
              <Route path="/animals/:id/edit" element={<AnimalFormPage />} />
              <Route path="/available" element={<AvailablePage />} />
              <Route path="/sold" element={<SoldPage />} />
              <Route path="/cages" element={<CagesPage />} />
              <Route path="/cages/:id" element={<CageDetailPage />} />
              <Route path="/sales" element={<SalesPage />} />
              <Route path="/sales/new" element={<NewSalePage />} />
              <Route path="/sales/:id" element={<SaleDetailPage />} />
              <Route path="/buyers" element={<BuyersPage />} />
              <Route path="/buyers/:id" element={<BuyerDetailPage />} />
              <Route path="/reports" element={<ReportsPage />} />
            </Route>
          </Route>

          {/* Fallback Catch-all Route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
