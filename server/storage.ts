import { 
  users, User, InsertUser,
  subjects, Subject, InsertSubject,
  staffExpertise, StaffExpertise, InsertStaffExpertise,
  studentSubjects, StudentSubject, InsertStudentSubject,
  availability, Availability, InsertAvailability,
  meetings, Meeting, InsertMeeting,
  conflicts, Conflict, InsertConflict,
  activities, Activity, InsertActivity,
  notifications, Notification, InsertNotification
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUsersByRole(role: string): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Subject operations
  getSubject(id: number): Promise<Subject | undefined>;
  getSubjects(): Promise<Subject[]>;
  createSubject(subject: InsertSubject): Promise<Subject>;
  
  // Staff expertise operations
  getStaffExpertise(id: number): Promise<StaffExpertise | undefined>;
  getStaffExpertiseByUser(userId: number): Promise<StaffExpertise[]>;
  createStaffExpertise(expertise: InsertStaffExpertise): Promise<StaffExpertise>;
  
  // Student subjects operations
  getStudentSubject(id: number): Promise<StudentSubject | undefined>;
  getStudentSubjectsByUser(userId: number): Promise<StudentSubject[]>;
  createStudentSubject(studentSubject: InsertStudentSubject): Promise<StudentSubject>;
  
  // Availability operations
  getAvailability(id: number): Promise<Availability | undefined>;
  getAvailabilitiesByUser(userId: number): Promise<Availability[]>;
  createAvailability(availability: InsertAvailability): Promise<Availability>;
  deleteAvailability(id: number): Promise<boolean>;
  
  // Meeting operations
  getMeeting(id: number): Promise<Meeting | undefined>;
  getMeetingsByStudent(studentId: number): Promise<Meeting[]>;
  getMeetingsByStaff(staffId: number): Promise<Meeting[]>;
  getMeetingsByDate(date: Date): Promise<Meeting[]>;
  createMeeting(meeting: InsertMeeting): Promise<Meeting>;
  updateMeeting(id: number, meetingData: Partial<InsertMeeting>): Promise<Meeting | undefined>;
  deleteMeeting(id: number): Promise<boolean>;
  
  // Conflict operations
  getConflict(id: number): Promise<Conflict | undefined>;
  getConflicts(status?: string): Promise<Conflict[]>;
  createConflict(conflict: InsertConflict): Promise<Conflict>;
  updateConflict(id: number, conflictData: Partial<InsertConflict>): Promise<Conflict | undefined>;
  resolveConflict(id: number, resolvedById: number): Promise<Conflict | undefined>;
  
  // Activity operations
  getActivity(id: number): Promise<Activity | undefined>;
  getRecentActivities(limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Notification operations
  getNotification(id: number): Promise<Notification | undefined>;
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<boolean>;
  
  // Matching algorithms
  findMatchingStaffForStudent(studentId: number, subjectId?: number): Promise<User[]>;
  findAvailableTimeslots(studentId: number, staffId: number): Promise<{day: number, start: string, end: string}[]>;
}

// In-memory storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private subjects: Map<number, Subject>;
  private staffExpertise: Map<number, StaffExpertise>;
  private studentSubjects: Map<number, StudentSubject>;
  private availability: Map<number, Availability>;
  private meetings: Map<number, Meeting>;
  private conflicts: Map<number, Conflict>;
  private activities: Map<number, Activity>;
  private notifications: Map<number, Notification>;
  
  private currentUserId: number;
  private currentSubjectId: number;
  private currentStaffExpertiseId: number;
  private currentStudentSubjectId: number;
  private currentAvailabilityId: number;
  private currentMeetingId: number;
  private currentConflictId: number;
  private currentActivityId: number;
  private currentNotificationId: number;

  constructor() {
    this.users = new Map();
    this.subjects = new Map();
    this.staffExpertise = new Map();
    this.studentSubjects = new Map();
    this.availability = new Map();
    this.meetings = new Map();
    this.conflicts = new Map();
    this.activities = new Map();
    this.notifications = new Map();
    
    this.currentUserId = 1;
    this.currentSubjectId = 1;
    this.currentStaffExpertiseId = 1;
    this.currentStudentSubjectId = 1;
    this.currentAvailabilityId = 1;
    this.currentMeetingId = 1;
    this.currentConflictId = 1;
    this.currentActivityId = 1;
    this.currentNotificationId = 1;
    
    // Initialize with sample data for development
    this.initSampleData();
  }

  private initSampleData() {
    // Add some initial users
    this.createUser({
      username: "admin",
      password: "password", // In production, this would be hashed
      firstName: "Sarah",
      lastName: "Thompson",
      email: "admin@bridges.adelphi.edu",
      role: "ADMIN",
      isRemote: false
    });
    
    // Create some subjects
    const subjects = [
      { name: "Mathematics", code: "MATH" },
      { name: "English", code: "ENGL" },
      { name: "Computer Science", code: "CS" },
      { name: "Biology", code: "BIO" },
      { name: "Psychology", code: "PSYCH" }
    ];
    
    subjects.forEach(subject => this.createSubject(subject));
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return Array.from(this.users.values()).filter(
      (user) => user.role === role
    );
  }

  async createUser(userData: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...userData, id, createdAt: new Date() };
    this.users.set(id, user);
    
    // Log activity
    this.createActivity({
      userId: id,
      activityType: "user_added",
      description: `${user.firstName} ${user.lastName} was added as a ${user.role.toLowerCase().replace('_', ' ')}`,
      metadata: JSON.stringify({
        userId: id,
        role: user.role,
      })
    });
    
    return user;
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Subject operations
  async getSubject(id: number): Promise<Subject | undefined> {
    return this.subjects.get(id);
  }

  async getSubjects(): Promise<Subject[]> {
    return Array.from(this.subjects.values());
  }

  async createSubject(subjectData: InsertSubject): Promise<Subject> {
    const id = this.currentSubjectId++;
    const subject: Subject = { ...subjectData, id };
    this.subjects.set(id, subject);
    return subject;
  }

  // Staff expertise operations
  async getStaffExpertise(id: number): Promise<StaffExpertise | undefined> {
    return this.staffExpertise.get(id);
  }

  async getStaffExpertiseByUser(userId: number): Promise<StaffExpertise[]> {
    return Array.from(this.staffExpertise.values()).filter(
      (expertise) => expertise.userId === userId
    );
  }

  async createStaffExpertise(expertiseData: InsertStaffExpertise): Promise<StaffExpertise> {
    const id = this.currentStaffExpertiseId++;
    const expertise: StaffExpertise = { ...expertiseData, id };
    this.staffExpertise.set(id, expertise);
    return expertise;
  }

  // Student subjects operations
  async getStudentSubject(id: number): Promise<StudentSubject | undefined> {
    return this.studentSubjects.get(id);
  }

  async getStudentSubjectsByUser(userId: number): Promise<StudentSubject[]> {
    return Array.from(this.studentSubjects.values()).filter(
      (studentSubject) => studentSubject.userId === userId
    );
  }

  async createStudentSubject(studentSubjectData: InsertStudentSubject): Promise<StudentSubject> {
    const id = this.currentStudentSubjectId++;
    const studentSubject: StudentSubject = { ...studentSubjectData, id };
    this.studentSubjects.set(id, studentSubject);
    return studentSubject;
  }

  // Availability operations
  async getAvailability(id: number): Promise<Availability | undefined> {
    return this.availability.get(id);
  }

  async getAvailabilitiesByUser(userId: number): Promise<Availability[]> {
    return Array.from(this.availability.values()).filter(
      (availability) => availability.userId === userId
    );
  }

  async createAvailability(availabilityData: InsertAvailability): Promise<Availability> {
    const id = this.currentAvailabilityId++;
    const newAvailability: Availability = { ...availabilityData, id };
    this.availability.set(id, newAvailability);
    return newAvailability;
  }

  async deleteAvailability(id: number): Promise<boolean> {
    return this.availability.delete(id);
  }

  // Meeting operations
  async getMeeting(id: number): Promise<Meeting | undefined> {
    return this.meetings.get(id);
  }

  async getMeetingsByStudent(studentId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(
      (meeting) => meeting.studentId === studentId
    );
  }

  async getMeetingsByStaff(staffId: number): Promise<Meeting[]> {
    return Array.from(this.meetings.values()).filter(
      (meeting) => meeting.staffId === staffId
    );
  }

  async getMeetingsByDate(date: Date): Promise<Meeting[]> {
    const dateString = date.toISOString().split('T')[0];
    return Array.from(this.meetings.values()).filter(meeting => {
      const meetingDate = new Date(meeting.date).toISOString().split('T')[0];
      return meetingDate === dateString;
    });
  }

  async createMeeting(meetingData: InsertMeeting): Promise<Meeting> {
    const id = this.currentMeetingId++;
    const meeting: Meeting = { ...meetingData, id };
    this.meetings.set(id, meeting);
    
    // Log activity
    const student = await this.getUser(meeting.studentId);
    const staff = await this.getUser(meeting.staffId);
    const meetingTypeName = meeting.meetingType.replace('_', ' ').toLowerCase();
    
    if (student && staff) {
      this.createActivity({
        userId: 1, // Admin user
        activityType: "meeting_scheduled",
        description: `New ${meetingTypeName} meeting scheduled for ${student.firstName} ${student.lastName} with ${staff.firstName} ${staff.lastName}`,
        metadata: JSON.stringify({
          meetingId: id,
          meetingType: meeting.meetingType,
          studentId: meeting.studentId,
          staffId: meeting.staffId,
          date: meeting.date,
        })
      });
    }
    
    return meeting;
  }

  async updateMeeting(id: number, meetingData: Partial<InsertMeeting>): Promise<Meeting | undefined> {
    const meeting = this.meetings.get(id);
    if (!meeting) return undefined;
    
    const updatedMeeting = { ...meeting, ...meetingData };
    this.meetings.set(id, updatedMeeting);
    
    // Log activity
    this.createActivity({
      userId: 1, // Admin user
      activityType: "meeting_updated",
      description: `Meeting #${id} was updated`,
      metadata: JSON.stringify({
        meetingId: id,
        updates: meetingData,
      })
    });
    
    return updatedMeeting;
  }

  async deleteMeeting(id: number): Promise<boolean> {
    const meeting = this.meetings.get(id);
    if (!meeting) return false;
    
    const deleted = this.meetings.delete(id);
    
    if (deleted) {
      // Log activity
      this.createActivity({
        userId: 1, // Admin user
        activityType: "meeting_deleted",
        description: `Meeting #${id} was deleted`,
        metadata: JSON.stringify({
          meetingId: id,
          meetingType: meeting.meetingType,
          studentId: meeting.studentId,
          staffId: meeting.staffId,
        })
      });
    }
    
    return deleted;
  }

  // Conflict operations
  async getConflict(id: number): Promise<Conflict | undefined> {
    return this.conflicts.get(id);
  }

  async getConflicts(status?: string): Promise<Conflict[]> {
    let conflicts = Array.from(this.conflicts.values());
    if (status) {
      conflicts = conflicts.filter(conflict => conflict.status === status);
    }
    return conflicts;
  }

  async createConflict(conflictData: InsertConflict): Promise<Conflict> {
    const id = this.currentConflictId++;
    const conflict: Conflict = { 
      ...conflictData, 
      id,
      createdAt: new Date(),
      resolvedAt: null
    };
    this.conflicts.set(id, conflict);
    
    // Log activity
    this.createActivity({
      userId: conflictData.reportedById || 1,
      activityType: "conflict_reported",
      description: `New ${conflictData.priority} priority conflict reported: ${conflictData.description.substring(0, 50)}...`,
      metadata: JSON.stringify({
        conflictId: id,
        priority: conflictData.priority,
        relatedUserId: conflictData.relatedUserId,
        relatedMeetingId: conflictData.relatedMeetingId,
      })
    });
    
    return conflict;
  }

  async updateConflict(id: number, conflictData: Partial<InsertConflict>): Promise<Conflict | undefined> {
    const conflict = this.conflicts.get(id);
    if (!conflict) return undefined;
    
    const updatedConflict = { ...conflict, ...conflictData };
    this.conflicts.set(id, updatedConflict);
    return updatedConflict;
  }

  async resolveConflict(id: number, resolvedById: number): Promise<Conflict | undefined> {
    const conflict = this.conflicts.get(id);
    if (!conflict) return undefined;
    
    const resolvedConflict: Conflict = { 
      ...conflict, 
      status: "resolved",
      resolvedAt: new Date()
    };
    this.conflicts.set(id, resolvedConflict);
    
    // Log activity
    const resolver = await this.getUser(resolvedById);
    this.createActivity({
      userId: resolvedById,
      activityType: "conflict_resolved",
      description: `Conflict resolved by ${resolver ? `${resolver.firstName} ${resolver.lastName}` : 'Unknown User'}: ${conflict.description.substring(0, 50)}...`,
      metadata: JSON.stringify({
        conflictId: id,
        resolvedById,
      })
    });
    
    return resolvedConflict;
  }

  // Activity operations
  async getActivity(id: number): Promise<Activity | undefined> {
    return this.activities.get(id);
  }

  async getRecentActivities(limit: number = 10): Promise<Activity[]> {
    return Array.from(this.activities.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createActivity(activityData: InsertActivity): Promise<Activity> {
    const id = this.currentActivityId++;
    const activity: Activity = { ...activityData, id, createdAt: new Date() };
    this.activities.set(id, activity);
    return activity;
  }

  // Notification operations
  async getNotification(id: number): Promise<Notification | undefined> {
    return this.notifications.get(id);
  }

  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async createNotification(notificationData: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = { 
      ...notificationData, 
      id, 
      read: false,
      createdAt: new Date() 
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<boolean> {
    const notification = this.notifications.get(id);
    if (!notification) return false;
    
    notification.read = true;
    this.notifications.set(id, notification);
    return true;
  }

  // Matching algorithms
  async findMatchingStaffForStudent(studentId: number, subjectId?: number): Promise<User[]> {
    const student = await this.getUser(studentId);
    if (!student) return [];
    
    // Get all student's subject needs
    let studentNeeds: StudentSubject[] = [];
    if (subjectId) {
      // Filter for specific subject if provided
      studentNeeds = (await this.getStudentSubjectsByUser(studentId))
        .filter(need => need.subjectId === subjectId);
    } else {
      studentNeeds = await this.getStudentSubjectsByUser(studentId);
    }
    
    if (studentNeeds.length === 0) return [];
    
    // Get all staff (both student staff and professional staff)
    const allStaff = await this.getUsersByRole("STUDENT_STAFF");
    const professionalStaff = await this.getUsersByRole("PROFESSIONAL_STAFF");
    allStaff.push(...professionalStaff);
    
    // For each subject need, find staff with matching expertise
    const matchingStaff: User[] = [];
    const subjectIds = studentNeeds.map(need => need.subjectId);
    
    for (const staff of allStaff) {
      const staffExpertises = await this.getStaffExpertiseByUser(staff.id);
      
      // Check if staff has expertise in any of the student's needed subjects
      const hasMatchingExpertise = staffExpertises.some(
        expertise => subjectIds.includes(expertise.subjectId)
      );
      
      if (hasMatchingExpertise && !matchingStaff.includes(staff)) {
        matchingStaff.push(staff);
      }
    }
    
    return matchingStaff;
  }

  async findAvailableTimeslots(studentId: number, staffId: number): Promise<{day: number, start: string, end: string}[]> {
    const studentAvailability = await this.getAvailabilitiesByUser(studentId);
    const staffAvailability = await this.getAvailabilitiesByUser(staffId);
    
    if (studentAvailability.length === 0 || staffAvailability.length === 0) {
      return [];
    }
    
    const availableSlots: {day: number, start: string, end: string}[] = [];
    
    // For each day, find overlapping time slots
    for (let day = 0; day < 7; day++) {
      const studentDaySlots = studentAvailability.filter(slot => slot.dayOfWeek === day);
      const staffDaySlots = staffAvailability.filter(slot => slot.dayOfWeek === day);
      
      for (const studentSlot of studentDaySlots) {
        for (const staffSlot of staffDaySlots) {
          // Convert times to minutes for easier comparison
          const studentStart = this.timeToMinutes(studentSlot.startTime);
          const studentEnd = this.timeToMinutes(studentSlot.endTime);
          const staffStart = this.timeToMinutes(staffSlot.startTime);
          const staffEnd = this.timeToMinutes(staffSlot.endTime);
          
          // Find overlap
          const overlapStart = Math.max(studentStart, staffStart);
          const overlapEnd = Math.min(studentEnd, staffEnd);
          
          // If there's an overlap of at least 30 minutes
          if (overlapEnd - overlapStart >= 30) {
            availableSlots.push({
              day,
              start: this.minutesToTime(overlapStart),
              end: this.minutesToTime(overlapEnd)
            });
          }
        }
      }
    }
    
    return availableSlots;
  }

  // Helper methods for time manipulation
  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }
}

export const storage = new MemStorage();
