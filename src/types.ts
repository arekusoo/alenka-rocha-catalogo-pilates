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

export type ActiveScreen = 'catalog' | 'exercise-detail' | 'exercise-form' | 'category-manage';

export interface IconOption {
  id: string;
  name: string;
  label: string;
}
