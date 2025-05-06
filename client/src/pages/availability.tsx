import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { User, Availability as AvailabilityType, daysOfWeek, formatTime } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AvailabilityForm } from "@/components/forms/availability-form";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { queryClient, apiRequest } from "@/lib/queryClient";

export default function Availability() {
  const [selectedUser, setSelectedUser] = useState<number | undefined>(undefined);
  const [selectedTab, setSelectedTab] = useState<string>("view");
  const [isFormOpen, setIsFormOpen] = useState(false);
  
  // Fetch all users
  const { data: students } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'STUDENT' }],
  });
  
  const { data: studentStaff } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'STUDENT_STAFF' }],
  });
  
  const { data: professionalStaff } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'PROFESSIONAL_STAFF' }],
  });
  
  // Combine all users for selection
  const allUsers = [
    ...(students || []).map(user => ({ ...user, type: 'Student' })),
    ...(studentStaff || []).map(user => ({ ...user, type: 'Student Staff' })),
    ...(professionalStaff || []).map(user => ({ ...user, type: 'Professional Staff' }))
  ];
  
  // Fetch selected user's availability
  const { data: userAvailability, isLoading: isLoadingAvailability } = useQuery<AvailabilityType[]>({
    queryKey: ['/api/availability', { userId: selectedUser }],
    enabled: !!selectedUser,
  });
  
  const selectedUserData = allUsers.find(user => user.id === selectedUser);
  
  const handleUserChange = (userId: string) => {
    setSelectedUser(parseInt(userId));
    setIsFormOpen(false);
  };
  
  const handleDeleteAvailability = async (availabilityId: number) => {
    try {
      await apiRequest('DELETE', `/api/availability/${availabilityId}`);
      // Invalidate cache to refresh the list
      queryClient.invalidateQueries({ queryKey: ['/api/availability', { userId: selectedUser }] });
    } catch (error) {
      console.error("Failed to delete availability:", error);
    }
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <CardTitle>Availability Management</CardTitle>
              <CardDescription>
                View and set availability for students and staff
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 space-x-0 md:space-x-4 items-center">
              <Select value={selectedUser?.toString()} onValueChange={handleUserChange}>
                <SelectTrigger className="w-full md:w-64">
                  <SelectValue placeholder="Select a person" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Select a person</SelectItem>
                  <SelectItem disabled value="students-header" className="font-bold text-apple-gray-400">
                    — Students —
                  </SelectItem>
                  {students?.map(student => (
                    <SelectItem key={`student-${student.id}`} value={student.id.toString()}>
                      {student.firstName} {student.lastName} (Student)
                    </SelectItem>
                  ))}
                  <SelectItem disabled value="student-staff-header" className="font-bold text-apple-gray-400">
                    — Student Staff —
                  </SelectItem>
                  {studentStaff?.map(staff => (
                    <SelectItem key={`studentstaff-${staff.id}`} value={staff.id.toString()}>
                      {staff.firstName} {staff.lastName} (Student Staff)
                    </SelectItem>
                  ))}
                  <SelectItem disabled value="prof-staff-header" className="font-bold text-apple-gray-400">
                    — Professional Staff —
                  </SelectItem>
                  {professionalStaff?.map(staff => (
                    <SelectItem key={`profstaff-${staff.id}`} value={staff.id.toString()}>
                      {staff.firstName} {staff.lastName} (Prof. Staff)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedUser && (
                <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full md:w-auto">
                  <TabsList>
                    <TabsTrigger value="view">View</TabsTrigger>
                    <TabsTrigger value="edit">Edit</TabsTrigger>
                  </TabsList>
                </Tabs>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!selectedUser ? (
              <div className="py-20 text-center text-apple-gray-600">
                <i className="fas fa-clock text-4xl mb-3"></i>
                <p className="text-lg">Please select a student or staff member to view or edit their availability.</p>
              </div>
            ) : selectedTab === "view" ? (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">
                      {selectedUserData?.firstName} {selectedUserData?.lastName}'s Availability
                    </h3>
                    <p className="text-apple-gray-600 text-sm">
                      {selectedUserData?.type} • {selectedUserData?.isRemote ? 'Remote' : 'On-Campus'}
                    </p>
                  </div>
                  <Button onClick={() => setSelectedTab("edit")}>
                    <i className="fas fa-pencil-alt mr-2"></i> Edit Availability
                  </Button>
                </div>
                
                {isLoadingAvailability ? (
                  <div className="space-y-4">
                    <Skeleton className="h-40 w-full" />
                  </div>
                ) : (
                  <>
                    {(!userAvailability || userAvailability.length === 0) ? (
                      <div className="py-10 text-center text-apple-gray-600 border rounded-md bg-apple-gray-50">
                        <i className="fas fa-calendar-times text-3xl mb-2"></i>
                        <p>No availability has been set yet.</p>
                        <Button variant="link" onClick={() => setSelectedTab("edit")}>
                          Add Availability
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {daysOfWeek.map((day, index) => {
                          const dayAvailability = userAvailability.filter(
                            avail => avail.dayOfWeek === index
                          );
                          
                          if (dayAvailability.length === 0) return null;
                          
                          return (
                            <div key={index} className="border rounded-md p-4">
                              <h4 className="font-medium mb-2">{day}</h4>
                              <div className="space-y-2">
                                {dayAvailability.map(avail => (
                                  <div key={avail.id} className="flex justify-between items-center bg-apple-gray-50 p-3 rounded-md">
                                    <div>
                                      <span className="font-medium">
                                        {formatTime(avail.startTime)} — {formatTime(avail.endTime)}
                                      </span>
                                      {avail.location && (
                                        <span className="ml-2 text-apple-gray-600">
                                          <i className="fas fa-map-marker-alt mr-1"></i>
                                          {avail.location}
                                        </span>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant={avail.isRecurring ? "secondary" : "outline"}>
                                        {avail.isRecurring ? "Recurring" : "One-time"}
                                      </Badge>
                                      <Button 
                                        variant="ghost" 
                                        size="sm"
                                        onClick={() => handleDeleteAvailability(avail.id)}
                                      >
                                        <i className="fas fa-trash text-apple-red"></i>
                                      </Button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                )}
              </>
            ) : (
              <div>
                <div className="mb-6 flex justify-between items-center">
                  <h3 className="text-lg font-semibold">
                    Edit {selectedUserData?.firstName} {selectedUserData?.lastName}'s Availability
                  </h3>
                  <Button variant="outline" onClick={() => setSelectedTab("view")}>
                    <i className="fas fa-eye mr-2"></i> View Availability
                  </Button>
                </div>
                
                {!isFormOpen ? (
                  <div className="flex flex-col items-center justify-center py-10 text-center text-apple-gray-600 border rounded-md bg-apple-gray-50">
                    <i className="fas fa-plus-circle text-4xl mb-3 text-apple-blue"></i>
                    <p className="mb-4">Add new availability for {selectedUserData?.firstName}</p>
                    <Button onClick={() => setIsFormOpen(true)}>
                      Add Availability Slot
                    </Button>
                  </div>
                ) : (
                  <AvailabilityForm 
                    userId={selectedUser} 
                    onCancel={() => setIsFormOpen(false)}
                    onSuccess={() => {
                      setIsFormOpen(false);
                      queryClient.invalidateQueries({ queryKey: ['/api/availability', { userId: selectedUser }] });
                    }}
                  />
                )}
                
                {userAvailability && userAvailability.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-medium mb-2">Current Availability</h4>
                    <div className="space-y-2">
                      {daysOfWeek.map((day, index) => {
                        const dayAvailability = userAvailability.filter(
                          avail => avail.dayOfWeek === index
                        );
                        
                        if (dayAvailability.length === 0) return null;
                        
                        return (
                          <div key={index} className="border rounded-md p-4">
                            <h4 className="font-medium mb-2">{day}</h4>
                            <div className="space-y-2">
                              {dayAvailability.map(avail => (
                                <div key={avail.id} className="flex justify-between items-center bg-apple-gray-50 p-3 rounded-md">
                                  <div>
                                    <span className="font-medium">
                                      {formatTime(avail.startTime)} — {formatTime(avail.endTime)}
                                    </span>
                                    {avail.location && (
                                      <span className="ml-2 text-apple-gray-600">
                                        <i className="fas fa-map-marker-alt mr-1"></i>
                                        {avail.location}
                                      </span>
                                    )}
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge variant={avail.isRecurring ? "secondary" : "outline"}>
                                      {avail.isRecurring ? "Recurring" : "One-time"}
                                    </Badge>
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={() => handleDeleteAvailability(avail.id)}
                                    >
                                      <i className="fas fa-trash text-apple-red"></i>
                                    </Button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
