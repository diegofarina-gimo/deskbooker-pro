
import React, { useState } from 'react';
import { useBooking, Team, User } from '@/contexts/BookingContext';
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
import { Textarea } from "@/components/ui/textarea";
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
import { Plus, Users, Edit, Trash2, UserPlus } from 'lucide-react';

export const TeamManagement: React.FC = () => {
  const { teams, addTeam, updateTeam, deleteTeam, users, getUsersByTeamId, getUserById } = useBooking();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [newTeam, setNewTeam] = useState<Omit<Team, 'id'>>({
    name: '',
    description: '',
    leaderId: users[0]?.id || ''
  });
  
  const handleAddTeam = () => {
    if (!newTeam.name || !newTeam.leaderId) {
      toast.error("Team name and leader are required");
      return;
    }
    
    addTeam(newTeam);
    setNewTeam({
      name: '',
      description: '',
      leaderId: users[0]?.id || ''
    });
    setIsDialogOpen(false);
    toast.success(`Team ${newTeam.name} has been created.`);
  };
  
  const handleEditTeam = (team: Team) => {
    setEditingTeam(team);
    setNewTeam(team);
    setIsDialogOpen(true);
  };
  
  const handleUpdateTeam = () => {
    if (!editingTeam) return;
    
    if (!newTeam.name || !newTeam.leaderId) {
      toast.error("Team name and leader are required");
      return;
    }
    
    updateTeam({
      ...editingTeam,
      ...newTeam
    });
    
    setEditingTeam(null);
    setNewTeam({
      name: '',
      description: '',
      leaderId: users[0]?.id || ''
    });
    setIsDialogOpen(false);
    toast.success(`Team ${newTeam.name} has been updated.`);
  };
  
  const handleDeleteTeam = (id: string) => {
    deleteTeam(id);
    toast.success(`Team has been deleted.`);
  };
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Team Management</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingTeam(null);
                setNewTeam({
                  name: '',
                  description: '',
                  leaderId: users[0]?.id || ''
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Edit Team' : 'Create New Team'}</DialogTitle>
              <DialogDescription>
                {editingTeam 
                  ? 'Update the team details below.'
                  : 'Fill in the details for the new team.'
                }
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Team Name
                </Label>
                <Input
                  id="name"
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({...newTeam, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  value={newTeam.description || ''}
                  onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leader" className="text-right">
                  Team Leader
                </Label>
                <div className="col-span-3">
                  <Select 
                    value={newTeam.leaderId} 
                    onValueChange={(value) => setNewTeam({...newTeam, leaderId: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team leader" />
                    </SelectTrigger>
                    <SelectContent>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>
                          {user.name}
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
                onClick={editingTeam ? handleUpdateTeam : handleAddTeam}
              >
                {editingTeam ? 'Update Team' : 'Create Team'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => {
          const teamMembers = getUsersByTeamId(team.id);
          const teamLeader = getUserById(team.leaderId);
          
          return (
            <Card key={team.id} className="hover-lift">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {team.description || 'No description'}
                    </CardDescription>
                  </div>
                  <div className="px-2 py-1 text-xs rounded bg-purple-100 text-purple-800">
                    {teamMembers.length} Members
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">Team Leader:</span>
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={teamLeader?.avatar} alt={teamLeader?.name} />
                        <AvatarFallback>{teamLeader?.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{teamLeader?.name}</span>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-sm font-medium">Members:</span>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {teamMembers.length > 0 ? (
                        teamMembers.map(member => (
                          <Avatar key={member.id} className="h-8 w-8 border-2 border-white">
                            <AvatarImage src={member.avatar} alt={member.name} />
                            <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                          </Avatar>
                        ))
                      ) : (
                        <span className="text-sm text-gray-500">No members yet</span>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTeam(team)}
                >
                  <Edit className="h-4 w-4 mr-1" /> Edit
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteTeam(team.id)}
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
