import { Router } from "express";
import uploadRouter from "./routes";

const router = Router();

// Defining the core path from which this module should be accessed
router.use("/upload", uploadRouter)

export default router;