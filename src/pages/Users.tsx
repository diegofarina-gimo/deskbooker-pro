
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { AppHeader } from '@/components/AppHeader';
import { UserManagement } from '@/components/UserManagement';

const Users = () => {
  const { currentUser } = useBooking();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated or not admin
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    } else if (currentUser.role !== 'admin') {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  if (!currentUser || currentUser.role !== 'admin') return null;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>
        
        <div className="bg-white rounded-lg shadow-sm border">
          <UserManagement />
        </div>
      </main>
    </div>
  );
};

export default Users;
