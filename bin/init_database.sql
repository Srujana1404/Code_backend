
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    user_role ENUM('admin', 'user') DEFAULT 'user',
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE contests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    start_time DATETIME,
    end_time DATETIME,
    created_by INT,  -- FK to users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
);


CREATE TABLE mcq_questions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_text TEXT NOT NULL,
);


CREATE TABLE mcq_options (
    id INT PRIMARY KEY AUTO_INCREMENT,
    question_id INT,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE
);



CREATE TABLE contest_mcq_map (
    id INT PRIMARY KEY AUTO_INCREMENT,
    contest_id INT,
    question_id INT,
    marks FLOAT NOT NULL DEFAULT 1,         -- ✅ Marks for this question in this contest
    negative_marks FLOAT DEFAULT 0,         -- Optional: Negative marking
    FOREIGN KEY (contest_id) REFERENCES contests(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES mcq_questions(id) ON DELETE CASCADE
);






CREATE TABLE mcq_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    contest_id INT,
    question_id INT,
    selected_option_id INT,
    is_correct BOOLEAN,
    submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contest_id) REFERENCES contests(id),
    FOREIGN KEY (question_id) REFERENCES mcq_questions(id),
    FOREIGN KEY (selected_option_id) REFERENCES mcq_options(id)
);



CREATE TABLE contest_results (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    contest_id INT,
    total_questions INT,
    correct_answers INT,
    score FLOAT,
    user_rank INT, 
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (contest_id) REFERENCES contests(id)
);
