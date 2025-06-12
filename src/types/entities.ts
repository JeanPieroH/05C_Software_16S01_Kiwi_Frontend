
export interface Classroom {
  id: string;
  name: string;
  description: string;
  quiz?: Quiz[];
  competences?: Competency[];
}

export interface Competency {
  id: string; 
  name: string;
  description: string;
}

export interface AnswerBase {
  id_answer?: number; // From your example JSON
  type: "base_text" | "base_multiple_option";
  options?: string[];
}

export interface Question {
  id?: string | number; // Can be number from your example
  statement: string;
  answer_correct: string;
  points: number;
  answer_base: AnswerBase;
  competences_id: (string | number)[]; // Can be numbers from your example
}

export interface Quiz {
  id: string;
  title: string;
  instruction: string;
  total_points?: number; 
  start_time?: string;
  end_time?: string;
  created_at?: string;
  updated_at?: string;
  questions?: Question[];
  classroom_id?: string; 
}

export interface NewQuizPayload {
  classroom_id: string;
  title: string;
  instruction: string;
  start_time: string;
  end_time: string;
  questions: Question[];
}

export interface TypeQuestion {
  textuales: boolean;
  inferenciales: boolean;
  criticas: boolean;
}

export interface GenerateQuizFromDocumentPayload {
  classroom_id: string;
  num_question: number;
  point_max: number;
  competences: Competency[]; 
  type_question: TypeQuestion;
}

export interface GenerateQuizFromTextPayload {
  classroom_id: string;
  num_question: number;
  point_max: number;
  text: string;
  competences: Competency[];
  type_question: TypeQuestion;
}

// For Results
export interface Student { // Re-using User from auth for simplicity if applicable, or define specific Student type
  id: string; 
  name: string;
  last_name: string;
  email: string;
  cel_phone: string | null;
  role: 'STUDENT';
  emotion?: string | null;
  coin_earned?: number;
  coin_available?: number;
}

export interface StudentResult {
  ranking: number;
  obtained_points: number;
  student: Student;
}

// For Quiz Submissions
export interface QuizSubmissionSummary {
  student_id: string; // or use User['id']
  student_name: string;
  student_last_name: string;
  points_obtained: number;
  submission_date?: string; // Optional
}

export interface SubmittedAnswer {
  id?: number; // From your example
  type: "submitted_text" | "submitted_multiple_option";
  answer_written?: string;
  option_select?: string;
}

export interface QuestionAttempt extends Question {
  feedback_automated: string | null;
  feedback_teacher: string | null;
  points_obtained: number;
  answer_submitted: SubmittedAnswer;
}

export interface StudentQuizAttempt {
  id: string | number; // Attempt ID or Quiz ID if unique per student
  title: string;
  instruction: string;
  start_time: string;
  end_time: string;
  created_at: string; // Submission time or quiz creation
  updated_at: string; // Last update to submission/feedback
  feedback_automated: string | null; // Overall automated feedback
  feedback_teacher: string | null;   // Overall teacher feedback
  points_obtained: number;          // Total points for this attempt
  questions: QuestionAttempt[];
  student_id?: string; // For context
  quiz_id?: string; // For context
}

export interface SaveFeedbackPayload {
    quiz_id: string;
    student_id: string;
    general_feedback: string | null;
    question_feedbacks: Array<{
        question_id: string | number; // or number
        feedback_text: string | null;
    }>;
}


// Store related types
export type CharacterType = "ANIMAL" | "HUMAN" | "OTHER"; // Add more as needed

export interface Character {
  id: string;
  name: string;
  modelUrl: string;
  price: number;
  type: CharacterType;
}

export type StoreCharacterData = {
  [key in CharacterType]?: Character[];
};
