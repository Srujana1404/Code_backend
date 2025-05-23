import { Request, Response } from "express";
import dbQuery from "../services/db";

export async function contests(req: Request, res: Response) {
  const contestId = req.params.id;
  try {
    const rows = await dbQuery(
      "SELECT * FROM contest_with_status WHERE id = ?",
      [contestId]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: "Contest not found" });
    }

   return res.json({ contestdata: rows[0] });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

