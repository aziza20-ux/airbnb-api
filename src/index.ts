import express from "express";
import compression from "compression";
import { globalErrorHandler } from "./middlewares/error.middleware";
import "dotenv/config";
import type { Request,Response,NextFunction } from "express";
import { setupSwagger } from "./config/swagger.js";
import { requestlimit } from "./middlewares/ratelimit.middleware";
import morgan from "morgan";
import v1Router from "./routes/v1/index.js";



const app = express();
const PORT = process.env.PORT || 3000;


// Middleware
app.use(express.json());
setupSwagger(app);
app.use(requestlimit);  // apply to all routes


app.use(compression());  // compress all responses

app.get("/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date() });
});

app.use("/api/v1", v1Router);
// app.use("/auth",authRoutes)
// app.use("/api/users", usersRoutes);
// app.use("/users", uploadRoutes);
// app.use("/api/listings", listingsRoutes);
// app.use("/api/bookings", bookingsRoutes);
app.use(globalErrorHandler);

//not found global  handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

//global handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);  // log full error server-side
  res.status(500).json({ error: "Something went wrong" });  // generic message to client
});

//morgan logger
// dev format in development, combined format in production
app.use(process.env["NODE_ENV"] === "production" ? morgan("combined") : morgan("dev"));




app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
