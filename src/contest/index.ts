import { Router } from "express";
import contest from "./routes";

const router = Router();

router.use("/", contest); // base path for MCQ

export default router;
