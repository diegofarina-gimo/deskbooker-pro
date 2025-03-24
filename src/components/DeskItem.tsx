
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
import { Wrench, AlertTriangle, User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { getDeskStatus, currentUser, getBookingByDeskAndDate, getUserById, getTeamById } = useBooking();
  const isMobile = useIsMobile();
  
  const status = getDeskStatus(desk.id, date);
  const booking = getBookingByDeskAndDate(desk.id, date);
  const bookedUser = booking ? getUserById(booking.userId) : null;
  const userTeam = bookedUser?.teamId ? getTeamById(bookedUser.teamId) : null;

  // Get dot color based on status and team
  let dotColor = '#4CAF50'; // Green for available
  let borderColor = 'border-green-400';
  let textColor = 'text-green-800';
  let bgColor = 'bg-white';
  let statusText = 'Available';
  let icon = null;

  switch (status) {
    case 'available':
      dotColor = '#4CAF50'; // Green
      bgColor = 'bg-green-50';
      borderColor = 'border-green-400';
      textColor = 'text-green-800';
      statusText = 'Available';
      break;
    case 'booked':
      dotColor = userTeam?.color || '#3B82F6'; // Team color or default blue
      bgColor = 'bg-blue-50';
      borderColor = 'border-blue-400';
      textColor = 'text-blue-800';
      statusText = 'Booked';
      icon = <User className="h-3 w-3" />;
      break;
    case 'maintenance':
      dotColor = '#F59E0B'; // Amber/orange
      bgColor = 'bg-yellow-50';
      borderColor = 'border-yellow-400';
      textColor = 'text-yellow-800';
      statusText = 'Maintenance';
      icon = <Wrench className="h-3 w-3" />;
      break;
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (isEditing) {
      e.dataTransfer.setData('desk', JSON.stringify(desk));
    }
  };

  const dotSize = isMobile ? 18 : 24;

  return (
    <div
      className={`absolute desk transition-all duration-200 ${isEditing ? 'cursor-move' : ''}`}
      style={{
        left: `${desk.x}px`,
        top: `${desk.y}px`,
        width: `${dotSize}px`,
        height: `${dotSize}px`,
        zIndex: 10, // Ensure dots are above the map background
      }}
      draggable={isEditing}
      onDragStart={handleDragStart}
    >
      <Dialog>
        <DialogTrigger asChild>
          <div 
            className={`w-full h-full rounded-full shadow-md hover:shadow-lg
                       transition-all duration-200 flex items-center justify-center
                       border-2 ${borderColor}`}
            style={{ 
              backgroundColor: dotColor,
              transform: `scale(${isEditing ? '1.2' : '1'})`,
            }}
          >
            {isEditing && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold bg-white px-1 rounded shadow">
                {desk.name}
              </span>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{desk.name}</DialogTitle>
            <DialogDescription>
              {status === 'available' 
                ? 'This desk is available for booking.' 
                : status === 'maintenance'
                ? 'This desk is currently under maintenance.'
                : bookedUser
                  ? `This desk is booked by ${bookedUser.name}${userTeam ? ` (${userTeam.name})` : ''}.`
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
