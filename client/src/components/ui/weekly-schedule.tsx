import { useState, useEffect } from "react";
import { Meeting, User, Subject, formatTime, meetingTypeInfo } from "@/lib/types";
import { MeetingCard } from "./meeting-card";
import { useMeetingModal } from "@/lib/hooks/use-meeting-modal";
import { MeetingDetailsModal } from "@/components/modals/meeting-details-modal";
import { Button } from "./button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";

interface WeeklyScheduleProps {
  meetings: Meeting[];
  students: User[];
  staff: User[];
  subjects: Subject[];
  initialDate?: Date;
  onMeetingClick?: (meeting: Meeting) => void;
}

export function WeeklySchedule({ 
  meetings, 
  students, 
  staff, 
  subjects, 
  initialDate,
  onMeetingClick 
}: WeeklyScheduleProps) {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate || new Date());
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [days, setDays] = useState<Date[]>([]);
  const [viewType, setViewType] = useState<'week' | 'day'>('week');
  const [selectedDay, setSelectedDay] = useState<number>(0); // 0-6 for Sunday-Saturday
  
  const { 
    isOpen, 
    meeting, 
    student, 
    staff: meetingStaff, 
    subject, 
    openModal, 
    closeModal 
  } = useMeetingModal();

  // Generate time slots from 8:00 AM to 8:00 PM
  useEffect(() => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    setTimeSlots(slots);
  }, []);

  // Generate days of the week
  useEffect(() => {
    const daysArray = [];
    const startDate = new Date(currentDate);
    
    // Find the Monday of the current week
    const day = startDate.getDay();
    const diff = startDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    startDate.setDate(diff);
    
    // Add Monday to Friday
    for (let i = 0; i < 5; i++) {
      daysArray.push(new Date(new Date(startDate).setDate(startDate.getDate() + i)));
    }
    
    setDays(daysArray);
  }, [currentDate]);

  const handleMeetingClick = (meeting: Meeting) => {
    const meetingStudent = students.find(s => s.id === meeting.studentId);
    const meetingStaff = staff.find(s => s.id === meeting.staffId);
    const meetingSubject = meeting.subjectId 
      ? subjects.find(s => s.id === meeting.subjectId) 
      : undefined;
    
    openModal(meeting, meetingStudent, meetingStaff, meetingSubject);
    
    if (onMeetingClick) {
      onMeetingClick(meeting);
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

  // Filter meetings for a specific timeslot and day
  const getMeetingsForSlot = (timeSlot: string, date: Date) => {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.date);
      const isSameDay = meetingDate.getDate() === date.getDate() &&
                      meetingDate.getMonth() === date.getMonth() &&
                      meetingDate.getFullYear() === date.getFullYear();
      
      const meetingStart = meeting.startTime;
      return isSameDay && meetingStart === timeSlot;
    });
  };

  // Get visible days based on view type
  const visibleDays = viewType === 'week' 
    ? days 
    : [days[selectedDay]];

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
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
        <div className="flex space-x-2 items-center">
          <Select 
            value={viewType} 
            onValueChange={(value) => setViewType(value as 'week' | 'day')}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="View" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week View</SelectItem>
              <SelectItem value="day">Day View</SelectItem>
            </SelectContent>
          </Select>
          
          {viewType === 'day' && (
            <Select 
              value={selectedDay.toString()} 
              onValueChange={(value) => setSelectedDay(parseInt(value))}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Select day" />
              </SelectTrigger>
              <SelectContent>
                {days.map((day, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {day.toLocaleDateString('en-US', { weekday: 'long' })}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <div 
          className="min-w-max" 
          style={{ 
            display: 'grid',
            gridTemplateColumns: `80px repeat(${visibleDays.length}, 1fr)`,
            gap: '1px'
          }}
        >
          {/* Calendar header */}
          <div className="sticky top-0 z-10 bg-apple-gray-100 font-medium border-b border-apple-gray-200 p-3">
            Time
          </div>
          
          {visibleDays.map((day, index) => (
            <div key={index} className="sticky top-0 z-10 bg-apple-gray-100 font-medium border-b border-apple-gray-200 p-3 text-center">
              {day.toLocaleDateString('en-US', { weekday: 'long' })}<br/>
              <span className="text-sm text-apple-gray-600">
                {day.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          ))}
          
          {/* Calendar time slots */}
          {timeSlots.map((timeSlot, rowIndex) => (
            <>
              <div key={`time-${rowIndex}`} className="time-slot flex items-center justify-center bg-apple-gray-50 border-r border-apple-gray-200 p-2 text-sm text-apple-gray-600">
                {formatTime(timeSlot)}
              </div>
              
              {visibleDays.map((day, colIndex) => {
                const slotMeetings = getMeetingsForSlot(timeSlot, day);
                
                return (
                  <div 
                    key={`slot-${rowIndex}-${colIndex}`} 
                    className="time-slot bg-white p-2 relative"
                  >
                    {slotMeetings.map((slotMeeting, meetingIndex) => {
                      const meetingStudent = students.find(s => s.id === slotMeeting.studentId);
                      const meetingStaff = staff.find(s => s.id === slotMeeting.staffId);
                      const meetingSubject = slotMeeting.subjectId 
                        ? subjects.find(s => s.id === slotMeeting.subjectId) 
                        : undefined;
                      
                      return (
                        <MeetingCard
                          key={`meeting-${meetingIndex}`}
                          meeting={slotMeeting}
                          student={meetingStudent}
                          staff={meetingStaff}
                          subject={meetingSubject}
                          onClick={() => handleMeetingClick(slotMeeting)}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </>
          ))}
        </div>
      </div>
      
      <MeetingDetailsModal
        isOpen={isOpen}
        meeting={meeting}
        student={student}
        staff={meetingStaff}
        subject={subject}
        onClose={closeModal}
      />
    </div>
  );
}
