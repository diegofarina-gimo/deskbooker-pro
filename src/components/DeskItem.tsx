
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
import { Tool, AlertTriangle } from 'lucide-react';

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

  // Define colors based on status
  let bgColor = 'bg-white';
  let borderColor = 'border-gray-300';
  let textColor = 'text-gray-900';
  let icon = null;

  switch (status) {
    case 'available':
      bgColor = 'bg-green-50';
      borderColor = 'border-green-400';
      textColor = 'text-green-800';
      break;
    case 'booked':
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-400';
      textColor = 'text-blue-800';
      break;
    case 'maintenance':
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-400';
      textColor = 'text-yellow-800';
      icon = <Tool className="h-3 w-3" />;
      break;
  }

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
            className={`w-full h-full flex flex-col justify-center items-center shadow-md hover:shadow-lg 
                      transition-all duration-200 p-2 ${bgColor} ${textColor} ${borderColor} border-2`}
          >
            <div className="text-xs font-semibold">{desk.name}</div>
            <div className="text-[10px] capitalize flex items-center gap-1">
              {icon}{status}
            </div>
          </Card>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Desk {desk.name}</DialogTitle>
            <DialogDescription>
              {status === 'available' 
                ? 'This desk is available for booking.' 
                : status === 'maintenance'
                ? 'This desk is currently under maintenance.'
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
            status !== 'maintenance' ? (
              <BookingForm deskId={desk.id} date={date} status={status} />
            ) : (
              <div className="py-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        This desk is currently unavailable due to maintenance.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
