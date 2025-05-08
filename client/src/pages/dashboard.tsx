import { useEffect, useState } from "react";
import { AppLayout } from "@/components/layout/app-layout";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { CalendarGrid } from "@/components/ui/calendar-grid";
import { ActivityCard } from "@/components/ui/activity-card";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalStaff: 0,
    weeklyMeetings: 0,
    successRate: 0
  });

  useEffect(() => {
    // Fetch dashboard stats
    fetch("/api/stats")
      .then(res => res.json())
      .then(setStats)
      .catch(console.error);
  }, []);

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Total Students"
            value={stats.totalStudents}
            trend="+5% from last semester"
          />
          <StatCard 
            title="Staff Members"
            value={stats.totalStaff}
            trend="2 new this week"
          />
          <StatCard 
            title="Weekly Meetings"
            value={stats.weeklyMeetings}
            trend="On track"
          />
          <StatCard 
            title="Success Rate"
            value={`${stats.successRate}%`}
            trend="Above target"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="col-span-2">
            <CalendarGrid meetings={[]} students={[]} staff={[]} subjects={[]} startDate={new Date()}/> {/* Placeholder data for CalendarGrid */}
          </Card>
          <Card>
            <ActivityCard activity={{id:0, description:"", user:{id:0, name:"", role:""}}} /> {/* Placeholder data for ActivityCard */}
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}