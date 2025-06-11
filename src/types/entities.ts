
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
  type: "base_text" | "base_multiple_option";
  options?: string[];
}

export interface Question {
  id?: string; 
  statement: string;
  answer_correct: string;
  points: number;
  answer_base: AnswerBase;
  competences_id: string[]; 
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

// New types for Results
export interface Student {
  id: string; // Using string for ID consistency
  name: string;
  last_name: string;
  email: string;
  cel_phone: string | null;
  role: 'STUDENT';
  // Optional fields from example
  emotion?: string | null;
  coin_earned?: number;
  coin_available?: number;
}

export interface StudentResult {
  ranking: number;
  obtained_points: number;
  student: Student;
}
