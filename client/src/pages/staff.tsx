import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { User, Subject, StaffExpertise } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Staff() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string | undefined>(undefined);
  
  // Fetch staff
  const { data: studentStaff, isLoading: isLoadingStudentStaff } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'STUDENT_STAFF' }],
  });
  
  const { data: professionalStaff, isLoading: isLoadingProfessionalStaff } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'PROFESSIONAL_STAFF' }],
  });
  
  // Fetch subjects
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });
  
  // Fetch staff expertise
  const { data: allStaffExpertise } = useQuery<StaffExpertise[]>({
    queryKey: ['/api/staff-expertise'],
    enabled: studentStaff !== undefined && professionalStaff !== undefined,
  });
  
  // Combine staff types
  const allStaff = [
    ...(studentStaff || []).map(staff => ({ ...staff, type: 'Student Staff' })),
    ...(professionalStaff || []).map(staff => ({ ...staff, type: 'Professional Staff' }))
  ];
  
  // Filter staff based on search term and role filter
  const filteredStaff = allStaff.filter(staff => {
    const fullName = `${staff.firstName} ${staff.lastName}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                          staff.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (roleFilter) {
      return matchesSearch && staff.type.toLowerCase() === roleFilter.toLowerCase();
    }
    
    return matchesSearch;
  });
  
  // Get subject expertise for a staff member
  const getStaffExpertiseNames = (staffId: number) => {
    if (!allStaffExpertise || !subjects) return [];
    
    const staffExpertiseIds = allStaffExpertise
      .filter(se => se.userId === staffId)
      .map(se => se.subjectId);
    
    return subjects
      .filter(subject => staffExpertiseIds.includes(subject.id))
      .map(subject => subject.name);
  };

  const isLoading = isLoadingStudentStaff || isLoadingProfessionalStaff;

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <CardTitle>Staff</CardTitle>
              <CardDescription>
                View and manage all staff members in the Bridges program
              </CardDescription>
            </div>
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4 items-center">
              <div className="relative w-full md:w-60">
                <Input
                  type="text"
                  placeholder="Search staff..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
                <i className="fas fa-search absolute left-2.5 top-3 text-apple-gray-400"></i>
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full md:w-40">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Types</SelectItem>
                  <SelectItem value="student staff">Student Staff</SelectItem>
                  <SelectItem value="professional staff">Professional Staff</SelectItem>
                </SelectContent>
              </Select>
              <Button>
                <i className="fas fa-plus mr-1"></i> Add Staff
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <>
                {filteredStaff.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Expertise</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStaff.map((staff) => (
                        <TableRow key={staff.id}>
                          <TableCell className="font-medium">
                            {staff.firstName} {staff.lastName}
                          </TableCell>
                          <TableCell>{staff.email}</TableCell>
                          <TableCell>
                            <Badge variant={staff.type === 'Student Staff' ? 'secondary' : 'outline'}>
                              {staff.type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline" 
                              className={staff.isRemote ? 'bg-blue-50 text-blue-700 border-blue-200' : ''}
                            >
                              {staff.isRemote ? 'Remote' : 'On-Campus'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {getStaffExpertiseNames(staff.id).map((subject, index) => (
                                <Badge key={index} variant="outline" className="bg-apple-gray-100">
                                  {subject}
                                </Badge>
                              ))}
                              {getStaffExpertiseNames(staff.id).length === 0 && (
                                <span className="text-apple-gray-500 text-sm">No expertise set</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-pencil-alt"></i>
                            </Button>
                            <Button variant="ghost" size="sm">
                              <i className="fas fa-calendar-alt"></i>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="py-20 text-center text-apple-gray-600">
                    <i className="fas fa-users text-4xl mb-3"></i>
                    <p className="text-lg">
                      {searchTerm || roleFilter
                        ? `No staff found matching your filters`
                        : "No staff members have been added yet."}
                    </p>
                    {(searchTerm || roleFilter) && (
                      <Button 
                        variant="link" 
                        onClick={() => {
                          setSearchTerm("");
                          setRoleFilter(undefined);
                        }}
                      >
                        Clear Filters
                      </Button>
                    )}
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
