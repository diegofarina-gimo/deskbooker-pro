import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

// Types
export type Role = 'admin' | 'user';
export type DeskStatus = 'available' | 'booked' | 'maintenance';
export type ResourceType = 'desk' | 'meeting_room';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  teamId?: string;
  bio?: string;
  phone?: string;
  isTeamLeader?: boolean;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId?: string;
  color?: string;
}

export interface Desk {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: DeskStatus;
  mapId: string;
  type: ResourceType;
  capacity?: number;
}

export interface FloorMap {
  id: string;
  name: string;
  width: number;
  height: number;
  background?: string;
}

export interface TimeSlot {
  startTime: string; // Format: "HH:MM"
  endTime: string;   // Format: "HH:MM"
}

export interface Booking {
  id: string;
  deskId: string;
  userId: string;
  date: string;
  isRecurring: boolean;
  recurringDays?: string[];
  timeSlot?: TimeSlot;
}

interface BookingContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  supabaseUser: SupabaseUser | null;
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
  getDeskStatus: (deskId: string, date: Date) => DeskStatus;
  getDeskById: (id: string) => Desk | undefined;
  getUserById: (id: string) => User | undefined;
  getTeamById: (id: string) => Team | undefined;
  getBookingByDeskAndDate: (deskId: string, date: Date) => Booking | undefined;
  getUserBookingsForDate: (userId: string, date: Date) => Booking[];
  canUserBookDesk: (userId: string, date: Date) => boolean;
  
  signOut: () => Promise<void>;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
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

  // Initialize Supabase auth state
  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSupabaseUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (data) {
              setCurrentUser({
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role as Role,
                avatar: data.avatar,
                teamId: data.team_id,
                bio: data.bio,
                phone: data.phone,
                isTeamLeader: data.is_team_leader
              });
            }
          } catch (error) {
            console.error("Error fetching user profile:", error);
          }
        } else {
          setCurrentUser(null);
        }
        
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSupabaseUser(session?.user ?? null);
      
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setCurrentUser({
                id: data.id,
                name: data.name,
                email: data.email,
                role: data.role as Role,
                avatar: data.avatar,
                teamId: data.team_id,
                bio: data.bio,
                phone: data.phone,
                isTeamLeader: data.is_team_leader
              });
            }
            setIsLoading(false);
          })
          .catch((error) => {
            console.error("Error fetching user profile:", error);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Load data from Supabase when authenticated
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) return;
      
      // Fetch maps
      const { data: mapsData } = await supabase
        .from('floor_maps')
        .select('*');
        
      if (mapsData && mapsData.length > 0) {
        setMaps(mapsData.map(map => ({
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
      
      // Fetch resources (desks and meeting rooms)
      const { data: resourcesData } = await supabase
        .from('resources')
        .select('*');
        
      if (resourcesData) {
        setDesks(resourcesData.map(resource => ({
          id: resource.id,
          name: resource.name,
          x: resource.x,
          y: resource.y,
          width: resource.width,
          height: resource.height,
          status: resource.status as DeskStatus,
          mapId: resource.map_id,
          type: resource.type as ResourceType,
          capacity: resource.capacity
        })));
      }
      
      // Fetch teams
      const { data: teamsData } = await supabase
        .from('teams')
        .select('*');
        
      if (teamsData) {
        setTeams(teamsData.map(team => ({
          id: team.id,
          name: team.name,
          description: team.description,
          leaderId: team.leader_id,
          color: team.color
        })));
      }
      
      // Fetch all users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*');
        
      if (usersData) {
        setUsers(usersData.map(user => ({
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
      const { data: bookingsData } = await supabase
        .from('bookings')
        .select('*');
        
      if (bookingsData) {
        setBookings(bookingsData.map(booking => ({
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
    };

    fetchData();
  }, [currentUser, selectedMap]);
  
  const updateSystemLogo = (url: string) => {
    setSystemLogo(url);
  };

  const addMap = async (map: Omit<FloorMap, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('floor_maps')
        .insert({
          name: map.name,
          width: map.width,
          height: map.height,
          background: map.background
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newMap = { 
          id: data.id, 
          name: data.name, 
          width: data.width, 
          height: data.height,
          background: data.background 
        };
        setMaps([...maps, newMap]);
      }
    } catch (error) {
      console.error("Error adding map:", error);
    }
  };

  const updateMap = async (map: FloorMap) => {
    try {
      const { error } = await supabase
        .from('floor_maps')
        .update({
          name: map.name,
          width: map.width,
          height: map.height,
          background: map.background
        })
        .eq('id', map.id);
        
      if (error) throw error;
      setMaps(maps.map(m => m.id === map.id ? map : m));
    } catch (error) {
      console.error("Error updating map:", error);
    }
  };

  const deleteMap = async (id: string) => {
    try {
      const { error } = await supabase
        .from('floor_maps')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setMaps(maps.filter(m => m.id !== id));
      setDesks(desks.filter(d => d.mapId !== id));
    } catch (error) {
      console.error("Error deleting map:", error);
    }
  };

  const addDesk = async (desk: Omit<Desk, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .insert({
          name: desk.name,
          x: desk.x,
          y: desk.y,
          width: desk.width,
          height: desk.height,
          status: desk.status,
          map_id: desk.mapId,
          type: desk.type || 'desk',
          capacity: desk.capacity
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newDesk = { 
          id: data.id,
          name: data.name,
          x: data.x,
          y: data.y,
          width: data.width,
          height: data.height,
          status: data.status,
          mapId: data.map_id,
          type: data.type,
          capacity: data.capacity
        };
        setDesks([...desks, newDesk]);
      }
    } catch (error) {
      console.error("Error adding resource:", error);
    }
  };

  const updateDesk = async (desk: Desk) => {
    try {
      const { error } = await supabase
        .from('resources')
        .update({
          name: desk.name,
          x: desk.x,
          y: desk.y,
          width: desk.width,
          height: desk.height,
          status: desk.status,
          map_id: desk.mapId,
          type: desk.type,
          capacity: desk.capacity
        })
        .eq('id', desk.id);
        
      if (error) throw error;
      setDesks(desks.map(d => d.id === desk.id ? desk : d));
    } catch (error) {
      console.error("Error updating resource:", error);
    }
  };

  const deleteDesk = async (id: string) => {
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setDesks(desks.filter(d => d.id !== id));
      setBookings(bookings.filter(b => b.deskId !== id));
    } catch (error) {
      console.error("Error deleting resource:", error);
    }
  };

  const addUser = async (user: Omit<User, 'id'>) => {
    // For Supabase, users are created through auth, not directly
    // This method would only be used for testing purposes
    console.warn("Users should be created through Supabase auth, not directly");
  };

  const updateUser = async (user: User) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          team_id: user.teamId,
          bio: user.bio,
          phone: user.phone,
          is_team_leader: user.isTeamLeader
        })
        .eq('id', user.id);
        
      if (error) throw error;
      setUsers(users.map(u => u.id === user.id ? user : u));
      
      // Update currentUser if it's the logged-in user
      if (currentUser?.id === user.id) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const deleteUser = async (id: string) => {
    // Deleting a user involves multiple steps and should typically
    // be done via admin functions, not in the client
    console.warn("User deletion should be handled by an admin function");
  };

  const changePassword = async (userId: string, currentPassword: string, newPassword: string): Promise<boolean> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error changing password:", error);
      return false;
    }
  };

  const addTeam = async (team: Omit<Team, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .insert({
          name: team.name,
          description: team.description,
          leader_id: team.leaderId,
          color: team.color
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newTeam = { 
          id: data.id,
          name: data.name,
          description: data.description,
          leaderId: data.leader_id,
          color: data.color
        };
        setTeams([...teams, newTeam]);
      }
    } catch (error) {
      console.error("Error adding team:", error);
    }
  };

  const updateTeam = async (team: Team) => {
    try {
      const { error } = await supabase
        .from('teams')
        .update({
          name: team.name,
          description: team.description,
          leader_id: team.leaderId,
          color: team.color
        })
        .eq('id', team.id);
        
      if (error) throw error;
      setTeams(teams.map(t => t.id === team.id ? team : t));
    } catch (error) {
      console.error("Error updating team:", error);
    }
  };

  const deleteTeam = async (id: string) => {
    try {
      // First update any users that belong to this team
      await supabase
        .from('profiles')
        .update({
          team_id: null,
          is_team_leader: false
        })
        .eq('team_id', id);
      
      // Then delete the team
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setTeams(teams.filter(t => t.id !== id));
      setUsers(users.map(user => 
        user.teamId === id ? { ...user, teamId: undefined, isTeamLeader: false } : user
      ));
    } catch (error) {
      console.error("Error deleting team:", error);
    }
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
    const desk = getDeskById(booking.deskId);
    
    if (!desk) return false;
    
    // For regular desks, check if user already has a booking for the day
    if (desk.type === 'desk' && !canUserBookDesk(booking.userId, new Date(booking.date))) {
      return false;
    }
    
    // For meeting rooms, check if the requested time slot is available
    if (desk.type === 'meeting_room' && booking.timeSlot) {
      const isAvailable = isMeetingRoomAvailableAtTime(
        booking.deskId, 
        new Date(booking.date), 
        booking.timeSlot
      );
      
      if (!isAvailable) return false;
    }
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          resource_id: booking.deskId,
          user_id: booking.userId,
          date: booking.date,
          is_recurring: booking.isRecurring,
          recurring_days: booking.recurringDays,
          start_time: booking.timeSlot?.startTime,
          end_time: booking.timeSlot?.endTime
        })
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const newBooking = {
          id: data.id,
          deskId: data.resource_id,
          userId: data.user_id,
          date: data.date,
          isRecurring: data.is_recurring,
          recurringDays: data.recurring_days,
          timeSlot: data.start_time && data.end_time ? {
            startTime: data.start_time.substring(0, 5),
            endTime: data.end_time.substring(0, 5)
          } : undefined
        };
        setBookings([...bookings, newBooking]);
      }
      
      return true;
    } catch (error) {
      console.error("Error adding booking:", error);
      return false;
    }
  };

  const cancelBooking = async (id: string) => {
    try {
      const { error } = await supabase
        .from('bookings')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      setBookings(bookings.filter(b => b.id !== id));
    } catch (error) {
      console.error("Error canceling booking:", error);
    }
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

  const getDeskStatus = (deskId: string, date: Date): DeskStatus => {
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
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  return (
    <BookingContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        supabaseUser,
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
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
