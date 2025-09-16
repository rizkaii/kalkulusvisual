import express from "express";

const app = express();

// contoh route
app.get("/", (_req, res) => {
  res.send("Hello from server");
});

// ✅ pilih salah satu ekspor:
export { app };          // kalau mau named export
// atau
export default app;      // kalau mau default export
