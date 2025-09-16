import express, { type Request, Response, NextFunction } from "express";
import http from "http";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// --------- Logger Middleware ----------
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) logLine = logLine.slice(0, 79) + "…";
      log(logLine);
    }
  });

  next();
});

// --------- Async Init ----------
(async () => {
  // Daftarkan semua routes API
  await registerRoutes(app);

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    // 🟢 Mode Development (lokal)
    const server = http.createServer(app);          // buat HTTP server manual
    await setupVite(app, server);                   // kirim app & server ke setupVite
    const port = parseInt(process.env.PORT || "5000", 10);
    server.listen(port, () => log(`Dev server running at http://localhost:${port}`));
  } else {
    // 🟠 Mode Production (Vercel)
    // Tidak perlu server.listen di sini — Vercel yang handle
    serveStatic(app);
  }
})();

// 🟡 Penting untuk Vercel: export Express instance
export default app;
