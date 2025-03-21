
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBooking } from '@/contexts/BookingContext';
import { AppHeader } from '@/components/AppHeader';
import { ChangePasswordForm } from '@/components/ChangePasswordForm';
import { ProfileEditor } from '@/components/ProfileEditor';
import { TeamManagement } from '@/components/TeamManagement';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useEffect } from 'react';

const Profile = () => {
  const { currentUser } = useBooking();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("profile");
  
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
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList>
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            {currentUser.role === 'admin' && <TabsTrigger value="teams">Teams</TabsTrigger>}
          </TabsList>
          
          <div className="mt-6">
            <TabsContent value="profile">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Profile Information</CardTitle>
                      <CardDescription>Your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center space-y-4">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                        <AvatarFallback className="text-xl">{currentUser.name.substring(0, 2)}</AvatarFallback>
                      </Avatar>
                      
                      <div className="text-center">
                        <h3 className="text-xl font-semibold">{currentUser.name}</h3>
                        <p className="text-gray-500">{currentUser.email}</p>
                        {currentUser.phone && <p className="text-gray-500">{currentUser.phone}</p>}
                        <div className="mt-2">
                          <span className={`inline-block px-3 py-1 rounded-full text-sm ${
                            currentUser.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                          }`}>
                            {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      {currentUser.bio && (
                        <div className="mt-4 text-center">
                          <p className="text-sm text-gray-600">{currentUser.bio}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
                
                <div className="lg:col-span-2">
                  <ProfileEditor />
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="security">
              <div className="lg:col-span-2">
                <ChangePasswordForm />
              </div>
            </TabsContent>
            
            {currentUser.role === 'admin' && (
              <TabsContent value="teams">
                <TeamManagement />
              </TabsContent>
            )}
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default Profile;
