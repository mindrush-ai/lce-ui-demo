import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  signupStep1Schema, 
  signupStep2Schema, 
  forgotPasswordSchema,
  resetPasswordSchema,
  loginSchema 
} from "@shared/schema";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export async function registerRoutes(app: Express): Promise<Server> {
  // Check if email exists
  app.get("/api/auth/check-email/:email", async (req, res) => {
    try {
      const { email } = req.params;
      const existingUser = await storage.getUserByEmail(email);
      res.json({ exists: !!existingUser });
    } catch (error) {
      console.error("Error checking email:", error);
      res.status(500).json({ message: "Failed to check email" });
    }
  });

  // Complete signup
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { step1Data, step2Data } = req.body;
      
      // Validate step 1 data
      const validatedStep1 = signupStep1Schema.parse(step1Data);
      
      // Validate step 2 data
      const validatedStep2 = signupStep2Schema.parse(step2Data);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedStep1.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists with this email" });
      }
      
      // Hash password
      const hashedPassword = await bcrypt.hash(validatedStep1.password, 10);
      
      // Create user
      const newUser = await storage.createUser({
        email: validatedStep1.email,
        password: hashedPassword,
        fullName: validatedStep2.fullName,
        companyName: validatedStep2.companyName,
        isGoogleAuth: false,
      });
      
      // Remove password from response
      const { password, ...userResponse } = newUser;
      
      res.status(201).json({ 
        user: userResponse,
        message: "Account created successfully" 
      });
    } catch (error: any) {
      console.error("Error creating user:", error);
      if (error.errors) {
        // Zod validation error
        res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to create account" });
      }
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user || !user.password) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      // Remove password from response
      const { password, ...userResponse } = user;
      
      res.json({ 
        user: userResponse,
        message: "Login successful" 
      });
    } catch (error: any) {
      console.error("Error during login:", error);
      if (error.errors) {
        res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Login failed" });
      }
    }
  });

  // Forgot password
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const validatedData = forgotPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(validatedData.email);
      if (!user) {
        // Don't reveal if email exists for security
        return res.json({ message: "If an account with that email exists, we'll send a reset link." });
      }
      
      // Generate reset token
      const resetToken = randomUUID();
      const resetTokenExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      
      await storage.updateUser(user.id, {
        resetToken,
        resetTokenExpires,
      });
      
      // TODO: Send email with reset link
      console.log(`Reset token for ${user.email}: ${resetToken}`);
      
      res.json({ message: "If an account with that email exists, we'll send a reset link." });
    } catch (error) {
      console.error("Error in forgot password:", error);
      res.status(500).json({ message: "Failed to process forgot password request" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const validatedData = resetPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByResetToken(validatedData.token);
      if (!user) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      // Hash new password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Update user password and clear reset token
      await storage.updateUser(user.id, {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpires: null,
      });
      
      res.json({ message: "Password reset successfully" });
    } catch (error: any) {
      console.error("Error in reset password:", error);
      if (error.errors) {
        res.status(400).json({ 
          message: "Validation error",
          errors: error.errors 
        });
      } else {
        res.status(500).json({ message: "Failed to reset password" });
      }
    }
  });

  // Google signup (placeholder for future implementation)
  app.post("/api/auth/google-signup", async (req, res) => {
    try {
      const { googleToken, step2Data } = req.body;
      
      // TODO: Verify Google token and extract user data
      // For now, return a placeholder response
      res.status(501).json({ message: "Google authentication not yet implemented" });
    } catch (error) {
      console.error("Error with Google signup:", error);
      res.status(500).json({ message: "Failed to process Google signup" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
