
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BookingProvider, useBooking } from './contexts/BookingContext';
import Dashboard from './pages/Dashboard';
import Index from './pages/Index';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Maps from './pages/Maps';
import Users from './pages/Users';
import Profile from './pages/Profile';
import MeetingRooms from './pages/MeetingRooms';
import MeetingRoomDisplay from './pages/MeetingRoomDisplay';
import { CustomToaster } from './components/CustomToaster';
import './App.css';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useBooking();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser, isLoading } = useBooking();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <BookingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/maps" element={
            <ProtectedRoute>
              <Maps />
            </ProtectedRoute>
          } />
          
          <Route path="/users" element={
            <AdminRoute>
              <Users />
            </AdminRoute>
          } />
          
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          <Route path="/meeting-rooms" element={
            <ProtectedRoute>
              <MeetingRooms />
            </ProtectedRoute>
          } />
          
          <Route path="/meeting-room/:roomId" element={
            <ProtectedRoute>
              <MeetingRoomDisplay />
            </ProtectedRoute>
          } />
          
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <CustomToaster />
    </BookingProvider>
  );
}

export default App;
