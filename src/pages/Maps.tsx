
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { AppHeader } from '@/components/AppHeader';
import { MapManagement } from '@/components/MapManagement';

const Maps = () => {
  const { currentUser } = useBooking();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  if (!currentUser) return null;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Map Management</h1>
        
        <div className="bg-white rounded-lg shadow-sm border">
          <MapManagement />
        </div>
      </main>
    </div>
  );
};

export default Maps;
