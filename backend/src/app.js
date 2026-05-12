import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import express from "express";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import fs from "fs";
import authRoutes from "./routes/auth.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import userRoutes from "./routes/user.routes.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";

import { ensureRuntimeConfig } from "./utils/security.js";

dotenv.config();
ensureRuntimeConfig();

const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://orbit-project-suite.onrender.com"
];

app.disable("x-powered-by");
if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1);
}

// --- START STATIC ASSETS (TOP PRIORITY) ---
const possiblePaths = [
  path.join(process.cwd(), "frontend/dist"),
  path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../frontend/dist"),
  "/opt/render/project/src/frontend/dist"
];

let frontendPath = possiblePaths[0];
for (const p of possiblePaths) {
  if (fs.existsSync(p)) {
    frontendPath = p;
    break;
  }
}

if (fs.existsSync(frontendPath)) {
  app.use(express.static(frontendPath));
}
// --- END STATIC ASSETS ---

app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", ...allowedOrigins, "https://*.onrender.com"],
        fontSrc: ["'self'", "https:", "data:"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    referrerPolicy: { policy: "same-origin" },
  })
);

app.use(hpp());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".onrender.com")) {
        return callback(null, true);
      }
      return callback(new Error("CORS origin is not allowed"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb", parameterLimit: 50 }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many authentication attempts. Please try again later." }
});

app.use("/api", apiLimiter);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "team-task-manager-api" });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/users", userRoutes);

app.get("/api/debug-paths", (req, res) => {
  const cwd = process.cwd();
  const paths = [cwd, path.join(cwd, "frontend"), path.join(cwd, "frontend/dist")];
  const results = paths.map(p => ({
    path: p,
    exists: fs.existsSync(p),
    contents: fs.existsSync(p) ? fs.readdirSync(p).slice(0, 10) : []
  }));
  res.json({ cwd, results });
});

// SPA FALLBACK (BOTTOM PRIORITY)
if (process.env.NODE_ENV === "production") {
  app.get("*", (req, res, next) => {
    if (!req.path.startsWith("/api") && !req.path.startsWith("/health")) {
      const p = path.join(process.cwd(), "frontend/dist/index.html");
      if (fs.existsSync(p)) return res.sendFile(p);
      const p2 = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../frontend/dist/index.html");
      if (fs.existsSync(p2)) return res.sendFile(p2);
    }
    next();
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(notFound);
app.use(errorHandler);

export default app;
