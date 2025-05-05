import { Request, Response } from "express";

export function submitScore(req: Request, res: Response) {
  res.status(200).json({ message: "Hello from MCQ Controller!" });
}
