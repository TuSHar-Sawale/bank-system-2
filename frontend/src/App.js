import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Transfer from "./pages/Transfer";
import Transactions from "./pages/Transactions";
import AdminPanel from "./pages/AdminPanel";
import Profile from "./pages/Profile";
import Layout from "./components/Layout";
import "./index.css";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ color: "#fff", padding: 40 }}>Loading...</div>;
  return user ? children : <Navigate to="/login" />;
};

const CustomerRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return user.role === "customer" ? children : <Navigate to="/admin" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return user.role === "admin" ? children : <Navigate to="/dashboard" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<Navigate to="/dashboard" />} />
            {/* Customer only routes */}
            <Route path="dashboard" element={<CustomerRoute><Dashboard /></CustomerRoute>} />
            <Route path="transfer" element={<CustomerRoute><Transfer /></CustomerRoute>} />
            <Route path="transactions" element={<CustomerRoute><Transactions /></CustomerRoute>} />
            {/* Admin only routes */}
            <Route path="admin" element={<AdminRoute><AdminPanel /></AdminRoute>} />
            {/* Shared */}
            <Route path="profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
