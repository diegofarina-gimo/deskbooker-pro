
import React, { useState } from 'react';
import { useBooking, Team } from '@/contexts/BookingContext';
import { Button } from "@/components/ui/button";
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
import { toast } from "sonner";
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Users, Edit, Trash2 } from 'lucide-react';

// Predefined team colors
const teamColors = [
  { name: 'Blue', value: '#3B82F6' },
  { name: 'Red', value: '#EF4444' },
  { name: 'Green', value: '#10B981' },
  { name: 'Purple', value: '#8B5CF6' },
  { name: 'Pink', value: '#EC4899' },
  { name: 'Yellow', value: '#F59E0B' },
  { name: 'Indigo', value: '#4F46E5' },
  { name: 'Teal', value: '#14B8A6' },
];

export const TeamManagement: React.FC = () => {
  const { teams, users, addTeam, updateTeam, deleteTeam, getUsersByTeamId, currentUser } = useBooking();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTeam, setNewTeam] = useState<Omit<Team, 'id'>>({
    name: '',
    description: '',
    leaderId: currentUser?.id || '',
    color: teamColors[0].value,
  });
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  
  const handleAddTeam = () => {
    addTeam(newTeam);
    setNewTeam({
      name: '',
      description: '',
      leaderId: currentUser?.id || '',
      color: teamColors[0].value,
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
    
    updateTeam({
      ...editingTeam,
      ...newTeam
    });
    
    setEditingTeam(null);
    setNewTeam({
      name: '',
      description: '',
      leaderId: currentUser?.id || '',
      color: teamColors[0].value,
    });
    setIsDialogOpen(false);
    toast.success(`Team ${newTeam.name} has been updated.`);
  };
  
  const handleDeleteTeam = (id: string) => {
    deleteTeam(id);
    toast.success(`Team has been deleted.`);
  };
  
  const availableLeaders = users.filter(user => user.role === 'admin');
  
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
                  leaderId: currentUser?.id || '',
                  color: teamColors[0].value,
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Team
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingTeam ? 'Edit Team' : 'Add New Team'}</DialogTitle>
              <DialogDescription>
                {editingTeam 
                  ? 'Update the team properties below.'
                  : 'Fill in the details for the new team.'
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
                  value={newTeam.description}
                  onChange={(e) => setNewTeam({...newTeam, description: e.target.value})}
                  className="col-span-3"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="leader" className="text-right">
                  Team Leader
                </Label>
                <Select 
                  value={newTeam.leaderId} 
                  onValueChange={(value) => setNewTeam({...newTeam, leaderId: value})}
                >
                  <SelectTrigger id="leader" className="col-span-3">
                    <SelectValue placeholder="Select a leader" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableLeaders.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Team Color
                </Label>
                <div className="col-span-3 flex flex-wrap gap-2">
                  {teamColors.map((color) => (
                    <div 
                      key={color.value}
                      className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 
                               ${newTeam.color === color.value ? 'ring-2 ring-offset-2 ring-black' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color.value }}
                      onClick={() => setNewTeam({...newTeam, color: color.value})}
                      title={color.name}
                    ></div>
                  ))}
                  
                  <input
                    type="color"
                    value={newTeam.color}
                    onChange={(e) => setNewTeam({...newTeam, color: e.target.value})}
                    className="hidden"
                    id="custom-color"
                  />
                  <label 
                    htmlFor="custom-color" 
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-100 cursor-pointer hover:bg-gray-200"
                    title="Custom color"
                  >
                    <Plus className="h-4 w-4" />
                  </label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button
                type="submit"
                onClick={editingTeam ? handleUpdateTeam : handleAddTeam}
              >
                {editingTeam ? 'Update Team' : 'Add Team'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => {
          const teamMembers = getUsersByTeamId(team.id);
          const teamLeader = users.find(user => user.id === team.leaderId);
          
          return (
            <Card key={team.id} className="overflow-hidden">
              <div 
                className="h-2" 
                style={{ backgroundColor: team.color || '#888888' }}
              ></div>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" style={{ color: team.color }} />
                  {team.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">{team.description}</p>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium">Team Leader:</p>
                  <div className="flex items-center gap-2">
                    <div className="flex-shrink-0 rounded-full w-6 h-6 bg-gray-200 overflow-hidden">
                      {teamLeader?.avatar ? (
                        <img 
                          src={teamLeader.avatar} 
                          alt={teamLeader.name} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold">
                          {teamLeader?.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="text-sm">{teamLeader?.name || 'Unknown'}</span>
                  </div>
                </div>
                
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Team Members ({teamMembers.length}):</p>
                  {teamMembers.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {teamMembers.map(member => (
                        <div 
                          key={member.id} 
                          className="rounded-full w-8 h-8 overflow-hidden bg-gray-200"
                          title={member.name}
                        >
                          {member.avatar ? (
                            <img 
                              src={member.avatar} 
                              alt={member.name} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary text-primary-foreground text-xs font-bold">
                              {member.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No members yet</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditTeam(team)}
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
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
