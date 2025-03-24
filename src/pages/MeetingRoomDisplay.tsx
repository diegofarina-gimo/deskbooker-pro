
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { format, addMinutes } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { BookingForm } from '@/components/BookingForm';
import { toast } from 'sonner';
import { 
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell
} from "@/components/ui/table";

const MeetingRoomDisplay = () => {
  const { roomId } = useParams<{ roomId: string }>();
  const { 
    desks, 
    bookings, 
    getUserById, 
    currentUser, 
    selectedDate, 
    setSelectedDate,
    cancelBooking,
    addBooking
  } = useBooking();
  
  const [isBookingDialogOpen, setIsBookingDialogOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState<'available' | 'occupied'>('available');
  const [currentBookingId, setCurrentBookingId] = useState<string | null>(null);
  
  console.log("Available desks:", desks);
  console.log("Looking for room ID:", roomId);
  console.log("Meeting rooms:", desks.filter(d => d.type === 'meeting_room'));
  
  const room = desks.find(desk => desk.id === roomId);
  
  if (!room) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Room Not Found</h1>
          <p className="text-gray-600">The meeting room you're looking for doesn't exist.</p>
          <p className="mt-4">
            <Link to="/meeting-rooms" className="text-blue-600 hover:underline">
              View All Meeting Rooms
            </Link>
          </p>
        </div>
      </div>
    );
  }
  
  if (room.type !== 'meeting_room') {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Invalid Resource</h1>
          <p className="text-gray-600">This resource is not a meeting room.</p>
          <p className="mt-4">
            <Link to="/meeting-rooms" className="text-blue-600 hover:underline">
              View All Meeting Rooms
            </Link>
          </p>
        </div>
      </div>
    );
  }
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  const now = new Date();
  const currentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isToday = selectedDate.toDateString() === new Date().toDateString();
  
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
  
  const handleQuickBook = (durationMinutes: number) => {
    if (!currentUser) {
      toast.error("You must be logged in to book a room");
      return;
    }
    
    const now = new Date();
    const startHour = now.getHours();
    const startMinute = now.getMinutes();
    const startTime = `${String(startHour).padStart(2, '0')}:${String(startMinute).padStart(2, '0')}`;
    
    const endTime = format(addMinutes(now, durationMinutes), 'HH:mm');
    
    const success = addBooking({
      deskId: roomId,
      userId: currentUser.id,
      date: format(now, 'yyyy-MM-dd'),
      isRecurring: false,
      timeSlot: {
        startTime,
        endTime
      }
    });
    
    if (success) {
      toast.success(`Room booked for ${durationMinutes} minutes`);
    } else {
      toast.error("Unable to book room for this time");
    }
  };
  
  const handleEndMeeting = () => {
    if (currentBookingId) {
      cancelBooking(currentBookingId);
      setCurrentBookingId(null);
      setCurrentStatus('available');
      toast.success("Meeting ended successfully");
    }
  };
  
  return (
    <div className="min-h-screen flex">
      {/* Left border indicator */}
      <div className={`w-2 ${
        currentStatus === 'available' ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      
      {/* Main content */}
      <div className="flex-1">
        <div className="container mx-auto px-4 py-10">
          <header className="mb-8 text-center">
            <h1 className="text-4xl font-bold mb-2">{room.name}</h1>
            <div className="text-lg text-gray-600 mb-4">
              Capacity: {room.capacity || 'Unknown'} {room.capacity === 1 ? 'person' : 'people'}
            </div>
            
            <div className="flex justify-center mb-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <CalendarIcon className="h-4 w-4" />
                    {format(selectedDate, 'PPP')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="center">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-white font-medium ${
              currentStatus === 'available' ? 'bg-green-500' : 'bg-red-500'
            }`}>
              {currentStatus === 'available' ? 'Available' : 'Occupied'}
            </div>
          </header>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {currentBooking && (
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
                <h2 className="text-xl font-bold mb-2">Current Meeting</h2>
                <div className="mb-1">
                  Booked by: {getUserById(currentBooking.userId)?.name || 'Unknown'}
                </div>
                <div className="mb-4">
                  Time: {currentBooking.timeSlot?.startTime} - {currentBooking.timeSlot?.endTime}
                </div>
                {(currentUser?.id === currentBooking.userId || currentUser?.role === 'admin') && (
                  <Button 
                    variant="destructive" 
                    onClick={handleEndMeeting}
                  >
                    End Meeting
                  </Button>
                )}
              </div>
            )}
            
            {nextBooking && (
              <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
                <h2 className="text-xl font-bold mb-2">Next Meeting</h2>
                <div className="mb-1">
                  Booked by: {getUserById(nextBooking.userId)?.name || 'Unknown'}
                </div>
                <div>
                  Time: {nextBooking.timeSlot?.startTime} - {nextBooking.timeSlot?.endTime}
                </div>
              </div>
            )}
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Schedule</h2>
            
            {roomBookings.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-md">
                <p className="text-gray-700">No bookings for today</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Booked By</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {roomBookings.map((booking, index) => {
                    const user = getUserById(booking.userId);
                    const isPast = isToday && booking.timeSlot && booking.timeSlot.endTime < currentTimeString;
                    const isCurrent = isToday && booking.timeSlot && 
                      currentTimeString >= booking.timeSlot.startTime && 
                      currentTimeString <= booking.timeSlot.endTime;
                    
                    return (
                      <TableRow 
                        key={index} 
                        className={`
                          ${isPast ? 'text-gray-500' : ''}
                          ${isCurrent ? 'bg-red-50' : ''}
                        `}
                      >
                        <TableCell className="font-medium">
                          {booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}
                        </TableCell>
                        <TableCell>
                          {user?.name || 'Unknown user'}
                        </TableCell>
                        <TableCell>
                          {isPast ? (
                            <span className="text-gray-500">Completed</span>
                          ) : isCurrent ? (
                            <span className="text-red-500 font-medium">In Progress</span>
                          ) : (
                            <span className="text-blue-500">Scheduled</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {isCurrent && (currentUser?.id === booking.userId || currentUser?.role === 'admin') && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEndMeeting()}
                              className="text-red-500 border-red-200 hover:bg-red-50"
                            >
                              End
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </div>
          
          {currentStatus === 'available' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4">Quick Book</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <Button onClick={() => handleQuickBook(15)}>15 min</Button>
                <Button onClick={() => handleQuickBook(30)}>30 min</Button>
                <Button onClick={() => handleQuickBook(60)}>1 hour</Button>
                <Button onClick={() => handleQuickBook(120)}>2 hours</Button>
              </div>
              
              <div className="mt-4">
                <Dialog open={isBookingDialogOpen} onOpenChange={setIsBookingDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full">Custom Booking</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Book {room.name}</DialogTitle>
                    </DialogHeader>
                    <BookingForm 
                      deskId={room.id} 
                      date={selectedDate} 
                      status="available"
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          )}
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
