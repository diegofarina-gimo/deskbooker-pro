
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { LayoutDashboard, Users, Map, CalendarDays, User, LogOut } from 'lucide-react';

export const AppHeader = () => {
  const { currentUser, signOut } = useBooking();
  const navigate = useNavigate();

  if (!currentUser) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Logged out successfully");
      navigate('/');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link to="/dashboard" className="flex items-center gap-2">
          <span className="text-xl font-bold">DeskBooker Pro</span>
        </Link>
        
        <nav className="hidden md:flex mx-6 items-center space-x-4 lg:space-x-6">
          <Link
            to="/dashboard"
            className="text-sm font-medium transition-colors hover:text-primary flex items-center gap-1"
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </Link>
          
          <Link
            to="/meeting-rooms"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
          >
            <CalendarDays className="h-4 w-4" />
            Meeting Rooms
          </Link>
          
          <Link
            to="/maps"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
          >
            <Map className="h-4 w-4" />
            Maps
          </Link>
          
          {currentUser.role === 'admin' && (
            <Link
              to="/users"
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary flex items-center gap-1"
            >
              <Users className="h-4 w-4" />
              Users
            </Link>
          )}
        </nav>
        
        <div className="flex flex-1 items-center justify-end">
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
                  <p className="text-xs leading-none text-muted-foreground">{currentUser.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer w-full flex items-center">
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 focus:text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};
