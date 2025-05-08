import {
  pgTable, text, serial, integer, boolean, timestamp, varchar, pgEnum, date, jsonb
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const meetingTypeEnum = pgEnum('meeting_type', [
  'LEARNING_STRATEGIST', 'COMBO', 'VOCATIONAL_COACH', 'SOCIAL_COACH', 'ACADEMIC_COACH', 'CHECK_IN'
]);

export const userRoleEnum = pgEnum('user_role', [
  'STUDENT', 'STUDENT_STAFF', 'PROFESSIONAL_STAFF', 'FACULTY', 'ADMIN'
]);

export const meetingOutcomeEnum = pgEnum('meeting_outcome', [
  'MEETING_HELD', 'STUDENT_NO_SHOW', 'STAFF_NO_SHOW', 'CANCELLED', 'RESCHEDULED'
]);

// Tables
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
  preferredMeetingTypes: text("preferred_meeting_types").default("{}"),
  timeZone: text("time_zone").default("America/New_York"),
  calendarSyncEnabled: boolean("calendar_sync_enabled").default(false),
  calendarSyncToken: text("calendar_sync_token"),
  theme: text("theme").default("light"),
  fontScale: integer("font_scale").default(100),
  profilePicture: text("profile_picture"),
  createdAt: timestamp("created_at").defaultNow(),
  lastActive: timestamp("last_active"),
});

export const forms = pgTable("forms", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  questions: jsonb("questions").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  semester: text("semester").notNull(),
  type: text("type").notNull()
});

export const formResponses = pgTable("form_responses", {
  id: serial("id").primaryKey(),
  formId: integer("form_id").references(() => forms.id),
  userId: integer("user_id").references(() => users.id),
  answers: jsonb("answers").notNull(),
  submittedAt: timestamp("submitted_at").defaultNow(),
});

// Zod Schemas
export const insertFormSchema = createInsertSchema(forms).omit({ id: true, createdAt: true });
export const insertFormResponseSchema = createInsertSchema(formResponses).omit({ id: true, submittedAt: true });

// Export for usage
export type InsertForm = z.infer<typeof insertFormSchema>;
export type InsertFormResponse = z.infer<typeof insertFormResponseSchema>;