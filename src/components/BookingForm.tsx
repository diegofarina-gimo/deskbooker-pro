
import React, { useState } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from 'date-fns';
import { CalendarIcon, CheckIcon, XIcon } from 'lucide-react';
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
    users
  } = useBooking();
  
  const [selectedDate, setSelectedDate] = useState<Date>(date);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState<string[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>(currentUser?.id || '');
  
  const desk = getDeskById(deskId);
  const isAdmin = currentUser?.role === 'admin';
  
  // Find if there's a booking for this desk on the selected date
  const existingBooking = bookings.find(
    b => b.deskId === deskId && b.date === format(selectedDate, 'yyyy-MM-dd')
  );
  
  const bookedBy = existingBooking ? getUserById(existingBooking.userId) : null;
  const isMyBooking = existingBooking && existingBooking.userId === currentUser?.id;
  
  const handleBook = () => {
    if (!currentUser) return;
    
    // Determine which user to book for
    const bookForUserId = isAdmin && selectedUserId ? selectedUserId : currentUser.id;
    const bookForUser = getUserById(bookForUserId);
    
    addBooking({
      deskId,
      userId: bookForUserId,
      date: format(selectedDate, 'yyyy-MM-dd'),
      isRecurring,
      recurringDays: isRecurring ? recurringDays : undefined,
    });
    
    const bookingMessage = isAdmin && bookForUser && bookForUser.id !== currentUser.id 
      ? `You've successfully booked ${desk?.name} for ${bookForUser.name} on ${format(selectedDate, 'PPPP')}`
      : `You've successfully booked ${desk?.name} for ${format(selectedDate, 'PPPP')}`;
    
    toast.success(bookingMessage);
  };
  
  const handleCancel = () => {
    if (!existingBooking) return;
    
    cancelBooking(existingBooking.id);
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
    <div className="p-4 space-y-4 animate-fadeIn">
      {status === 'booked' ? (
        <div className="bg-blue-50 p-4 rounded-md">
          <h3 className="font-medium text-blue-800">Currently Booked</h3>
          {bookedBy && (
            <p className="text-sm mt-2">
              Booked by: {bookedBy.name}
            </p>
          )}
          {(isMyBooking || isAdmin) && (
            <Button
              variant="destructive"
              size="sm"
              className="mt-3"
              onClick={handleCancel}
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
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
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
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="recurring" 
              checked={isRecurring}
              onCheckedChange={() => setIsRecurring(!isRecurring)}
            />
            <Label htmlFor="recurring">Make this a recurring booking</Label>
          </div>
          
          {isRecurring && (
            <div className="ml-6 space-y-2 animate-slideIn">
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
            Book Desk
          </Button>
        </div>
      )}
    </div>
  );
};
