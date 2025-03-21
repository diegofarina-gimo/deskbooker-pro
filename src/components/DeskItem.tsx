
import React from 'react';
import { useBooking, Desk } from '@/contexts/BookingContext';
import { Card } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { BookingForm } from './BookingForm';

interface DeskItemProps {
  desk: Desk;
  date: Date;
  isEditing?: boolean;
  onEdit?: (desk: Desk) => void;
  onDelete?: (id: string) => void;
}

export const DeskItem: React.FC<DeskItemProps> = ({ 
  desk, 
  date, 
  isEditing = false,
  onEdit,
  onDelete
}) => {
  const { getDeskStatus, currentUser } = useBooking();
  
  const status = getDeskStatus(desk.id, date);
  const statusColor = status === 'available' ? 'available' : 'booked';
  const statusTextColor = status === 'available' ? 'availableText' : 'bookedText';

  const handleDragStart = (e: React.DragEvent) => {
    if (isEditing) {
      e.dataTransfer.setData('desk', JSON.stringify(desk));
    }
  };

  return (
    <div
      className={`absolute desk ${isEditing ? 'cursor-move' : ''}`}
      style={{
        left: `${desk.x}px`,
        top: `${desk.y}px`,
        width: `${desk.width}px`,
        height: `${desk.height}px`,
      }}
      draggable={isEditing}
      onDragStart={handleDragStart}
    >
      <Dialog>
        <DialogTrigger asChild>
          <Card
            className={`w-full h-full flex flex-col justify-center items-center shadow-sm border 
                      hover:shadow-md transition-all duration-200 p-2 bg-${statusColor} text-${statusTextColor}`}
          >
            <div className="text-xs font-semibold">{desk.name}</div>
            <div className="text-[10px] capitalize">{status}</div>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Desk {desk.name}</DialogTitle>
            <DialogDescription>
              {status === 'available' 
                ? 'This desk is available for booking.' 
                : 'This desk is currently booked.'}
            </DialogDescription>
          </DialogHeader>
          
          {isEditing ? (
            <div className="grid gap-4 py-4">
              <div className="flex justify-between">
                <button
                  onClick={() => onEdit?.(desk)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Edit Desk
                </button>
                <button
                  onClick={() => onDelete?.(desk.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete Desk
                </button>
              </div>
            </div>
          ) : (
            <BookingForm deskId={desk.id} date={date} status={status} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
