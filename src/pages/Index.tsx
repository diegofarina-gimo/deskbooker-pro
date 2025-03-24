
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocalBooking } from '@/contexts/LocalBookingContext';
import { Login } from './Login';

const Index = () => {
  const { currentUser } = useLocalBooking();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  return <Login />;
};

export default Index;
