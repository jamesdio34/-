
export enum SubjectType {
  CHINESE = '國語',
  MATH = '數學',
  LIFE = '生活',
  MIXED = '大混亂',
}

export interface Pokemon {
  id: number;
  name: string;
  spriteUrl: string; // Animated GIF
  obtainedAt: number;
}

export interface UserState {
  name: string;
  avatarUrl: string; // Default or Pokemon sprite
  gold: number;
  completedLevels: Record<string, number>; // key: Subject, value: max level cleared
  inventory: Pokemon[];
  mistakes: MistakeRecord[];
  seenQuestions: string[]; // List of question texts already answered to avoid repeats
}

export interface MistakeRecord {
  id: string;
  question: string;
  correctAnswer: string;
  subject: SubjectType;
  timestamp: number;
}

export interface Question {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  difficulty?: number; // 1: Easy, 2: Medium, 3: Hard
}

export interface BossData {
  name: string;
  imageUrl: string;
  tauntText: string;
  tauntAudioBase64?: string;
}

export interface LevelConfig {
  level: number;
  subject: SubjectType;
  questionCount: number;
  rewardGold: number;
}
