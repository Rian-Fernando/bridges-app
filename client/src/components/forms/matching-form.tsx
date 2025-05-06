import { useState, useEffect } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { User, Subject, MeetingType, meetingTypeInfo } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { Input } from "../ui/input";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "../ui/skeleton";
import { findMatchingStaff, timeToMinutes, minutesToTime } from "@/lib/utils/meeting-utils";

// Define the form schema
const matchingSchema = z.object({
  studentId: z.number(),
  staffId: z.number(),
  meetingType: z.string(),
  subjectId: z.number().optional(),
  date: z.date(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/),
  location: z.string().optional(),
  isVirtual: z.boolean().default(false),
  notes: z.string().optional(),
}).refine(data => {
  const start = timeToMinutes(data.startTime);
  const end = timeToMinutes(data.endTime);
  return end > start;
}, {
  message: "End time must be after start time",
  path: ["endTime"],
});

interface MatchingFormProps {
  students: User[];
  staff: User[];
  subjects: Subject[];
  onSuccess?: () => void;
}

export function MatchingForm({ students, staff, subjects, onSuccess }: MatchingFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filteredStaff, setFilteredStaff] = useState<User[]>([]);
  const [selectedStudentIsRemote, setSelectedStudentIsRemote] = useState(false);
  const [selectedStaffIsRemote, setSelectedStaffIsRemote] = useState(false);
  
  // Fetch data for matching
  const { data: studentSubjects } = useQuery({
    queryKey: ['/api/student-subjects'],
  });
  
  const { data: staffExpertise } = useQuery({
    queryKey: ['/api/staff-expertise'],
  });
  
  // Form default values
  const form = useForm<z.infer<typeof matchingSchema>>({
    resolver: zodResolver(matchingSchema),
    defaultValues: {
      studentId: 0,
      staffId: 0,
      meetingType: "LEARNING_STRATEGIST",
      date: new Date(),
      startTime: "09:00",
      endTime: "10:00",
      isVirtual: false,
      location: "",
      notes: "",
    },
  });
  
  // Get current form values
  const watchStudentId = form.watch("studentId");
  const watchStaffId = form.watch("staffId");
  const watchMeetingType = form.watch("meetingType");
  const watchSubjectId = form.watch("subjectId");
  const watchIsVirtual = form.watch("isVirtual");
  
  // Set location to "Virtual" when isVirtual is checked
  useEffect(() => {
    if (watchIsVirtual) {
      form.setValue("location", "Virtual");
    } else if (form.getValues("location") === "Virtual") {
      form.setValue("location", "");
    }
  }, [watchIsVirtual, form]);
  
  // Update staff list when student changes
  useEffect(() => {
    if (!watchStudentId || watchStudentId === 0) {
      setFilteredStaff(staff);
      return;
    }
    
    // Update student remote status
    const selectedStudent = students.find(s => s.id === watchStudentId);
    setSelectedStudentIsRemote(selectedStudent?.isRemote || false);
    
    // Filter staff based on student's subjects
    if (studentSubjects && staffExpertise) {
      const matching = findMatchingStaff(
        watchStudentId,
        watchSubjectId,
        staff,
        studentSubjects,
        staffExpertise
      );
      setFilteredStaff(matching.length > 0 ? matching : staff);
    } else {
      setFilteredStaff(staff);
    }
  }, [watchStudentId, watchSubjectId, staff, students, studentSubjects, staffExpertise]);
  
  // Update staff remote status when staff changes
  useEffect(() => {
    if (!watchStaffId || watchStaffId === 0) return;
    
    const selectedStaff = staff.find(s => s.id === watchStaffId);
    setSelectedStaffIsRemote(selectedStaff?.isRemote || false);
    
    // If staff is remote, automatically set meeting to virtual
    if (selectedStaff?.isRemote) {
      form.setValue("isVirtual", true);
    }
  }, [watchStaffId, staff, form]);
  
  // Check if both student or staff are remote, force virtual
  useEffect(() => {
    if (selectedStudentIsRemote || selectedStaffIsRemote) {
      form.setValue("isVirtual", true);
    }
  }, [selectedStudentIsRemote, selectedStaffIsRemote, form]);
  
  const onSubmit = async (data: z.infer<typeof matchingSchema>) => {
    setIsSubmitting(true);
    try {
      // Format the meeting data
      const meetingData = {
        studentId: data.studentId,
        staffId: data.staffId,
        meetingType: data.meetingType,
        subjectId: data.subjectId,
        date: data.date.toISOString(),
        startTime: data.startTime,
        endTime: data.endTime,
        location: data.location || (data.isVirtual ? "Virtual" : "TBD"),
        isVirtual: data.isVirtual,
        notes: data.notes || "",
        status: "scheduled"
      };
      
      await apiRequest('POST', '/api/meetings', meetingData);
      
      toast({
        title: "Meeting Scheduled",
        description: "The meeting has been successfully scheduled.",
      });
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      form.reset({
        studentId: 0,
        staffId: 0,
        meetingType: "LEARNING_STRATEGIST",
        date: new Date(),
        startTime: "09:00",
        endTime: "10:00",
        isVirtual: false,
        location: "",
        notes: "",
      });
    } catch (error) {
      console.error("Failed to schedule meeting:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to schedule meeting. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Student Selection */}
            <FormField
              control={form.control}
              name="studentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value ? field.value.toString() : "0"}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0" disabled>Select a student</SelectItem>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.firstName} {student.lastName} 
                          {student.isRemote ? " (Remote)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Staff Selection */}
            <FormField
              control={form.control}
              name="staffId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Staff</FormLabel>
                  {!studentSubjects || !staffExpertise ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <Select
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value ? field.value.toString() : "0"}
                      disabled={!watchStudentId || watchStudentId === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a staff member" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="0" disabled>Select a staff member</SelectItem>
                        {filteredStaff.map((staffMember) => (
                          <SelectItem key={staffMember.id} value={staffMember.id.toString()}>
                            {staffMember.firstName} {staffMember.lastName} 
                            {staffMember.isRemote ? " (Remote)" : ""}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormDescription>
                    Staff are filtered based on subject expertise
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Meeting Type */}
            <FormField
              control={form.control}
              name="meetingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Meeting Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select meeting type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(meetingTypeInfo).map(([type, info]) => (
                        <SelectItem key={type} value={type}>
                          {info.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Subject */}
            <FormField
              control={form.control}
              name="subjectId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Subject (Optional)</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                    value={field.value?.toString() || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a subject" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No specific subject</SelectItem>
                      {subjects.map((subject) => (
                        <SelectItem key={subject.id} value={subject.id.toString()}>
                          {subject.name} ({subject.code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Date */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Pick a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Start Time */}
            <FormField
              control={form.control}
              name="startTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* End Time */}
            <FormField
              control={form.control}
              name="endTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Virtual Meeting */}
            <FormField
              control={form.control}
              name="isVirtual"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={selectedStudentIsRemote || selectedStaffIsRemote}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Virtual Meeting</FormLabel>
                    <FormDescription>
                      {selectedStudentIsRemote || selectedStaffIsRemote 
                        ? "Required as a participant is remote"
                        : "The meeting will be conducted online"}
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location {!watchIsVirtual && "(Optional)"}</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Room or building name" 
                      {...field} 
                      disabled={watchIsVirtual}
                    />
                  </FormControl>
                  <FormDescription>
                    {watchIsVirtual 
                      ? "Virtual meeting location is set automatically" 
                      : "Specify the meeting location if known"}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Notes */}
          <FormField
            control={form.control}
            name="notes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Add any relevant notes about the meeting"
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Scheduling..." : "Schedule Meeting"}
            </Button>
          </div>
        </form>
      </Form>
    </Card>
  );
}
