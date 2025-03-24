
import React, { useState } from 'react';
import { useBooking } from '@/contexts/BookingContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { addDays, format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';
import { Calendar, Users } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const BookingStats = () => {
  const { bookings, desks, teams, users, getUsersByTeamId } = useBooking();
  const [timeFrame, setTimeFrame] = useState<'week' | 'month'>('week');

  // Calculate date range
  const today = new Date();
  const startDate = timeFrame === 'week' 
    ? startOfWeek(today, { weekStartsOn: 1 }) // Week starts on Monday
    : addDays(today, -30);
  const endDate = timeFrame === 'week'
    ? endOfWeek(today, { weekStartsOn: 1 })
    : today;

  // Generate daily data for the chart
  const daysInRange = eachDayOfInterval({ start: startDate, end: endDate });

  // Daily bookings data
  const dailyBookingsData = daysInRange.map(day => {
    const dayBookings = bookings.filter(booking => 
      isSameDay(parseISO(booking.date), day)
    );
    
    return {
      date: format(day, 'MM/dd'),
      fullDate: format(day, 'PP'),
      count: dayBookings.length,
      utilization: desks.length > 0 ? Math.round((dayBookings.length / desks.length) * 100) : 0
    };
  });

  // Team stats
  const teamBookingStats = teams.map(team => {
    const teamUserIds = getUsersByTeamId(team.id).map(user => user.id);
    const teamBookingsCount = bookings.filter(booking => 
      teamUserIds.includes(booking.userId) && 
      parseISO(booking.date) >= startDate && 
      parseISO(booking.date) <= endDate
    ).length;

    return {
      name: team.name,
      count: teamBookingsCount,
      color: team.color || '#3B82F6'
    };
  }).sort((a, b) => b.count - a.count);

  // Total stats
  const totalBookings = bookings.filter(booking => 
    parseISO(booking.date) >= startDate && 
    parseISO(booking.date) <= endDate
  ).length;

  const uniqueUsers = new Set(
    bookings
      .filter(booking => parseISO(booking.date) >= startDate && parseISO(booking.date) <= endDate)
      .map(booking => booking.userId)
  ).size;

  const averageUtilization = dailyBookingsData.reduce((acc, curr) => acc + curr.utilization, 0) / dailyBookingsData.length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Booking Statistics</h2>
        <Select value={timeFrame} onValueChange={(value: 'week' | 'month') => setTimeFrame(value)}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Time Frame" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{totalBookings}</CardTitle>
            <CardDescription>Total Bookings</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{uniqueUsers}</CardTitle>
            <CardDescription>Unique Users</CardDescription>
          </CardHeader>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl">{averageUtilization.toFixed(1)}%</CardTitle>
            <CardDescription>Average Space Utilization</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Daily Booking Activity
          </CardTitle>
          <CardDescription>
            Number of bookings per day
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyBookingsData} margin={{ top: 10, right: 30, left: 0, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [value, name === 'count' ? 'Bookings' : 'Utilization (%)']}
                  labelFormatter={(label, payload) => {
                    const item = dailyBookingsData.find(d => d.date === label);
                    return item ? item.fullDate : label;
                  }}
                />
                <Bar dataKey="count" fill="#3b82f6" name="Bookings" />
                <Bar dataKey="utilization" fill="#10b981" name="Utilization (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Team Booking Distribution
          </CardTitle>
          <CardDescription>
            Bookings by team during selected period
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            {teamBookingStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={teamBookingStats}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    fill="#8884d8"
                    paddingAngle={1}
                    dataKey="count"
                    nameKey="name"
                  >
                    {teamBookingStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [value, 'Bookings']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center text-gray-500">No team data available</div>
            )}
          </div>
          
          <div className="mt-6 space-y-2">
            {teamBookingStats.map((team, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: team.color }}
                  />
                  <span>{team.name}</span>
                </div>
                <span>{team.count} bookings</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
