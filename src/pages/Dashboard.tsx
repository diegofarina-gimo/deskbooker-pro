
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { AppHeader } from '@/components/AppHeader';
import { BookingOverview } from '@/components/BookingOverview';
import { FloorMap } from '@/components/FloorMap';
import { TeamBookingsView } from '@/components/TeamBookingsView';
import { BookingStats } from '@/components/BookingStats';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useIsMobile } from '@/hooks/use-mobile';

const Dashboard = () => {
  const { currentUser, selectedMap, maps, selectedDate } = useBooking();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!currentUser) {
      navigate('/');
    }
  }, [currentUser, navigate]);
  
  if (!currentUser) return null;
  
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="w-full flex max-w-md">
            <TabsTrigger value="overview" className="flex-1">
              {isMobile ? "Bookings" : "Booking Overview"}
            </TabsTrigger>
            <TabsTrigger value="map" className="flex-1">
              {isMobile ? "Map" : "Office Map"}
            </TabsTrigger>
            <TabsTrigger value="team" className="flex-1">
              {isMobile ? "Team" : "Team View"}
            </TabsTrigger>
            {currentUser.role === 'admin' && (
              <TabsTrigger value="stats" className="flex-1">
                {isMobile ? "Stats" : "Statistics"}
              </TabsTrigger>
            )}
          </TabsList>
          
          <TabsContent value="overview" className="animate-slideIn">
            <BookingOverview />
          </TabsContent>
          
          <TabsContent value="map" className="animate-slideIn">
            <div className="p-4 md:p-6 space-y-6">
              {selectedMap ? (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h2 className="text-xl font-semibold mb-4">
                    {maps.find(m => m.id === selectedMap)?.name || 'Office Map'}
                  </h2>
                  <FloorMap mapId={selectedMap} date={selectedDate} showBookingDetails={true} />
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Please select a map from the booking overview</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="team" className="animate-slideIn">
            <div className="p-4 md:p-6 space-y-6">
              <TeamBookingsView />
            </div>
          </TabsContent>
          
          {currentUser.role === 'admin' && (
            <TabsContent value="stats" className="animate-slideIn">
              <div className="p-4 md:p-6 space-y-6">
                <BookingStats />
              </div>
            </TabsContent>
          )}
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
