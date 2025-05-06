// Types for the frontend components

export type MeetingType = 'LEARNING_STRATEGIST' | 'COMBO' | 'VOCATIONAL_COACH' | 'SOCIAL_COACH' | 'ACADEMIC_COACH' | 'CHECK_IN';
export type UserRole = 'STUDENT' | 'STUDENT_STAFF' | 'PROFESSIONAL_STAFF' | 'ADMIN';
export type ConflictPriority = 'high' | 'medium' | 'low';
export type ConflictStatus = 'open' | 'resolved';
export type ActivityType = 'meeting_scheduled' | 'user_added' | 'meeting_updated' | 'meeting_deleted' | 'conflict_reported' | 'conflict_resolved';

export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isRemote: boolean;
  createdAt: string; // ISO date string
}

export interface Subject {
  id: number;
  name: string;
  code: string;
}

export interface StaffExpertise {
  id: number;
  userId: number;
  subjectId: number;
  proficiencyLevel: number;
}

export interface StudentSubject {
  id: number;
  userId: number;
  subjectId: number;
  priorityLevel: number;
}

export interface Availability {
  id: number;
  userId: number;
  dayOfWeek: number; // 0-6 (Sunday to Saturday)
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  isRecurring: boolean;
  location: string;
}

export interface Meeting {
  id: number;
  studentId: number;
  staffId: number;
  meetingType: MeetingType;
  subjectId?: number;
  date: string; // ISO date string
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  location: string;
  isVirtual: boolean;
  notes: string;
  status: 'scheduled' | 'cancelled' | 'completed';
}

export interface Conflict {
  id: number;
  relatedUserId?: number;
  relatedMeetingId?: number;
  description: string;
  priority: ConflictPriority;
  status: ConflictStatus;
  assignedToId?: number;
  reportedById?: number;
  createdAt: string; // ISO date string
  resolvedAt?: string; // ISO date string
}

export interface Activity {
  id: number;
  userId?: number;
  activityType: ActivityType;
  description: string;
  metadata: string; // JSON string
  createdAt: string; // ISO date string
}

export interface Notification {
  id: number;
  userId: number;
  message: string;
  read: boolean;
  createdAt: string; // ISO date string
}

export interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change: {
    value: string | number;
    isPositive: boolean;
    text: string;
  };
}

export interface MeetingCardProps {
  meeting: Meeting;
  student?: User;
  staff?: User;
  subject?: Subject;
  onClick?: () => void;
}

export interface ConflictCardProps {
  conflict: Conflict;
  relatedUser?: User;
  assignedTo?: User;
  onResolve?: () => void;
  onAssign?: () => void;
}

export interface ActivityCardProps {
  activity: Activity;
  user?: User;
}

export interface MeetingDetailsModalProps {
  isOpen: boolean;
  meeting?: Meeting;
  student?: User;
  staff?: User;
  subject?: Subject;
  onClose: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onCancel?: () => void;
}

export interface TimeSlot {
  day: number;
  time: string;
  content?: React.ReactNode;
  onClick?: () => void;
}

// Form submission interfaces
export interface UserFormData {
  username: string;
  password: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isRemote: boolean;
}

export interface AvailabilityFormData {
  userId: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isRecurring: boolean;
  location: string;
}

export interface MeetingFormData {
  studentId: number;
  staffId: number;
  meetingType: MeetingType;
  subjectId?: number;
  date: Date;
  startTime: string;
  endTime: string;
  location: string;
  isVirtual: boolean;
  notes: string;
}

export interface ConflictFormData {
  relatedUserId?: number;
  relatedMeetingId?: number;
  description: string;
  priority: ConflictPriority;
  assignedToId?: number;
  reportedById?: number;
}

// Helper mapping for meeting types
export const meetingTypeInfo = {
  LEARNING_STRATEGIST: {
    label: 'Learning Strategist',
    shortLabel: 'LS',
    color: '#0066CC',
    bgColor: 'bg-apple-blue',
    borderColor: 'border-apple-blue',
    icon: 'fa-graduation-cap'
  },
  COMBO: {
    label: 'COMBO Meeting',
    shortLabel: 'COMBO',
    color: '#5E2612',
    bgColor: 'bg-adelphi-brown',
    borderColor: 'border-adelphi-brown',
    icon: 'fa-users'
  },
  VOCATIONAL_COACH: {
    label: 'Vocational Coach',
    shortLabel: 'VC',
    color: '#34C759',
    bgColor: 'bg-apple-green',
    borderColor: 'border-apple-green',
    icon: 'fa-briefcase'
  },
  SOCIAL_COACH: {
    label: 'Social Coach',
    shortLabel: 'SC',
    color: '#FF9500',
    bgColor: 'bg-apple-orange',
    borderColor: 'border-apple-orange',
    icon: 'fa-comments'
  },
  ACADEMIC_COACH: {
    label: 'Academic Coach',
    shortLabel: 'AC',
    color: '#5856D6',
    bgColor: 'bg-purple-500',
    borderColor: 'border-purple-500',
    icon: 'fa-book'
  },
  CHECK_IN: {
    label: 'Check-in',
    shortLabel: 'Check-in',
    color: '#FF3B30',
    bgColor: 'bg-apple-red',
    borderColor: 'border-apple-red',
    icon: 'fa-clipboard-check'
  }
};

// Helper mapping for days of week
export const daysOfWeek = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

// Helper for formatting dates
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper for formatting times
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, '0')} ${period}`;
};

// Helper for getting relative time (e.g., "3 hours ago")
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return 'just now';
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }
  
  if (diffInDays < 30) {
    const diffInWeeks = Math.floor(diffInDays / 7);
    return `${diffInWeeks} week${diffInWeeks > 1 ? 's' : ''} ago`;
  }
  
  return formatDate(dateString);
};
