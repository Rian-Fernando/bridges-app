import { useState, useEffect } from "react";
import { Meeting, User, Subject, formatTime, meetingTypeInfo } from "@/lib/types";
import { MeetingCard } from "./meeting-card";
import { useMeetingModal } from "@/lib/hooks/use-meeting-modal";
import { MeetingDetailsModal } from "@/components/modals/meeting-details-modal";

interface CalendarGridProps {
  meetings: Meeting[];
  students: User[];
  staff: User[];
  subjects: Subject[];
  startDate: Date;
  onMeetingClick?: (meeting: Meeting) => void;
}

export function CalendarGrid({ 
  meetings, 
  students, 
  staff, 
  subjects, 
  startDate, 
  onMeetingClick 
}: CalendarGridProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [days, setDays] = useState<Date[]>([]);
  const { isOpen, meeting, student, staff: meetingStaff, subject, openModal, closeModal } = useMeetingModal();

  // Generate time slots from 8:00 AM to 8:00 PM
  useEffect(() => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    setTimeSlots(slots);
  }, []);

  // Generate days of the week (Monday to Friday)
  useEffect(() => {
    const daysArray = [];
    const currentDate = new Date(startDate);
    
    // Find the Monday of the current week
    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    currentDate.setDate(diff);
    
    // Add Monday to Friday
    for (let i = 0; i < 5; i++) {
      daysArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    setDays(daysArray);
  }, [startDate]);

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

  return (
    <>
      <div className="overflow-x-auto">
        <div className="calendar-grid min-w-max">
          {/* Calendar header */}
          <div className="sticky top-0 z-10 bg-apple-gray-100 font-medium border-b border-apple-gray-200 p-3">
            Time
          </div>
          
          {days.map((day, index) => (
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
              
              {days.map((day, colIndex) => {
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
    </>
  );
}
