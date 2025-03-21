
import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export type Role = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
}

export interface Desk {
  id: string;
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  status: 'available' | 'booked';
  mapId: string;
}

export interface Map {
  id: string;
  name: string;
  width: number;
  height: number;
  background?: string;
}

export interface Booking {
  id: string;
  deskId: string;
  userId: string;
  date: string;
  isRecurring: boolean;
  recurringDays?: string[]; // e.g. ['monday', 'wednesday']
}

interface BookingContextType {
  // Current user
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  // Maps
  maps: Map[];
  addMap: (map: Omit<Map, 'id'>) => void;
  updateMap: (map: Map) => void;
  deleteMap: (id: string) => void;
  
  // Desks
  desks: Desk[];
  addDesk: (desk: Omit<Desk, 'id'>) => void;
  updateDesk: (desk: Desk) => void;
  deleteDesk: (id: string) => void;
  
  // Users
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  updateUser: (user: User) => void;
  deleteUser: (id: string) => void;
  
  // Bookings
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  cancelBooking: (id: string) => void;
  
  // View state
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedMap: string | null;
  setSelectedMap: (id: string | null) => void;
  
  // Utility functions
  isDeskAvailable: (deskId: string, date: Date) => boolean;
  getDeskStatus: (deskId: string, date: Date) => 'available' | 'booked';
  getDeskById: (id: string) => Desk | undefined;
  getUserById: (id: string) => User | undefined;
}

// Sample mock data
const sampleUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    avatar: 'https://i.pravatar.cc/150?img=68',
  },
  {
    id: '2',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'user',
    avatar: 'https://i.pravatar.cc/150?img=69',
  }
];

const sampleMaps: Map[] = [
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
    width: 80,
    height: 50,
    status: 'available',
    mapId: '1',
  },
  {
    id: '2',
    name: 'Desk A2',
    x: 200,
    y: 100,
    width: 80,
    height: 50,
    status: 'available',
    mapId: '1',
  },
  {
    id: '3',
    name: 'Desk B1',
    x: 100,
    y: 200,
    width: 80,
    height: 50,
    status: 'available',
    mapId: '1',
  },
  {
    id: '4',
    name: 'Desk B2',
    x: 200,
    y: 200,
    width: 80,
    height: 50,
    status: 'available',
    mapId: '1',
  },
  {
    id: '5',
    name: 'Desk C1',
    x: 400,
    y: 100,
    width: 80,
    height: 50,
    status: 'available',
    mapId: '1',
  },
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
  // State initialization
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [maps, setMaps] = useState<Map[]>(sampleMaps);
  const [desks, setDesks] = useState<Desk[]>(sampleDesks);
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);
  
  // UI state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMap, setSelectedMap] = useState<string | null>(sampleMaps[0]?.id || null);

  // Auto-login the admin for demonstration purposes
  useEffect(() => {
    setCurrentUser(sampleUsers[0]);
  }, []);

  // CRUD operations for maps
  const addMap = (map: Omit<Map, 'id'>) => {
    const newMap = { ...map, id: crypto.randomUUID() };
    setMaps([...maps, newMap]);
  };

  const updateMap = (map: Map) => {
    setMaps(maps.map(m => m.id === map.id ? map : m));
  };

  const deleteMap = (id: string) => {
    setMaps(maps.filter(m => m.id !== id));
    // Also remove any desks associated with this map
    setDesks(desks.filter(d => d.mapId !== id));
  };

  // CRUD operations for desks
  const addDesk = (desk: Omit<Desk, 'id'>) => {
    const newDesk = { ...desk, id: crypto.randomUUID() };
    setDesks([...desks, newDesk]);
  };

  const updateDesk = (desk: Desk) => {
    setDesks(desks.map(d => d.id === desk.id ? desk : d));
  };

  const deleteDesk = (id: string) => {
    setDesks(desks.filter(d => d.id !== id));
    // Also remove any bookings for this desk
    setBookings(bookings.filter(b => b.deskId !== id));
  };

  // CRUD operations for users
  const addUser = (user: Omit<User, 'id'>) => {
    const newUser = { ...user, id: crypto.randomUUID() };
    setUsers([...users, newUser]);
  };

  const updateUser = (user: User) => {
    setUsers(users.map(u => u.id === user.id ? user : u));
  };

  const deleteUser = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
    // Also remove any bookings for this user
    setBookings(bookings.filter(b => b.userId !== id));
  };

  // CRUD operations for bookings
  const addBooking = (booking: Omit<Booking, 'id'>) => {
    const newBooking = { ...booking, id: crypto.randomUUID() };
    setBookings([...bookings, newBooking]);
  };

  const cancelBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  // Utility functions
  const formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isDeskAvailable = (deskId: string, date: Date): boolean => {
    const dateStr = formatDateString(date);
    return !bookings.some(b => 
      b.deskId === deskId && 
      (b.date === dateStr || 
        (b.isRecurring && b.recurringDays?.includes(
          date.toLocaleDateString('en-US', { weekday: 'lowercase' })
        ))
      )
    );
  };

  const getDeskStatus = (deskId: string, date: Date): 'available' | 'booked' => {
    return isDeskAvailable(deskId, date) ? 'available' : 'booked';
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
        bookings,
        addBooking,
        cancelBooking,
        selectedDate,
        setSelectedDate,
        selectedMap,
        setSelectedMap,
        isDeskAvailable,
        getDeskStatus,
        getDeskById,
        getUserById
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
