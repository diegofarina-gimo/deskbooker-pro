
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { AppHeader } from '@/components/AppHeader';
import { BookingOverview } from '@/components/BookingOverview';
import { FloorMap } from '@/components/FloorMap';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Dashboard = () => {
  const { currentUser, selectedMap, maps } = useBooking();
  const navigate = useNavigate();
  
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
      
      <main className="container mx-auto py-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Booking Overview</TabsTrigger>
            <TabsTrigger value="map">Office Map</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="animate-slideIn">
            <BookingOverview />
          </TabsContent>
          
          <TabsContent value="map" className="animate-slideIn">
            <div className="p-6 space-y-6">
              {selectedMap ? (
                <div className="bg-white rounded-lg shadow-sm border p-4">
                  <h2 className="text-xl font-semibold mb-4">
                    {maps.find(m => m.id === selectedMap)?.name || 'Office Map'}
                  </h2>
                  <FloorMap mapId={selectedMap} date={new Date()} />
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">Please select a map from the booking overview</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Dashboard;
