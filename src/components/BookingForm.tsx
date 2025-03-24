import React, { useState, useEffect } from 'react';
import { useBooking, TimeSlot } from '@/contexts/BookingContext';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { CalendarIcon, CheckIcon, XIcon, Clock } from 'lucide-react';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

interface BookingFormProps {
  deskId: string;
  date: Date;
  status: 'available' | 'booked';
}

export const BookingForm: React.FC<BookingFormProps> = ({ deskId, date, status }) => {
  const { 
    addBooking, 
    cancelBooking, 
    currentUser, 
    bookings,
    getDeskById,
    getUserById,
    users,
    canUserBookDesk,
    getBookingByDeskAndDate
  } = useBooking();
  
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || '');
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("10:00");
  const [bookingsForDay, setBookingsForDay] = useState<any[]>([]);
  
  const desk = getDeskById(deskId);
  const isAdmin = currentUser?.role === 'admin';
  const isMeetingRoom = desk?.type === 'meeting_room';
  
  const dateStr = format(selectedDate, 'yyyy-MM-dd');
  
  useEffect(() => {
    if (isMeetingRoom) {
      const roomBookings = bookings
        .filter(b => b.deskId === deskId && b.date === dateStr)
        .map(booking => {
          const user = getUserById(booking.userId);
          return {
            id: booking.id,
            userId: booking.userId,
            userName: user?.name || 'Unknown User',
            timeSlot: booking.timeSlot,
            isCurrentUserBooking: booking.userId === currentUser?.id
          };
        })
        .sort((a, b) => {
          if (!a.timeSlot || !b.timeSlot) return 0;
          return a.timeSlot.startTime.localeCompare(b.timeSlot.startTime);
        });
      
      setBookingsForDay(roomBookings);
    }
  }, [bookings, deskId, dateStr, currentUser?.id, isMeetingRoom, getUserById]);
  
  const existingBooking = getBookingByDeskAndDate(deskId, selectedDate);
  const bookedBy = existingBooking ? getUserById(existingBooking.userId) : null;
  const isMyBooking = existingBooking && existingBooking.userId === currentUser?.id;
  
  const timeOptions = [];
  for (let hour = 9; hour <= 17; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const hourFormatted = hour.toString().padStart(2, '0');
      const minuteFormatted = minute.toString().padStart(2, '0');
      timeOptions.push(`${hourFormatted}:${minuteFormatted}`);
    }
  }
  
  const handleBook = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser) return;
    
    const bookForUserId = isAdmin && selectedUserId ? selectedUserId : currentUser.id;
    const bookForUser = getUserById(bookForUserId);
    
    if (!isMeetingRoom && !isAdmin) {
      const canBook = canUserBookDesk(currentUser.id, selectedDate);
      if (!canBook) {
        toast.error("You can only book one desk per day");
        return;
      }
    }
    
    let timeSlot: TimeSlot | undefined;
    if (isMeetingRoom) {
      if (startTime >= endTime) {
        toast.error("End time must be after start time");
        return;
      }
      timeSlot = {
        startTime,
        endTime
      };
    }
    
    const success = addBooking({
      deskId,
      userId: bookForUserId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      isRecurring,
      recurringDays: isRecurring ? recurringDays : undefined,
      timeSlot
    });
    
    if (success) {
      const resourceType = isMeetingRoom ? 'meeting room' : 'desk';
      const bookingMessage = isAdmin && bookForUser && bookForUser.id !== currentUser.id 
        ? `You've successfully booked ${desk?.name} for ${bookForUser.name} on ${format(selectedDate, 'PPPP')}`
        : `You've successfully booked ${desk?.name} for ${format(selectedDate, 'PPPP')}`;
      
      toast.success(bookingMessage + (isMeetingRoom ? ` from ${startTime} to ${endTime}` : ''));
    } else {
      if (isMeetingRoom) {
        toast.error(`This time slot is not available. Please select a different time.`);
      } else {
        toast.error(`You already have a desk booked for this day.`);
      }
    }
  };
  
  const handleCancel = (bookingId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    cancelBooking(bookingId);
    toast.success(`Booking for ${desk?.name} has been cancelled.`);
  };
  
  const weekdays = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
  ];
  
  const handleRecurringDayChange = (day: string) => {
    setRecurringDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day) 
        : [...prev, day]
    );
  };
  
  return (
    <div className="p-4 space-y-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
      {isMeetingRoom && bookingsForDay.length > 0 && (
        <div className="bg-blue-50 p-4 rounded-md mb-4">
          <h3 className="font-medium text-blue-800 mb-2">Existing Bookings Today</h3>
          <div className="space-y-2 max-h-36 overflow-y-auto">
            {bookingsForDay.map((booking) => (
              <div key={booking.id} className="flex justify-between items-center text-sm border-b pb-1">
                <div>
                  <span className="font-medium">{booking.userName}</span>
                  {booking.timeSlot && (
                    <span className="text-gray-600 ml-2">
                      {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                    </span>
                  )}
                </div>
                {(booking.isCurrentUserBooking || isAdmin) && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCancel(booking.id, e);
                    }}
                  >
                    <XIcon className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {!isMeetingRoom && status === 'booked' && existingBooking ? (
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium text-blue-800">Currently Booked</h3>
          {bookedBy && (
            <p className="text-sm mt-2">
              Booked by: {bookedBy.name}
            </p>
          )}
          {existingBooking?.timeSlot && (
            <p className="text-sm mt-1">
              Time: {existingBooking.timeSlot.startTime} - {existingBooking.timeSlot.endTime}
            </p>
          )}
          {(isMyBooking || isAdmin) && (
            <Button
              variant="destructive"
              size="sm"
              className="mt-3"
              onClick={(e) => {
                e.stopPropagation();
                handleCancel(existingBooking.id, e);
              }}
            >
              <XIcon className="mr-2 h-4 w-4" />
              Cancel Booking
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <Label htmlFor="booking-date">Select Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="booking-date"
                  variant="outline"
                  className="w-full justify-start text-left mt-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start" onClick={(e) => e.stopPropagation()}>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                  className="pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
          {isMeetingRoom && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="start-time">Start Time</Label>
                  <Select 
                    value={startTime} 
                    onValueChange={setStartTime}
                  >
                    <SelectTrigger id="start-time" className="w-full mt-1" onClick={(e) => e.stopPropagation()}>
                      <SelectValue placeholder="Select start time" />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      {timeOptions.slice(0, -1).map(time => (
                        <SelectItem key={`start-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="end-time">End Time</Label>
                  <Select 
                    value={endTime} 
                    onValueChange={setEndTime}
                  >
                    <SelectTrigger id="end-time" className="w-full mt-1" onClick={(e) => e.stopPropagation()}>
                      <SelectValue placeholder="Select end time" />
                    </SelectTrigger>
                    <SelectContent onClick={(e) => e.stopPropagation()}>
                      {timeOptions.slice(1).map(time => (
                        <SelectItem key={`end-${time}`} value={time}>
                          {time}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          
          {isAdmin && (
            <div>
              <Label htmlFor="book-for-user">Book for User</Label>
              <Select
                value={selectedUserId}
                onValueChange={setSelectedUserId}
              >
                <SelectTrigger className="w-full mt-1">
                  <SelectValue placeholder="Select user" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={currentUser?.id || ""}>
                    {currentUser?.name || "Yourself"} (You)
                  </SelectItem>
                  {users
                    .filter(user => user.id !== currentUser?.id)
                    .map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))
                  }
                </SelectContent>
              </Select>
            </div>
          )}
          
          {!isMeetingRoom && (
            <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
              <Checkbox 
                id="recurring" 
                checked={isRecurring}
                onCheckedChange={() => setIsRecurring(!isRecurring)}
              />
              <Label htmlFor="recurring">Make this a recurring booking</Label>
            </div>
          )}
          
          {isRecurring && !isMeetingRoom && (
            <div className="ml-6 space-y-2 animate-slideIn" onClick={(e) => e.stopPropagation()}>
              <Label>Select days of the week</Label>
              <div className="grid grid-cols-2 gap-2 mt-1">
                {weekdays.map((day) => (
                  <div key={day.id} className="flex items-center space-x-2">
                    <Checkbox 
                      id={day.id} 
                      checked={recurringDays.includes(day.id)}
                      onCheckedChange={() => handleRecurringDayChange(day.id)}
                    />
                    <Label htmlFor={day.id}>{day.label}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <Button onClick={handleBook} className="w-full mt-4">
            <CheckIcon className="mr-2 h-4 w-4" />
            Book {isMeetingRoom ? 'Meeting Room' : 'Desk'}
          </Button>
        </div>
      )}
    </div>
  );
};
