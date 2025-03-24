
import React from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { format, isSameDay, isBefore, isAfter } from 'date-fns';
import { User, Calendar, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useIsMobile } from '@/hooks/use-mobile';

export const TeamBookingsView = () => {
  const { 
    currentUser, 
    teams, 
    getUsersByTeamId, 
    bookings, 
    getDeskById, 
    getUserById,
    cancelBooking,
    selectedDate,
  } = useBooking();
  
  const isMobile = useIsMobile();
  
  if (!currentUser || !currentUser.teamId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Bookings</CardTitle>
          <CardDescription>
            You are not assigned to any team.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  const userTeam = teams.find(t => t.id === currentUser.teamId);
  if (!userTeam) return null;
  
  const teamMembers = getUsersByTeamId(userTeam.id);
  const teamMemberIds = teamMembers.map(member => member.id);
  
  // Filter bookings for team members and group by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const upcomingBookings = bookings
    .filter(booking => {
      const bookingDate = new Date(booking.date);
      bookingDate.setHours(0, 0, 0, 0);
      return teamMemberIds.includes(booking.userId) && !isBefore(bookingDate, today);
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Check if a specific date has been selected
  const selectedDateBookings = bookings.filter(booking => {
    return teamMemberIds.includes(booking.userId) && isSameDay(new Date(booking.date), selectedDate);
  });
  
  // Group bookings by date
  const bookingsByDate = upcomingBookings.reduce((acc, booking) => {
    const dateStr = booking.date;
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(booking);
    return acc;
  }, {} as Record<string, typeof bookings>);
  
  const handleCancelBooking = (id: string) => {
    cancelBooking(id);
    toast.success('Booking cancelled successfully');
  };
  
  const teamAttendanceRate = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const dateBookings = bookingsByDate[dateStr] || [];
    const uniqueUsersBooked = new Set(dateBookings.map(b => b.userId)).size;
    return `${uniqueUsersBooked}/${teamMembers.length} members`;
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader style={{ borderLeftWidth: '4px', borderLeftColor: userTeam.color || '#3B82F6' }}>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {userTeam.name} Team Bookings
          </CardTitle>
          <CardDescription>
            See when your team members are coming to the office
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedDateBookings.length > 0 ? (
            <div className="mb-6">
              <h3 className="text-sm font-medium mb-2">
                {format(selectedDate, 'PPPP')} - {teamAttendanceRate(selectedDate)}
              </h3>
              <div className="space-y-2">
                {selectedDateBookings.map(booking => {
                  const desk = getDeskById(booking.deskId);
                  const user = getUserById(booking.userId);
                  
                  return (
                    <div 
                      key={booking.id} 
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-md"
                    >
                      <div className="flex items-center gap-2">
                        {user?.avatar ? (
                          <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full" />
                        ) : (
                          <User className="w-6 h-6 text-gray-400" />
                        )}
                        <div>
                          <p className="font-medium">{user?.name}</p>
                          <p className="text-xs text-gray-500">{desk?.name}</p>
                        </div>
                      </div>
                      {(booking.userId === currentUser.id || currentUser.role === 'admin') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleCancelBooking(booking.id)}
                        >
                          <XCircle className="h-4 w-4 mr-1" />
                          <span className={isMobile ? 'sr-only' : ''}>Cancel</span>
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="mb-6 text-center p-4 bg-gray-50 rounded-md">
              <p className="text-gray-500">No team bookings for {format(selectedDate, 'PPP')}</p>
            </div>
          )}
          
          <h3 className="text-sm font-medium mb-2">Upcoming Team Bookings</h3>
          {Object.keys(bookingsByDate).length > 0 ? (
            <div className="space-y-4">
              {Object.entries(bookingsByDate).map(([dateStr, dateBookings]) => {
                const bookingDate = new Date(dateStr);
                if (isBefore(bookingDate, today)) return null;
                
                const uniqueUsersBooked = new Set(dateBookings.map(b => b.userId));
                
                return (
                  <div key={dateStr} className="border rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-2 flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{format(bookingDate, 'EEEE, MMMM d')}</h4>
                        <p className="text-xs text-gray-500">
                          {uniqueUsersBooked.size} team members booked
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                        {uniqueUsersBooked.size}/{teamMembers.length}
                      </span>
                    </div>
                    <div className="p-2">
                      <div className="flex flex-wrap gap-2">
                        {Array.from(uniqueUsersBooked).map(userId => {
                          const user = getUserById(userId);
                          if (!user) return null;
                          
                          return (
                            <div key={userId} className="flex items-center gap-1 bg-white px-2 py-1 text-xs rounded border">
                              {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-4 h-4 rounded-full" />
                              ) : (
                                <User className="w-4 h-4 text-gray-400" />
                              )}
                              <span>{user.name}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center p-4 bg-gray-50 rounded-md">
              <p className="text-gray-500">No upcoming team bookings</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
