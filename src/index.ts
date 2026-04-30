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
const PORT = Number(process.env.PORT) || 3000;

//morgan logger
// dev format in development, combined format in production
app.use(process.env["NODE_ENV"] === "production" ? morgan("combined") : morgan("dev"));
// Middleware
app.use(express.json());
setupSwagger(app);
app.use(requestlimit);  // apply to all routes


app.use(compression());  // compress all responses

app.get("/api/v1/health", (req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime(), timestamp: new Date() });
});

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Service health check
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: Service is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 uptime:
 *                   type: number
 *                   example: 123.45
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: 2026-04-30T12:00:00.000Z
 */

app.use("/api/v1", v1Router);
app.use(globalErrorHandler);

//404 not found global  handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: "Route not found" });
});

//global handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);  // log full error server-side
  res.status(500).json({ error: "Something went wrong" });  // generic message to client
});



app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
