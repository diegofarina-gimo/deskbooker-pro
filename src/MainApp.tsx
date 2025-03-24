
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LocalBookingProvider } from './contexts/LocalBookingContext';
import { Toaster } from '@/components/ui/sonner';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Maps from './pages/Maps';
import MeetingRooms from './pages/MeetingRooms';
import MeetingRoomDisplay from './pages/MeetingRoomDisplay';
import Users from './pages/Users';
import NotFound from './pages/NotFound';

const MainApp = () => {
  return (
    <LocalBookingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/meeting-rooms" element={<MeetingRooms />} />
          <Route path="/meeting-rooms/:id" element={<MeetingRoomDisplay />} />
          <Route path="/users" element={<Users />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Toaster />
      </Router>
    </LocalBookingProvider>
  );
};

export default MainApp;
