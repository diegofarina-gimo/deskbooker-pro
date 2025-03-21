
import React, { useState } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const { users, setCurrentUser } = useBooking();
  const navigate = useNavigate();
  
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      setCurrentUser(user);
      navigate('/dashboard');
      toast.success(`Welcome back, ${user.name}!`);
    } else {
      toast.error('User not found. Please try again.');
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold tracking-tight">DeskBooker Pro</h1>
          <p className="mt-2 text-gray-600">Sign in to book your desk</p>
        </div>
        
        <Card className="glass-card animate-slideIn">
          <CardHeader>
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>
              Enter your email to sign in to your account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="name@example.com"
                  type="email"
                  autoCapitalize="none"
                  autoComplete="email"
                  autoCorrect="off"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full">
                Sign In
              </Button>
            </CardFooter>
          </form>
        </Card>
        
        <div className="text-center text-sm">
          <p className="text-gray-500">
            For demo purposes, use:
          </p>
          <div className="flex flex-col items-center mt-2 space-y-1">
            <Button
              variant="link"
              className="h-auto p-0 text-blue-600"
              onClick={() => setEmail('admin@example.com')}
            >
              admin@example.com (Admin)
            </Button>
            <Button
              variant="link"
              className="h-auto p-0 text-blue-600"
              onClick={() => setEmail('john@example.com')}
            >
              john@example.com (User)
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
