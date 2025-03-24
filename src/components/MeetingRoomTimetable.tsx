
import React, { useState } from 'react';
import { useBooking, Desk, TimeSlot } from '@/contexts/BookingContext';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookingForm } from './BookingForm';
import { cn } from '@/lib/utils';
import { CalendarClock, CheckCircle, XCircle, Clock } from 'lucide-react';

interface TimeSlotInfo {
  startTime: string;
  endTime: string;
  isBooked: boolean;
  bookingId?: string;
  userId?: string;
  userName?: string;
}

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
  
  // Generate all time slots for the day
  const generateTimeSlots = (): TimeSlotInfo[] => {
    const slots: TimeSlotInfo[] = [];
    
    // Office hours from 9 AM to 5 PM
    for (let hour = 9; hour < 18; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const nextHour = minute === 30 ? hour + 1 : hour;
        const nextMinute = minute === 30 ? 0 : 30;
        
        const startTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const endTime = `${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`;
        
        if (nextHour >= 18) continue; // Skip slots that end after 6 PM
        
        const roomBookings = bookings.filter(b => 
          b.deskId === room.id && 
          b.date === dateStr &&
          b.timeSlot
        );
        
        // Check if this time slot overlaps with any booking
        const isBooked = roomBookings.some(booking => {
          if (!booking.timeSlot) return false;
          
          const bookingStart = booking.timeSlot.startTime;
          const bookingEnd = booking.timeSlot.endTime;
          
          // Convert times to minutes for easier comparison
          const slotStartMinutes = hour * 60 + minute;
          const slotEndMinutes = nextHour * 60 + nextMinute;
          const bookingStartMinutes = parseInt(bookingStart.split(':')[0]) * 60 + parseInt(bookingStart.split(':')[1]);
          const bookingEndMinutes = parseInt(bookingEnd.split(':')[0]) * 60 + parseInt(bookingEnd.split(':')[1]);
          
          // Check for overlap
          return (slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes);
        });
        
        const overlappingBooking = roomBookings.find(booking => {
          if (!booking.timeSlot) return false;
          
          const bookingStart = booking.timeSlot.startTime;
          const bookingEnd = booking.timeSlot.endTime;
          
          // Convert times to minutes for easier comparison
          const slotStartMinutes = hour * 60 + minute;
          const slotEndMinutes = nextHour * 60 + nextMinute;
          const bookingStartMinutes = parseInt(bookingStart.split(':')[0]) * 60 + parseInt(bookingStart.split(':')[1]);
          const bookingEndMinutes = parseInt(bookingEnd.split(':')[0]) * 60 + parseInt(bookingEnd.split(':')[1]);
          
          // Check for overlap
          return (slotStartMinutes < bookingEndMinutes && slotEndMinutes > bookingStartMinutes);
        });
        
        const bookingId = overlappingBooking?.id;
        const userId = overlappingBooking?.userId;
        const userName = userId ? getUserById(userId)?.name : undefined;
        
        slots.push({
          startTime,
          endTime,
          isBooked,
          bookingId,
          userId,
          userName
        });
      }
    }
    
    return slots;
  };
  
  const timeSlots = generateTimeSlots();
  
  const handleBookClick = (timeSlot: TimeSlot) => {
    setSelectedTimeSlot(timeSlot);
    setBookingDialogOpen(true);
  };
  
  // For compact view (grid layout)
  if (compact) {
    return (
      <div className="space-y-2">
        <div className="grid grid-cols-5 gap-1">
          {timeSlots.map((slot, index) => {
            const isPast = isToday && slot.endTime < currentTimeString;
            const now = isToday && currentTimeString >= slot.startTime && currentTimeString <= slot.endTime;
            
            return (
              <div 
                key={index}
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center text-xs font-medium shadow-sm",
                  slot.isBooked 
                    ? "bg-red-100 text-red-800" 
                    : "bg-green-100 text-green-800 hover:bg-green-200 cursor-pointer",
                  isPast && "opacity-60",
                  now && "ring-2 ring-blue-400"
                )}
                title={`${slot.startTime} - ${slot.endTime}${slot.userName ? ` | Booked by: ${slot.userName}` : ''}`}
                onClick={() => !slot.isBooked && !isPast && handleBookClick({
                  startTime: slot.startTime,
                  endTime: slot.endTime
                })}
              >
                {slot.startTime.split(':')[0]}
                {slot.isBooked && <XCircle className="h-3 w-3 ml-1" />}
              </div>
            );
          })}
        </div>
        
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
      <div className="grid grid-cols-1 gap-2">
        {timeSlots.map((slot, index) => {
          const isPast = isToday && slot.endTime < currentTimeString;
          const now = isToday && currentTimeString >= slot.startTime && currentTimeString <= slot.endTime;
          
          return (
            <div 
              key={index} 
              className={cn(
                "p-3 rounded-lg flex justify-between items-center shadow-sm border transition-all duration-200",
                slot.isBooked 
                  ? "bg-red-50 border-red-100" 
                  : "bg-gradient-to-r from-green-50 to-green-100 border-green-100 hover:shadow-md hover:-translate-y-0.5",
                isPast && "opacity-60",
                now && "ring-2 ring-blue-400"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white shadow-sm">
                  <CalendarClock 
                    className={cn(
                      "w-5 h-5",
                      slot.isBooked ? "text-red-500" : "text-green-500"
                    )} 
                  />
                </div>
                <div>
                  <span className="font-medium text-gray-800 flex items-center gap-2">
                    {slot.startTime} - {slot.endTime}
                    {now && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full flex items-center">
                        <Clock className="h-3 w-3 mr-1" />Current
                      </span>
                    )}
                  </span>
                  {slot.userName && (
                    <span className="text-sm text-gray-500 flex items-center mt-0.5">
                      Booked by: {slot.userName}
                    </span>
                  )}
                </div>
              </div>
              
              {!slot.isBooked && !isPast && (
                <Button 
                  size="sm" 
                  onClick={() => handleBookClick({
                    startTime: slot.startTime,
                    endTime: slot.endTime
                  })}
                  className="gap-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 shadow-sm"
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  Book
                </Button>
              )}
              
              {slot.isBooked && (
                <div className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full flex items-center">
                  <XCircle className="h-3.5 w-3.5 mr-1" />
                  Booked
                </div>
              )}
            </div>
          );
        })}
      </div>
      
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
