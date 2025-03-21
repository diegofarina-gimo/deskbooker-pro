
import React from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format, isSameDay } from 'date-fns';
import { CalendarIcon, XCircle } from 'lucide-react';
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const BookingOverview: React.FC = () => {
  const { 
    bookings, 
    selectedDate, 
    setSelectedDate, 
    cancelBooking,
    currentUser,
    getDeskById,
    maps,
    selectedMap,
    setSelectedMap
  } = useBooking();
  
  if (!currentUser) return null;
  
  // Filter bookings by selected date and current user (if not admin)
  const filteredBookings = bookings.filter(booking => {
    const isMatchingDate = isSameDay(new Date(booking.date), selectedDate);
    const isCurrentUserBooking = currentUser.role === 'admin' || booking.userId === currentUser.id;
    return isMatchingDate && isCurrentUserBooking;
  });
  
  const handleCancelBooking = (id: string) => {
    cancelBooking(id);
    toast.success('Booking cancelled successfully');
  };
  
  return (
    <div className="p-6 space-y-6">
      <Tabs defaultValue="calendar">
        <TabsList className="mb-6">
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
        </TabsList>
        
        <TabsContent value="calendar" className="animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarIcon className="h-5 w-5" />
                  Book a Desk
                </CardTitle>
                <CardDescription>
                  Select a date to view available desks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  className="rounded-md border shadow-sm pointer-events-auto"
                />
                
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Selected Floor Map</p>
                  <Select value={selectedMap || ''} onValueChange={setSelectedMap}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a map" />
                    </SelectTrigger>
                    <SelectContent>
                      {maps.map(map => (
                        <SelectItem key={map.id} value={map.id}>
                          {map.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Your Bookings</CardTitle>
                  <CardDescription>
                    {format(selectedDate, 'PPPP')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {filteredBookings.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 text-center">
                      <CalendarIcon className="h-12 w-12 text-gray-300 mb-2" />
                      <p className="text-gray-500">No bookings found for this date</p>
                      <p className="text-sm text-gray-400 mt-1">
                        Select a desk on the map to make a reservation
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredBookings.map(booking => {
                        const desk = getDeskById(booking.deskId);
                        
                        return (
                          <div 
                            key={booking.id} 
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-md border-l-4 border-blue-500"
                          >
                            <div>
                              <p className="font-medium">{desk?.name || 'Unknown Desk'}</p>
                              <p className="text-sm text-gray-500">
                                {booking.isRecurring ? 'Recurring booking' : 'One-time booking'}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleCancelBooking(booking.id)}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="animate-fadeIn">
          <Card>
            <CardHeader>
              <CardTitle>All Your Bookings</CardTitle>
              <CardDescription>
                Manage all your upcoming reservations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookings.filter(b => 
                new Date(b.date) >= new Date() && 
                (currentUser.role === 'admin' || b.userId === currentUser.id)
              ).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">No upcoming bookings found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings
                    .filter(b => 
                      new Date(b.date) >= new Date() && 
                      (currentUser.role === 'admin' || b.userId === currentUser.id)
                    )
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(booking => {
                      const desk = getDeskById(booking.deskId);
                      
                      return (
                        <div 
                          key={booking.id} 
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-md border-l-4 border-blue-500"
                        >
                          <div>
                            <p className="font-medium">{desk?.name || 'Unknown Desk'}</p>
                            <div className="flex items-center gap-2">
                              <p className="text-sm text-gray-500">
                                {format(new Date(booking.date), 'PPP')}
                              </p>
                              {booking.isRecurring && (
                                <span className="px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                                  Recurring
                                </span>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
