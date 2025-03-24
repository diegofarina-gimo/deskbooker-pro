import React, { createContext, useContext, useState, useEffect } from 'react';

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
  password: string;
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
  changePassword: (userId: string, currentPassword: string, newPassword: string) => boolean;
  
  teams: Team[];
  addTeam: (team: Omit<Team, 'id'>) => void;
  updateTeam: (team: Team) => void;
  deleteTeam: (id: string) => void;
  getUsersByTeamId: (teamId: string) => User[];
  getTeamBookings: (teamId: string, date: Date) => Booking[];
  
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => boolean;
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
}

const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=68',
    password: 'admin123',
    bio: 'System administrator',
    phone: '555-1234',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=69',
    password: 'user123',
    teamId: '1',
    bio: 'Software developer',
    phone: '555-5678',
  }
];

const sampleTeams: Team[] = [
  {
    id: '1',
    name: 'Engineering',
    description: 'Software development team',
    leaderId: '1',
    color: '#4f46e5',
  },
  {
    id: '2',
    name: 'Design',
    description: 'UX/UI Design team',
    leaderId: '1',
    color: '#ec4899',
  },
  {
    id: '3',
    name: 'Marketing',
    description: 'Marketing and PR team',
    leaderId: '1',
    color: '#10b981',
  }
];

const sampleMaps: FloorMap[] = [
  {
    id: '1',
    name: 'Main Office',
    width: 800,
    height: 600,
  },
  {
    id: '2',
    name: 'Second Floor',
    width: 1000,
    height: 800,
  }
];

const sampleDesks: Desk[] = [
  {
    id: '1',
    name: 'Desk A1',
    x: 100,
    y: 100,
    width: 40, // Updated size
    height: 25, // Updated size
    status: 'available',
    mapId: '1',
    type: 'desk',
  },
  {
    id: '2',
    name: 'Desk A2',
    x: 200,
    y: 100,
    width: 40, // Updated size
    height: 25, // Updated size
    status: 'available',
    mapId: '1',
    type: 'desk',
  },
  {
    id: '3',
    name: 'Desk B1',
    x: 100,
    y: 200,
    width: 40, // Updated size
    height: 25, // Updated size
    status: 'maintenance',
    mapId: '1',
    type: 'desk',
  },
  {
    id: '4',
    name: 'Desk B2',
    x: 200,
    y: 200,
    width: 40, // Updated size
    height: 25, // Updated size
    status: 'available',
    mapId: '1',
    type: 'desk',
  },
  {
    id: '5',
    name: 'Desk C1',
    x: 400,
    y: 100,
    width: 40, // Updated size
    height: 25, // Updated size
    status: 'available',
    mapId: '1',
    type: 'desk',
  },
  {
    id: '6',
    name: 'Conference Room A',
    x: 300,
    y: 300,
    width: 80,
    height: 60,
    status: 'available',
    mapId: '1',
    type: 'meeting_room',
    capacity: 8,
  },
  {
    id: '7',
    name: 'Meeting Room B',
    x: 400,
    y: 300,
    width: 60,
    height: 40,
    status: 'available',
    mapId: '1',
    type: 'meeting_room',
    capacity: 4,
  },
  {
    id: '8',
    name: 'Boardroom',
    x: 500,
    y: 200,
    width: 100,
    height: 80,
    status: 'available',
    mapId: '2',
    type: 'meeting_room',
    capacity: 12,
  }
];

const sampleBookings: Booking[] = [
  {
    id: '1',
    deskId: '1',
    userId: '2',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
  }
];

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [maps, setMaps] = useState<FloorMap[]>(sampleMaps);
  const [desks, setDesks] = useState<Desk[]>(sampleDesks);
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);
  const [teams, setTeams] = useState<Team[]>(sampleTeams.map(team => ({...team, leaderId: undefined})));
  const [systemLogo, setSystemLogo] = useState<string | null>(null);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMap, setSelectedMap] = useState<string | null>(sampleMaps[0]?.id || null);

  useEffect(() => {
    setCurrentUser(sampleUsers[0]);
  }, []);
  
  const updateSystemLogo = (url: string) => {
    setSystemLogo(url);
  };

  const addMap = (map: Omit<FloorMap, 'id'>) => {
    const newMap = { ...map, id: crypto.randomUUID() };
    setMaps([...maps, newMap]);
  };

  const updateMap = (map: FloorMap) => {
    setMaps(maps.map(m => m.id === map.id ? map : m));
  };

  const deleteMap = (id: string) => {
    setMaps(maps.filter(m => m.id !== id));
    setDesks(desks.filter(d => d.mapId !== id));
  };

  const addDesk = (desk: Omit<Desk, 'id'>) => {
    const newDesk = { 
      ...desk, 
      id: crypto.randomUUID(),
      type: desk.type || 'desk'
    };
    setDesks([...desks, newDesk]);
  };

  const updateDesk = (desk: Desk) => {
    setDesks(desks.map(d => d.id === desk.id ? desk : d));
  };

  const deleteDesk = (id: string) => {
    setDesks(desks.filter(d => d.id !== id));
    setBookings(bookings.filter(b => b.deskId !== id));
  };

  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: crypto.randomUUID() };
    setUsers([...users, newUser]);
  };

  const updateUser = (user: User) => {
    setUsers(users.map(u => u.id === user.id ? user : u));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    setBookings(bookings.filter(b => b.userId !== id));
  };

  const changePassword = (userId: string, currentPassword: string, newPassword: string): boolean => {
    const userIndex = users.findIndex(u => u.id === userId);
    if (userIndex === -1) return false;
    
    if (users[userIndex].password !== currentPassword) return false;
    
    const updatedUsers = [...users];
    updatedUsers[userIndex] = {
      ...updatedUsers[userIndex],
      password: newPassword
    };
    
    setUsers(updatedUsers);
    return true;
  };

  const addTeam = (team: Omit<Team, 'id'>) => {
    const newTeam = { ...team, id: crypto.randomUUID() };
    setTeams([...teams, newTeam]);
  };

  const updateTeam = (team: Team) => {
    setTeams(teams.map(t => t.id === team.id ? team : t));
  };

  const deleteTeam = (id: string) => {
    setTeams(teams.filter(t => t.id !== id));
    setUsers(users.map(user => 
      user.teamId === id ? { ...user, teamId: undefined, isTeamLeader: false } : user
    ));
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

  const addBooking = (booking: Omit<Booking, 'id'>): boolean => {
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
    
    const newBooking = { ...booking, id: crypto.randomUUID() };
    setBookings([...bookings, newBooking]);
    return true;
  };

  const cancelBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
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

  return (
    <BookingContext.Provider
      value={{
        currentUser,
        setCurrentUser,
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
        canUserBookDesk
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
