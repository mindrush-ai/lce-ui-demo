import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").notNull().unique(),
  password: text("password"),
  fullName: varchar("full_name").notNull(),
  companyName: varchar("company_name").notNull(),
  isGoogleAuth: boolean("is_google_auth").default(false),
  googleId: varchar("google_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  password: true,
  fullName: true,
  companyName: true,
  isGoogleAuth: true,
  googleId: true,
});

export const signupStep1Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const signupStep2Schema = z.object({
  fullName: z.string().min(1, "Please enter your full name"),
  companyName: z.string().min(1, "Please enter your company name"),
  acceptedTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type SignupStep1Data = z.infer<typeof signupStep1Schema>;
export type SignupStep2Data = z.infer<typeof signupStep2Schema>;
