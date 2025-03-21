
import React, { useState, useRef } from 'react';
import { useBooking, Desk, Map } from '@/contexts/BookingContext';
import { Button } from "@/components/ui/button";
import { DeskItem } from './DeskItem';
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
import { Plus, Move, Grid } from 'lucide-react';
import { toast } from "sonner";

interface FloorMapProps {
  mapId: string;
  date: Date;
  isEditing?: boolean;
}

export const FloorMap: React.FC<FloorMapProps> = ({ 
  mapId, 
  date,
  isEditing = false 
}) => {
  const { 
    maps, 
    desks, 
    addDesk, 
    updateDesk, 
    deleteDesk,
    getDeskStatus 
  } = useBooking();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [newDesk, setNewDesk] = useState<Omit<Desk, 'id'>>({
    name: '',
    x: 0,
    y: 0,
    width: 80,
    height: 50,
    status: 'available',
    mapId: mapId
  });
  const [editingDesk, setEditingDesk] = useState<Desk | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get the current map
  const currentMap = maps.find(m => m.id === mapId);
  if (!currentMap) return <div>Map not found</div>;
  
  // Filter desks by map ID
  const mapDesks = desks.filter(desk => desk.mapId === mapId);
  
  const handleAddDesk = () => {
    addDesk(newDesk);
    setNewDesk({
      name: '',
      x: 0,
      y: 0,
      width: 80,
      height: 50,
      status: 'available',
      mapId: mapId
    });
    setIsDialogOpen(false);
    toast.success(`Desk ${newDesk.name} has been added to the map.`);
  };
  
  const handleEditDesk = (desk: Desk) => {
    setEditingDesk(desk);
    setNewDesk(desk);
    setIsDialogOpen(true);
  };
  
  const handleUpdateDesk = () => {
    if (!editingDesk) return;
    
    updateDesk({
      ...editingDesk,
      ...newDesk
    });
    
    setEditingDesk(null);
    setNewDesk({
      name: '',
      x: 0,
      y: 0,
      width: 80,
      height: 50,
      status: 'available',
      mapId: mapId
    });
    setIsDialogOpen(false);
    toast.success(`Desk ${newDesk.name} has been updated.`);
  };
  
  const handleDeleteDesk = (id: string) => {
    deleteDesk(id);
    toast.success(`Desk has been removed from the map.`);
  };
  
  // Map navigation functions
  const handleZoom = (factor: number) => {
    setScale(prevScale => {
      const newScale = prevScale * factor;
      return Math.min(Math.max(0.5, newScale), 2); // Limit scale between 0.5 and 2
    });
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return; // Don't allow panning in edit mode
    
    setIsDragging(true);
    setStartPos({
      x: e.clientX - translate.x,
      y: e.clientY - translate.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setTranslate({
      x: e.clientX - startPos.x,
      y: e.clientY - startPos.y
    });
  };
  
  const handleMouseUp = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    if (!isEditing) return;
    
    e.preventDefault();
    const deskData = e.dataTransfer.getData('desk');
    if (!deskData) return;
    
    const desk: Desk = JSON.parse(deskData);
    
    if (!mapRef.current) return;
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = Math.max(0, (e.clientX - rect.left) / scale - (desk.width / 2));
    const y = Math.max(0, (e.clientY - rect.top) / scale - (desk.height / 2));
    
    updateDesk({
      ...desk,
      x,
      y
    });
    
    toast.success(`Desk ${desk.name} has been moved.`);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };
  
  return (
    <div className="relative h-full">
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button variant="outline" size="icon" onClick={() => handleZoom(1.1)}>
          <Plus size={18} />
        </Button>
        <Button variant="outline" size="icon" onClick={() => handleZoom(0.9)}>
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2 7.5C2 7.22386 2.22386 7 2.5 7H12.5C12.7761 7 13 7.22386 13 7.5C13 7.77614 12.7761 8 12.5 8H2.5C2.22386 8 2 7.77614 2 7.5Z" fill="currentColor" />
          </svg>
        </Button>
        <Button variant="outline" size="icon" onClick={resetView}>
          <Grid size={18} />
        </Button>
      </div>
      
      {isEditing && (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              className="absolute bottom-4 right-4 z-10"
              onClick={() => {
                setEditingDesk(null);
                setNewDesk({
                  name: '',
                  x: Math.floor(currentMap.width / 2 - 40),
                  y: Math.floor(currentMap.height / 2 - 25),
                  width: 80,
                  height: 50,
                  status: 'available',
                  mapId: mapId
                });
              }}
            >
              Add Desk
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingDesk ? 'Edit Desk' : 'Add New Desk'}</DialogTitle>
              <DialogDescription>
                {editingDesk 
                  ? 'Update the desk properties below.'
                  : 'Fill in the details for the new desk.'
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
                  value={newDesk.name}
                  onChange={(e) => setNewDesk({...newDesk, name: e.target.value})}
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
                  value={newDesk.width}
                  onChange={(e) => setNewDesk({...newDesk, width: Number(e.target.value)})}
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
                  value={newDesk.height}
                  onChange={(e) => setNewDesk({...newDesk, height: Number(e.target.value)})}
                  className="col-span-3"
                />
              </div>
              
              {editingDesk && (
                <>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="x" className="text-right">
                      X Position
                    </Label>
                    <Input
                      id="x"
                      type="number"
                      value={newDesk.x}
                      onChange={(e) => setNewDesk({...newDesk, x: Number(e.target.value)})}
                      className="col-span-3"
                    />
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="y" className="text-right">
                      Y Position
                    </Label>
                    <Input
                      id="y"
                      type="number"
                      value={newDesk.y}
                      onChange={(e) => setNewDesk({...newDesk, y: Number(e.target.value)})}
                      className="col-span-3"
                    />
                  </div>
                </>
              )}
            </div>
            
            <DialogFooter>
              <Button
                type="submit"
                onClick={editingDesk ? handleUpdateDesk : handleAddDesk}
              >
                {editingDesk ? 'Update Desk' : 'Add Desk'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {isEditing && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Move className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You are in edit mode. Drag desks to reposition them, or click on a desk to edit its properties.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div 
        className="map-container bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
        style={{ 
          height: '70vh', 
          cursor: isDragging ? 'grabbing' : (isEditing ? 'default' : 'grab') 
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          ref={mapRef}
          className="map-content bg-white"
          style={{ 
            width: `${currentMap.width}px`, 
            height: `${currentMap.height}px`,
            transform: `scale(${scale}) translate(${translate.x/scale}px, ${translate.y/scale}px)`,
            transformOrigin: 'top left',
            boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
            backgroundImage: currentMap.background ? `url(${currentMap.background})` : 'none',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          {/* Render desks */}
          {mapDesks.map(desk => (
            <DeskItem 
              key={desk.id} 
              desk={desk} 
              date={date} 
              isEditing={isEditing}
              onEdit={handleEditDesk}
              onDelete={handleDeleteDesk}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
