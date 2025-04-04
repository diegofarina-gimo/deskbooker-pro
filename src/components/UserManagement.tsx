
import React, { useState } from 'react';
import { useBooking, User } from '@/contexts/BookingContext';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from "sonner";
import { Plus, UserCog, User as UserIcon, Trash2, Eye, EyeOff, Users } from 'lucide-react';

// Define an interface that extends User with password for form usage
interface UserFormData extends Omit<User, 'id'> {
  password: string;
}

export const UserManagement: React.FC = () => {
  const { users, teams, addUser, updateUser, deleteUser, currentUser } = useBooking();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isTeamPopoverOpen, setIsTeamPopoverOpen] = useState<{[key: string]: boolean}>({});
  const [newUser, setNewUser] = useState<UserFormData>({
    name: '',
    email: '',
    role: 'user',
    password: '',
    avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
  });
  
  const handleAddUser = () => {
    if (newUser.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    // Create a copy without the password to match User type
    const { password, ...userWithoutPassword } = newUser;
    addUser(userWithoutPassword);
    
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      password: '',
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
    });
    setIsDialogOpen(false);
    toast.success(`User ${newUser.name} has been added.`);
  };
  
  const handleEditUser = (user: User) => {
    setEditingUser(user);
    // Convert User to UserFormData by adding an empty password field
    setNewUser({
      ...user,
      password: ''
    });
    setIsDialogOpen(true);
  };
  
  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    if (newUser.password && newUser.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    // Create a copy without the password to match User type
    const { password, ...userWithoutPassword } = newUser;
    
    updateUser({
      ...editingUser,
      ...userWithoutPassword
    });
    
    setEditingUser(null);
    setNewUser({
      name: '',
      email: '',
      role: 'user',
      password: '',
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
    });
    setIsDialogOpen(false);
    toast.success(`User ${newUser.name} has been updated.`);
  };
  
  const handleDeleteUser = (id: string) => {
    if (id === currentUser?.id) {
      toast.error("You cannot delete your own account.");
      return;
    }
    
    deleteUser(id);
    toast.success(`User has been removed.`);
  };
  
  const handleAssignTeam = (userId: string, teamId: string | undefined) => {
    const user = users.find(u => u.id === userId);
    if (!user) return;
    
    const teamName = teamId ? teams.find(t => t.id === teamId)?.name : 'no team';
    
    updateUser({
      ...user,
      teamId
    });
    
    setIsTeamPopoverOpen({
      ...isTeamPopoverOpen,
      [userId]: false
    });
    
    toast.success(`User ${user.name} has been assigned to ${teamName}.`);
  };
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">User Management</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingUser(null);
                setNewUser({
                  name: '',
                  email: '',
                  role: 'user',
                  password: '',
                  avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`
                });
                setShowPassword(false);
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
              <DialogDescription>
                {editingUser 
                  ? 'Update the user properties below.'
                  : 'Fill in the details for the new user.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="password" className="text-right">
                  Password
                </Label>
                <div className="col-span-3 relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder={editingUser ? "Enter new password" : "Enter password"}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-500" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-500" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="role" className="text-right">
                  Role
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={newUser.role} 
                    onValueChange={(value) => setNewUser({...newUser, role: value as 'admin' | 'user'})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="team" className="text-right">
                  Team
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={newUser.teamId || "none"} 
                    onValueChange={(value) => setNewUser({...newUser, teamId: value === "none" ? undefined : value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team (optional)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Team</SelectItem>
                      {teams.map(team => (
                        <SelectItem key={team.id} value={team.id}>
                          <div className="flex items-center">
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: team.color || '#888' }} 
                            />
                            {team.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="submit"
                onClick={editingUser ? handleUpdateUser : handleAddUser}
              >
                {editingUser ? 'Update User' : 'Add User'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map(user => (
          <Card key={user.id} className="hover-lift">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback>{user.name.substring(0, 2)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{user.name}</CardTitle>
                    <CardDescription className="text-sm">{user.email}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center">
                  {user.role === 'admin' ? (
                    <span className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                      Admin
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded bg-blue-100 text-blue-800">
                      User
                    </span>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center text-sm text-gray-500 mt-2">
                {user.role === 'admin' ? (
                  <UserCog className="h-4 w-4 mr-1" />
                ) : (
                  <UserIcon className="h-4 w-4 mr-1" />
                )}
                <span>
                  {user.role === 'admin' 
                    ? 'Has full access to the system' 
                    : 'Can book and manage own reservations'
                  }
                </span>
              </div>
              
              <div className="mt-3 pt-3 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Team:</span>
                  
                  <Popover 
                    open={isTeamPopoverOpen[user.id]} 
                    onOpenChange={(open) => setIsTeamPopoverOpen({...isTeamPopoverOpen, [user.id]: open})}
                  >
                    <PopoverTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        <div className="flex items-center gap-1">
                          {user.teamId ? (
                            <>
                              <div 
                                className="w-2 h-2 rounded-full" 
                                style={{ 
                                  backgroundColor: teams.find(t => t.id === user.teamId)?.color || '#888' 
                                }} 
                              />
                              {teams.find(t => t.id === user.teamId)?.name || 'Unknown Team'}
                            </>
                          ) : (
                            <span className="text-gray-500">No Team</span>
                          )}
                          <Users className="ml-1 h-3 w-3" />
                        </div>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-56 p-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium mb-2">Assign to team:</p>
                        
                        <div 
                          className="flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleAssignTeam(user.id, undefined)}
                        >
                          <span className="text-gray-600">No Team</span>
                        </div>
                        
                        {teams.map(team => (
                          <div 
                            key={team.id}
                            className="flex items-center p-2 rounded hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleAssignTeam(user.id, team.id)}
                          >
                            <div 
                              className="w-3 h-3 rounded-full mr-2" 
                              style={{ backgroundColor: team.color || '#888' }} 
                            />
                            <span>{team.name}</span>
                          </div>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleEditUser(user)}
              >
                Edit
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => handleDeleteUser(user.id)}
                disabled={user.id === currentUser?.id}
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Delete
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
