import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { User, Subject, StudentSubject } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function Students() {
  const [searchTerm, setSearchTerm] = useState("");
  
  // Fetch students
  const { data: students, isLoading: isLoadingStudents } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'STUDENT' }],
  });
  
  // Fetch subjects
  const { data: subjects } = useQuery<Subject[]>({
    queryKey: ['/api/subjects'],
  });
  
  // Fetch student subjects (for all students)
  const { data: studentSubjects } = useQuery<StudentSubject[]>({
    queryKey: ['/api/student-subjects'],
    enabled: students !== undefined && students.length > 0,
  });
  
  // Filter students based on search term
  const filteredStudents = students?.filter(student => {
    const fullName = `${student.firstName} ${student.lastName}`.toLowerCase();
    return fullName.includes(searchTerm.toLowerCase()) || 
           student.email.toLowerCase().includes(searchTerm.toLowerCase());
  });
  
  // Get subject names for a student
  const getStudentSubjectNames = (studentId: number) => {
    if (!studentSubjects || !subjects) return [];
    
    const studentSubjectIds = studentSubjects
      .filter(ss => ss.userId === studentId)
      .map(ss => ss.subjectId);
    
    return subjects
      .filter(subject => studentSubjectIds.includes(subject.id))
      .map(subject => subject.name);
  };

  return (
    <AppLayout>
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-col md:flex-row justify-between md:items-center space-y-4 md:space-y-0">
            <div>
              <CardTitle>Students</CardTitle>
              <CardDescription>
                View and manage all students in the Bridges program
              </CardDescription>
            </div>
            <div className="flex space-x-4 items-center">
              <div className="relative w-60">
                <Input
                  type="text"
                  placeholder="Search students..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
                <i className="fas fa-search absolute left-2.5 top-3 text-apple-gray-400"></i>
              </div>
              <Button>
                <i className="fas fa-plus mr-1"></i> Add Student
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoadingStudents ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                {[1, 2, 3, 4, 5].map((i) => (
                  <Skeleton key={i} className="h-14 w-full" />
                ))}
              </div>
            ) : (
              <>
                {filteredStudents && filteredStudents.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Subjects</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredStudents.map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="font-medium">
                            {student.firstName} {student.lastName}
                          </TableCell>
                          <TableCell>{student.email}</TableCell>
                          <TableCell>
                            <div className="flex flex-wrap gap-1">
                              {getStudentSubjectNames(student.id).map((subject, index) => (
                                <Badge key={index} variant="outline">
                                  {subject}
                                </Badge>
                              ))}
                              {getStudentSubjectNames(student.id).length === 0 && (
                                <span className="text-apple-gray-500 text-sm">No subjects</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-apple-green text-white">Active</Badge>
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
                    <i className="fas fa-user-graduate text-4xl mb-3"></i>
                    <p className="text-lg">
                      {searchTerm
                        ? `No students found matching "${searchTerm}"`
                        : "No students have been added yet."}
                    </p>
                    {searchTerm && (
                      <Button variant="link" onClick={() => setSearchTerm("")}>
                        Clear Search
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
