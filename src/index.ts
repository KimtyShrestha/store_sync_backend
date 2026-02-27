import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import { connectDatabase } from "./database/store.sync.db";
import { PORT } from "./config";
import authRoutes from "./routes/auth.routes";
import uploadRoutes from "./routes/upload.routes";
import superadminRoutes from "./routes/superadmin.routes";
import ownerRoutes from "./routes/owner.routes";
import branchRoutes from "./routes/branch.routes";

const app: Application = express();

import cors from "cors";

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(bodyParser.json());
app.use("/api/branch", branchRoutes);
app.use("/api/owner", ownerRoutes);
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use("/api/upload", uploadRoutes);
app.use("/api/superadmin", superadminRoutes);
console.log("Mounting auth routes...");
app.use("/api/auth", authRoutes);
app.get("/", (req: Request, res: Response) => {
  return res
    .status(200)
    .json({ success: "true", message: "Welcome to the API" });
});

async function startServer() {
  await connectDatabase();

  app.listen(PORT, () => {
    console.log(`Server running on: http://localhost:${PORT}`);
  });
}

startServer();

