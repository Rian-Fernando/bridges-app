import express, { type Express } from "express";
import { createServer, type Server } from "http";
import { 
  insertUserSchema,
  insertSubjectSchema,
  insertStaffExpertiseSchema,
  insertStudentSubjectSchema,
  insertAvailabilitySchema,
  insertMeetingSchema,
  insertConflictSchema,
  insertNotificationSchema,
  insertFormSchema,
  insertFormResponseSchema
} from "@shared/schema";
import { z } from "zod";
import { setupAuth } from "./auth";
import { db } from "./db";
import { eq, and, desc, gt, lt, gte, lte } from "drizzle-orm";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  const { requireAuth } = require("./auth");

  // Form routes for semester questions
  apiRouter.post("/forms", requireAuth, async (req, res) => {
    try {
      const formData = insertFormSchema.parse(req.body);
      const newForm = await storage.createForm(formData);
      res.status(201).json(newForm);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create form" });
    }
  });

  apiRouter.post("/forms/:formId/responses", requireAuth, async (req, res) => {
    try {
      const formId = parseInt(req.params.formId);
      const responseData = insertFormResponseSchema.parse({
        ...req.body,
        formId,
        userId: req.user.id
      });
      const newResponse = await storage.createFormResponse(responseData);
      res.status(201).json(newResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to submit form response" });
    }
  });

  // Automated matching endpoint
  apiRouter.post("/matching/auto", requireAuth, async (req, res) => {
    try {
      const { studentId, type } = req.body;
      const matches = await storage.findOptimalMatches(studentId, type);
      res.json(matches);
    } catch (error) {
      res.status(500).json({ error: "Failed to find matches" });
    }
  });

  // User routes
  apiRouter.get("/users", requireAuth, async (req, res) => {
    try {
      const role = req.query.role as string | undefined;
      let users;
      if (role) {
        users = await storage.getUsersByRole(role);
      } else {
        // For now, use the admin user as a workaround to get all users
        users = await storage.getUsersByRole("ADMIN");
        const students = await storage.getUsersByRole("STUDENT");
        const studentStaff = await storage.getUsersByRole("STUDENT_STAFF");
        const professionalStaff = await storage.getUsersByRole("PROFESSIONAL_STAFF");
        
        users = [...users, ...students, ...studentStaff, ...professionalStaff];
      }
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  apiRouter.get("/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  apiRouter.post("/users", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const newUser = await storage.createUser(userData);
      res.status(201).json(newUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create user" });
    }
  });

  apiRouter.put("/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const userData = insertUserSchema.partial().parse(req.body);
      const updatedUser = await storage.updateUser(id, userData);
      if (!updatedUser) {
        return res.status(404).json({ error: "User not found" });
      }
      res.json(updatedUser);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update user" });
    }
  });

  // Subject routes
  apiRouter.get("/subjects", async (req, res) => {
    try {
      const subjects = await storage.getSubjects();
      res.json(subjects);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch subjects" });
    }
  });

  apiRouter.post("/subjects", async (req, res) => {
    try {
      const subjectData = insertSubjectSchema.parse(req.body);
      const newSubject = await storage.createSubject(subjectData);
      res.status(201).json(newSubject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create subject" });
    }
  });

  // Staff expertise routes
  apiRouter.get("/staff-expertise", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (userId) {
        const expertise = await storage.getStaffExpertiseByUser(userId);
        res.json(expertise);
      } else {
        res.status(400).json({ error: "userId query parameter is required" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch staff expertise" });
    }
  });

  apiRouter.post("/staff-expertise", async (req, res) => {
    try {
      const expertiseData = insertStaffExpertiseSchema.parse(req.body);
      const newExpertise = await storage.createStaffExpertise(expertiseData);
      res.status(201).json(newExpertise);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create staff expertise" });
    }
  });

  // Student subjects routes
  apiRouter.get("/student-subjects", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (userId) {
        const studentSubjects = await storage.getStudentSubjectsByUser(userId);
        res.json(studentSubjects);
      } else {
        res.status(400).json({ error: "userId query parameter is required" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch student subjects" });
    }
  });

  apiRouter.post("/student-subjects", async (req, res) => {
    try {
      const subjectData = insertStudentSubjectSchema.parse(req.body);
      const newStudentSubject = await storage.createStudentSubject(subjectData);
      res.status(201).json(newStudentSubject);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create student subject" });
    }
  });

  // Availability routes
  apiRouter.get("/availability", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (userId) {
        const availabilities = await storage.getAvailabilitiesByUser(userId);
        res.json(availabilities);
      } else {
        res.status(400).json({ error: "userId query parameter is required" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch availabilities" });
    }
  });

  apiRouter.post("/availability", async (req, res) => {
    try {
      const availabilityData = insertAvailabilitySchema.parse(req.body);
      const newAvailability = await storage.createAvailability(availabilityData);
      res.status(201).json(newAvailability);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create availability" });
    }
  });

  apiRouter.delete("/availability/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteAvailability(id);
      if (!deleted) {
        return res.status(404).json({ error: "Availability not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete availability" });
    }
  });

  // Role-based access middleware
  const checkRole = (allowedRoles: string[]) => async (req: any, res: any, next: any) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };

  // Meeting routes with role-based access
  apiRouter.get("/meetings", checkRole(['STUDENT', 'STUDENT_STAFF', 'PROFESSIONAL_STAFF', 'FACULTY', 'ADMIN']), async (req, res) => {
    try {
      const studentId = req.query.studentId ? parseInt(req.query.studentId as string) : undefined;
      const staffId = req.query.staffId ? parseInt(req.query.staffId as string) : undefined;
      const dateStr = req.query.date as string | undefined;
      
      if (studentId) {
        const meetings = await storage.getMeetingsByStudent(studentId);
        res.json(meetings);
      } else if (staffId) {
        const meetings = await storage.getMeetingsByStaff(staffId);
        res.json(meetings);
      } else if (dateStr) {
        const date = new Date(dateStr);
        const meetings = await storage.getMeetingsByDate(date);
        res.json(meetings);
      } else {
        res.status(400).json({ error: "Either studentId, staffId, or date query parameter is required" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meetings" });
    }
  });

  apiRouter.get("/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meeting = await storage.getMeeting(id);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      res.json(meeting);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch meeting" });
    }
  });

  apiRouter.post("/meetings", async (req, res) => {
    try {
      const meetingData = insertMeetingSchema.parse(req.body);
      const newMeeting = await storage.createMeeting(meetingData);
      res.status(201).json(newMeeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create meeting" });
    }
  });

  apiRouter.put("/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const meetingData = insertMeetingSchema.partial().parse(req.body);
      const updatedMeeting = await storage.updateMeeting(id, meetingData);
      if (!updatedMeeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      res.json(updatedMeeting);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update meeting" });
    }
  });

  apiRouter.delete("/meetings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMeeting(id);
      if (!deleted) {
        return res.status(404).json({ error: "Meeting not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete meeting" });
    }
  });

  // Conflict routes
  apiRouter.get("/conflicts", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const conflicts = await storage.getConflicts(status);
      res.json(conflicts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conflicts" });
    }
  });

  apiRouter.get("/conflicts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conflict = await storage.getConflict(id);
      if (!conflict) {
        return res.status(404).json({ error: "Conflict not found" });
      }
      res.json(conflict);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch conflict" });
    }
  });

  apiRouter.post("/conflicts", async (req, res) => {
    try {
      const conflictData = insertConflictSchema.parse(req.body);
      const newConflict = await storage.createConflict(conflictData);
      res.status(201).json(newConflict);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create conflict" });
    }
  });

  apiRouter.put("/conflicts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const conflictData = insertConflictSchema.partial().parse(req.body);
      const updatedConflict = await storage.updateConflict(id, conflictData);
      if (!updatedConflict) {
        return res.status(404).json({ error: "Conflict not found" });
      }
      res.json(updatedConflict);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to update conflict" });
    }
  });

  // Faculty-specific routes
  apiRouter.post("/meetings/:id/request-change", checkRole(['FACULTY', 'ADMIN']), async (req, res) => {
    try {
      const meetingId = parseInt(req.params.id);
      const { newModality, reason } = req.body;
      
      const meeting = await storage.getMeeting(meetingId);
      if (!meeting) {
        return res.status(404).json({ error: "Meeting not found" });
      }

      const result = await findAlternativeStaff(meeting, meeting.staffId, newModality);
      
      if (!result.success) {
        return res.status(422).json({ error: result.message });
      }

      // Create change request
      const changeRequest = await storage.createMeetingChangeRequest({
        meetingId,
        requestedById: req.user.id,
        newModality,
        reason,
        alternativeStaffIds: result.alternativeStaff!.map(s => s.id)
      });

      res.status(201).json(changeRequest);
    } catch (error) {
      res.status(500).json({ error: "Failed to process change request" });
    }
  });

  apiRouter.post("/conflicts/:id/resolve", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const resolvedById = req.body.resolvedById ? parseInt(req.body.resolvedById) : 1; // Default to admin
      
      const resolvedConflict = await storage.resolveConflict(id, resolvedById);
      if (!resolvedConflict) {
        return res.status(404).json({ error: "Conflict not found" });
      }
      res.json(resolvedConflict);
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve conflict" });
    }
  });

  // Activity routes
  apiRouter.get("/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const activities = await storage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });

  // Notification routes
  apiRouter.get("/notifications", async (req, res) => {
    try {
      const userId = req.query.userId ? parseInt(req.query.userId as string) : undefined;
      
      if (userId) {
        const notifications = await storage.getNotificationsByUser(userId);
        res.json(notifications);
      } else {
        res.status(400).json({ error: "userId query parameter is required" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch notifications" });
    }
  });

  apiRouter.post("/notifications", async (req, res) => {
    try {
      const notificationData = insertNotificationSchema.parse(req.body);
      const newNotification = await storage.createNotification(notificationData);
      res.status(201).json(newNotification);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to create notification" });
    }
  });

  apiRouter.post("/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.markNotificationAsRead(id);
      if (!success) {
        return res.status(404).json({ error: "Notification not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to mark notification as read" });
    }
  });

  // Matching algorithm routes
  apiRouter.get("/match/staff", async (req, res) => {
    try {
      const studentId = parseInt(req.query.studentId as string);
      const subjectId = req.query.subjectId ? parseInt(req.query.subjectId as string) : undefined;
      
      if (!studentId) {
        return res.status(400).json({ error: "studentId query parameter is required" });
      }
      
      const matchingStaff = await storage.findMatchingStaffForStudent(studentId, subjectId);
      res.json(matchingStaff);
    } catch (error) {
      res.status(500).json({ error: "Failed to find matching staff" });
    }
  });

  apiRouter.get("/match/timeslots", async (req, res) => {
    try {
      const studentId = parseInt(req.query.studentId as string);
      const staffId = parseInt(req.query.staffId as string);
      
      if (!studentId || !staffId) {
        return res.status(400).json({ error: "Both studentId and staffId query parameters are required" });
      }
      
      const availableTimeslots = await storage.findAvailableTimeslots(studentId, staffId);
      res.json(availableTimeslots);
    } catch (error) {
      res.status(500).json({ error: "Failed to find available timeslots" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}