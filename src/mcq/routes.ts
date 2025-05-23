import { Router } from "express";
import { getMCQdata, infoTable, submitScore } from "./controller";


const router = Router();

router.post("/submit", submitScore); // endpoint: /mcq/submit
router.get("/contestDetails/:id", infoTable);
router.get("/MCQdata/:id", getMCQdata); // endpoint: /mcq/contestDetails/:id

export default router;
