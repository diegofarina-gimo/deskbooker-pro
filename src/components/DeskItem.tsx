
import React, { useState } from 'react';
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
import { Wrench, AlertTriangle, User, Users, Clock } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { format } from 'date-fns';

interface DeskItemProps {
  desk: Desk;
  date: Date;
  isEditing?: boolean;
  showBookingDetails?: boolean;
  onEdit?: (desk: Desk) => void;
  onDelete?: (id: string) => void;
}

export const DeskItem: React.FC<DeskItemProps> = ({ 
  desk, 
  date, 
  isEditing = false,
  showBookingDetails = false,
  onEdit,
  onDelete
}) => {
  const { getDeskStatus, currentUser, getBookingByDeskAndDate, getUserById, getTeamById, bookings } = useBooking();
  const isMobile = useIsMobile();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const status = getDeskStatus(desk.id, date);
  const booking = getBookingByDeskAndDate(desk.id, date);
  const bookedUser = booking ? getUserById(booking.userId) : null;
  const userTeam = bookedUser?.teamId ? getTeamById(bookedUser.teamId) : null;

  let dotColor = '#4CAF50';
  let borderColor = 'border-green-400';
  let textColor = 'text-green-800';
  let bgColor = 'bg-white';
  let statusText = 'Available';
  let icon = null;
  
  const now = new Date();
  const currentTimeString = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
  
  const isToday = date.toDateString() === new Date().toDateString();
  
  const isCurrentlyBooked = (desk.type === 'meeting_room' && booking?.timeSlot && isToday) ? 
    (currentTimeString >= booking.timeSlot.startTime && currentTimeString <= booking.timeSlot.endTime) : false;

  const isBookable = status === 'available' || 
    (desk.type === 'meeting_room' && status === 'booked' && !isCurrentlyBooked);
    
  const isBooked = (status === 'booked' && desk.type !== 'meeting_room') || isCurrentlyBooked;
  const isMeetingRoom = desk.type === 'meeting_room';

  const hasMultipleBookings = isMeetingRoom && 
    bookings.filter(b => b.deskId === desk.id && 
                    b.date === format(date, 'yyyy-MM-dd')).length > 1;

  if (isMeetingRoom) {
    if (desk.status !== 'maintenance') {
      if (isCurrentlyBooked) {
        dotColor = 'linear-gradient(145deg, #9F9EA1, #C8C8C9)';
        borderColor = 'border-gray-400';
        textColor = 'text-gray-800';
        statusText = 'In Use';
        icon = <Clock className="h-3 w-3" />;
      } else {
        dotColor = '#1EAEDB'; 
        borderColor = 'border-blue-400';
        textColor = 'text-blue-800';
        statusText = hasMultipleBookings ? 'Has Bookings' : 'Available';
        icon = hasMultipleBookings ? <Users className="h-3 w-3" /> : null;
      }
    } else {
      dotColor = '#F59E0B';
      borderColor = 'border-yellow-400';
      textColor = 'text-yellow-800';
      statusText = 'Maintenance';
      icon = <Wrench className="h-3 w-3" />;
    }
  } else {
    switch (status) {
      case 'available':
        dotColor = '#4CAF50';
        bgColor = 'bg-green-50';
        borderColor = 'border-green-400';
        textColor = 'text-green-800';
        statusText = 'Available';
        break;
      case 'booked':
        dotColor = 'linear-gradient(145deg, #9F9EA1, #C8C8C9)';
        bgColor = 'bg-gray-50';
        borderColor = 'border-gray-400';
        textColor = 'text-gray-800';
        statusText = 'Booked';
        icon = <User className="h-3 w-3" />;
        break;
      case 'maintenance':
        dotColor = '#F59E0B';
        bgColor = 'bg-yellow-50';
        borderColor = 'border-yellow-400';
        textColor = 'text-yellow-800';
        statusText = 'Maintenance';
        icon = <Wrench className="h-3 w-3" />;
        break;
    }
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (isEditing) {
      e.dataTransfer.setData('desk', JSON.stringify(desk));
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onDelete) {
      onDelete(desk.id);
      setDialogOpen(false);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (onEdit) {
      onEdit(desk);
    }
  };

  const dotSize = isMobile ? 18 : 24;
  
  const shouldShowUserInfo = showBookingDetails && 
    ((status === 'booked' && bookedUser) || 
    (isMeetingRoom && booking && bookedUser));

  const bookingFormStatus = desk.status === 'maintenance' ? 'available' : (isCurrentlyBooked ? 'booked' : 'available');

  return (
    <div
      className={`absolute desk transition-all duration-200 ${isEditing ? 'cursor-move' : ''}`}
      style={{
        left: `${desk.x}px`,
        top: `${desk.y}px`,
        width: `${dotSize}px`,
        height: `${dotSize}px`,
        zIndex: 10,
        transform: 'translate(-50%, -50%)',
      }}
      draggable={isEditing}
      onDragStart={handleDragStart}
    >
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <div 
            className={`w-full h-full rounded-full shadow-md hover:shadow-lg
                       transition-all duration-200 flex items-center justify-center
                       border-2 ${borderColor} relative group`}
            style={{ 
              background: dotColor,
              transform: `scale(${isEditing ? '1.2' : '1'})`,
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
          >
            {isEditing && (
              <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold bg-white px-1 rounded shadow">
                {desk.name}
              </span>
            )}
            
            {shouldShowUserInfo && (
              <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-white p-1 rounded-md shadow-md text-xs border w-32 z-20">
                <div className="font-semibold truncate">{bookedUser.name}</div>
                {userTeam && (
                  <div className="flex items-center gap-1">
                    <div
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: '#9F9EA1' }}
                    ></div>
                    <span className="truncate">{userTeam.name}</span>
                  </div>
                )}
                {booking?.timeSlot && (
                  <div className="text-xs mt-1">
                    {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                  </div>
                )}
              </div>
            )}
            
            {hasMultipleBookings && !isEditing && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]" onClick={(e) => e.stopPropagation()}>
          <DialogHeader>
            <DialogTitle>{desk.name}</DialogTitle>
            <DialogDescription>
              {isMeetingRoom ? `Meeting room capacity: ${desk.capacity || 4} people` : ''}
              {desk.status !== 'maintenance'
                ? isMeetingRoom 
                  ? `This meeting room is available for booking.${hasMultipleBookings ? ' There are already some bookings for today.' : ''}`
                  : status === 'available' ? 'This desk is available for booking.' : 'This desk is currently booked.'
                : `This ${isMeetingRoom ? 'meeting room' : 'desk'} is currently under maintenance.`}
              {booking?.timeSlot && isCurrentlyBooked && (
                <div className="mt-1">
                  Currently booked: {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {isEditing ? (
            <div className="grid gap-4 py-4">
              <div className="flex justify-between">
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Edit {isMeetingRoom ? 'Meeting Room' : 'Desk'}
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          ) : (
            desk.status !== 'maintenance' ? (
              <BookingForm deskId={desk.id} date={date} status={bookingFormStatus} />
            ) : (
              <div className="py-4">
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-yellow-400" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-yellow-700">
                        This {isMeetingRoom ? 'meeting room' : 'desk'} is currently unavailable due to maintenance.
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
