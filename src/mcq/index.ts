import { Router } from "express";
import mcqRoutes from "./routes";

const router = Router();

router.use("/", mcqRoutes); // base path for MCQ

export default router;
