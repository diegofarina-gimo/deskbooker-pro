
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
import { toast } from "sonner";
import { Plus, UserCog, User as UserIcon, Trash2, Eye, EyeOff } from 'lucide-react';

export const UserManagement: React.FC = () => {
  const { users, addUser, updateUser, deleteUser, currentUser } = useBooking();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
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
    
    addUser(newUser);
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
    setNewUser(user);
    setIsDialogOpen(true);
  };
  
  const handleUpdateUser = () => {
    if (!editingUser) return;
    
    if (newUser.password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }
    
    updateUser({
      ...editingUser,
      ...newUser
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
    // Don't allow deletion of current user
    if (id === currentUser?.id) {
      toast.error("You cannot delete your own account.");
      return;
    }
    
    deleteUser(id);
    toast.success(`User has been removed.`);
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
