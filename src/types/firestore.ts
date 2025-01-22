import { Timestamp } from 'firebase/firestore';

export interface Task {
  title: string;
  description: string;
  dueDate: Timestamp;
  completed: boolean;
  userId: string;
  createdAt: Timestamp;
  tags: string[]; // Array de IDs das tags
}

export interface Subject {
  name: string;
  totalHours: number;
  type1: {
    hours: number;
    hoursPerClass: number;
    absences: number;
  };
  type2: {
    hours: number;
    hoursPerClass: number;
    absences: number;
  };
  hasMultipleTypes: boolean;
  maxAbsencePercentage: number;
  userId: string;
  createdAt: Timestamp;
}

export interface PomodoroSession {
  type: 'focus' | 'break';
  duration: number;
  startedAt: Timestamp;
  completedAt: Timestamp;
  userId: string;
  createdAt: Timestamp;
}

export interface UserSettings {
  userId: string;
  theme: string;
  notifications: boolean;
  pomodoroSettings: {
    focusTime: number;
    shortBreakTime: number;
    longBreakTime: number;
    sessionsUntilLongBreak: number;
  };
}

export interface Note {
  title: string;
  content: string;
  topicId: string;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Topic {
  name: string;
  userId: string;
  createdAt: Timestamp;
}

export interface Tag {
  name: string;
  color: string;
  userId: string;
  createdAt: Timestamp;
} 