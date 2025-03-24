
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { useBooking } from '@/contexts/BookingContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCreatingTestUser, setIsCreatingTestUser] = useState(false);
  const navigate = useNavigate();
  const { currentUser } = useBooking();
  
  useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Error logging in');
    } finally {
      setIsLoading(false);
    }
  };
  
  const createTestUser = async () => {
    setIsCreatingTestUser(true);
    try {
      const { data, error } = await supabase.functions.invoke('setup-test-user');
      
      if (error) {
        throw error;
      }
      
      if (data.message) {
        toast.success(data.message);
        // Auto-fill the credentials
        setEmail('admin@example.com');
        setPassword('abc123');
      }
    } catch (error: any) {
      console.error('Error creating test user:', error);
      toast.error(error.message || 'Error creating test user');
    } finally {
      setIsCreatingTestUser(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Test User</span>
              </div>
            </div>
            
            <div className="text-sm text-gray-600 mt-4">
              <p>Test User Credentials:</p>
              <div className="bg-gray-100 p-2 rounded mt-1">
                <p>Email: admin@example.com</p>
                <p>Password: abc123</p>
              </div>
              
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  className="w-full" 
                  onClick={createTestUser}
                  disabled={isCreatingTestUser}
                >
                  {isCreatingTestUser ? 'Creating Test User...' : 'Create Test User'}
                </Button>
                <p className="text-xs text-gray-500 mt-1">
                  Click this button if you can't log in with the test credentials above
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export { Login };
export default Login;
