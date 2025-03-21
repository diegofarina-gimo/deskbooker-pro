
import React, { useState, useRef } from 'react';
import { useBooking, User } from '@/contexts/BookingContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { 
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import { toast } from "sonner";
import { Upload, Save, User as UserIcon, Phone } from 'lucide-react';

export const ProfileEditor = () => {
  const { currentUser, updateUser } = useBooking();

  const [profile, setProfile] = useState<Partial<User>>(currentUser || {});
  const [previewImage, setPreviewImage] = useState<string | undefined>(currentUser?.avatar);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };

  const handleImageClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result as string);
        setProfile({
          ...profile,
          avatar: reader.result as string
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    if (!currentUser || !profile.name || !profile.email) {
      toast.error("Name and email are required");
      return;
    }

    updateUser({
      ...currentUser,
      name: profile.name,
      email: profile.email,
      avatar: profile.avatar || currentUser.avatar,
      bio: profile.bio,
      phone: profile.phone
    });
    
    toast.success("Your profile has been updated successfully");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Profile</CardTitle>
        <CardDescription>Update your personal information</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col items-center space-y-4">
          <div 
            className="relative cursor-pointer group"
            onClick={handleImageClick}
          >
            <Avatar className="h-24 w-24 border-2 border-primary">
              <AvatarImage src={previewImage} alt={profile.name} />
              <AvatarFallback className="text-xl">
                {profile.name?.substring(0, 2) || currentUser.name.substring(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Upload className="h-6 w-6 text-white" />
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              accept="image/*"
            />
          </div>
          <p className="text-sm text-gray-500">Click to change your profile picture</p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="name"
                name="name"
                value={profile.name || ''}
                onChange={handleChange}
                className="pl-10"
                placeholder="Your full name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute left-3 top-3 h-4 w-4 text-gray-400"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect width="20" height="16" x="2" y="4" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              <Input
                id="email"
                name="email"
                type="email"
                value={profile.email || ''}
                onChange={handleChange}
                className="pl-10"
                placeholder="Your email address"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="phone"
                name="phone"
                value={profile.phone || ''}
                onChange={handleChange}
                className="pl-10"
                placeholder="Your phone number"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={profile.bio || ''}
              onChange={handleChange}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSaveProfile} className="ml-auto">
          <Save className="mr-2 h-4 w-4" /> Save Changes
        </Button>
      </CardFooter>
    </Card>
  );
};
