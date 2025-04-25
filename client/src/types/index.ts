// Assessment related types
export interface Question {
  _id?: string;
  text: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Assessment {
  _id?: string;
  title: string;
  description: string;
  questions: Question[];
  createdAt?: string;
}

// Without correct answers for responder view
export interface AssessmentForResponder {
  _id: string;
  title: string;
  description: string;
  questions: {
    _id: string;
    text: string;
    options: string[];
  }[];
  createdAt: string;
}

// Response related types
export interface Response {
  _id?: string;
  assessmentId: string;
  answers: number[];
  score: number;
  submittedAt?: string;
  name?: string;
  email?: string;
}

export interface AssessmentResult {
  response: Response;
  totalQuestions: number;
  correctAnswers: number[];
}