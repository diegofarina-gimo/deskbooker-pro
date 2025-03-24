
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useBooking } from '@/contexts/BookingContext';
import { Login } from './Login';

const Index = () => {
  const { currentUser } = useBooking();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  return <Login />;
};

export default Index;
