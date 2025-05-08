import { useState, useEffect } from "react";
import { Meeting, User, Subject, formatTime, meetingTypeInfo } from "@/lib/types";
import { MeetingCard } from "./meeting-card";
import { useMeetingModal } from "@/lib/hooks/use-meeting-modal";
import { MeetingDetailsModal } from "@/components/modals/meeting-details-modal";
import React from 'react';
import { cn } from "@/lib/utils";

interface CalendarGridProps {
  meetings: Meeting[];
  students: User[];
  staff: User[];
  subjects: Subject[];
  startDate: Date;
  onMeetingClick?: (meeting: Meeting) => void;
}

interface InnerCalendarGridProps {
  days: Date[];
  renderDay: (day: Date) => React.ReactNode;
  className?: string;
}

export function CalendarGrid({
  meetings,
  students,
  staff,
  subjects,
  startDate,
  onMeetingClick,
}: CalendarGridProps) {
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [days, setDays] = useState<Date[]>([]);
  const { isOpen, meeting, student, staff: meetingStaff, subject, openModal, closeModal } = useMeetingModal();

  useEffect(() => {
    const slots = [];
    for (let hour = 8; hour <= 20; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    setTimeSlots(slots);
  }, []);

  useEffect(() => {
    const daysArray = [];
    const currentDate = new Date(startDate);

    const day = currentDate.getDay();
    const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1);
    currentDate.setDate(diff);

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

  const renderDay = (day: Date) => {
    return (
      <>
        {timeSlots.map((timeSlot, rowIndex) => {
          const slotMeetings = getMeetingsForSlot(timeSlot, day);
          return (
            <div key={`slot-${day.toISOString()}-${rowIndex}`} className="time-slot bg-white p-2 relative">
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
    );
  };


  return (
    <>
      <div className="overflow-x-auto">
        <InnerCalendarGrid days={days} renderDay={renderDay} />
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


function InnerCalendarGrid({ days, renderDay, className }: InnerCalendarGridProps) {
  return (
    <div className={cn("grid grid-cols-7 gap-1", className)}>
      {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
        <div key={day} className="text-center text-sm font-medium text-gray-500">
          {day}
        </div>
      ))}
      {days.map((day) => (
        <div key={day.toISOString()} className="aspect-square p-1">
          {renderDay(day)}
        </div>
      ))}
    </div>
  );
}