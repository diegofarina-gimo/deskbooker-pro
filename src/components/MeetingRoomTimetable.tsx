
import React, { useState } from 'react';
import { useBooking, Desk, TimeSlot } from '@/contexts/BookingContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { BookingForm } from './BookingForm';
import { cn } from '@/lib/utils';
import { CalendarClock, XCircle, Clock, User } from 'lucide-react';

interface MeetingRoomTimetableProps {
  room: Desk;
  date: Date;
  compact?: boolean;
}

export const MeetingRoomTimetable: React.FC<MeetingRoomTimetableProps> = ({ 
  room, 
  date,
  compact = false
}) => {
  const { 
    bookings, 
    getUserById,
    currentUser
  } = useBooking();

  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false);
  
  const dateStr = format(date, 'yyyy-MM-dd');
  const now = new Date();
  const currentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  const isToday = date.toDateString() === new Date().toDateString();
  
  // Get only the bookings for this room and date
  const roomBookings = bookings
    .filter(b => b.deskId === room.id && b.date === dateStr && b.timeSlot)
    .map(booking => {
      const user = getUserById(booking.userId);
      return {
        id: booking.id,
        userId: booking.userId,
        userName: user?.name || 'Unknown User',
        timeSlot: booking.timeSlot,
        isPast: isToday && booking.timeSlot && booking.timeSlot.endTime < currentTimeString,
        isCurrent: isToday && booking.timeSlot && 
                  currentTimeString >= booking.timeSlot.startTime && 
                  currentTimeString <= booking.timeSlot.endTime,
        isCurrentUserBooking: booking.userId === currentUser?.id
      };
    })
    .sort((a, b) => {
      if (!a.timeSlot || !b.timeSlot) return 0;
      return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime);
    });
  
  const handleBookClick = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setBookingDialogOpen(true);
  };
  
  const handleNewBooking = () => {
    // Default to next available full hour
    const currentHour = now.getHours();
    const nextHour = currentHour + 1;
    const startTime = `${String(nextHour).padStart(2, '0')}:00`;
    const endTime = `${String(nextHour + 1).padStart(2, '0')}:00`;
    
    setSelectedTimeSlot({
      startTime,
      endTime
    });
    setBookingDialogOpen(true);
  };
  
  // For compact view (grid layout)
  if (compact) {
    if (roomBookings.length === 0) {
      return (
        <div className="text-center py-8 bg-gray-50 rounded-md">
          <p className="text-gray-500">No meetings scheduled for this day</p>
          <Button 
            size="sm" 
            onClick={handleNewBooking} 
            className="mt-4 gap-1"
          >
            <CalendarClock className="h-3.5 w-3.5" />
            Book Meeting
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-1">
          {roomBookings.map((booking, index) => (
            <div 
              key={index}
              className={cn(
                "p-2 rounded-md flex justify-between items-center",
                booking.isPast ? "bg-gray-100 text-gray-500" : 
                booking.isCurrent ? "bg-blue-50 border border-blue-200" :
                "bg-green-50 border border-green-100"
              )}
            >
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5" />
                <span>{booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}</span>
                <span className="text-xs ml-2">{booking.userName}</span>
              </div>
            </div>
          ))}
        </div>
        
        <Button 
          size="sm" 
          onClick={handleNewBooking} 
          className="w-full mt-4 gap-1"
        >
          <CalendarClock className="h-3.5 w-3.5" />
          Book Meeting
        </Button>
        
        <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
          <DialogContent onClick={(e) => e.stopPropagation()}>
            <DialogHeader>
              <DialogTitle>Book {room.name}</DialogTitle>
            </DialogHeader>
            {selectedTimeSlot && (
              <BookingForm 
                deskId={room.id} 
                date={date} 
                status="available"
                preselectedTimeSlot={selectedTimeSlot}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {roomBookings.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-md">
          <p className="text-gray-500 mb-2">No meetings scheduled for this day</p>
          <Button 
            onClick={handleNewBooking} 
            className="mt-2 gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
          >
            <CalendarClock className="h-4 w-4" />
            Book Meeting
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {roomBookings.map((booking, index) => (
            <div 
              key={index} 
              className={cn(
                "p-4 rounded-lg flex justify-between items-center shadow-sm border transition-all duration-200",
                booking.isPast 
                  ? "bg-gray-50 border-gray-100 opacity-60" 
                  : booking.isCurrent
                    ? "bg-blue-50 border-blue-100 ring-2 ring-blue-300"
                    : "bg-gradient-to-r from-green-50 to-green-100 border-green-100"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center justify-center w-10 h-10 rounded-full shadow-sm",
                  booking.isPast ? "bg-gray-100" : 
                  booking.isCurrent ? "bg-blue-100" : "bg-white"
                )}>
                  <Clock className={cn(
                    "w-5 h-5",
                    booking.isPast ? "text-gray-400" : 
                    booking.isCurrent ? "text-blue-500" : "text-green-500"
                  )} />
                </div>
                <div>
                  <span className="font-medium text-gray-800 flex items-center gap-2">
                    {booking.timeSlot?.startTime} - {booking.timeSlot?.endTime}
                    {booking.isCurrent && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center">
                        <Clock className="h-3 w-3 mr-1" />Current
                      </span>
                    )}
                    {booking.isPast && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full flex items-center">
                        <Clock className="h-3 w-3 mr-1" />Past
                      </span>
                    )}
                  </span>
                  <span className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <User className="h-3 w-3" />
                    {booking.userName}
                  </span>
                </div>
              </div>
              
              {(booking.isCurrentUserBooking || currentUser?.role === 'admin') && (
                <Button 
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    const { cancelBooking } = useBooking();
                    cancelBooking(booking.id);
                  }}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
        </div>
      )}
      
      {roomBookings.length > 0 && (
        <Button 
          onClick={handleNewBooking} 
          className="w-full mt-2 gap-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
        >
          <CalendarClock className="h-4 w-4" />
          Book Another Meeting
        </Button>
      )}
      
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>Book {room.name}</DialogTitle>
          </DialogHeader>
          {selectedTimeSlot && (
            <BookingForm 
              deskId={room.id} 
              date={date} 
              status="available"
              preselectedTimeSlot={selectedTimeSlot}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
