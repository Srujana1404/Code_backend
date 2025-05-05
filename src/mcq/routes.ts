import { Router } from "express";
import { submitScore } from "./controller";

const router = Router();

router.get("/submit", submitScore); // endpoint: /mcq/submit

export default router;
