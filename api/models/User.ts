import { ObjectId } from 'mongodb';

export interface User {
  _id?: ObjectId;
  email: string;
  name: string;
  passwordHash?: string;
  googleId?: string;
  createdAt: Date;
  updatedAt: Date;
  preferences?: {
    currency: string;
    timezone: string;
    theme: 'dark' | 'light';
  };
}

export interface Transaction {
  _id?: ObjectId;
  userId: ObjectId;
  amount: number;
  description: string;
  category: string;
  type: 'income' | 'expense';
  date: Date;
  isRecurring: boolean;
  recurringPattern?: 'daily' | 'weekly' | 'monthly' | 'yearly';
  recurringEndDate?: Date;
  parentTransactionId?: ObjectId;
  attachments?: string[];
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Budget {
  _id?: ObjectId;
  name: string;
  description?: string;
  ownerId: ObjectId;
  members: Array<{
    userId: ObjectId;
    role: 'owner' | 'admin' | 'member';
    joinedAt: Date;
  }>;
  categories: Array<{
    name: string;
    limit: number;
    spent: number;
  }>;
  totalBudget: number;
  period: 'monthly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryRule {
  _id?: ObjectId;
  userId: ObjectId;
  keywords: string[];
  category: string;
  priority: number;
  enabled: boolean;
  createdAt: Date;
}

export interface SavingsGoal {
  _id?: ObjectId;
  userId: ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: Date;
  category?: string;
  createdAt: Date;
  updatedAt: Date;
}
