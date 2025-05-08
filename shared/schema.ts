import { pgTable, text, serial, integer, boolean, timestamp, varchar, pgEnum, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enum for meeting types
export const meetingTypeEnum = pgEnum('meeting_type', [
  'LEARNING_STRATEGIST',
  'COMBO',
  'VOCATIONAL_COACH',
  'SOCIAL_COACH',
  'ACADEMIC_COACH',
  'CHECK_IN'
]);

// Enum for user roles
export const userRoleEnum = pgEnum('user_role', [
  'STUDENT',
  'STUDENT_STAFF',
  'PROFESSIONAL_STAFF', 
  'FACULTY',
  'ADMIN'
]);

export const permissionLevels = {
  STUDENT: ['VIEW_SCHEDULE', 'REQUEST_CHANGES', 'VIEW_MEETINGS'],
  STUDENT_STAFF: ['VIEW_SCHEDULE', 'REQUEST_CHANGES', 'VIEW_MEETINGS', 'SET_AVAILABILITY'],
  PROFESSIONAL_STAFF: ['VIEW_SCHEDULE', 'REQUEST_CHANGES', 'VIEW_MEETINGS', 'SET_AVAILABILITY'],
  FACULTY: ['VIEW_ALL', 'MANAGE_PAIRINGS', 'APPROVE_CHANGES', 'MODIFY_SCHEDULES'],
  ADMIN: ['VIEW_ALL', 'MANAGE_ALL', 'SYSTEM_CONFIG']
};

// Enum for meeting outcome
export const meetingOutcomeEnum = pgEnum('meeting_outcome', [
  'MEETING_HELD',
  'STUDENT_NO_SHOW',
  'STAFF_NO_SHOW',
  'CANCELLED',
  'RESCHEDULED'
]);

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  role: userRoleEnum("role").notNull(),
  isRemote: boolean("is_remote").default(false),
  isCommuter: boolean("is_commuter").default(false),
  weeklyHourLimit: integer("weekly_hour_limit"),
  preferredLocation: text("preferred_location").default(""),
  preferredMeetingTypes: text("preferred_meeting_types").default("{}"), // JSON string of preferred meeting types
  timeZone: text("time_zone").default("America/New_York"),
  calendarSyncEnabled: boolean("calendar_sync_enabled").default(false),
  calendarSyncToken: text("calendar_sync_token"),
  theme: text("theme").default("light"),
  fontScale: integer("font_scale").default(100),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActive: timestamp("last_active"),
});

// Subjects table
export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  code: text("code").notNull().unique(),
  department: text("department"),
  description: text("description"),
});

// Staff expertise table (for matching staff with subjects)
export const staffExpertise = pgTable("staff_expertise", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  subjectId: integer("subject_id").notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  proficiencyLevel: integer("proficiency_level").notNull().default(1), // Scale 1-5
  notes: text("notes"),
});

// Student subject needs table
export const studentSubjects = pgTable("student_subjects", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  subjectId: integer("subject_id").notNull().references(() => subjects.id, { onDelete: 'cascade' }),
  priorityLevel: integer("priority_level").notNull().default(1), // Scale 1-5
  notes: text("notes"),
});

// Staff preferences table
export const staffPreferences = pgTable("staff_preferences", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  maxStudentsPerDay: integer("max_students_per_day"),
  maxConsecutiveMeetings: integer("max_consecutive_meetings"),
  preferredMeetingBuffer: integer("preferred_meeting_buffer"), // Minutes between meetings
  blackoutDates: text("blackout_dates").default("[]"), // JSON array of dates
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Availability table
export const availability = pgTable("availability", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  dayOfWeek: integer("day_of_week").notNull(), // 0-6 (Sunday to Saturday)
  startTime: text("start_time").notNull(), // Format: "HH:MM"
  endTime: text("end_time").notNull(), // Format: "HH:MM"
  isRecurring: boolean("is_recurring").default(true),
  location: text("location").default(""),
  effectiveDate: date("effective_date"), // For non-recurring availability
  expirationDate: date("expiration_date"), // For temporary availability changes
});

// Meetings table
export const meetings = pgTable("meetings", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  staffId: integer("staff_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  meetingType: meetingTypeEnum("meeting_type").notNull(),
  subjectId: integer("subject_id").references(() => subjects.id),
  date: timestamp("date").notNull(),
  startTime: text("start_time").notNull(), // Format: "HH:MM"
  endTime: text("end_time").notNull(), // Format: "HH:MM"
  location: text("location").default("TBD"),
  isVirtual: boolean("is_virtual").default(false),
  notes: text("notes").default(""),
  status: text("status").default("scheduled"), // scheduled, cancelled, completed
  reminder: boolean("reminder").default(true),
  reminderSent: boolean("reminder_sent").default(false),
  tags: text("tags").default("[]"), // JSON array of tags
  isRecurring: boolean("is_recurring").default(false),
  recurringId: integer("recurring_id"), // Parent recurring meeting ID
  customFormData: text("custom_form_data").default("{}"), // JSON data for custom forms
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Meeting reports table
export const meetingReports = pgTable("meeting_reports", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  submittedById: integer("submitted_by_id").notNull().references(() => users.id),
  outcome: meetingOutcomeEnum("outcome").notNull(),
  summary: text("summary").notNull(),
  privateNotes: text("private_notes").default(""),
  sharedNotes: text("shared_notes").default(""),
  followUpNeeded: boolean("follow_up_needed").default(false),
  followUpDescription: text("follow_up_description"),
  reviewedById: integer("reviewed_by_id").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  reviewNotes: text("review_notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Student feedback table
export const studentFeedback = pgTable("student_feedback", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  studentId: integer("student_id").notNull().references(() => users.id),
  rating: integer("rating"), // 1-5 rating
  feedback: text("feedback"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Goals table
export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").default("in_progress"), // in_progress, completed, abandoned
  startDate: date("start_date").notNull(),
  targetDate: date("target_date"),
  completedDate: date("completed_date"),
  relatedSubjectId: integer("related_subject_id").references(() => subjects.id),
  createdAt: timestamp("created_at").defaultNow(),
});

// Meeting-Goal relationship table
export const meetingGoals = pgTable("meeting_goals", {
  id: serial("id").primaryKey(),
  meetingId: integer("meeting_id").notNull().references(() => meetings.id, { onDelete: 'cascade' }),
  goalId: integer("goal_id").notNull().references(() => goals.id, { onDelete: 'cascade' }),
  progress: text("progress"), // Notes on progress made during this meeting
});

// Conflicts table
export const conflicts = pgTable("conflicts", {
  id: serial("id").primaryKey(),
  relatedUserId: integer("related_user_id").references(() => users.id),
  relatedMeetingId: integer("related_meeting_id").references(() => meetings.id),
  description: text("description").notNull(),
  priority: text("priority").notNull().default("medium"), // high, medium, low
  status: text("status").notNull().default("open"), // open, resolved
  category: text("category"), // class_drop, staff_preference, etc.
  assignedToId: integer("assigned_to_id").references(() => users.id),
  reportedById: integer("reported_by_id").references(() => users.id),
  resolution: text("resolution"),
  createdAt: timestamp("created_at").defaultNow(),
  resolvedAt: timestamp("resolved_at"),
});

// Rooms table
export const rooms = pgTable("rooms", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  building: text("building"),
  capacity: integer("capacity"),
  hasVideo: boolean("has_video").default(false),
  isAccessible: boolean("is_accessible").default(true),
  notes: text("notes"),
});

// Room availability table
export const roomAvailability = pgTable("room_availability", {
  id: serial("id").primaryKey(),
  roomId: integer("room_id").notNull().references(() => rooms.id, { onDelete: 'cascade' }),
  dayOfWeek: integer("day_of_week").notNull(),
  startTime: text("start_time").notNull(),
  endTime: text("end_time").notNull(),
  isAvailable: boolean("is_available").default(true),
  reason: text("reason"),
  effectiveDate: date("effective_date"),
  expirationDate: date("expiration_date"),
});

// Messages table
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  senderId: integer("sender_id").notNull().references(() => users.id),
  recipientId: integer("recipient_id").notNull().references(() => users.id),
  subject: text("subject"),
  content: text("content").notNull(),
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Message templates table
export const messageTemplates = pgTable("message_templates", {
  id: serial("id").primaryKey(),
  createdById: integer("created_by_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  subject: text("subject"),
  content: text("content").notNull(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Activities table
export const activities = pgTable("activities", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  activityType: text("activity_type").notNull(), // meeting_scheduled, user_added, etc.
  description: text("description").notNull(),
  metadata: text("metadata").default("{}"), // JSON string for additional data
  createdAt: timestamp("created_at").defaultNow(),
});

// Notifications table
// Forms for semester questions
export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  semester: text("semester").notNull(),
  type: text("type").notNull(), // STUDENT or STAFF
});

export const formResponses = pgTable("form_responses", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => forms.id),
  userId: integer("user_id").references(() => users.id),
  answers: jsonb("answers").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  message: text("message").notNull(),
  type: text("type").default("info"), // info, warning, error, success
  relatedEntityType: text("related_entity_type"), // meeting, conflict, etc.
  relatedEntityId: integer("related_entity_id"),
  read: boolean("read").default(false),
  actionUrl: text("action_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Zod schemas and types
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  lastActive: true,
});

export const insertSubjectSchema = createInsertSchema(subjects).omit({
  id: true,
});

export const insertStaffExpertiseSchema = createInsertSchema(staffExpertise).omit({
  id: true,
});

export const insertStudentSubjectSchema = createInsertSchema(studentSubjects).omit({
  id: true,
});

export const insertStaffPreferencesSchema = createInsertSchema(staffPreferences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertAvailabilitySchema = createInsertSchema(availability).omit({
  id: true,
});

export const insertMeetingSchema = createInsertSchema(meetings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMeetingReportSchema = createInsertSchema(meetingReports).omit({
  id: true,
  createdAt: true,
  reviewedAt: true,
});

export const insertStudentFeedbackSchema = createInsertSchema(studentFeedback).omit({
  id: true,
  createdAt: true,
});

export const insertGoalSchema = createInsertSchema(goals).omit({
  id: true,
  createdAt: true,
  completedDate: true,
});

export const insertMeetingGoalSchema = createInsertSchema(meetingGoals).omit({
  id: true,
});

export const insertConflictSchema = createInsertSchema(conflicts).omit({
  id: true,
  createdAt: true,
  resolvedAt: true,
});

export const insertRoomSchema = createInsertSchema(rooms).omit({
  id: true,
});

export const insertRoomAvailabilitySchema = createInsertSchema(roomAvailability).omit({
  id: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
  isRead: true,
});

export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
  read: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertSubject = z.infer<typeof insertSubjectSchema>;
export type Subject = typeof subjects.$inferSelect;

export type InsertStaffExpertise = z.infer<typeof insertStaffExpertiseSchema>;
export type StaffExpertise = typeof staffExpertise.$inferSelect;

export type InsertStudentSubject = z.infer<typeof insertStudentSubjectSchema>;
export type StudentSubject = typeof studentSubjects.$inferSelect;

export type InsertStaffPreferences = z.infer<typeof insertStaffPreferencesSchema>;
export type StaffPreferences = typeof staffPreferences.$inferSelect;

export type InsertAvailability = z.infer<typeof insertAvailabilitySchema>;
export type Availability = typeof availability.$inferSelect;

export type InsertMeeting = z.infer<typeof insertMeetingSchema>;
export type Meeting = typeof meetings.$inferSelect;

export type InsertMeetingReport = z.infer<typeof insertMeetingReportSchema>;
export type MeetingReport = typeof meetingReports.$inferSelect;

export type InsertStudentFeedback = z.infer<typeof insertStudentFeedbackSchema>;
export type StudentFeedback = typeof studentFeedback.$inferSelect;

export type InsertGoal = z.infer<typeof insertGoalSchema>;
export type Goal = typeof goals.$inferSelect;

export type InsertMeetingGoal = z.infer<typeof insertMeetingGoalSchema>;
export type MeetingGoal = typeof meetingGoals.$inferSelect;

export type InsertConflict = z.infer<typeof insertConflictSchema>;
export type Conflict = typeof conflicts.$inferSelect;

export type InsertRoom = z.infer<typeof insertRoomSchema>;
export type Room = typeof rooms.$inferSelect;

export type InsertRoomAvailability = z.infer<typeof insertRoomAvailabilitySchema>;
export type RoomAvailability = typeof roomAvailability.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertMessageTemplate = z.infer<typeof insertMessageTemplateSchema>;
export type MessageTemplate = typeof messageTemplates.$inferSelect;

export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type Activity = typeof activities.$inferSelect;

export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type Notification = typeof notifications.$inferSelect;

// Enum types for easier use in the application
export type MeetingType = 'LEARNING_STRATEGIST' | 'COMBO' | 'VOCATIONAL_COACH' | 'SOCIAL_COACH' | 'ACADEMIC_COACH' | 'CHECK_IN';
export type UserRole = 'STUDENT' | 'STUDENT_STAFF' | 'PROFESSIONAL_STAFF' | 'ADMIN';
export type MeetingOutcome = 'MEETING_HELD' | 'STUDENT_NO_SHOW' | 'STAFF_NO_SHOW' | 'CANCELLED' | 'RESCHEDULED';
