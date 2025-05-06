import { User, Meeting, Subject, Availability, MeetingType } from "@/lib/types";

/**
 * Checks if a given meeting time conflicts with existing meetings
 * for either the student or staff member
 */
export function checkMeetingConflict(
  newMeeting: {
    studentId: number;
    staffId: number;
    date: string;
    startTime: string;
    endTime: string;
  },
  existingMeetings: Meeting[]
): boolean {
  const newMeetingDate = new Date(newMeeting.date).toISOString().split('T')[0];
  
  // Filter meetings for the same day
  const sameDayMeetings = existingMeetings.filter(meeting => {
    const meetingDate = new Date(meeting.date).toISOString().split('T')[0];
    return (
      meetingDate === newMeetingDate &&
      (meeting.studentId === newMeeting.studentId || meeting.staffId === newMeeting.staffId)
    );
  });
  
  // Check for time conflicts
  return sameDayMeetings.some(meeting => {
    const newStart = timeToMinutes(newMeeting.startTime);
    const newEnd = timeToMinutes(newMeeting.endTime);
    const existingStart = timeToMinutes(meeting.startTime);
    const existingEnd = timeToMinutes(meeting.endTime);
    
    // Check if the new meeting overlaps with an existing meeting
    return (
      (newStart >= existingStart && newStart < existingEnd) ||
      (newEnd > existingStart && newEnd <= existingEnd) ||
      (newStart <= existingStart && newEnd >= existingEnd)
    );
  });
}

/**
 * Finds matching staff members for a student based on subject expertise and availability
 */
export function findMatchingStaff(
  studentId: number,
  subjectId: number | undefined,
  staffList: User[],
  studentSubjects: { userId: number, subjectId: number }[],
  staffExpertise: { userId: number, subjectId: number }[]
): User[] {
  // If no specific subject is provided, get all student's subjects
  const relevantSubjectIds = subjectId
    ? [subjectId]
    : studentSubjects
        .filter(ss => ss.userId === studentId)
        .map(ss => ss.subjectId);
  
  if (relevantSubjectIds.length === 0) {
    return staffList; // Return all staff if no subjects are found
  }
  
  // Find staff with matching expertise
  const matchingStaffIds = staffExpertise
    .filter(se => relevantSubjectIds.includes(se.subjectId))
    .map(se => se.userId);
  
  return staffList.filter(staff => matchingStaffIds.includes(staff.id));
}

/**
 * Finds available time slots when both student and staff are available
 */
export function findAvailableTimeSlots(
  studentId: number,
  staffId: number,
  studentAvailability: Availability[],
  staffAvailability: Availability[]
): { day: number, start: string, end: string, location?: string }[] {
  const availableSlots: { day: number, start: string, end: string, location?: string }[] = [];
  
  // Filter availability for the specific student and staff
  const studentSlots = studentAvailability.filter(a => a.userId === studentId);
  const staffSlots = staffAvailability.filter(a => a.userId === staffId);
  
  // For each day of the week
  for (let day = 0; day < 7; day++) {
    const studentDaySlots = studentSlots.filter(slot => slot.dayOfWeek === day);
    const staffDaySlots = staffSlots.filter(slot => slot.dayOfWeek === day);
    
    // Find overlapping time slots
    for (const studentSlot of studentDaySlots) {
      for (const staffSlot of staffDaySlots) {
        // Convert times to minutes for easier comparison
        const studentStart = timeToMinutes(studentSlot.startTime);
        const studentEnd = timeToMinutes(studentSlot.endTime);
        const staffStart = timeToMinutes(staffSlot.startTime);
        const staffEnd = timeToMinutes(staffSlot.endTime);
        
        // Find overlap
        const overlapStart = Math.max(studentStart, staffStart);
        const overlapEnd = Math.min(studentEnd, staffEnd);
        
        // If there's an overlap of at least 30 minutes
        if (overlapEnd - overlapStart >= 30) {
          // Prefer staff location if available
          const location = staffSlot.location || studentSlot.location;
          
          availableSlots.push({
            day,
            start: minutesToTime(overlapStart),
            end: minutesToTime(overlapEnd),
            location
          });
        }
      }
    }
  }
  
  return availableSlots;
}

/**
 * Suggests the best meeting type based on student needs and staff expertise
 */
export function suggestMeetingType(
  studentId: number,
  staffId: number,
  studentSubjects: { userId: number, subjectId: number, priorityLevel: number }[],
  staffExpertise: { userId: number, subjectId: number, proficiencyLevel: number }[]
): MeetingType {
  // Get student subjects sorted by priority
  const subjects = studentSubjects
    .filter(ss => ss.userId === studentId)
    .sort((a, b) => b.priorityLevel - a.priorityLevel);
  
  // Get staff expertise
  const expertise = staffExpertise.filter(se => se.userId === staffId);
  
  // If student has high priority academic subjects and staff has matching expertise
  if (subjects.length > 0 && expertise.some(e => e.subjectId === subjects[0].subjectId)) {
    // If staff proficiency is high in the subject
    const subjectExpertise = expertise.find(e => e.subjectId === subjects[0].subjectId);
    if (subjectExpertise && subjectExpertise.proficiencyLevel >= 4) {
      return 'LEARNING_STRATEGIST';
    } else {
      return 'ACADEMIC_COACH';
    }
  }
  
  // Default to COMBO meeting if no specific subject match is found
  return 'COMBO';
}

/**
 * Determines the most suitable location for a meeting
 */
export function determineMeetingLocation(
  student: User,
  staff: User,
  studentAvailability: Availability[],
  staffAvailability: Availability[]
): { location: string, isVirtual: boolean } {
  // If staff is remote, meeting should be virtual
  if (staff.isRemote) {
    return { location: "Virtual", isVirtual: true };
  }
  
  // If student is remote, meeting should be virtual
  if (student.isRemote) {
    return { location: "Virtual", isVirtual: true };
  }
  
  // Otherwise, prefer staff's location if available
  const staffLocations = staffAvailability
    .filter(a => a.userId === staff.id && a.location)
    .map(a => a.location);
  
  if (staffLocations.length > 0) {
    return { location: staffLocations[0], isVirtual: false };
  }
  
  // Fall back to student's location if available
  const studentLocations = studentAvailability
    .filter(a => a.userId === student.id && a.location)
    .map(a => a.location);
  
  if (studentLocations.length > 0) {
    return { location: studentLocations[0], isVirtual: false };
  }
  
  // Default to TBD if no locations are specified
  return { location: "TBD", isVirtual: false };
}

/**
 * Utility function to convert time string to minutes
 */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

/**
 * Utility function to convert minutes to time string
 */
export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
