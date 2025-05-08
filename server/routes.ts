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
} from "../shared/schema"; // <-- CORRECTED FROM @shared/schema

import { z } from "zod";
import { setupAuth } from "./auth";
import { db } from "./db";
import { eq, and, desc, gt, lt, gte, lte } from "drizzle-orm";

// Define the rest of your `registerRoutes(app: Express): Promise<Server>` function
// ... (as per your original file, since the rest seems mostly fine)

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = express.Router();
  app.use("/api", apiRouter);

  const { requireAuth } = require("./auth");

  apiRouter.post("/forms", requireAuth, async (req, res) => {
    try {
      const formData = insertFormSchema.parse(req.body);
      const newForm = await db.insertInto("forms").values(formData).returning("*");
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
      const newResponse = await db.insertInto("form_responses").values(responseData).returning("*");
      res.status(201).json(newResponse);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: error.errors });
      }
      res.status(500).json({ error: "Failed to submit form response" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}