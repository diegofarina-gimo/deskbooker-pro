
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useLocalBooking } from '@/contexts/LocalBookingContext';
import { Login } from './Login';
import { toast } from 'sonner';

const Index = () => {
  const { currentUser } = useLocalBooking();
  const navigate = useNavigate();
  
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);
  
  // Check for any network issues that might affect server connectivity
  useEffect(() => {
    const checkServerConnection = async () => {
      try {
        const response = await fetch('http://localhost:3001/health', { 
          method: 'HEAD',
          // Quick timeout to avoid hanging if server is down
          signal: AbortSignal.timeout(2000)
        });
        
        if (!response.ok) {
          toast.error('Local server appears to be offline. Please start the server before using the app.');
        }
      } catch (error) {
        // If server isn't running, we'll get an error here
        toast.warning('Local server not detected. Please ensure the server is running with "npm run dev" in the server directory.');
      }
    };
    
    checkServerConnection();
  }, []);
  
  return <Login />;
};

export default Index;
