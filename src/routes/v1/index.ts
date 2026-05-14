import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import listingsRoutes from "./listings.routes.js";
import bookingsRoutes from "./bookings.routes.js";
import reviewsRoutes from "./reviews.routes.js";
import uploadRoutes from "./upload.routes.js"
import aiRoutes from "./ai.routes.js";
import hostRequestRoutes from "./hostRequest.routes.js";


const v1Router = Router();

v1Router.use("/auth",authRoutes)
v1Router.use("/users", usersRoutes);
v1Router.use("/usersuploads", uploadRoutes);
v1Router.use("/listings", listingsRoutes);
v1Router.use("/bookings", bookingsRoutes);
v1Router.use("/reviews", reviewsRoutes);
v1Router.use("/ai",aiRoutes);
v1Router.use("/host-requests", hostRequestRoutes)

export default v1Router;
