import React, { createContext, useContext, useState, useEffect } from 'react';

// Types
export type Role = 'admin' | 'user';
export type DeskStatus = 'available' | 'booked' | 'maintenance';

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
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  leaderId: string;
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
  recurringDays?: string[];
}

interface BookingContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  
  maps: Map[];
  addMap: (map: Omit<Map, 'id'>) => void;
  updateMap: (map: Map) => void;
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
  
  bookings: Booking[];
  addBooking: (booking: Omit<Booking, 'id'>) => void;
  cancelBooking: (id: string) => void;
  
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
  selectedMap: string | null;
  setSelectedMap: (id: string | null) => void;
  
  isDeskAvailable: (deskId: string, date: Date) => boolean;
  getDeskStatus: (deskId: string, date: Date) => DeskStatus;
  getDeskById: (id: string) => Desk | undefined;
  getUserById: (id: string) => User | undefined;
  getTeamById: (id: string) => Team | undefined;
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
    status: 'maintenance',
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [maps, setMaps] = useState<Map[]>(sampleMaps);
  const [desks, setDesks] = useState<Desk[]>(sampleDesks);
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [bookings, setBookings] = useState<Booking[]>(sampleBookings);
  const [teams, setTeams] = useState<Team[]>(sampleTeams);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedMap, setSelectedMap] = useState<string | null>(sampleMaps[0]?.id || null);

  useEffect(() => {
    setCurrentUser(sampleUsers[0]);
  }, []);

  const addMap = (map: Omit<Map, 'id'>) => {
    const newMap = { ...map, id: crypto.randomUUID() };
    setMaps([...maps, newMap]);
  };

  const updateMap = (map: Map) => {
    setMaps(maps.map(m => m.id === map.id ? map : m));
  };

  const deleteMap = (id: string) => {
    setMaps(maps.filter(m => m.id !== id));
    setDesks(desks.filter(d => d.mapId !== id));
  };

  const addDesk = (desk: Omit<Desk, 'id'>) => {
    const newDesk = { ...desk, id: crypto.randomUUID() };
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
      user.teamId === id ? { ...user, teamId: undefined } : user
    ));
  };

  const getUsersByTeamId = (teamId: string): User[] => {
    return users.filter(user => user.teamId === teamId);
  };

  const getTeamById = (id: string): Team | undefined => {
    return teams.find(t => t.id === id);
  };

  const addBooking = (booking: Omit<Booking, 'id'>) => {
    const newBooking = { ...booking, id: crypto.randomUUID() };
    setBookings([...bookings, newBooking]);
  };

  const cancelBooking = (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  const formatDateString = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const isDeskAvailable = (deskId: string, date: Date): boolean => {
    const dateStr = formatDateString(date);
    const weekday = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    
    const desk = desks.find(d => d.id === deskId);
    if (desk?.status === 'maintenance') return false;
    
    return !bookings.some(b => 
      b.deskId === deskId && 
      (b.date === dateStr || 
        (b.isRecurring && b.recurringDays?.includes(weekday))
      )
    );
  };

  const getDeskStatus = (deskId: string, date: Date): DeskStatus => {
    const desk = desks.find(d => d.id === deskId);
    if (desk?.status === 'maintenance') return 'maintenance';
    
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
        changePassword,
        teams,
        addTeam,
        updateTeam,
        deleteTeam,
        getUsersByTeamId,
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
        getUserById,
        getTeamById
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
