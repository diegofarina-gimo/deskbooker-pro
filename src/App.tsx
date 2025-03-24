
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BookingProvider } from './contexts/BookingContext';
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

function App() {
  return (
    <BookingProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/users" element={<Users />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/meeting-rooms" element={<MeetingRooms />} />
          <Route path="/meeting-room/:roomId" element={<MeetingRoomDisplay />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
      <CustomToaster />
    </BookingProvider>
  );
}

export default App;
