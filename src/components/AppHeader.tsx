
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CalendarDays, LayoutDashboard, LogOut, Map, Settings, Users } from 'lucide-react';

export const AppHeader: React.FC = () => {
  const { currentUser, setCurrentUser } = useBooking();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };
  
  if (!currentUser) return null;
  
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Link to="/dashboard" className="flex items-center">
            <CalendarDays className="h-5 w-5 text-blue-600 mr-2" />
            <span className="font-bold text-xl">DeskBooker Pro</span>
          </Link>
        </div>
        
        <nav className="hidden md:flex items-center space-x-1">
          <Button variant="ghost" asChild>
            <Link to="/dashboard" className="flex items-center px-3 py-2">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </Link>
          </Button>
          
          {currentUser.role === 'admin' && (
            <>
              <Button variant="ghost" asChild>
                <Link to="/maps" className="flex items-center px-3 py-2">
                  <Map className="h-4 w-4 mr-2" />
                  Maps
                </Link>
              </Button>
              
              <Button variant="ghost" asChild>
                <Link to="/users" className="flex items-center px-3 py-2">
                  <Users className="h-4 w-4 mr-2" />
                  Users
                </Link>
              </Button>
            </>
          )}
          
          <Button variant="ghost" asChild>
            <Link to="/profile" className="flex items-center px-3 py-2">
              <Settings className="h-4 w-4 mr-2" />
              My Profile
            </Link>
          </Button>
        </nav>
        
        <div className="flex items-center space-x-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                  <AvatarFallback>{currentUser.name.substring(0, 2)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{currentUser.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {currentUser.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/dashboard" className="flex items-center cursor-pointer">
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
              </DropdownMenuItem>
              
              {currentUser.role === 'admin' && (
                <>
                  <DropdownMenuItem asChild>
                    <Link to="/maps" className="flex items-center cursor-pointer">
                      <Map className="h-4 w-4 mr-2" />
                      Maps
                    </Link>
                  </DropdownMenuItem>
                  
                  <DropdownMenuItem asChild>
                    <Link to="/users" className="flex items-center cursor-pointer">
                      <Users className="h-4 w-4 mr-2" />
                      Users
                    </Link>
                  </DropdownMenuItem>
                </>
              )}
              
              <DropdownMenuItem asChild>
                <Link to="/profile" className="flex items-center cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  My Profile
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
