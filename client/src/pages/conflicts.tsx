import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AppLayout } from "@/components/layout/app-layout";
import { Conflict, User, Meeting, formatDate } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ConflictCard } from "@/components/ui/conflict-card";
import { ConfirmModal } from "@/components/modals/confirm-modal";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Conflicts() {
  const { toast } = useToast();
  const [selectedTab, setSelectedTab] = useState<string>("open");
  const [priorityFilter, setPriorityFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState<boolean>(false);
  const [isResolveModalOpen, setIsResolveModalOpen] = useState<boolean>(false);
  const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    description: "",
    priority: "medium",
    relatedUserId: "",
    relatedMeetingId: "",
  });
  
  // Fetch conflicts
  const { data: conflicts, isLoading: isLoadingConflicts } = useQuery<Conflict[]>({
    queryKey: ['/api/conflicts'],
  });
  
  // Fetch users
  const { data: students } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'STUDENT' }],
  });
  
  const { data: allStaff } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'STUDENT_STAFF' }],
  });
  
  const { data: professionalStaff } = useQuery<User[]>({
    queryKey: ['/api/users', { role: 'PROFESSIONAL_STAFF' }],
  });
  
  // Fetch meetings
  const { data: meetings } = useQuery<Meeting[]>({
    queryKey: ['/api/meetings'],
  });
  
  const isLoading = isLoadingConflicts;
  
  // Combine all staff
  const allUsers = [
    ...(students || []),
    ...(allStaff || []),
    ...(professionalStaff || [])
  ];
  
  // Filter conflicts
  const filteredConflicts = conflicts?.filter(conflict => {
    // Filter by tab (open/resolved)
    const matchesStatus = selectedTab === 'open' 
      ? conflict.status === 'open' 
      : conflict.status === 'resolved';
    
    // Filter by priority if set
    const matchesPriority = priorityFilter 
      ? conflict.priority === priorityFilter 
      : true;
    
    // Filter by search term in description
    const matchesSearch = searchTerm
      ? conflict.description.toLowerCase().includes(searchTerm.toLowerCase())
      : true;
    
    return matchesStatus && matchesPriority && matchesSearch;
  });
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Submit new conflict report
  const handleSubmitConflict = async () => {
    try {
      const payload = {
        description: formData.description,
        priority: formData.priority,
        relatedUserId: formData.relatedUserId ? parseInt(formData.relatedUserId) : undefined,
        relatedMeetingId: formData.relatedMeetingId ? parseInt(formData.relatedMeetingId) : undefined,
        reportedById: 1, // Admin for now
        status: "open"
      };
      
      await apiRequest('POST', '/api/conflicts', payload);
      
      // Reset form and refresh data
      setFormData({
        description: "",
        priority: "medium",
        relatedUserId: "",
        relatedMeetingId: "",
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/conflicts'] });
      
      toast({
        title: "Conflict Reported",
        description: "The conflict has been successfully reported.",
      });
      
    } catch (error) {
      console.error("Failed to report conflict:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to report the conflict. Please try again.",
      });
    }
  };
  
  // Handle conflict assignment
  const handleAssignConflict = async (userId: string) => {
    if (!selectedConflict) return;
    
    try {
      await apiRequest('PUT', `/api/conflicts/${selectedConflict.id}`, {
        assignedToId: parseInt(userId),
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/conflicts'] });
      setIsAssignModalOpen(false);
      setSelectedConflict(null);
      
      toast({
        title: "Conflict Assigned",
        description: "The conflict has been successfully assigned.",
      });
      
    } catch (error) {
      console.error("Failed to assign conflict:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to assign the conflict. Please try again.",
      });
    }
  };
  
  // Handle conflict resolution
  const handleResolveConflict = async () => {
    if (!selectedConflict) return;
    
    try {
      await apiRequest('POST', `/api/conflicts/${selectedConflict.id}/resolve`, {
        resolvedById: 1, // Admin for now
      });
      
      queryClient.invalidateQueries({ queryKey: ['/api/conflicts'] });
      setIsResolveModalOpen(false);
      setSelectedConflict(null);
      
      toast({
        title: "Conflict Resolved",
        description: "The conflict has been successfully resolved.",
      });
      
    } catch (error) {
      console.error("Failed to resolve conflict:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to resolve the conflict. Please try again.",
      });
    }
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
                    <CardTitle>Conflicts</CardTitle>
                    <CardDescription>
                      Track and resolve scheduling conflicts
                    </CardDescription>
                  </div>
                  <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full md:w-auto">
                    <TabsList>
                      <TabsTrigger value="open">Open</TabsTrigger>
                      <TabsTrigger value="resolved">Resolved</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
                  <div className="relative flex-1">
                    <Input
                      type="text"
                      placeholder="Search conflicts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                    <i className="fas fa-search absolute left-2.5 top-3 text-apple-gray-400"></i>
                  </div>
                  <div className="flex space-x-4">
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={() => setIsReportModalOpen(true)}>
                      <i className="fas fa-plus mr-2"></i> Report Conflict
                    </Button>
                  </div>
                </div>
                
                {isLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : (
                  <>
                    {filteredConflicts && filteredConflicts.length > 0 ? (
                      <div className="space-y-4">
                        {filteredConflicts.map(conflict => {
                          const relatedUser = allUsers.find(user => user.id === conflict.relatedUserId);
                          const assignedTo = allUsers.find(user => user.id === conflict.assignedToId);
                          
                          return (
                            <ConflictCard
                              key={conflict.id}
                              conflict={conflict}
                              relatedUser={relatedUser}
                              assignedTo={assignedTo}
                              onResolve={() => {
                                setSelectedConflict(conflict);
                                setIsResolveModalOpen(true);
                              }}
                              onAssign={() => {
                                setSelectedConflict(conflict);
                                setIsAssignModalOpen(true);
                              }}
                            />
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-20 text-center text-apple-gray-600">
                        <i className="fas fa-check-circle text-4xl mb-3 text-apple-green"></i>
                        <p className="text-lg">
                          {selectedTab === 'open'
                            ? 'No open conflicts found.'
                            : 'No resolved conflicts found.'}
                        </p>
                        {(searchTerm || priorityFilter) && (
                          <Button 
                            variant="link" 
                            onClick={() => {
                              setSearchTerm("");
                              setPriorityFilter("");
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
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Conflict Resolution Guide</CardTitle>
                <CardDescription>Steps to effectively manage conflicts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="border rounded-md p-3 bg-apple-gray-50">
                  <div className="flex items-center mb-2">
                    <Badge className="bg-apple-blue">Step 1</Badge>
                  </div>
                  <h4 className="font-medium mb-1">Identify the Issue</h4>
                  <p className="text-sm text-apple-gray-600">
                    Clarify what type of conflict it is and who is affected.
                  </p>
                </div>
                
                <div className="border rounded-md p-3 bg-apple-gray-50">
                  <div className="flex items-center mb-2">
                    <Badge className="bg-apple-blue">Step 2</Badge>
                  </div>
                  <h4 className="font-medium mb-1">Assign Responsibility</h4>
                  <p className="text-sm text-apple-gray-600">
                    Delegate the conflict to the appropriate staff member for resolution.
                  </p>
                </div>
                
                <div className="border rounded-md p-3 bg-apple-gray-50">
                  <div className="flex items-center mb-2">
                    <Badge className="bg-apple-blue">Step 3</Badge>
                  </div>
                  <h4 className="font-medium mb-1">Review Options</h4>
                  <p className="text-sm text-apple-gray-600">
                    Consider alternative times, locations, or staff members.
                  </p>
                </div>
                
                <div className="border rounded-md p-3 bg-apple-gray-50">
                  <div className="flex items-center mb-2">
                    <Badge className="bg-apple-blue">Step 4</Badge>
                  </div>
                  <h4 className="font-medium mb-1">Implement Solution</h4>
                  <p className="text-sm text-apple-gray-600">
                    Make necessary adjustments to schedules and inform all parties.
                  </p>
                </div>
                
                <div className="border rounded-md p-3 bg-apple-gray-50">
                  <div className="flex items-center mb-2">
                    <Badge className="bg-apple-blue">Step 5</Badge>
                  </div>
                  <h4 className="font-medium mb-1">Document Resolution</h4>
                  <p className="text-sm text-apple-gray-600">
                    Mark the conflict as resolved and record the solution.
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Conflict Statistics</CardTitle>
                <CardDescription>Current conflict status overview</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-40 w-full" />
                ) : (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-md p-4 text-center">
                        <div className="text-3xl font-bold text-apple-red">
                          {conflicts?.filter(c => c.status === 'open').length || 0}
                        </div>
                        <div className="text-sm text-apple-gray-600">Open Conflicts</div>
                      </div>
                      <div className="border rounded-md p-4 text-center">
                        <div className="text-3xl font-bold text-apple-green">
                          {conflicts?.filter(c => c.status === 'resolved').length || 0}
                        </div>
                        <div className="text-sm text-apple-gray-600">Resolved</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">High Priority</span>
                          <span>
                            {conflicts?.filter(c => c.priority === 'high' && c.status === 'open').length || 0}
                          </span>
                        </div>
                        <div className="h-2 bg-apple-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-apple-red rounded-full"
                            style={{ 
                              width: `${conflicts 
                                ? (conflicts.filter(c => c.priority === 'high' && c.status === 'open').length / 
                                  Math.max(conflicts.filter(c => c.status === 'open').length, 1)) * 100
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Medium Priority</span>
                          <span>
                            {conflicts?.filter(c => c.priority === 'medium' && c.status === 'open').length || 0}
                          </span>
                        </div>
                        <div className="h-2 bg-apple-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-apple-orange rounded-full"
                            style={{ 
                              width: `${conflicts 
                                ? (conflicts.filter(c => c.priority === 'medium' && c.status === 'open').length / 
                                  Math.max(conflicts.filter(c => c.status === 'open').length, 1)) * 100
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium">Low Priority</span>
                          <span>
                            {conflicts?.filter(c => c.priority === 'low' && c.status === 'open').length || 0}
                          </span>
                        </div>
                        <div className="h-2 bg-apple-gray-200 rounded-full">
                          <div 
                            className="h-2 bg-apple-gray-600 rounded-full"
                            style={{ 
                              width: `${conflicts 
                                ? (conflicts.filter(c => c.priority === 'low' && c.status === 'open').length / 
                                  Math.max(conflicts.filter(c => c.status === 'open').length, 1)) * 100
                                : 0}%` 
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      {/* Report Conflict Modal */}
      <ConfirmModal
        isOpen={isReportModalOpen}
        title="Report Conflict"
        description="Please provide details about the conflict."
        onConfirm={handleSubmitConflict}
        onCancel={() => setIsReportModalOpen(false)}
        confirmText="Submit"
        cancelText="Cancel"
      >
        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              placeholder="Describe the conflict..."
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="priority">Priority</Label>
            <Select
              name="priority"
              value={formData.priority}
              onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}
            >
              <SelectTrigger id="priority">
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="relatedUserId">Related User (Optional)</Label>
            <Select
              name="relatedUserId"
              value={formData.relatedUserId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, relatedUserId: value }))}
            >
              <SelectTrigger id="relatedUserId">
                <SelectValue placeholder="Select user (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {allUsers?.map(user => (
                  <SelectItem key={user.id} value={user.id.toString()}>
                    {user.firstName} {user.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="relatedMeetingId">Related Meeting (Optional)</Label>
            <Select
              name="relatedMeetingId"
              value={formData.relatedMeetingId}
              onValueChange={(value) => setFormData(prev => ({ ...prev, relatedMeetingId: value }))}
            >
              <SelectTrigger id="relatedMeetingId">
                <SelectValue placeholder="Select meeting (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">None</SelectItem>
                {meetings?.map(meeting => {
                  const student = allUsers?.find(user => user.id === meeting.studentId);
                  const staff = allUsers?.find(user => user.id === meeting.staffId);
                  
                  return (
                    <SelectItem key={meeting.id} value={meeting.id.toString()}>
                      {formatDate(meeting.date)}: {student?.firstName} & {staff?.firstName}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ConfirmModal>
      
      {/* Assign Conflict Modal */}
      <ConfirmModal
        isOpen={isAssignModalOpen}
        title="Assign Conflict"
        description="Select a staff member to handle this conflict."
        onConfirm={() => {}} // This is handled by the select's onValueChange
        onCancel={() => {
          setIsAssignModalOpen(false);
          setSelectedConflict(null);
        }}
        confirmText=""
        cancelText="Cancel"
        hideConfirmButton={true}
      >
        <div className="space-y-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="assignedStaff">Assign To</Label>
            <Select
              name="assignedStaff"
              onValueChange={handleAssignConflict}
            >
              <SelectTrigger id="assignedStaff">
                <SelectValue placeholder="Select staff member" />
              </SelectTrigger>
              <SelectContent>
                {[...(allStaff || []), ...(professionalStaff || [])].map(staff => (
                  <SelectItem key={staff.id} value={staff.id.toString()}>
                    {staff.firstName} {staff.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ConfirmModal>
      
      {/* Resolve Conflict Modal */}
      <ConfirmModal
        isOpen={isResolveModalOpen}
        title="Resolve Conflict"
        description="Are you sure you want to mark this conflict as resolved?"
        onConfirm={handleResolveConflict}
        onCancel={() => {
          setIsResolveModalOpen(false);
          setSelectedConflict(null);
        }}
        confirmText="Resolve"
        cancelText="Cancel"
      />
    </AppLayout>
  );
}
