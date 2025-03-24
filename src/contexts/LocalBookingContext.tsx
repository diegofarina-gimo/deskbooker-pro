
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../integrations/api/client';
import { User, Role, Team, Desk, FloorMap, TimeSlot, Booking } from './BookingContext';

interface LocalBookingContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  isLoading: boolean;
  
  systemLogo: string | null;
  updateSystemLogo: (url: string) => void;
  
  maps: FloorMap[];
  addMap: (map: Omit<FloorMap, 'id'>) => void;
  updateMap: (map: FloorMap) => void;
  deleteMap: (id: string) => void;
  
  desks: Desk[];
  addDesk: (desk: Omit<Desk, 'id'>) => void;
  updateDesk: (desk: Desk) => void;
  deleteDesk: (id: string) => void;
  
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  changePassword: (userId: string, currentPassword: string, newPassword: string) => Promise<boolean>;
  
  teams: Team[];
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (team: Team) => void;
  deleteTeam: (id: string) => void;
  getUsersByTeamId: (teamId: string) => User[];
  getTeamBookings: (teamId: string, date: Date) => Booking[];
  
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => Promise<boolean>;
  cancelBooking: (id: string) => void;
  
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedMap: string | null;
  setSelectedMap: (id: string | null) => void;
  
  isDeskAvailable: (deskId: string, date: Date, timeSlot?: TimeSlot) => boolean;
  isMeetingRoomAvailableAtTime: (deskId: string, date: Date, timeSlot: TimeSlot) => boolean;
  getDeskStatus: (deskId: string, date: Date) => 'available' | 'booked' | 'maintenance';
  getDeskById: (id: string) => Desk | undefined;
  getUserById: (id: string) => User | undefined;
  getTeamById: (id: string) => Team | undefined;
  getBookingByDeskAndDate: (deskId: string, date: Date) => Booking | undefined;
  getUserBookingsForDate: (userId: string, date: Date) => Booking[];
  canUserBookDesk: (userId: string, date: Date) => boolean;
  
  signOut: () => Promise<void>;
}

const LocalBookingContext = createContext<LocalBookingContextType | undefined>(undefined);

export const LocalBookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [maps, setMaps] = useState<FloorMap[]>([]);
  const [desks, setDesks] = useState<Desk[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [systemLogo, setSystemLogo] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMap, setSelectedMap] = useState<string | null>(null);

  // Initialize auth state
  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await api.auth.getSession();
      
      if (session?.user) {
        try {
          const userData = session.user;
          
          setCurrentUser({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role as Role,
            avatar: userData.avatar,
            teamId: userData.teamId,
            bio: userData.bio,
            phone: userData.phone,
            isTeamLeader: userData.isTeamLeader
          });
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Load data when authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      try {
        // Fetch maps
        const { data: mapsData } = await api.data.getMaps();
        
        if (mapsData && mapsData.length > 0) {
          setMaps(mapsData.map((map: any) => ({
            id: map.id,
            name: map.name,
            width: map.width,
            height: map.height,
            background: map.background
          })));
          
          if (!selectedMap) {
            setSelectedMap(mapsData[0].id);
          }
        }
        
        // Fetch resources
        const { data: resourcesData } = await api.data.getResources();
        
        if (resourcesData) {
          setDesks(resourcesData.map((resource: any) => ({
            id: resource.id,
            name: resource.name,
            x: resource.x,
            y: resource.y,
            width: resource.width,
            height: resource.height,
            status: resource.status as 'available' | 'booked' | 'maintenance',
            mapId: resource.map_id,
            type: resource.type as 'desk' | 'meeting_room',
            capacity: resource.capacity
          })));
        }
        
        // Fetch teams
        const { data: teamsData } = await api.data.getTeams();
        
        if (teamsData) {
          setTeams(teamsData.map((team: any) => ({
            id: team.id,
            name: team.name,
            description: team.description,
            leaderId: team.leader_id,
            color: team.color
          })));
        }
        
        // Fetch all users
        const { data: usersData } = await api.data.getProfiles();
        
        if (usersData) {
          setUsers(usersData.map((user: any) => ({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role as Role,
            avatar: user.avatar,
            teamId: user.team_id,
            bio: user.bio,
            phone: user.phone,
            isTeamLeader: user.is_team_leader
          })));
        }
        
        // Fetch bookings
        const { data: bookingsData } = await api.data.getBookings();
        
        if (bookingsData) {
          setBookings(bookingsData.map((booking: any) => ({
            id: booking.id,
            deskId: booking.resource_id,
            userId: booking.user_id,
            date: booking.date,
            isRecurring: booking.is_recurring,
            recurringDays: booking.recurring_days,
            timeSlot: booking.start_time && booking.end_time ? {
              startTime: booking.start_time.substring(0, 5),
              endTime: booking.end_time.substring(0, 5)
            } : undefined
          })));
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, [currentUser, selectedMap]);
  
  // Implement all the required functions
  // This is just skeleton - you'd need to implement all of these methods to call your API
  
  const updateSystemLogo = (url: string) => {
    setSystemLogo(url);
  };

  const addMap = async (map: Omit<FloorMap, 'id'>) => {
    // Implementation would call the API
    console.log("Adding map", map);
  };

  const updateMap = async (map: FloorMap) => {
    // Implementation would call the API
    console.log("Updating map", map);
  };

  const deleteMap = async (id: string) => {
    // Implementation would call the API
    console.log("Deleting map", id);
  };

  const addDesk = async (desk: Omit<Desk, 'id'>) => {
    // Implementation would call the API
    console.log("Adding desk", desk);
  };

  const updateDesk = async (desk: Desk) => {
    // Implementation would call the API
    console.log("Updating desk", desk);
  };

  const deleteDesk = async (id: string) => {
    // Implementation would call the API
    console.log("Deleting desk", id);
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    // Implementation would call the API
    console.log("Adding user", user);
  };

  const updateUser = async (user: User) => {
    // Implementation would call the API
    console.log("Updating user", user);
  };

  const deleteUser = async (id: string) => {
    // Implementation would call the API
    console.log("Deleting user", id);
  };

  const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    // Implementation would call the API
    console.log("Changing password for user", userId);
    return true;
  };

  const addTeam = async (team: Omit<Team, 'id'>) => {
    // Implementation would call the API
    console.log("Adding team", team);
  };

  const updateTeam = async (team: Team) => {
    // Implementation would call the API
    console.log("Updating team", team);
  };

  const deleteTeam = async (id: string) => {
    // Implementation would call the API
    console.log("Deleting team", id);
  };

  const getUsersByTeamId = (teamId: string): User[] => {
    return users.filter(user => user.teamId === teamId);
  };

  const getTeamById = (id: string): Team | undefined => {
    return teams.find(t => t.id === id);
  };

  const getTeamBookings = (teamId: string, date: Date): Booking[] => {
    const dateStr = formatDateString(date);
    const teamUsers = getUsersByTeamId(teamId);
    const teamUserIds = teamUsers.map(user => user.id);
    
    return bookings.filter(booking => 
      teamUserIds.includes(booking.userId) && booking.date === dateStr
    );
  };

  const addBooking = async (booking: Omit<Booking, 'id'>): Promise<boolean> => {
    // Implementation would call the API
    console.log("Adding booking", booking);
    return true;
  };

  const cancelBooking = async (id: string) => {
    // Implementation would call the API
    console.log("Canceling booking", id);
  };

  const formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const getUserBookingsForDate = (userId: string, date: Date): Booking[] => {
    const dateStr = formatDateString(date);
    return bookings.filter(b => b.userId === userId && b.date === dateStr);
  };

  const canUserBookDesk = (userId: string, date: Date): boolean => {
    const user = getUserById(userId);
    if (!user) return false;
    
    if (user.role === 'admin') return true;
    
    const existingBookings = getUserBookingsForDate(userId, date);
    const deskBookings = existingBookings.filter(booking => {
      const desk = getDeskById(booking.deskId);
      return desk?.type === 'desk';
    });
    
    return deskBookings.length === 0;
  };

  const isDeskAvailable = (deskId: string, date: Date, timeSlot?: TimeSlot): boolean => {
    const dateStr = formatDateString(date);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const desk = desks.find(d => d.id === deskId);
    if (!desk || desk.status === 'maintenance') return false;
    
    // If it's a meeting room with a time slot, use the specialized checker
    if (desk.type === 'meeting_room' && timeSlot) {
      return isMeetingRoomAvailableAtTime(
        deskId, 
        new Date(dateStr), 
        timeSlot
      );
    }
    
    // For regular desks, check if there are any bookings
    const deskBookings = bookings.filter(b => 
      b.deskId === deskId && 
      (b.date === dateStr || 
        (b.isRecurring && b.recurringDays?.includes(weekday))
      )
    );
    
    return deskBookings.length === 0;
  };
  
  const isMeetingRoomAvailableAtTime = (deskId: string, date: Date, timeSlot: TimeSlot): boolean => {
    const dateStr = formatDateString(date);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const desk = desks.find(d => d.id === deskId);
    if (!desk || desk.status === 'maintenance' || desk.type !== 'meeting_room') return false;
    
    const deskBookings = bookings.filter(b => 
      b.deskId === deskId && 
      (b.date === dateStr || 
        (b.isRecurring && b.recurringDays?.includes(weekday))
      ) && 
      b.timeSlot // Only consider bookings with time slots
    );
    
    // Check if any existing booking overlaps with the requested time slot
    return !deskBookings.some(booking => {
      if (!booking.timeSlot) return false;
      
      const bookingStart = timeToMinutes(booking.timeSlot.startTime);
      const bookingEnd = timeToMinutes(booking.timeSlot.endTime);
      const requestStart = timeToMinutes(timeSlot.startTime);
      const requestEnd = timeToMinutes(timeSlot.endTime);
      
      // Check for overlap - if requested time starts before booking ends AND requested time ends after booking starts
      return (requestStart < bookingEnd && requestEnd > bookingStart);
    });
  };

  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return (hours * 60) + minutes;
  };

  const getDeskStatus = (deskId: string, date: Date): 'available' | 'booked' | 'maintenance' => {
    const desk = desks.find(d => d.id === deskId);
    if (!desk || desk.status === 'maintenance') return 'maintenance';
    
    const dateStr = formatDateString(date);
    
    // For meeting rooms, check if there are any bookings for the day
    // but the status is still considered 'booked' for UI purposes (blue dot)
    // even though new bookings at different times are allowed
    if (desk.type === 'meeting_room') {
      const hasBookings = bookings.some(b => 
        b.deskId === deskId && b.date === dateStr
      );
      
      return hasBookings ? 'booked' : 'available';
    }
    
    // For regular desks
    return isDeskAvailable(deskId, date) ? 'available' : 'booked';
  };

  const getBookingByDeskAndDate = (deskId: string, date: Date): Booking | undefined => {
    const dateStr = formatDateString(date);
    return bookings.find(b => b.deskId === deskId && b.date === dateStr);
  };

  const getDeskById = (id: string): Desk | undefined => {
    return desks.find(d => d.id === id);
  };

  const getUserById = (id: string): User | undefined => {
    return users.find(u => u.id === id);
  };

  const signOut = async (): Promise<void> => {
    await api.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <LocalBookingContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isLoading,
        systemLogo,
        updateSystemLogo,
        maps,
        addMap,
        updateMap,
        deleteMap,
        desks,
        addDesk,
        updateDesk,
        deleteDesk,
        users,
        addUser,
        updateUser,
        deleteUser,
        changePassword,
        teams,
        addTeam,
        updateTeam,
        deleteTeam,
        getUsersByTeamId,
        getTeamBookings,
        bookings,
        addBooking,
        cancelBooking,
        selectedDate,
        setSelectedDate,
        selectedMap,
        setSelectedMap,
        isDeskAvailable,
        isMeetingRoomAvailableAtTime,
        getDeskStatus,
        getDeskById,
        getUserById,
        getTeamById,
        getBookingByDeskAndDate,
        getUserBookingsForDate,
        canUserBookDesk,
        signOut
      }}
    >
      {children}
    </LocalBookingContext.Provider>
  );
};

export const useLocalBooking = () => {
  const context = useContext(LocalBookingContext);
  if (context === undefined) {
    throw new Error('useLocalBooking must be used within a LocalBookingProvider');
  }
  return context;
};
