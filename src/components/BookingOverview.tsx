
import React, { useState } from 'react';
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
import { CalendarIcon, XCircle, Users, User } from 'lucide-react';
import { toast } from "sonner";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useIsMobile } from '@/hooks/use-mobile';

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
    setSelectedMap,
    teams,
    getUsersByTeamId,
    getTeamBookings,
    getUserById
  } = useBooking();
  
  const [viewMode, setViewMode] = useState<'my' | 'team'>('my');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const isMobile = useIsMobile();
  
  if (!currentUser) return null;
  
  // Get user's team if they have one
  const userTeam = currentUser.teamId ? teams.find(t => t.id === currentUser.teamId) : null;
  
  // Filter bookings based on view mode
  let filteredBookings = bookings;
  
  if (viewMode === 'my') {
    // My bookings
    filteredBookings = bookings.filter(booking => {
      const isMatchingDate = isSameDay(new Date(booking.date), selectedDate);
      const isCurrentUserBooking = currentUser.role === 'admin' || booking.userId === currentUser.id;
      return isMatchingDate && isCurrentUserBooking;
    });
  } else if (viewMode === 'team' && selectedTeam) {
    // Team bookings
    filteredBookings = getTeamBookings(selectedTeam, selectedDate);
  }
  
  const handleCancelBooking = (id: string) => {
    cancelBooking(id);
    toast.success('Booking cancelled successfully');
  };
  
  // Get available teams (for admin, all teams; for user, just their team)
  const availableTeams = currentUser.role === 'admin' 
    ? teams 
    : userTeam 
      ? [userTeam]
      : [];
  
  // Team colors for legend
  const teamColorsForLegend = teams.filter(team => {
    if (currentUser.role === 'admin') return true;
    if (currentUser.teamId === team.id) return true;
    return false;
  });
  
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
                  <Select value={selectedMap || 'none'} onValueChange={(val) => setSelectedMap(val === 'none' ? null : val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a map" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Map Selected</SelectItem>
                      {maps.map(map => (
                        <SelectItem key={map.id} value={map.id}>
                          {map.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {/* Team color legend */}
                {teamColorsForLegend.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Team Colors</p>
                    <div className="flex flex-wrap gap-2">
                      {teamColorsForLegend.map(team => (
                        <div key={team.id} className="flex items-center gap-1 text-xs">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: team.color || '#888888' }}
                          ></div>
                          <span>{team.name}</span>
                        </div>
                      ))}
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <span>Available</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                        <span>Maintenance</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="md:col-span-2">
              <Card>
                <CardHeader className="flex-row justify-between items-start space-y-0">
                  <div>
                    <CardTitle>Bookings</CardTitle>
                    <CardDescription>
                      {format(selectedDate, 'PPPP')}
                    </CardDescription>
                  </div>
                  {(availableTeams.length > 0 || currentUser.role === 'admin') && (
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant={viewMode === 'my' ? 'default' : 'outline'} 
                        onClick={() => setViewMode('my')}
                        className="flex items-center gap-1"
                      >
                        <User className="h-4 w-4" />
                        {!isMobile && <span>My Bookings</span>}
                      </Button>
                      <Button 
                        size="sm" 
                        variant={viewMode === 'team' ? 'default' : 'outline'} 
                        onClick={() => {
                          setViewMode('team');
                          if (availableTeams.length > 0 && !selectedTeam) {
                            setSelectedTeam(availableTeams[0].id);
                          }
                        }}
                        className="flex items-center gap-1"
                      >
                        <Users className="h-4 w-4" />
                        {!isMobile && <span>Team</span>}
                      </Button>
                    </div>
                  )}
                </CardHeader>
                
                {viewMode === 'team' && availableTeams.length > 0 && (
                  <div className="px-6 -mt-2 mb-4">
                    <Select value={selectedTeam || 'none'} onValueChange={(val) => setSelectedTeam(val === 'none' ? null : val)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a team" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No Team Selected</SelectItem>
                        {availableTeams.map(team => (
                          <SelectItem key={team.id} value={team.id}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                
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
                        const user = getUserById(booking.userId);
                        const team = user?.teamId ? teams.find(t => t.id === user.teamId) : null;
                        
                        return (
                          <div 
                            key={booking.id} 
                            className="flex justify-between items-center p-3 bg-gray-50 rounded-md border-l-4"
                            style={{ borderLeftColor: team?.color || '#3B82F6' }}
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium">{desk?.name || 'Unknown Desk'}</p>
                                {viewMode === 'team' && (
                                  <span className="text-xs text-gray-500">
                                    ({user?.name})
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-gray-500">
                                {booking.isRecurring ? 'Recurring booking' : 'One-time booking'}
                              </p>
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
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="list" className="animate-fadeIn">
          <Card>
            <CardHeader className="flex-row justify-between items-start space-y-0">
              <div>
                <CardTitle>All Bookings</CardTitle>
                <CardDescription>
                  Manage all your upcoming reservations
                </CardDescription>
              </div>
              {(availableTeams.length > 0 || currentUser.role === 'admin') && (
                <div className="flex items-center gap-2">
                  <Button 
                    size="sm" 
                    variant={viewMode === 'my' ? 'default' : 'outline'} 
                    onClick={() => setViewMode('my')}
                    className="flex items-center gap-1"
                  >
                    <User className="h-4 w-4" />
                    {!isMobile && <span>My Bookings</span>}
                  </Button>
                  <Button 
                    size="sm" 
                    variant={viewMode === 'team' ? 'default' : 'outline'} 
                    onClick={() => {
                      setViewMode('team');
                      if (availableTeams.length > 0 && !selectedTeam) {
                        setSelectedTeam(availableTeams[0].id);
                      }
                    }}
                    className="flex items-center gap-1"
                  >
                    <Users className="h-4 w-4" />
                    {!isMobile && <span>Team</span>}
                  </Button>
                </div>
              )}
            </CardHeader>
            
            {viewMode === 'team' && availableTeams.length > 0 && (
              <div className="px-6 -mt-2 mb-4">
                <Select value={selectedTeam || 'none'} onValueChange={(val) => setSelectedTeam(val === 'none' ? null : val)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a team" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No Team Selected</SelectItem>
                    {availableTeams.map(team => (
                      <SelectItem key={team.id} value={team.id}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            
            <CardContent>
              {bookings.filter(b => {
                const isUpcoming = new Date(b.date) >= new Date();
                const isRelevant = viewMode === 'my'
                  ? (currentUser.role === 'admin' || b.userId === currentUser.id)
                  : selectedTeam 
                    ? getUserById(b.userId)?.teamId === selectedTeam
                    : false;
                return isUpcoming && isRelevant;
              }).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <CalendarIcon className="h-12 w-12 text-gray-300 mb-2" />
                  <p className="text-gray-500">No upcoming bookings found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bookings
                    .filter(b => {
                      const isUpcoming = new Date(b.date) >= new Date();
                      const isRelevant = viewMode === 'my'
                        ? (currentUser.role === 'admin' || b.userId === currentUser.id)
                        : selectedTeam 
                          ? getUserById(b.userId)?.teamId === selectedTeam
                          : false;
                      return isUpcoming && isRelevant;
                    })
                    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
                    .map(booking => {
                      const desk = getDeskById(booking.deskId);
                      const user = getUserById(booking.userId);
                      const team = user?.teamId ? teams.find(t => t.id === user.teamId) : null;
                      
                      return (
                        <div 
                          key={booking.id} 
                          className="flex justify-between items-center p-3 bg-gray-50 rounded-md border-l-4"
                          style={{ borderLeftColor: team?.color || '#3B82F6' }}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{desk?.name || 'Unknown Desk'}</p>
                              {viewMode === 'team' && (
                                <span className="text-xs text-gray-500">
                                  ({user?.name})
                                </span>
                              )}
                            </div>
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
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
