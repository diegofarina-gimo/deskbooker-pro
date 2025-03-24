
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
                  "aspect-square rounded-sm flex items-center justify-center text-xs font-medium",
                  slot.isBooked 
                    ? "bg-red-100 text-red-800" 
                    : "bg-green-100 text-green-800",
                  isPast && "opacity-60",
                  now && "ring-2 ring-blue-400"
                )}
                title={`${slot.startTime} - ${slot.endTime}${slot.userName ? ` | Booked by: ${slot.userName}` : ''}`}
              >
                {slot.startTime.split(':')[0]}
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
      <div className="grid grid-cols-1 divide-y">
        {timeSlots.map((slot, index) => {
          const isPast = isToday && slot.endTime < currentTimeString;
          const now = isToday && currentTimeString >= slot.startTime && currentTimeString <= slot.endTime;
          
          return (
            <div 
              key={index} 
              className={cn(
                "py-2 px-3 flex justify-between items-center",
                slot.isBooked 
                  ? "bg-red-50" 
                  : "bg-green-50",
                isPast && "opacity-70",
                now && "ring-2 ring-inset ring-blue-400"
              )}
            >
              <div className="flex items-center gap-2">
                <div 
                  className={cn(
                    "w-3 h-3 rounded-full",
                    slot.isBooked ? "bg-red-500" : "bg-green-500"
                  )}
                />
                <span className="font-medium">
                  {slot.startTime} - {slot.endTime}
                </span>
                {slot.userName && (
                  <span className="text-sm text-gray-600 ml-2">
                    Booked by: {slot.userName}
                  </span>
                )}
                {now && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                    Current
                  </span>
                )}
              </div>
              
              {!slot.isBooked && !isPast && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      size="sm" 
                      onClick={() => handleBookClick({
                        startTime: slot.startTime,
                        endTime: slot.endTime
                      })}
                    >
                      Book
                    </Button>
                  </DialogTrigger>
                  <DialogContent onClick={(e) => e.stopPropagation()}>
                    <DialogHeader>
                      <DialogTitle>Book {room.name}</DialogTitle>
                    </DialogHeader>
                    <BookingForm 
                      deskId={room.id} 
                      date={date} 
                      status="available"
                      preselectedTimeSlot={{
                        startTime: slot.startTime,
                        endTime: slot.endTime
                      }}
                    />
                  </DialogContent>
                </Dialog>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
