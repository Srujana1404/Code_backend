import { Router } from "express";
import { contests } from "./controller";

const router = Router();

router.get("/contests/:id", contests); // endpoint: /contest/:id

export default router;