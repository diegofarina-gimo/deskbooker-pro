import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock, CalendarClock, Bookmark, CalendarCheck } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookingForm } from '@/components/BookingForm';
import { toast } from 'sonner';
import { MeetingRoomTimetable } from '@/components/MeetingRoomTimetable';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const MeetingRoomDisplay = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { 
    desks, 
    bookings, 
    getUserById, 
    currentUser, 
    selectedDate, 
    setSelectedDate,
    cancelBooking
  } = useBooking();
  
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [customTimeSlot, setCustomTimeSlot] = useState<{startTime: string, endTime: string} | null>(null);
  const [currentStatus, setCurrentStatus] = useState<'available' | 'occupied'>('available');
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  
  const room = desks.find(desk => desk.id === roomId);
  
  if (!room) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md p-8 rounded-xl shadow-lg bg-white border border-gray-100">
          <h1 className="text-3xl font-bold mb-2">Room Not Found</h1>
          <p className="text-gray-600 mb-6">The meeting room you're looking for doesn't exist.</p>
          <Link to="/meeting-rooms">
            <Button className="gap-2">
              <CalendarClock className="h-4 w-4" />
              View All Meeting Rooms
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  if (room.type !== 'meeting_room') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center max-w-md p-8 rounded-xl shadow-lg bg-white border border-gray-100">
          <h1 className="text-3xl font-bold mb-2">Invalid Resource</h1>
          <p className="text-gray-600 mb-6">This resource is not a meeting room.</p>
          <Link to="/meeting-rooms">
            <Button className="gap-2">
              <CalendarClock className="h-4 w-4" />
              View All Meeting Rooms
            </Button>
          </Link>
        </div>
      </div>
    );
  }
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const now = new Date();
  const currentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  const isFutureDate = selectedDate > now && !isToday;
  
  const roomBookings = bookings.filter(b => 
    b.deskId === roomId && 
    b.date === dateStr &&
    b.timeSlot
  ).sort((a, b) => {
    if (!a.timeSlot || !b.timeSlot) return 0;
    return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime);
  });
  
  useEffect(() => {
    if (isToday && roomBookings.length > 0) {
      const isCurrentlyBooked = roomBookings.some(booking => {
        if (!booking.timeSlot) return false;
        
        const startTime = booking.timeSlot.startTime;
        const endTime = booking.timeSlot.endTime;
        
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const [currentHour, currentMinute] = currentTimeString.split(':').map(Number);
        
        const startMinutes = startHour * 60 + startMinute;
        const endMinutes = endHour * 60 + endMinute;
        const currentMinutes = currentHour * 60 + currentMinute;
        
        if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
          setCurrentBookingId(booking.id);
          return true;
        }
        return false;
      });
      
      setCurrentStatus(isCurrentlyBooked ? 'occupied' : 'available');
    } else {
      setCurrentStatus('available');
    }
    
    const intervalId = setInterval(() => {
      const now = new Date();
      const newCurrentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      if (isToday && roomBookings.length > 0) {
        const isCurrentlyBooked = roomBookings.some(booking => {
          if (!booking.timeSlot) return false;
          
          const startTime = booking.timeSlot.startTime;
          const endTime = booking.timeSlot.endTime;
          
          const [startHour, startMinute] = startTime.split(':').map(Number);
          const [endHour, endMinute] = endTime.split(':').map(Number);
          const [currentHour, currentMinute] = newCurrentTimeString.split(':').map(Number);
          
          const startMinutes = startHour * 60 + startMinute;
          const endMinutes = endHour * 60 + endMinute;
          const currentMinutes = currentHour * 60 + currentMinute;
          
          if (currentMinutes >= startMinutes && currentMinutes < endMinutes) {
            setCurrentBookingId(booking.id);
            return true;
          }
          return false;
        });
        
        setCurrentStatus(isCurrentlyBooked ? 'occupied' : 'available');
      } else {
        setCurrentStatus('available');
      }
    }, 60000);
    
    return () => clearInterval(intervalId);
  }, [roomBookings, isToday, currentTimeString]);
  
  const getCurrentBooking = () => {
    if (!isToday) return null;
    
    return roomBookings.find(booking => {
      if (!booking.timeSlot) return false;
      
      const startTime = booking.timeSlot.startTime;
      const endTime = booking.timeSlot.endTime;
      
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const [endHour, endMinute] = endTime.split(':').map(Number);
      const [currentHour, currentMinute] = currentTimeString.split(':').map(Number);
      
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      const currentMinutes = currentHour * 60 + currentMinute;
      
      return currentMinutes >= startMinutes && currentMinutes < endMinutes;
    });
  };
  
  const getNextBooking = () => {
    if (!isToday) return null;
    
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentMinutes = currentHour * 60 + currentMinute;
    
    return roomBookings.find(booking => {
      if (!booking.timeSlot) return false;
      
      const startTime = booking.timeSlot.startTime;
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const startMinutes = startHour * 60 + startMinute;
      
      return startMinutes > currentMinutes;
    });
  };
  
  const currentBooking = getCurrentBooking();
  const nextBooking = getNextBooking();
  
  const handleEndMeeting = () => {
    if (currentBookingId) {
      cancelBooking(currentBookingId);
      setCurrentBookingId(null);
      setCurrentStatus('available');
      toast.success("Meeting ended successfully");
    }
  };

  // Updated handleQuickBook to start from current time
  const handleQuickBook = (durationMinutes: number) => {
    if (!currentUser) {
      toast.error("You must be logged in to book a room");
      return;
    }
    
    // Always use the current time as the start time for quick bookings
    const realNow = new Date();
    let startTime: string;
    
    if (isToday) {
      // For today, use the actual current time
      startTime = `${String(realNow.getHours()).padStart(2, '0')}:${String(realNow.getMinutes()).padStart(2, '0')}`;
    } else {
      // For future days, start at 9 AM
      startTime = "09:00";
    }
    
    // Calculate end time based on the duration from the start time
    const startDate = new Date();
    startDate.setHours(parseInt(startTime.split(':')[0], 10));
    startDate.setMinutes(parseInt(startTime.split(':')[1], 10));
    
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;
    
    setCustomTimeSlot({
      startTime,
      endTime
    });
    
    setIsBookingDialogOpen(true);
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left border indicator */}
      <div className={`w-2 ${
        currentStatus === 'available' ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      
      {/* Main content */}
      <div className="flex-1 bg-gray-50">
        <div className="container mx-auto px-4 py-8">
          <header className="mb-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-start">
                <div>
                  <Link to="/meeting-rooms" className="text-sm text-blue-600 hover:underline flex items-center gap-1 mb-3">
                    <CalendarClock className="h-3 w-3" />
                    Back to Meeting Rooms
                  </Link>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2 text-gray-900">{room.name}</h1>
                  <div className="text-gray-600 mb-4 flex items-center gap-2">
                    <span className="inline-flex items-center bg-gray-100 px-3 py-1 rounded-full text-sm">
                      Capacity: {room.capacity || 'Unknown'} {room.capacity === 1 ? 'person' : 'people'}
                    </span>
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-white font-medium text-sm ${
                      currentStatus === 'available' ? 'bg-green-500' : 'bg-red-500'
                    }`}>
                      {currentStatus === 'available' ? 'Available' : 'Occupied'}
                    </div>
                  </div>
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-2 mt-2 bg-white shadow-sm">
                      <CalendarIcon className="h-4 w-4" />
                      {format(selectedDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={(date) => date && setSelectedDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </header>
          
          <div className="grid gap-6 max-w-4xl mx-auto">
            {(currentBooking || nextBooking) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-2">
                {currentBooking && (
                  <Card className="border-l-4 border-l-red-500 shadow-md overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-red-500" />
                        Current Meeting
                      </CardTitle>
                      <CardDescription>In progress now</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-1 font-medium">
                        Booked by: {getUserById(currentBooking.userId)?.name || 'Unknown'}
                      </div>
                      <div className="mb-4 text-sm text-gray-600">
                        Time: {currentBooking.timeSlot?.startTime} - {currentBooking.timeSlot?.endTime}
                      </div>
                      {(currentUser?.id === currentBooking.userId || currentUser?.role === 'admin') && (
                        <Button 
                          variant="destructive" 
                          onClick={handleEndMeeting}
                          className="gap-2 w-full"
                        >
                          End Meeting
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )}
                
                {nextBooking && (
                  <Card className="border-l-4 border-l-blue-500 shadow-md overflow-hidden">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2">
                        <CalendarCheck className="h-5 w-5 text-blue-500" />
                        Next Meeting
                      </CardTitle>
                      <CardDescription>Coming up today</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="mb-1 font-medium">
                        Booked by: {getUserById(nextBooking.userId)?.name || 'Unknown'}
                      </div>
                      <div className="text-sm text-gray-600">
                        Time: {nextBooking.timeSlot?.startTime} - {nextBooking.timeSlot?.endTime}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
            
            <Card className="shadow-md overflow-hidden">
              <CardHeader className="pb-3 border-b">
                <CardTitle className="flex items-center gap-2">
                  <CalendarClock className="h-5 w-5" />
                  {isToday ? "Today's Schedule" : format(selectedDate, 'PPPP')}
                </CardTitle>
                <CardDescription>
                  {isToday ? "View and book time slots for today" : 
                   isFutureDate ? "Plan ahead and reserve time slots" : 
                   "View past bookings"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <MeetingRoomTimetable room={room} date={selectedDate} />
              </CardContent>
            </Card>
            
            {currentStatus === 'available' && (
              <Card className="shadow-md overflow-hidden bg-gradient-to-br from-white to-gray-50">
                <CardHeader className="pb-3 border-b">
                  <CardTitle className="flex items-center gap-2">
                    <Bookmark className="h-5 w-5 text-green-500" />
                    {isToday ? "Quick Book" : "Book Room"}
                  </CardTitle>
                  <CardDescription>
                    {isToday 
                      ? "Need the room right now? Book it quickly!"
                      : "Book this room for a future date"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {isToday && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <Button 
                        onClick={() => handleQuickBook(15)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        15 min
                      </Button>
                      <Button 
                        onClick={() => handleQuickBook(30)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        30 min
                      </Button>
                      <Button 
                        onClick={() => handleQuickBook(60)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        1 hour
                      </Button>
                      <Button 
                        onClick={() => handleQuickBook(120)}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                      >
                        2 hours
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-4">
                    <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="w-full bg-white"
                        >
                          {isToday ? "Custom Booking" : "Book This Room"}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Book {room.name}</DialogTitle>
                        </DialogHeader>
                        <BookingForm 
                          deskId={room.id} 
                          date={selectedDate} 
                          status="available"
                          preselectedTimeSlot={customTimeSlot || undefined}
                        />
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      
      {/* Right border indicator */}
      <div className={`w-2 ${
        currentStatus === 'available' ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
    </div>
  );
};

export default MeetingRoomDisplay;
