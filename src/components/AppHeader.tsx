
import React from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { MapPin, LogOut, Calendar, Users } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export const AppHeader: React.FC = () => {
  const { currentUser, setCurrentUser } = useBooking();
  const navigate = useNavigate();

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  if (!currentUser) return null;

  return (
    <header className="w-full py-4 px-6 bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <div className="font-semibold text-lg">DeskBooker Pro</div>
        </div>

        <div className="flex items-center space-x-6">
          <nav className="hidden md:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 font-medium text-gray-600 hover:text-gray-900"
              onClick={() => navigate('/dashboard')}
            >
              <Calendar size={18} />
              <span>Dashboard</span>
            </Button>
            <Button 
              variant="ghost" 
              className="flex items-center gap-2 font-medium text-gray-600 hover:text-gray-900"
              onClick={() => navigate('/maps')}
            >
              <MapPin size={18} />
              <span>Maps</span>
            </Button>
            {currentUser.role === 'admin' && (
              <Button 
                variant="ghost" 
                className="flex items-center gap-2 font-medium text-gray-600 hover:text-gray-900"
                onClick={() => navigate('/users')}
              >
                <Users size={18} />
                <span>Users</span>
              </Button>
            )}
          </nav>

          <div className="flex items-center space-x-4">
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                <AvatarFallback>{currentUser.name.substring(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium hidden md:inline-block">{currentUser.name}</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="text-gray-500 hover:text-gray-700"
            >
              <LogOut size={16} className="mr-2" />
              <span className="hidden md:inline">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
