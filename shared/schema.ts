import { sql } from "drizzle-orm";
import {
  index,
  jsonb,
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  serial,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table.
// (IMPORTANT) This table is mandatory for Replit Auth, don't drop it.
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const companies = pgTable("companies", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  industry: text("industry").notNull(),
  size: text("size").notNull(),
  userId: varchar("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCompanySchema = createInsertSchema(companies).omit({
  id: true,
  createdAt: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertCompany = z.infer<typeof insertCompanySchema>;
export type Company = typeof companies.$inferSelect;

// Product Information Schema
export const productInfoSchema = z.object({
  itemNumber: z.string().min(1, "Item Number is required"),
  nameId: z.string().min(1, "Item Name/Description is required"),
  htsCode: z.enum(["3401.19.00.00", "5603.92.00.70", "3401.11.50.00", "5603.12.00.10", "5603.14.90.10"], {
    required_error: "Please select an HTS Code"
  }),
  countryOfOrigin: z.string().min(2, "Country of origin is required"),
  unitCost: z.number()
    .positive("Unit cost must be positive")
    .max(999999.9999, "Unit cost too large"),
  // Section 2 - Item Details
  numberOfUnits: z.number()
    .int("Number must be a whole number")
    .min(1, "Number of units must be at least 1"),
  // Section 3 - Shipment Details
  containerSize: z.string().min(1, "Container size is required"),
  incoterms: z.string().min(1, "Incoterms is required"),
  originPort: z.string().min(1, "Origin port is required"),
  destinationPort: z.string().min(1, "Destination port is required"),
  // Freight Charges
  useIndexRates: z.boolean().default(false),
  freightCost: z.number().optional()
});

export type ProductInfo = z.infer<typeof productInfoSchema>;

// Authentication schemas
export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type LoginData = z.infer<typeof loginSchema>;

// Signup schemas
export const signupStep1Schema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignupStep1Data = z.infer<typeof signupStep1Schema>;

export const signupStep2Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  company: z.string().min(1, "Company name is required"),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
  acceptMarketing: z.boolean().optional(),
});

export type SignupStep2Data = z.infer<typeof signupStep2Schema>;

