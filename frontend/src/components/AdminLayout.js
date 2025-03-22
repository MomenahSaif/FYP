import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import '../styles/AdminLayout.css';

const AdminLayout = () => {
  const userRole = localStorage.getItem('userRole'); // Get the stored role (admin/user)

  return (
    <div className="admin-container">
      {userRole === 'admin' ? <AdminHeader /> : <AdminHeader />} {/* Use correct header */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
};

export default AdminLayout;
