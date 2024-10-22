export interface Problem {
    id: number;
    question: string;
    difficulty: 'Basic' | 'Intermediate' | 'Advanced';
    topic: string;
}

export interface SolutionResult {
    correct: boolean;
    feedback: string;
}