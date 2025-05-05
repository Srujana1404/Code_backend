import { Router } from "express";
import mcq from "./mcq";

const router = Router();

router.use("/", mcq); // endpoint: /api/mcq/submit

export default router;
