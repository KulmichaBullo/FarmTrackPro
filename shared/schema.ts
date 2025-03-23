import { pgTable, text, serial, integer, boolean, jsonb, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema - kept from original
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Fields schema
export const fields = pgTable("fields", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  size: real("size").notNull(), // size in acres
  soilType: text("soil_type").notNull(),
  history: text("history"),
  coordinates: jsonb("coordinates").notNull(), // GeoJSON format for field boundaries
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertFieldSchema = createInsertSchema(fields).omit({
  id: true,
  createdAt: true,
});

// Crops schema
export const crops = pgTable("crops", {
  id: serial("id").primaryKey(),
  fieldId: integer("field_id").notNull(),
  name: text("name").notNull(),
  seedType: text("seed_type").notNull(),
  plantedDate: timestamp("planted_date").notNull(),
  harvestDate: timestamp("harvest_date").notNull(),
  status: text("status").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertCropSchema = createInsertSchema(crops).omit({
  id: true,
  createdAt: true,
});

// Inputs schema (fertilizers, pesticides, etc.)
export const inputs = pgTable("inputs", {
  id: serial("id").primaryKey(),
  cropId: integer("crop_id").notNull(),
  type: text("type").notNull(), // fertilizer, pesticide, etc.
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  unit: text("unit").notNull(),
  appliedDate: timestamp("applied_date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertInputSchema = createInsertSchema(inputs).omit({
  id: true,
  createdAt: true,
});

// Tasks schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  fieldId: integer("field_id"),
  cropId: integer("crop_id"),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date"),
  workersNeeded: integer("workers_needed").notNull().default(1),
  status: text("status").notNull().default("pending"), // pending, in-progress, completed
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
});

// Weather schema (for storing local weather data)
export const weatherData = pgTable("weather_data", {
  id: serial("id").primaryKey(),
  date: timestamp("date").notNull(),
  temperature: real("temperature"),
  humidity: real("humidity"),
  wind: real("wind"),
  condition: text("condition"),
  alerts: jsonb("alerts"),
  forecast: jsonb("forecast"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertWeatherSchema = createInsertSchema(weatherData).omit({
  id: true,
  createdAt: true,
});

// Type definitions
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Field = typeof fields.$inferSelect;
export type InsertField = z.infer<typeof insertFieldSchema>;

export type Crop = typeof crops.$inferSelect;
export type InsertCrop = z.infer<typeof insertCropSchema>;

export type Input = typeof inputs.$inferSelect;
export type InsertInput = z.infer<typeof insertInputSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type WeatherData = typeof weatherData.$inferSelect;
export type InsertWeatherData = z.infer<typeof insertWeatherSchema>;

// Enums
export const TaskStatus = {
  PENDING: "pending",
  IN_PROGRESS: "in-progress",
  COMPLETED: "completed",
} as const;

export const SoilTypes = {
  CLAY: "Clay",
  CLAY_LOAM: "Clay Loam",
  LOAM: "Loam",
  SANDY_LOAM: "Sandy Loam",
  SANDY: "Sandy",
} as const;

export const InputTypes = {
  FERTILIZER: "fertilizer",
  PESTICIDE: "pesticide",
  IRRIGATION: "irrigation",
  OTHER: "other",
} as const;

export const CropStatus = {
  HEALTHY: "healthy",
  NEEDS_WATER: "needs-water", 
  NEEDS_FERTILIZER: "needs-fertilizer",
  PEST_PROBLEM: "pest-problem",
  DISEASE: "disease",
} as const;
