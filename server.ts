import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import multer from "multer";

const DATA_DIR = path.join(process.cwd(), "data");
const UPLOADS_DIR = path.join(process.cwd(), "uploads");
const CMS_FILE = path.join(DATA_DIR, "cms.json");
const POSTS_FILE = path.join(DATA_DIR, "posts.json");
const BRIEFINGS_FILE = path.join(DATA_DIR, "briefings.json");

// Ensure data and uploads directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR);

if (!fs.existsSync(BRIEFINGS_FILE)) {
  fs.writeFileSync(BRIEFINGS_FILE, JSON.stringify([]));
}
if (!fs.existsSync(CMS_FILE)) {
  fs.writeFileSync(CMS_FILE, JSON.stringify({
    siteName: "INDERA - Intelligence, Defense Research and Analysis",
    logoText: "INDERA",
    primaryColor: "#E31E24",
    secondaryColor: "#050505",
    fontFamily: "JetBrains Mono",
    footerText: "© 2026 INDERA - Intelligence, Defense Research and Analysis. All rights reserved."
  }));
}
if (!fs.existsSync(POSTS_FILE)) {
  fs.writeFileSync(POSTS_FILE, JSON.stringify([
    { id: 1, title: "New Addition to Sanctions List", content: "The committee has added QDi.436 to the list.", date: "2026-03-25" },
    { id: 2, title: "Annual Review Completed", content: "The annual review of the 1267 list has been finalized.", date: "2026-03-10" }
  ]));
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage });

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Basic middleware first
  app.use(express.json());
  app.use(cors());
  app.use("/uploads", express.static(UPLOADS_DIR));

  // Auth API
  app.post("/api/login", (req, res) => {
    console.log("Received login request:", req.body);
    const { email, password } = req.body || {};
    
    if (!email || !password) {
      console.warn("Login attempt with missing credentials");
      return res.status(400).json({ success: false, message: "Missing credentials" });
    }

    console.log(`Login attempt for: ${email}`);
    // Simple hardcoded auth for demonstration
    if (email === "ADMIN" && password === "Star") {
      console.log("Login successful");
      res.json({ success: true, user: { email, role: "admin" } });
    } else {
      console.warn("Login failed: Invalid credentials");
      res.status(401).json({ success: false, message: "Invalid credentials" });
    }
  });

  // File Upload API
  app.post("/api/upload", upload.array("files"), (req, res) => {
    const files = (req.files as Express.Multer.File[]).map(file => ({
      name: file.originalname,
      path: `/uploads/${file.filename}`,
      type: file.mimetype
    }));
    res.json({ success: true, files });
  });

  // Briefings API
  app.get("/api/briefings", (req, res) => {
    const data = JSON.parse(fs.readFileSync(BRIEFINGS_FILE, "utf-8"));
    res.json(data);
  });

  app.post("/api/briefings", (req, res) => {
    const briefings = JSON.parse(fs.readFileSync(BRIEFINGS_FILE, "utf-8"));
    const newBriefing = {
      id: Date.now(),
      ...req.body,
      timestamp: new Date().toISOString()
    };
    briefings.push(newBriefing);
    fs.writeFileSync(BRIEFINGS_FILE, JSON.stringify(briefings, null, 2));
    res.json(newBriefing);
  });

  // CMS API
  app.get("/api/cms", (req, res) => {
    const data = JSON.parse(fs.readFileSync(CMS_FILE, "utf-8"));
    res.json(data);
  });

  app.post("/api/cms", (req, res) => {
    fs.writeFileSync(CMS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  });

  // Posts API
  app.get("/api/posts", (req, res) => {
    const data = JSON.parse(fs.readFileSync(POSTS_FILE, "utf-8"));
    res.json(data);
  });

  app.post("/api/posts", (req, res) => {
    fs.writeFileSync(POSTS_FILE, JSON.stringify(req.body, null, 2));
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting in development mode with Vite...");
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting in production mode...");
    const distPath = path.join(process.cwd(), "dist");
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get("*", (req, res) => {
        res.sendFile(path.join(distPath, "index.html"));
      });
    } else {
      console.error("Production build not found. Please run 'npm run build' first.");
      app.get("*", (req, res) => {
        res.status(500).send("Production build not found. Please run 'npm run build' first.");
      });
    }
  }

  // Error handling middleware
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("SERVER ERROR:", err);
    res.status(500).json({ 
      success: false, 
      message: "Internal Server Error",
      error: process.env.NODE_ENV === "production" ? "An unexpected error occurred" : err.message
    });
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("CRITICAL: Failed to start server:", err);
  process.exit(1);
});
