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
  htsCode: z.enum(["2204.21.50.40", "2204.10.00.75"], {
    required_error: "Please select an HTS Code"
  }),
  countryOfOrigin: z.string().min(2, "Country of origin is required"),
  unitCost: z.number()
    .positive("Unit cost must be positive")
    .max(999999.9999, "Unit cost too large"),
  // Section 2 - Item Details
  numberOfWineCases: z.number()
    .int("Number must be a whole number")
    .min(1, "Number of wine cases must be at least 1")
    .max(1260, "Number of wine cases cannot exceed 1260"),
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

