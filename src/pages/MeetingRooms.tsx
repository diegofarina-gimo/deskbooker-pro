
import React, { useState } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { AppHeader } from '@/components/AppHeader';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { MeetingRoomTimetable } from '@/components/MeetingRoomTimetable';
import { Link } from 'react-router-dom';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

const MeetingRooms = () => {
  const { currentUser, desks, selectedDate, setSelectedDate, selectedMap, setSelectedMap, maps } = useBooking();
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  
  const meetingRooms = desks.filter(desk => desk.type === 'meeting_room');
  console.log("Meeting rooms in MeetingRooms.tsx:", meetingRooms);
  
  const filteredRooms = selectedMap 
    ? meetingRooms.filter(room => room.mapId === selectedMap)
    : meetingRooms;

  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-3xl font-bold">Meeting Rooms</h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="justify-start gap-2">
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
            
            <Select 
              value={selectedMap || 'all'} 
              onValueChange={(value) => setSelectedMap(value === 'all' ? '' : value)}
            >
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="All floors" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All floors</SelectItem>
                {maps.map((map) => (
                  <SelectItem key={map.id} value={map.id}>
                    {map.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-1">
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm" 
                onClick={() => setViewMode('list')}
              >
                List
              </Button>
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'outline'} 
                size="sm"
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
            </div>
          </div>
        </div>
        
        {filteredRooms.length === 0 ? (
          <div className="p-10 text-center bg-white rounded-lg shadow-sm">
            <h3 className="text-xl font-medium text-gray-700 mb-2">No Meeting Rooms Available</h3>
            <p className="text-gray-500">
              {selectedMap 
                ? "There are no meeting rooms on this floor."
                : "There are no meeting rooms in the system."}
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="space-y-6">
            {filteredRooms.map(room => (
              <Card key={room.id} className="overflow-hidden">
                <CardHeader className="bg-gray-50">
                  <div className="flex justify-between items-center">
                    <CardTitle>{room.name}</CardTitle>
                    <div className="text-sm text-muted-foreground">
                      Capacity: {room.capacity || 'Unknown'} {room.capacity === 1 ? 'person' : 'people'}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  <MeetingRoomTimetable room={room} date={selectedDate} />
                </CardContent>
                <CardFooter className="bg-gray-50 border-t">
                  <Link to={`/meeting-room/${room.id}`} className="flex items-center text-blue-600 hover:underline text-sm">
                    <ExternalLink className="w-4 h-4 mr-1" /> View Room Display
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRooms.map(room => (
              <Card key={room.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{room.name}</CardTitle>
                  <div className="text-sm text-muted-foreground">
                    Capacity: {room.capacity || 'Unknown'} {room.capacity === 1 ? 'person' : 'people'}
                  </div>
                </CardHeader>
                <CardContent>
                  <MeetingRoomTimetable room={room} date={selectedDate} compact={true} />
                </CardContent>
                <CardFooter className="pt-2 border-t">
                  <Link to={`/meeting-room/${room.id}`} className="flex items-center text-blue-600 hover:underline text-sm">
                    <ExternalLink className="w-4 h-4 mr-1" /> View Room Display
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default MeetingRooms;
