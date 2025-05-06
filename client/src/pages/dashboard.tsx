import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { StatCard } from "@/components/ui/stat-card";
import { ActivityCard } from "@/components/ui/activity-card";
import { ConflictCard } from "@/components/ui/conflict-card";
import { CalendarGrid } from "@/components/ui/calendar-grid";
import { User, Meeting, Conflict, Activity, Subject } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Fetch data
  const { data: students, isLoading: isLoadingStudents } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'STUDENT' }],
  });
  
  const { data: staff, isLoading: isLoadingStaff } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'STUDENT_STAFF' }],
  });
  
  const { data: professionalStaff } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'PROFESSIONAL_STAFF' }],
  });
  
  const { data: meetings, isLoading: isLoadingMeetings } = useQuery<Meeting[]>({
    queryKey: ['/api/meetings', { date: currentDate.toISOString().split('T')[0] }],
  });
  
  const { data: conflicts, isLoading: isLoadingConflicts } = useQuery<Conflict[]>({
    queryKey: ['/api/conflicts', { status: 'open' }],
  });
  
  const { data: activities, isLoading: isLoadingActivities } = useQuery<Activity[]>({
    queryKey: ['/api/activities'],
  });
  
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

  const handleResolveConflict = async (conflictId: number) => {
    try {
      await apiRequest('POST', `/api/conflicts/${conflictId}/resolve`, { resolvedById: 1 });
      // Invalidate conflicts cache to refresh the list
      queryClient.invalidateQueries({queryKey: ['/api/conflicts']});
    } catch (error) {
      console.error("Failed to resolve conflict:", error);
    }
  };

  const handleAssignConflict = async (conflictId: number) => {
    try {
      // For simplicity, assign to the admin user
      await apiRequest('PUT', `/api/conflicts/${conflictId}`, { 
        assignedToId: 1 // Admin user
      });
      queryClient.invalidateQueries({queryKey: ['/api/conflicts']});
    } catch (error) {
      console.error("Failed to assign conflict:", error);
    }
  };

  const handlePreviousWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleCurrentWeek = () => {
    setCurrentDate(new Date());
  };

  // Calculate total staff (both student staff and professional staff)
  const totalStaff = (staff?.length || 0) + (professionalStaff?.length || 0);

  // Calculate meeting type distribution
  const getMeetingTypeDistribution = () => {
    if (!meetings || meetings.length === 0) return {};
    
    const distribution = meetings.reduce((acc, meeting) => {
      acc[meeting.meetingType] = (acc[meeting.meetingType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert counts to percentages
    const total = meetings.length;
    const percentages = Object.entries(distribution).map(([type, count]) => ({
      type,
      percentage: Math.round((count / total) * 100)
    }));
    
    return percentages;
  };

  const meetingDistribution = getMeetingTypeDistribution();

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        {/* Summary Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard
            title="Total Students"
            value={isLoadingStudents ? "—" : students?.length || 0}
            icon={<i className="fas fa-user-graduate text-apple-blue"></i>}
            change={{
              value: "12%",
              isPositive: true,
              text: "from last semester"
            }}
          />
          
          <StatCard
            title="Active Staff"
            value={isLoadingStaff ? "—" : totalStaff}
            icon={<i className="fas fa-users text-adelphi-gold"></i>}
            change={{
              value: "5%",
              isPositive: true,
              text: "from last semester"
            }}
          />
          
          <StatCard
            title="Weekly Meetings"
            value={isLoadingMeetings ? "—" : meetings?.length || 0}
            icon={<i className="fas fa-calendar-check text-adelphi-brown"></i>}
            change={{
              value: "3%",
              isPositive: false,
              text: "from last week"
            }}
          />
          
          <StatCard
            title="Open Conflicts"
            value={isLoadingConflicts ? "—" : conflicts?.filter(c => c.status === 'open').length || 0}
            icon={<i className="fas fa-exclamation-triangle text-apple-red"></i>}
            change={{
              value: "15%",
              isPositive: true,
              text: "from last week"
            }}
          />
        </div>
        
        {/* Schedule Overview Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-5 border-b border-apple-gray-200">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-apple-gray-900">Weekly Schedule Overview</h3>
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handlePreviousWeek}
                >
                  <i className="fas fa-chevron-left mr-1"></i> Previous
                </Button>
                <Button 
                  size="sm"
                  onClick={handleCurrentWeek}
                >
                  Today
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleNextWeek}
                >
                  Next <i className="fas fa-chevron-right ml-1"></i>
                </Button>
              </div>
            </div>
          </div>
          
          {isLoadingMeetings || isLoadingStudents || isLoadingStaff || isLoadingSubjects ? (
            <div className="p-10 flex justify-center">
              <Skeleton className="h-[400px] w-full" />
            </div>
          ) : (
            <CalendarGrid
              meetings={meetings || []}
              students={students || []}
              staff={[...(staff || []), ...(professionalStaff || [])]}
              subjects={subjects || []}
              startDate={currentDate}
            />
          )}
        </div>
        
        {/* Recent Activity and Conflicts Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Meeting Type Distribution */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-lg font-semibold text-apple-gray-900 mb-5">Meeting Type Distribution</h3>
            
            {isLoadingMeetings ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-10" />
                    </div>
                    <Skeleton className="h-2 w-full" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col space-y-4">
                {meetingDistribution.length > 0 ? (
                  meetingDistribution.map(({ type, percentage }) => (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium">
                          {type.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
                        </span>
                        <span>{percentage}%</span>
                      </div>
                      <div className="h-2 bg-apple-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${
                            type === 'LEARNING_STRATEGIST' ? 'bg-apple-blue' :
                            type === 'COMBO' ? 'bg-adelphi-brown' :
                            type === 'VOCATIONAL_COACH' ? 'bg-apple-green' :
                            type === 'SOCIAL_COACH' ? 'bg-apple-orange' :
                            type === 'ACADEMIC_COACH' ? 'bg-purple-500' :
                            'bg-apple-red'
                          }`}
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-apple-gray-600 text-center py-4">
                    No meetings scheduled for the selected date range.
                  </p>
                )}
              </div>
            )}
          </div>
          
          {/* Recent Activity */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-lg font-semibold text-apple-gray-900 mb-5">Recent Activity</h3>
            
            {isLoadingActivities ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="flex items-start mb-4">
                    <Skeleton className="h-10 w-10 rounded-md mr-3" />
                    <div className="flex-1">
                      <Skeleton className="h-4 w-40 mb-2" />
                      <Skeleton className="h-3 w-60 mb-1" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {activities && activities.length > 0 ? (
                  activities.slice(0, 4).map(activity => (
                    <ActivityCard 
                      key={activity.id} 
                      activity={activity} 
                    />
                  ))
                ) : (
                  <p className="text-apple-gray-600 text-center py-4">
                    No recent activities to display.
                  </p>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-apple-blue border-apple-blue hover:bg-apple-blue hover:bg-opacity-5"
                >
                  View All Activity
                </Button>
              </>
            )}
          </div>
          
          {/* Active Conflicts */}
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-lg font-semibold text-apple-gray-900 mb-5">Active Conflicts</h3>
            
            {isLoadingConflicts ? (
              <div className="space-y-3">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-24 w-full rounded" />
                ))}
              </div>
            ) : (
              <>
                {conflicts && conflicts.length > 0 ? (
                  conflicts
                    .filter(conflict => conflict.status === 'open')
                    .slice(0, 4)
                    .map(conflict => {
                      const relatedUser = students?.find(s => s.id === conflict.relatedUserId) ||
                                      staff?.find(s => s.id === conflict.relatedUserId) ||
                                      professionalStaff?.find(s => s.id === conflict.relatedUserId);
                      
                      const assignedTo = staff?.find(s => s.id === conflict.assignedToId) ||
                                     professionalStaff?.find(s => s.id === conflict.assignedToId);
                      
                      return (
                        <ConflictCard
                          key={conflict.id}
                          conflict={conflict}
                          relatedUser={relatedUser}
                          assignedTo={assignedTo}
                          onResolve={() => handleResolveConflict(conflict.id)}
                          onAssign={() => handleAssignConflict(conflict.id)}
                        />
                      );
                    })
                ) : (
                  <p className="text-apple-gray-600 text-center py-4">
                    No active conflicts to display.
                  </p>
                )}
                
                <Button 
                  variant="outline" 
                  className="w-full mt-4 text-apple-blue border-apple-blue hover:bg-apple-blue hover:bg-opacity-5"
                >
                  View All Conflicts
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
