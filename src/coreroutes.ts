import { Router } from "express";
import mcq from "./mcq";
import contest from "./contest";
import upload from "./upload";

const router = Router();

router.use("/", mcq); // endpoint: /api/mcq/submit
router.use("/", contest); // endpoint: /contest/:id
router.use("/", upload);

export default router;

