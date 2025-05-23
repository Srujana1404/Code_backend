import { Request, Response } from "express";
import dbQuery from "../services/db";

export async function mcq(req: Request, res: Response) {
  const mcqId = req.params.id;
  try {
    // Simulate a database query
    const rows = await dbQuery(
      "SELECT * FROM mcq_with_status WHERE id = ?",
      [mcqId]
    );

    if ((rows as any[]).length === 0) {
      return res.status(404).json({ message: "MCQ not found" });
    }
    return res.json({ mcqdata: rows[0] });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export async function infoTable(req: Request, res: Response) {
  const contestId = req.params.id;
  const sql = `
        SELECT
        contest_id,
        COUNT(question_id) AS total_questions,
        SUM(marks) AS total_score,
        SUM(negative_marks) AS total_negative_marks
        FROM
            contest_mcq_map
        WHERE
            contest_id = ?
        GROUP BY
            contest_id;`


  const result = await dbQuery(sql, [contestId]);
 return res.json({ contestDetails: result[0] });

}

export async function getMCQdata(req: Request, res: Response) {
  const contestId = req.params.id;
  const sql = `
        SELECT 
        q.id AS question_id,
        q.question_text,
        cqm.marks,
        o.id AS option_id,
        o.option_text
        FROM 
            contest_mcq_map cqm
        JOIN 
            mcq_questions q ON cqm.question_id = q.id
        JOIN 
            mcq_options o ON o.question_id = q.id
        WHERE 
            cqm.contest_id = ?
        ORDER BY 
            q.id, o.id;`;


  const result = await dbQuery(sql, [contestId]);
  return res.json({ mcqdata: result });
}

export async function submitScore(req: Request, res: Response) {
  const { contestId, userId, selectedAnswers, markedForReview } = req.body;

  try {
    // Insert each submission
    for (const [questionId, selectedOptionId] of Object.entries(selectedAnswers)) {
      const [optionRow] = await dbQuery(
        `SELECT o.is_correct, c.marks, c.negative_marks
         FROM mcq_options o
         JOIN contest_mcq_map c ON c.question_id = o.question_id
         WHERE o.id = ? AND c.contest_id = ?`,
        [selectedOptionId, contestId]
      );

      const isCorrect = optionRow?.is_correct === 1;
      await dbQuery(
        `INSERT INTO mcq_submissions
          (user_id, contest_id, question_id, selected_option_id, is_correct, marked_for_review)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          1,
          contestId,
          questionId,
          selectedOptionId,
          isCorrect ? 1 : 0,
          markedForReview && markedForReview.includes(Number(questionId)) ? 1 : 0
        ]
      );
    }

    // Get summary for contest_results
    const [summary] = await dbQuery(
      `SELECT 
        COUNT(*) AS total_questions,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS correct_answers,
        SUM(CASE WHEN is_correct THEN cqm.marks ELSE 0 END) AS score,
        SUM(CASE WHEN is_correct = FALSE THEN cqm.negative_marks ELSE 0 END) AS negative_marks
      FROM mcq_submissions ms
      JOIN contest_mcq_map cqm ON cqm.question_id = ms.question_id AND cqm.contest_id = ms.contest_id
      WHERE ms.user_id = ? AND ms.contest_id = ?`,
      [1, contestId]
    );

    // Insert into contest_results
    await dbQuery(
      `INSERT INTO contest_results (
        user_id, contest_id, total_questions, correct_answers, score, negative_marks
      ) VALUES (?, ?, ?, ?, ?, ?)`,
      [
        1,
        contestId,
        summary.total_questions || 0,
        summary.correct_answers || 0,
        summary.score || 0,
        summary.negative_marks || 0
      ]
    );

    return res.json({ message: "Submission successful", result: summary });
  } catch (error) {
    console.error("Error in submitScore:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
