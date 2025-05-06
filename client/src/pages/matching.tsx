import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { User, Subject, Meeting, formatDate, formatTime, meetingTypeInfo } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MatchingForm } from "@/components/forms/matching-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { WeeklySchedule } from "@/components/ui/weekly-schedule";
import { queryClient } from "@/lib/queryClient";

export default function Matching() {
  const [selectedTab, setSelectedTab] = useState<string>("new");
  
  // Fetch data
  const { data: students, isLoading: isLoadingStudents } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'STUDENT' }],
  });
  
  const { data: studentStaff, isLoading: isLoadingStudentStaff } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'STUDENT_STAFF' }],
  });
  
  const { data: professionalStaff, isLoading: isLoadingProfessionalStaff } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'PROFESSIONAL_STAFF' }],
  });
  
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });
  
  const { data: meetings, isLoading: isLoadingMeetings } = useQuery<Meeting[]>({
    queryKey: ['/api/meetings', { date: new Date().toISOString().split('T')[0] }],
  });
  
  const isLoading = isLoadingStudents || isLoadingStudentStaff || isLoadingProfessionalStaff || 
                    isLoadingSubjects || isLoadingMeetings;
  
  const combinedStaff = [...(studentStaff || []), ...(professionalStaff || [])];
  
  // Get recent matches
  const recentMatches = meetings 
    ? [...meetings]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5)
    : [];
  
  const handleMatchingSuccess = () => {
    // Invalidate queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['/api/meetings'] });
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div>
                    <CardTitle>Student-Staff Matching</CardTitle>
                    <CardDescription>
                      Create and manage meeting assignments
                    </CardDescription>
                  </div>
                  <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full md:w-auto">
                    <TabsList>
                      <TabsTrigger value="new">New Match</TabsTrigger>
                      <TabsTrigger value="schedule">View Schedule</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-64 w-full" />
                  </div>
                ) : (
                  <TabsContent value={selectedTab} forceMount={true} hidden={selectedTab !== "new"}>
                    <MatchingForm 
                      students={students || []}
                      staff={combinedStaff}
                      subjects={subjects || []}
                      onSuccess={handleMatchingSuccess}
                    />
                  </TabsContent>
                )}
                
                <TabsContent value={selectedTab} forceMount={true} hidden={selectedTab !== "schedule"}>
                  {isLoading ? (
                    <Skeleton className="h-[500px] w-full" />
                  ) : (
                    <WeeklySchedule 
                      meetings={meetings || []}
                      students={students || []}
                      staff={combinedStaff}
                      subjects={subjects || []}
                    />
                  )}
                </TabsContent>
              </CardContent>
            </Card>
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Matching Guidelines</CardTitle>
                <CardDescription>Tips for effective scheduling</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Alert>
                  <i className="fas fa-map-marker-alt mr-2 text-apple-blue"></i>
                  <AlertTitle>Location Matters</AlertTitle>
                  <AlertDescription>
                    Consider commuting staff who should not travel to campus for just one session.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <i className="fas fa-graduation-cap mr-2 text-apple-green"></i>
                  <AlertTitle>Subject Matching</AlertTitle>
                  <AlertDescription>
                    Match students with staff who have expertise in the required subject areas.
                  </AlertDescription>
                </Alert>
                
                <Alert>
                  <i className="fas fa-clock mr-2 text-apple-orange"></i>
                  <AlertTitle>Time Management</AlertTitle>
                  <AlertDescription>
                    Allow adequate time between sessions, especially for staff with multiple meetings.
                  </AlertDescription>
                </Alert>
                
                <Alert variant="destructive">
                  <i className="fas fa-exclamation-triangle mr-2"></i>
                  <AlertTitle>Avoid Conflicts</AlertTitle>
                  <AlertDescription>
                    Check for overlapping schedules before confirming new matches.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Recent Matches</CardTitle>
                <CardDescription>Last 5 scheduled meetings</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map(i => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    {recentMatches.length > 0 ? (
                      <div className="space-y-3">
                        {recentMatches.map(meeting => {
                          const meetingInfo = meetingTypeInfo[meeting.meetingType];
                          const student = students?.find(s => s.id === meeting.studentId);
                          const staff = combinedStaff.find(s => s.id === meeting.staffId);
                          
                          return (
                            <div key={meeting.id} className="border rounded-md p-3 hover-lift">
                              <div className="flex items-center mb-1">
                                <div 
                                  className="w-3 h-3 rounded-full mr-2" 
                                  style={{ backgroundColor: meetingInfo.color }}
                                ></div>
                                <span className="font-medium text-sm">{meetingInfo.label}</span>
                                <Badge className="ml-auto" variant="outline">
                                  {formatDate(meeting.date)}
                                </Badge>
                              </div>
                              <div className="text-sm text-apple-gray-600">
                                <div>
                                  <span className="font-medium">Student:</span> {student?.firstName} {student?.lastName}
                                </div>
                                <div>
                                  <span className="font-medium">Staff:</span> {staff?.firstName} {staff?.lastName}
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                  <span>
                                    {formatTime(meeting.startTime)} - {formatTime(meeting.endTime)}
                                  </span>
                                  <span className="text-xs italic">
                                    {meeting.isVirtual ? 'Virtual' : meeting.location}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-8 text-center text-apple-gray-600">
                        <i className="fas fa-calendar-times text-3xl mb-2"></i>
                        <p>No recent matches found.</p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
