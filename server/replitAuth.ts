import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";
import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import MemoryStore from "memorystore";
import { storage } from "./storage";

// For local development, we'll use a simplified OIDC setup
const getOidcConfig = memoize(
  async () => {
    // Use Replit's OIDC endpoint, but with local callback
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID || "local-dev-client"
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  
  // Use memory store for local development
  const MemoryStoreSession = MemoryStore(session);
  
  return session({
    secret: process.env.SESSION_SECRET || 'dev-secret-key-change-in-production',
    store: new MemoryStoreSession({
      checkPeriod: 86400000 // prune expired entries every 24h
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false, // Set to true in production with HTTPS
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(claims: any) {
  try {
    await storage.upsertUser({
      id: claims["sub"],
      email: claims["email"],
      firstName: claims["first_name"],
      lastName: claims["last_name"],
      profileImageUrl: claims["profile_image_url"],
    });
  } catch (error) {
    console.log("Database not available for user storage, using session only");
  }
}

export async function setupAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Only set up OIDC if we have the required environment variables
  if (process.env.REPL_ID && process.env.ISSUER_URL) {
    try {
      const config = await getOidcConfig();

      const verify: VerifyFunction = async (
        tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
        verified: passport.AuthenticateCallback
      ) => {
        const user = {};
        updateUserSession(user, tokens);
        await upsertUser(tokens.claims());
        verified(null, user);
      };

      // Use localhost for local development
      const callbackURL = `http://localhost:${process.env.PORT || 5000}/api/callback`;
      
      const strategy = new Strategy(
        {
          name: "replitauth",
          config,
          scope: "openid email profile offline_access",
          callbackURL,
        },
        verify,
      );
      passport.use(strategy);

      passport.serializeUser((user: any, cb: any) => cb(null, user));
      passport.deserializeUser((user: any, cb: any) => cb(null, user));

      app.get("/api/login", (req, res, next) => {
        passport.authenticate("replitauth", {
          prompt: "login consent",
          scope: ["openid", "email", "profile", "offline_access"],
        })(req, res, next);
      });

      app.get("/api/callback", (req, res, next) => {
        passport.authenticate("replitauth", {
          successReturnToOrRedirect: "/",
          failureRedirect: "/api/dev-login",
        })(req, res, next);
      });

      app.get("/api/logout", (req: any, res) => {
        req.logout(() => {
          res.redirect(
            client.buildEndSessionUrl(config, {
              client_id: process.env.REPL_ID!,
              post_logout_redirect_uri: `http://localhost:${process.env.PORT || 5000}`,
            }).href
          );
        });
      });

    } catch (error: any) {
      console.log("OIDC setup failed, falling back to dev auth:", error.message);
      setupDevAuth(app);
    }
  } else {
    console.log("REPL_ID or ISSUER_URL not set, using dev auth");
    setupDevAuth(app);
  }

  // Always provide user info endpoint (for React client)
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (req.user?.claims?.sub) {
        // OIDC user
        const userId = req.user.claims.sub;
        try {
          const user = await storage.getUser(userId);
          if (user) {
            return res.json(user);
          }
        } catch (dbError) {
          console.log("Database not available, using session data");
        }
        
        // Fallback to claims data
        return res.json({
          id: userId,
          email: req.user.claims.email,
          firstName: req.user.claims.first_name,
          lastName: req.user.claims.last_name,
          profileImageUrl: req.user.claims.profile_image_url,
        });
      } else if (req.session?.user) {
        // Dev user
        return res.json(req.session.user);
      } else {
        return res.status(401).json({ message: "Not authenticated" });
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // API endpoint for React client login
  app.post('/api/auth/login', async (req: any, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Check hardcoded dev users if password provided
      const DEV_USERS = {
        'admin@mindrush.com': { password: '$omeRandomPass*', firstName: 'Admin', lastName: 'User' },
        'google.user@example.com': { password: 'mock-google-password', firstName: 'Google', lastName: 'User' },
      };

      if (password && DEV_USERS[email as keyof typeof DEV_USERS]) {
        const devUser = DEV_USERS[email as keyof typeof DEV_USERS];
        if (password === devUser.password) {
          const userSession = {
            id: email,
            email,
            firstName: devUser.firstName,
            lastName: devUser.lastName,
          };
          
          req.session.user = userSession;
          return res.json({ message: "Login successful", user: userSession });
        } else {
          return res.status(401).json({ message: "Invalid password" });
        }
      }

      // If no password or not a dev user, try database user creation
      if (!password) {
        try {
          const user = await storage.upsertUser({
            id: email,
            email,
            firstName: null,
            lastName: null,
            profileImageUrl: null,
          });

          req.session.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
          };

          return res.json({ message: "Login successful", user });
        } catch (dbError) {
          console.error("Database error, using session-only auth:", dbError);
          const sessionUser = {
            id: email,
            email,
            firstName: 'User',
            lastName: '',
          };
          req.session.user = sessionUser;
          return res.json({ message: "Login successful (session only)", user: sessionUser });
        }
      } else {
        return res.status(401).json({ message: "Invalid credentials" });
      }
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // API logout for React client
  app.post('/api/auth/logout', (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      res.json({ message: "Logout successful" });
    });
  });

  // Check email endpoint for signup
  app.get('/api/auth/check-email/:email', async (req: any, res) => {
    try {
      const email = decodeURIComponent(req.params.email);
      
      // Check hardcoded users
      const DEV_USERS = ['admin@mindrush.com', 'google.user@example.com'];
      if (DEV_USERS.includes(email)) {
        return res.json({ exists: true });
      }

      // Check database
      try {
        const user = await storage.getUser(email);
        res.json({ exists: !!user });
      } catch (dbError) {
        // If database fails, assume email doesn't exist
        res.json({ exists: false });
      }
    } catch (error) {
      console.error("Check email error:", error);
      res.status(500).json({ message: "Failed to check email" });
    }
  });

  // Signup endpoint
  app.post('/api/auth/signup', async (req: any, res) => {
    try {
      const { email, password, firstName, lastName, company, acceptTerms } = req.body;
      
      if (!acceptTerms) {
        return res.status(400).json({ message: "You must accept the terms and conditions" });
      }

      // Check if user already exists
      try {
        const existingUser = await storage.getUser(email);
        if (existingUser) {
          return res.status(400).json({ message: "An account with this email already exists" });
        }
      } catch (dbError) {
        console.log("Database check failed, proceeding with signup");
      }

      // Create user
      try {
        const user = await storage.upsertUser({
          id: email,
          email,
          firstName,
          lastName,
          profileImageUrl: null,
        });

        // Set session
        req.session.user = {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
        };

        res.json({ message: "Account created successfully", user });
      } catch (dbError) {
        console.error("Database error during signup, using session-only:", dbError);
        const sessionUser = {
          id: email,
          email,
          firstName,
          lastName,
        };
        req.session.user = sessionUser;
        res.json({ message: "Account created successfully (session only)", user: sessionUser });
      }
    } catch (error) {
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Dev info endpoint
  app.get('/api/dev-info', (req, res) => {
    const DEV_USERS = {
      'admin@mindrush.com': '$omeRandomPass*',
      'google.user@example.com': 'mock-google-password',
      };

    res.json({
      message: "Development login credentials",
      users: DEV_USERS,
      instructions: {
        "With Password": "Use any of the above email/password combinations",
        "Without Password": "Use any email without password for passwordless login",
        "Google Mock": "Click 'Continue with Google' button (uses google.user@example.com)"
      }
    });
  });
}

// Development authentication fallback
function setupDevAuth(app: Express) {
  console.log("Setting up development authentication - use the React login page at /");
  
  // Redirect /api/login to home page (React will handle login UI)
  app.get("/api/login", (req, res) => {
    res.redirect("/");
  });
}

export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  // Check OIDC authentication
  if (req.user?.claims?.sub) {
    const user = req.user as any;
    
    if (!req.isAuthenticated() || !user.expires_at) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const now = Math.floor(Date.now() / 1000);
    if (now <= user.expires_at) {
      return next();
    }

    // Try to refresh token
    const refreshToken = user.refresh_token;
    if (!refreshToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const config = await getOidcConfig();
      const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
      updateUserSession(user, tokenResponse);
      return next();
    } catch (error) {
      return res.status(401).json({ message: "Unauthorized" });
    }
  }
  
  // Check dev session authentication
  if (req.session?.user) {
    // Add compatibility layer for existing code
    req.user = { claims: { sub: req.session.user.id } };
    return next();
  }
  
  return res.status(401).json({ message: "Unauthorized" });
};
