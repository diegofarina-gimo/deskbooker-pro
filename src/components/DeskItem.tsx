
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
import { Wrench, AlertTriangle, User, Users } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const { getDeskStatus, currentUser, getBookingByDeskAndDate, getUserById, getTeamById } = useBooking();
  const isMobile = useIsMobile();
  
  const status = getDeskStatus(desk.id, date);
  const booking = getBookingByDeskAndDate(desk.id, date);
  const bookedUser = booking ? getUserById(booking.userId) : null;
  const userTeam = bookedUser?.teamId ? getTeamById(bookedUser.teamId) : null;

  // Get dot color based on status and type
  let dotColor = '#4CAF50'; // Green for available
  let borderColor = 'border-green-400';
  let textColor = 'text-green-800';
  let bgColor = 'bg-white';
  let statusText = 'Available';
  let icon = null;

  const isBookable = status === 'available';
  const isBooked = status === 'booked';
  const isMeetingRoom = desk.type === 'meeting_room';

  // For meeting rooms, use blue color theme
  if (isMeetingRoom) {
    if (isBookable) {
      dotColor = '#1EAEDB'; // Blue for available meeting room
      borderColor = 'border-blue-400';
      textColor = 'text-blue-800';
      statusText = 'Available';
    } else if (isBooked) {
      dotColor = '#9F9EA1'; // Grey for booked meeting room
      borderColor = 'border-gray-400';
      textColor = 'text-gray-800';
      statusText = 'Booked';
      icon = <Users className="h-3 w-3" />;
    } else {
      dotColor = '#F59E0B'; // Amber/orange for maintenance
      borderColor = 'border-yellow-400';
      textColor = 'text-yellow-800';
      statusText = 'Maintenance';
      icon = <Wrench className="h-3 w-3" />;
    }
  } else {
    // For regular desks
    switch (status) {
      case 'available':
        dotColor = '#4CAF50'; // Green
        bgColor = 'bg-green-50';
        borderColor = 'border-green-400';
        textColor = 'text-green-800';
        statusText = 'Available';
        break;
      case 'booked':
        dotColor = '#9F9EA1'; // Grey for booked
        bgColor = 'bg-gray-50';
        borderColor = 'border-gray-400';
        textColor = 'text-gray-800';
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
  }

  const handleDragStart = (e: React.DragEvent) => {
    if (isEditing) {
      e.dataTransfer.setData('desk', JSON.stringify(desk));
    }
  };

  const dotSize = isMobile ? 18 : 24;
  
  // Show booking user info on hover if showBookingDetails is true and desk is booked
  const shouldShowUserInfo = showBookingDetails && status === 'booked' && bookedUser;

  return (
    <div
      className={`absolute desk transition-all duration-200 ${isEditing ? 'cursor-move' : ''}`}
      style={{
        left: `${desk.x}px`,
        top: `${desk.y}px`,
        width: `${dotSize}px`,
        height: `${dotSize}px`,
        zIndex: 10, // Ensure dots are above the map background
        transform: 'translate(-50%, -50%)', // Center the dot on the exact coordinates
      }}
      draggable={isEditing}
      onDragStart={handleDragStart}
    >
      <Dialog>
        <DialogTrigger asChild>
          <div 
            className={`w-full h-full rounded-full shadow-md hover:shadow-lg
                       transition-all duration-200 flex items-center justify-center
                       border-2 ${borderColor} relative group`}
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
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{desk.name}</DialogTitle>
            <DialogDescription>
              {isMeetingRoom ? `Meeting room capacity: ${desk.capacity || 4} people` : ''}
              {status === 'available' 
                ? `This ${isMeetingRoom ? 'meeting room' : 'desk'} is available for booking.` 
                : status === 'maintenance'
                ? `This ${isMeetingRoom ? 'meeting room' : 'desk'} is currently under maintenance.`
                : bookedUser
                  ? `This ${isMeetingRoom ? 'meeting room' : 'desk'} is booked by ${bookedUser.name}${userTeam ? ` (${userTeam.name})` : ''}.`
                  : `This ${isMeetingRoom ? 'meeting room' : 'desk'} is currently booked.`}
              {booking?.timeSlot && (
                <div className="mt-1">
                  Time: {booking.timeSlot.startTime} - {booking.timeSlot.endTime}
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          {isEditing ? (
            <div className="grid gap-4 py-4">
              <div className="flex justify-between">
                <button
                  onClick={() => onEdit?.(desk)}
                  className="px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors"
                >
                  Edit {isMeetingRoom ? 'Meeting Room' : 'Desk'}
                </button>
                <button
                  onClick={() => onDelete?.(desk.id)}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-md hover:bg-red-100 transition-colors"
                >
                  Delete
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
