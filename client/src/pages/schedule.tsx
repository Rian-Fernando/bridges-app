import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { CalendarGrid } from "@/components/ui/calendar-grid";
import { User, Meeting, Subject } from "@/lib/types";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function Schedule() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [filterType, setFilterType] = useState<string | undefined>(undefined);
  const [selectedStudent, setSelectedStudent] = useState<number | undefined>(undefined);
  const [selectedStaff, setSelectedStaff] = useState<number | undefined>(undefined);
  
  // Fetch data
  const { data: students, isLoading: isLoadingStudents } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'STUDENT' }],
  });
  
  const { data: allStaff, isLoading: isLoadingStaff } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'STUDENT_STAFF' }],
  });
  
  const { data: professionalStaff } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'PROFESSIONAL_STAFF' }],
  });
  
  const { data: meetings, isLoading: isLoadingMeetings } = useQuery<Meeting[]>({
    queryKey: ['/api/meetings', { 
      date: currentDate.toISOString().split('T')[0],
      studentId: selectedStudent,
      staffId: selectedStaff
    }],
  });
  
  const { data: subjects, isLoading: isLoadingSubjects } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });

  const allStaffList = [...(allStaff || []), ...(professionalStaff || [])];

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

  const handleFilterChange = (value: string) => {
    setFilterType(value);
    // Reset selection when filter type changes
    setSelectedStudent(undefined);
    setSelectedStaff(undefined);
  };

  const handleStudentChange = (value: string) => {
    setSelectedStudent(parseInt(value));
  };

  const handleStaffChange = (value: string) => {
    setSelectedStaff(parseInt(value));
  };

  // Filter meetings based on selected filters
  const filteredMeetings = meetings?.filter(meeting => {
    if (selectedStudent && meeting.studentId !== selectedStudent) return false;
    if (selectedStaff && meeting.staffId !== selectedStaff) return false;
    return true;
  }) || [];

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Schedule</CardTitle>
                <CardDescription>
                  View and manage all scheduled meetings
                </CardDescription>
              </div>
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
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 mb-6">
              <div className="w-full md:w-1/3">
                <Label htmlFor="filter-type">Filter By</Label>
                <Select onValueChange={handleFilterChange} value={filterType}>
                  <SelectTrigger id="filter-type">
                    <SelectValue placeholder="All Meetings" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Meetings</SelectItem>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="staff">Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {filterType === 'student' && (
                <div className="w-full md:w-2/3">
                  <Label htmlFor="student-select">Select Student</Label>
                  <Select onValueChange={handleStudentChange} value={selectedStudent?.toString()}>
                    <SelectTrigger id="student-select">
                      <SelectValue placeholder="Select a student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students?.map(student => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.firstName} {student.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              
              {filterType === 'staff' && (
                <div className="w-full md:w-2/3">
                  <Label htmlFor="staff-select">Select Staff</Label>
                  <Select onValueChange={handleStaffChange} value={selectedStaff?.toString()}>
                    <SelectTrigger id="staff-select">
                      <SelectValue placeholder="Select a staff member" />
                    </SelectTrigger>
                    <SelectContent>
                      {allStaffList.map(staff => (
                        <SelectItem key={staff.id} value={staff.id.toString()}>
                          {staff.firstName} {staff.lastName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            
            {isLoadingMeetings || isLoadingStudents || isLoadingStaff || isLoadingSubjects ? (
              <div className="p-10 flex justify-center">
                <Skeleton className="h-[500px] w-full" />
              </div>
            ) : (
              filteredMeetings.length > 0 ? (
                <CalendarGrid
                  meetings={filteredMeetings}
                  students={students || []}
                  staff={allStaffList}
                  subjects={subjects || []}
                  startDate={currentDate}
                />
              ) : (
                <div className="py-20 text-center text-apple-gray-600">
                  <i className="fas fa-calendar-times text-4xl mb-3"></i>
                  <p className="text-lg">No meetings found for the selected filters.</p>
                  {(selectedStudent || selectedStaff || filterType) && (
                    <Button 
                      variant="link" 
                      onClick={() => {
                        setFilterType(undefined);
                        setSelectedStudent(undefined);
                        setSelectedStaff(undefined);
                      }}
                    >
                      Clear Filters
                    </Button>
                  )}
                </div>
              )
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
