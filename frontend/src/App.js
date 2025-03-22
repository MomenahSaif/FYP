import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import ToolPage from './pages/ToolPage';
import AccountSettings from './pages/AccountSettings';
import History from './pages/History';
import AboutUs from './pages/AboutUs';
import Edit from './pages/Edit';
import Admin from './pages/Admin'; // Import Admin Page
import AllRecords from './pages/allrecords';
import ProtectedRoute from './components/ProtectedRoute'; // Import ProtectedRoute
import AdminLayout from './components/AdminLayout';
import AdminAccountSettings from './pages/AdminAccountSettings';
import AdminEdit from './pages/AdminEdit';
import './App.css';

const App = () => {
  return (
    <Router>
  <Routes>
    {/* Home page without layout */}
    <Route path="/" element={<Home />} />

    {/* User Layout */}
    <Route element={<Layout />}>
      <Route path="/tool" element={<ToolPage />} />
      <Route path="/history" element={<History />} />
      <Route path="/about" element={<AboutUs />} /> 
      <Route path="/account" element={<AccountSettings />} />
      <Route path="/edit" element={<Edit />} />
    </Route>

    {/* Ensure /admin uses AdminLayout */}
    <Route path="/admin/*" element={<AdminLayout />}>
  <Route index element={<Admin />} />
  <Route path="allrecords" element={<AllRecords />} />
  <Route path="AdminAccountSettings" element={<AdminAccountSettings />} />
  <Route path="AdminEdit" element={<AdminEdit />} />
</Route>


    {/* Redirect any unknown paths to the home page */}
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
</Router>

  );
};

export default App;
