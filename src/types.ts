export type IntensityLevel = 'iniciante' | 'intermediario' | 'avancado';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color?: string;
}

export interface Exercise {
  id: string;
  name: string;
  videoUrl: string;
  categoryId: string;
  categoryName: string;
  intensity: IntensityLevel;
  typeTag: string; // e.g., 'Pilates Solo', 'Pilates Aparelho', 'Reformer'
  description: string;
  detailedNotes?: string;
  icon: string;
  imageUrl: string;
  createdAt: string;
  tags?: string[];
}

export type StudentPlanType = '1x_week' | '2x_week' | '3x_week' | 'avulsa';

export interface PlanOption {
  id: StudentPlanType;
  name: string;
  price: string;
  fullLabel: string;
  totalClasses: number;
  isMonthly: boolean;
}

export interface ClassSession {
  id: string;
  studentId: string;
  studentName: string;
  studentPhone?: string;
  studentLimitations?: string;
  date: string; // 'YYYY-MM-DD'
  time: string; // 'HH:mm'
  classNumber: number; // e.g. 1
  totalClasses: number; // e.g. 8 (or 1 for avulsa)
  descriptionLabel?: string; // 'Aula 1 de 8'
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  completedAt?: string;
  notes?: string;
}

export interface Student {
  id: string;
  name: string;
  phone: string;
  planId: StudentPlanType;
  planName: string;
  remainingClasses: number;
  totalPlanClasses: number;
  limitations: string;
  weeklySchedule: string; // Horários e dias fixos
  startDate?: string;
  createdAt: string;
}

export type ActiveScreen =
  | 'catalog'
  | 'agenda'
  | 'clients'
  | 'client-detail'
  | 'exercise-detail'
  | 'exercise-form'
  | 'category-manage';

export type NewItemTab = 'exercise' | 'category' | 'student';

export interface IconOption {
  id: string;
  name: string;
  label: string;
}
