
import React, { useState } from 'react';
import { useBooking, Map } from '@/contexts/BookingContext';
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
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, MapPin, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';
import { FloorMap } from './FloorMap';

export const MapManagement: React.FC = () => {
  const { maps, addMap, updateMap, deleteMap, selectedDate, setSelectedMap } = useBooking();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditMapOpen, setIsEditMapOpen] = useState(false);
  const [editingMapId, setEditingMapId] = useState<string | null>(null);
  const [editingMap, setEditingMap] = useState<Map | null>(null);
  const [newMap, setNewMap] = useState<Omit<Map, 'id'>>({
    name: '',
    width: 800,
    height: 600,
  });
  
  const handleAddMap = () => {
    addMap(newMap);
    setNewMap({
      name: '',
      width: 800,
      height: 600,
    });
    setIsDialogOpen(false);
    toast.success(`Map ${newMap.name} has been added.`);
  };
  
  const handleEditMap = (map: Map) => {
    setEditingMap(map);
    setNewMap(map);
    setIsDialogOpen(true);
  };
  
  const handleUpdateMap = () => {
    if (!editingMap) return;
    
    updateMap({
      ...editingMap,
      ...newMap
    });
    
    setEditingMap(null);
    setNewMap({
      name: '',
      width: 800,
      height: 600,
    });
    setIsDialogOpen(false);
    toast.success(`Map ${newMap.name} has been updated.`);
  };
  
  const handleDeleteMap = (id: string) => {
    deleteMap(id);
    toast.success(`Map has been deleted.`);
  };
  
  const handleEditMapDesks = (mapId: string) => {
    setEditingMapId(mapId);
    setIsEditMapOpen(true);
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, mapId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check if the file is an image
    if (!file.type.startsWith('image/')) {
      toast.error('The file must be an image.');
      return;
    }
    
    // Check if file size is less than 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.error('The image must be less than 5MB in size.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      
      if (mapId) {
        // Update an existing map
        const map = maps.find(m => m.id === mapId);
        if (map) {
          updateMap({
            ...map,
            background: imageUrl
          });
          toast.success(`Map background image has been updated.`);
        }
      } else if (editingMap) {
        // Update the map being edited
        setNewMap({
          ...newMap,
          background: imageUrl
        });
      } else {
        // Add background to new map
        setNewMap({
          ...newMap,
          background: imageUrl
        });
      }
    };
    
    reader.readAsDataURL(file);
    
    // Reset the input value to allow selecting the same file again
    e.target.value = '';
  };
  
  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Map Management</h2>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              onClick={() => {
                setEditingMap(null);
                setNewMap({
                  name: '',
                  width: 800,
                  height: 600,
                });
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Add Map
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingMap ? 'Edit Map' : 'Add New Map'}</DialogTitle>
              <DialogDescription>
                {editingMap 
                  ? 'Update the map properties below.'
                  : 'Fill in the details for the new map.'
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
                  value={newMap.name}
                  onChange={(e) => setNewMap({...newMap, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="width" className="text-right">
                  Width
                </Label>
                <Input
                  id="width"
                  type="number"
                  value={newMap.width}
                  onChange={(e) => setNewMap({...newMap, width: Number(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="height" className="text-right">
                  Height
                </Label>
                <Input
                  id="height"
                  type="number"
                  value={newMap.height}
                  onChange={(e) => setNewMap({...newMap, height: Number(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="background" className="text-right">
                  Background Image
                </Label>
                <div className="col-span-3">
                  <Input
                    id="background"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="col-span-3"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload an image of your office floor plan (max 5MB)
                  </p>
                </div>
              </div>
              
              {newMap.background && (
                <div className="mt-2">
                  <Label className="mb-2 block">Preview:</Label>
                  <div className="relative border rounded-md overflow-hidden" style={{ maxHeight: '200px' }}>
                    <img 
                      src={newMap.background} 
                      alt="Map background preview" 
                      className="w-full object-contain"
                      style={{ maxHeight: '200px' }}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="submit"
                onClick={editingMap ? handleUpdateMap : handleAddMap}
              >
                {editingMap ? 'Update Map' : 'Add Map'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Dialog open={isEditMapOpen} onOpenChange={setIsEditMapOpen}>
        <DialogContent className="max-w-5xl h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Map Layout</DialogTitle>
            <DialogDescription>
              Drag desks to reposition them, or click add desk to create new ones.
            </DialogDescription>
          </DialogHeader>
          
          {editingMapId && (
            <div className="h-[calc(90vh-120px)] overflow-auto">
              <FloorMap mapId={editingMapId} date={selectedDate} isEditing={true} />
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {maps.map(map => (
          <Card key={map.id} className="hover-lift">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <CardTitle>{map.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-100 rounded-md p-3 text-sm">
                <div className="flex justify-between mb-2">
                  <span>Dimensions:</span>
                  <span>{map.width} x {map.height}</span>
                </div>
              </div>
              
              {map.background ? (
                <div className="mt-3 border rounded-md overflow-hidden" style={{ height: '120px' }}>
                  <img 
                    src={map.background} 
                    alt={`${map.name} background`} 
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="mt-3 border border-dashed rounded-md flex items-center justify-center" style={{ height: '120px' }}>
                  <div className="text-center p-4">
                    <ImageIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                    <label htmlFor={`map-image-${map.id}`} className="text-sm text-blue-500 cursor-pointer hover:text-blue-700">
                      Upload background image
                      <Input
                        id={`map-image-${map.id}`}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageUpload(e, map.id)}
                      />
                    </label>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedMap(map.id);
                  handleEditMapDesks(map.id);
                }}
              >
                <Pencil className="h-4 w-4 mr-2" />
                Edit Layout
              </Button>
              
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEditMap(map)}
                >
                  Edit
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDeleteMap(map.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};
