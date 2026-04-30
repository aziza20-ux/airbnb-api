import { Router } from "express";
import authRoutes from "./auth.routes.js";
import usersRoutes from "./users.routes.js";
import listingsRoutes from "./listings.routes.js";
import bookingsRoutes from "./bookings.routes.js";
import uploadRoutes from "./upload.routes.js"


const v1Router = Router();

v1Router.use("/auth",authRoutes)
v1Router.use("/users", usersRoutes);
v1Router.use("/usersuploads", uploadRoutes);
v1Router.use("/listings", listingsRoutes);
v1Router.use("/bookings", bookingsRoutes);

export default v1Router;
