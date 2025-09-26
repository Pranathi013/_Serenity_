export enum MessageAuthor {
  USER = 'user',
  BOT = 'bot',
}

export interface Message {
  id: string;
  author: MessageAuthor;
  text: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
}

export enum Sentiment {
  Positive = 'Positive',
  Negative = 'Negative',
  Neutral = 'Neutral',
}

export interface SentimentAnalysisResult {
  sentiment: Sentiment;
  summary: string;
}

export interface MoodAnalysisResult {
  moodName: string;
  moodScore: number;
}

export interface Achievement {
  id: string;
  text: string;
  date: string;
}

export interface Task {
  id: string;
  name: string;
  startTime: string; // "HH:mm"
  duration: number; // minutes
}

export interface Medicine {
  id: string;
  name: string;
  time: string; // "HH:mm"
}

export interface BookChapter {
  title: string;
  content: string;
}

export type BookContentResult = BookChapter[];

export interface ParentalControlsSettings {
  enabled: boolean;
  parentName: string;
  parentContact: string; // email or phone
  shareMood: boolean;
  shareStreaks: boolean;
}
