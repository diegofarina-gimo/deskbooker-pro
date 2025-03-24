import React, { useState, useRef, useEffect } from 'react';
import { useBooking, type Desk, type ResourceType } from '@/contexts/BookingContext';
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
import { 
  Plus, 
  Move, 
  Grid, 
  Rows, 
  Crosshair, 
  Calendar as CalendarIcon,
  LucideIcon
} from 'lucide-react';
import { toast } from "sonner";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface FloorMapProps {
  mapId: string;
  date: Date;
  isEditing?: boolean;
  showBookingDetails?: boolean;
}

export const FloorMap: React.FC<FloorMapProps> = ({ 
  mapId, 
  date: initialDate,
  isEditing = false,
  showBookingDetails = false
}) => {
  const { 
    maps, 
    desks, 
    addDesk, 
    updateDesk, 
    deleteDesk,
    getDeskStatus,
    getUserById,
    getBookingByDeskAndDate,
    selectedDate: contextDate,
    setSelectedDate: setContextDate
  } = useBooking();
  
  const mapRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [translate, setTranslate] = useState({ x: 0, y: 0 });
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [newDesk, setNewDesk] = useState<Omit<Desk, 'id'>>({
    name: '',
    x: 0,
    y: 0,
    width: 80,
    height: 50,
    status: 'available',
    mapId: mapId,
    type: 'desk',
  });
  const [editingDesk, setEditingDesk] = useState<Desk | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isResourceDialogOpen, setIsResourceDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [generateCount, setGenerateCount] = useState(5);
  const [rowCount, setRowCount] = useState(1);
  const [showGrid, setShowGrid] = useState(isEditing);
  
  useEffect(() => {
    if (!isEditing) {
      setSelectedDate(contextDate);
    }
  }, [contextDate, isEditing]);

  useEffect(() => {
    if (!isEditing) {
      setContextDate(selectedDate);
    }
  }, [selectedDate, setContextDate, isEditing]);
  
  const currentMap = maps.find(m => m.id === mapId);
  if (!currentMap) return <div>Map not found</div>;
  
  const mapDesks = desks.filter(desk => desk.mapId === mapId);
  
  const getNextDeskNumber = (prefix = 'Desk') => {
    const deskNumbers = mapDesks
      .filter(desk => desk.name.startsWith(prefix))
      .map(desk => {
        const match = desk.name.match(new RegExp(`${prefix}\\s+(\\d+)`, 'i'));
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(num => !isNaN(num));
    
    const maxNumber = deskNumbers.length > 0 ? Math.max(...deskNumbers) : 0;
    return maxNumber + 1;
  };

  useEffect(() => {
    if (isDialogOpen && !editingDesk) {
      setNewDesk(prev => ({
        ...prev,
        name: `Desk ${getNextDeskNumber()}`,
        type: 'desk'
      }));
    }
  }, [isDialogOpen, editingDesk]);
  
  useEffect(() => {
    if (isResourceDialogOpen) {
      setNewDesk(prev => ({
        ...prev,
        name: `Meeting Room ${getNextDeskNumber('Meeting Room')}`,
        type: 'meeting_room',
        capacity: 4
      }));
    }
  }, [isResourceDialogOpen]);
  
  const handleAddDesk = () => {
    const resourceType = newDesk.type || 'desk';
    const defaultName = resourceType === 'desk' 
      ? `Desk ${getNextDeskNumber()}`
      : `Meeting Room ${getNextDeskNumber('Meeting Room')}`;

    addDesk({
      ...newDesk,
      name: newDesk.name || defaultName
    });
    
    setNewDesk({
      name: '',
      x: 0,
      y: 0,
      width: 80,
      height: 50,
      status: 'available',
      mapId: mapId,
      type: 'desk',
    });
    setIsDialogOpen(false);
    setIsResourceDialogOpen(false);
    toast.success(`${newDesk.type === 'meeting_room' ? 'Meeting Room' : 'Desk'} ${newDesk.name} has been added to the map.`);
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
      mapId: mapId,
      type: 'desk',
    });
    setIsDialogOpen(false);
    toast.success(`${newDesk.type === 'meeting_room' ? 'Meeting Room' : 'Desk'} ${newDesk.name} has been updated.`);
  };
  
  const handleDeleteDesk = (id: string) => {
    deleteDesk(id);
    toast.success(`Resource has been removed from the map.`);
  };
  
  const handleGenerateDesks = () => {
    const desksPerRow = Math.ceil(generateCount / rowCount);
    const spacingX = 120;
    const spacingY = 120;
    const startX = (currentMap.width - (desksPerRow * spacingX)) / 2 + 20;
    const startY = (currentMap.height - (rowCount * spacingY)) / 2 + 20;
    
    for (let r = 0; r < rowCount; r++) {
      for (let i = 0; i < desksPerRow; i++) {
        const deskIndex = r * desksPerRow + i;
        if (deskIndex >= generateCount) break;
        
        addDesk({
          name: `Desk ${getNextDeskNumber() + deskIndex}`,
          x: startX + (i * spacingX),
          y: startY + (r * spacingY),
          width: 80,
          height: 50,
          status: 'available',
          mapId: mapId,
          type: 'desk',
        });
      }
    }
    
    setIsGenerateDialogOpen(false);
    toast.success(`${generateCount} desks have been automatically generated.`);
  };
  
  const handleZoom = (factor: number) => {
    setScale(prevScale => {
      const newScale = prevScale * factor;
      return Math.min(Math.max(0.5, newScale), 2);
    });
  };
  
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isEditing) return;
    
    setIsDragging(true);
    setStartPos({
      x: e.clientX - translate.x,
      y: e.clientY - translate.y
    });
  };
  
  const handleMouseMove = (e: React.MouseEvent) => {
    if (mapRef.current) {
      const rect = mapRef.current.getBoundingClientRect();
      const x = Math.round((e.clientX - rect.left) / scale - translate.x / scale);
      const y = Math.round((e.clientY - rect.top) / scale - translate.y / scale);
      setMousePosition({ x, y });
    }
    
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
    
    toast.success(`${desk.type === 'meeting_room' ? 'Meeting Room' : 'Desk'} ${desk.name} has been moved.`);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };
  
  const resetView = () => {
    setScale(1);
    setTranslate({ x: 0, y: 0 });
  };
  
  const handleMapClick = (e: React.MouseEvent) => {
    if (!isEditing || !mapRef.current) return;
    
    const target = e.target as Element;
    if (target.closest('.desk')) {
      return;
    }
    
    const rect = mapRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / scale - translate.x / scale;
    const y = (e.clientY - rect.top) / scale - translate.y / scale;
    
    setNewDesk({
      ...newDesk,
      x,
      y,
      name: `Desk ${getNextDeskNumber()}`,
      type: 'desk'
    });
    
    setIsDialogOpen(true);
  };
  
  const toggleGrid = () => {
    setShowGrid(!showGrid);
  };
  
  const gridSizeX = 50;
  const gridSizeY = 50;
  const gridCellsX = Math.ceil(currentMap.width / gridSizeX);
  const gridCellsY = Math.ceil(currentMap.height / gridSizeY);
  
  return (
    <div className="relative h-full">
      {!isEditing && (
        <div className="mb-4 flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-lg font-medium">Office Map for</h3>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="mt-1">
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(selectedDate, 'PPP')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => date && setSelectedDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      )}
      
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
        {isEditing && (
          <Button variant="outline" size="icon" onClick={toggleGrid}>
            <Crosshair size={18} />
          </Button>
        )}
      </div>
      
      {isEditing && (
        <div className="absolute top-4 left-4 z-10 bg-white/80 backdrop-blur-sm p-2 rounded-md border shadow-sm">
          <p className="text-sm font-mono">X: {mousePosition.x}, Y: {mousePosition.y}</p>
        </div>
      )}
      
      {isEditing && (
        <>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingDesk ? 'Edit Resource' : 'Add New Desk'}</DialogTitle>
                <DialogDescription>
                  {editingDesk 
                    ? 'Update the resource properties below.'
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
                  <Label htmlFor="type" className="text-right">
                    Type
                  </Label>
                  <div className="col-span-3">
                    <RadioGroup 
                      value={newDesk.type} 
                      onValueChange={(value) => setNewDesk({
                        ...newDesk, 
                        type: value as ResourceType
                      })}
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="desk" id="desk-type" />
                        <Label htmlFor="desk-type">Desk</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="meeting_room" id="meeting-room-type" />
                        <Label htmlFor="meeting-room-type">Meeting Room</Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
                
                {newDesk.type === 'meeting_room' && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="capacity" className="text-right">
                      Capacity
                    </Label>
                    <Input
                      id="capacity"
                      type="number"
                      min="1"
                      value={newDesk.capacity || 4}
                      onChange={(e) => setNewDesk({...newDesk, capacity: Number(e.target.value)})}
                      className="col-span-3"
                    />
                  </div>
                )}
                
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
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="status" className="text-right">
                    Status
                  </Label>
                  <div className="col-span-3">
                    <select 
                      id="status"
                      value={newDesk.status}
                      onChange={(e) => setNewDesk({...newDesk, status: e.target.value as 'available' | 'maintenance'})}
                      className="w-full rounded-md border border-input bg-background px-3 py-2"
                    >
                      <option value="available">Available</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="x" className="text-right">
                    X Position
                  </Label>
                  <Input
                    id="x"
                    type="number"
                    value={Math.round(newDesk.x)}
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
                    value={Math.round(newDesk.y)}
                    onChange={(e) => setNewDesk({...newDesk, y: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={editingDesk ? handleUpdateDesk : handleAddDesk}
                >
                  {editingDesk ? 'Update Resource' : 'Add Desk'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </DialogTrigger>
          
          <Dialog open={isResourceDialogOpen} onOpenChange={setIsResourceDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="absolute bottom-4 right-28 z-10"
                onClick={() => {
                  setNewDesk({
                    name: `Meeting Room ${getNextDeskNumber('Meeting Room')}`,
                    x: Math.floor(currentMap.width / 2 - 40),
                    y: Math.floor(currentMap.height / 2 - 25),
                    width: 80,
                    height: 50,
                    status: 'available',
                    mapId: mapId,
                    type: 'meeting_room',
                    capacity: 4
                  });
                  setIsResourceDialogOpen(true);
                }}
                variant="default"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Add Resource
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Meeting Room</DialogTitle>
                <DialogDescription>
                  Fill in the details for the new meeting room resource.
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
                  <Label htmlFor="capacity" className="text-right">
                    Capacity
                  </Label>
                  <Input
                    id="capacity"
                    type="number"
                    min="1"
                    value={newDesk.capacity || 4}
                    onChange={(e) => setNewDesk({...newDesk, capacity: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="x" className="text-right">
                    X Position
                  </Label>
                  <Input
                    id="x"
                    type="number"
                    value={Math.round(newDesk.x)}
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
                    value={Math.round(newDesk.y)}
                    onChange={(e) => setNewDesk({...newDesk, y: Number(e.target.value)})}
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleAddDesk}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  Add Meeting Room
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <DialogTrigger asChild>
            <Button 
              className="absolute bottom-4 right-4 z-10"
              onClick={() => {
                setEditingDesk(null);
                setNewDesk({
                  name: `Desk ${getNextDeskNumber()}`,
                  x: Math.floor(currentMap.width / 2 - 40),
                  y: Math.floor(currentMap.height / 2 - 25),
                  width: 80,
                  height: 50,
                  status: 'available',
                  mapId: mapId,
                  type: 'desk'
                });
                setIsDialogOpen(true);
              }}
            >
              Add Desk
            </Button>
          </DialogTrigger>
          
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                className="absolute bottom-4 left-4 z-10"
                variant="secondary"
                onClick={() => setIsGenerateDialogOpen(true)}
              >
                <Plus className="mr-2" size={18} />
                Generate Desks
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Generate Multiple Desks</DialogTitle>
                <DialogDescription>
                  Automatically create multiple desks with sequential numbering.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="count" className="text-right">
                    Number of Desks
                  </Label>
                  <Input
                    id="count"
                    type="number"
                    min="1"
                    max="50"
                    value={generateCount}
                    onChange={(e) => setGenerateCount(Math.min(50, Math.max(1, Number(e.target.value))))}
                    className="col-span-3"
                  />
                </div>
                
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="rows" className="text-right">
                    Number of Rows
                  </Label>
                  <Input
                    id="rows"
                    type="number"
                    min="1"
                    max="10"
                    value={rowCount}
                    onChange={(e) => setRowCount(Math.min(10, Math.max(1, Number(e.target.value))))}
                    className="col-span-3"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleGenerateDesks}
                >
                  Generate Desks
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
      
      {isEditing && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Move className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You are in edit mode. Click anywhere on the map to add a desk, or drag existing desks to reposition them.
              </p>
            </div>
          </div>
        </div>
      )}
      
      <div 
        className="map-container bg-gray-50 border border-gray-200 rounded-lg overflow-hidden"
        style={{ 
          height: '70vh', 
          cursor: isDragging ? 'grabbing' : (isEditing ? 'crosshair' : 'grab') 
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          ref={mapRef}
          className="map-content"
          style={{ 
            position: 'relative',
            width: `${currentMap.width}px`, 
            height: `${currentMap.height}px`,
            transform: `scale(${scale}) translate(${translate.x/scale}px, ${translate.y/scale}px)`,
            transformOrigin: 'top left',
            boxShadow: 'inset 0 0 0 1px rgba(0, 0, 0, 0.05)',
          }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onClick={handleMapClick}
        >
          {currentMap.background && (
            <div 
              className="map-background absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${currentMap.background})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                opacity: 0.7
              }}
            />
          )}
          
          {showGrid && (
            <div className="grid-overlay absolute inset-0 pointer-events-none">
              {Array.from({ length: gridCellsX + 1 }).map((_, i) => (
                <div
                  key={`v-${i}`}
                  className="absolute top-0 bottom-0 border-r border-dashed border-gray-300"
                  style={{
                    left: `${i * gridSizeX}px`,
                    opacity: 0.5,
                  }}
                />
              ))}
              
              {Array.from({ length: gridCellsY + 1 }).map((_, i) => (
                <div
                  key={`h-${i}`}
                  className="absolute left-0 right-0 border-b border-dashed border-gray-300"
                  style={{
                    top: `${i * gridSizeY}px`,
                    opacity: 0.5,
                  }}
                />
              ))}
              
              {Array.from({ length: gridCellsX }).map((_, i) => (
                <div
                  key={`x-${i}`}
                  className="absolute top-1 text-[9px] font-mono text-gray-500"
                  style={{
                    left: `${i * gridSizeX + 2}px`,
                  }}
                >
                  {i * gridSizeX}
                </div>
              ))}
              
              {Array.from({ length: gridCellsY }).map((_, i) => (
                <div
                  key={`y-${i}`}
                  className="absolute left-1 text-[9px] font-mono text-gray-500"
                  style={{
                    top: `${i * gridSizeY + 2}px`,
                  }}
                >
                  {i * gridSizeY}
                </div>
              ))}
            </div>
          )}
          
          <div className="desks-layer absolute inset-0 z-10">
            {mapDesks.map(desk => (
              <DeskItem 
                key={desk.id} 
                desk={desk} 
                date={selectedDate} 
                isEditing={isEditing}
                showBookingDetails={showBookingDetails}
                onEdit={handleEditDesk}
                onDelete={handleDeleteDesk}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
