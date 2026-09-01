import React, { useState, useEffect } from 'react';
import { ActiveScreen, Exercise, Category } from './types';
import { INITIAL_CATEGORIES, INITIAL_EXERCISES } from './data/initialData';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { CatalogView } from './components/CatalogView';
import { ExerciseDetailView } from './components/ExerciseDetailView';
import { NewExerciseView } from './components/NewExerciseView';
import { ManageCategoriesView } from './components/ManageCategoriesView';
import { CheckCircle2 } from 'lucide-react';

const STORAGE_KEY_EXERCISES = 'alenka_pilates_exercises_v1';
const STORAGE_KEY_CATEGORIES = 'alenka_pilates_categories_v1';

export default function App() {
  // Load initial state from LocalStorage or default datasets
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_EXERCISES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved exercises:', e);
    }
    return INITIAL_EXERCISES;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_CATEGORIES);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Error loading saved categories:', e);
    }
    return INITIAL_CATEGORIES;
  });

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('catalog');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_EXERCISES, JSON.stringify(exercises));
    } catch (e) {
      console.error('Error saving exercises:', e);
    }
  }, [exercises]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
    } catch (e) {
      console.error('Error saving categories:', e);
    }
  }, [categories]);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Handlers for Navigation
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setActiveScreen('exercise-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewExercise = () => {
    setEditingExercise(null);
    setActiveScreen('exercise-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setActiveScreen('exercise-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveExercise = (
    exerciseData: Omit<Exercise, 'id' | 'createdAt'>,
    exerciseId?: string
  ) => {
    if (exerciseId) {
      // Editing existing
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId
            ? {
                ...ex,
                ...exerciseData,
              }
            : ex
        )
      );
      if (selectedExercise && selectedExercise.id === exerciseId) {
        setSelectedExercise({
          ...selectedExercise,
          ...exerciseData,
        });
      }
      showToast('Exercício atualizado com sucesso!');
      setActiveScreen('exercise-detail');
    } else {
      // Creating new
      const newEx: Exercise = {
        ...exerciseData,
        id: `ex-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      setExercises((prev) => [newEx, ...prev]);
      showToast('Novo exercício cadastrado!');
      setSelectedExercise(newEx);
      setActiveScreen('catalog');
    }
  };

  const handleDeleteExercise = (exerciseId: string) => {
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    setSelectedExercise(null);
    setActiveScreen('catalog');
    showToast('Exercício excluído com sucesso.');
  };

  const handleAddCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    showToast(`Categoria "${categoryData.name}" criada com sucesso!`);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    // Also remove associated exercises if any
    setExercises((prev) => prev.filter((ex) => ex.categoryId !== categoryId));
    showToast(`Categoria ${cat ? `"${cat.name}"` : ''} excluída.`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafa] text-[#191c1d] flex flex-col font-sans selection:bg-[#2b7a78] selection:text-[#befffc]">
      {/* Top App Bar */}
      <Navbar
        activeScreen={activeScreen}
        onNavigate={(screen) => setActiveScreen(screen)}
        isEditing={!!editingExercise}
        onEdit={
          activeScreen === 'exercise-detail' && selectedExercise
            ? () => handleEditExercise(selectedExercise)
            : undefined
        }
      />

      {/* Main View Transition */}
      <div className="flex-1 flex flex-col">
        {activeScreen === 'catalog' && (
          <CatalogView
            exercises={exercises}
            categories={categories}
            onSelectExercise={handleSelectExercise}
            onAddNewExercise={handleAddNewExercise}
            onManageCategories={() => setActiveScreen('category-manage')}
          />
        )}

        {activeScreen === 'exercise-detail' && selectedExercise && (
          <ExerciseDetailView
            exercise={selectedExercise}
            onBack={() => setActiveScreen('catalog')}
            onEdit={handleEditExercise}
            onDelete={handleDeleteExercise}
          />
        )}

        {activeScreen === 'exercise-form' && (
          <NewExerciseView
            categories={categories}
            editingExercise={editingExercise}
            onSaveExercise={handleSaveExercise}
            onSwitchTab={(tab) => {
              if (tab === 'category') setActiveScreen('category-manage');
            }}
            onCancel={() => {
              if (editingExercise) {
                setActiveScreen('exercise-detail');
              } else {
                setActiveScreen('catalog');
              }
            }}
          />
        )}

        {activeScreen === 'category-manage' && (
          <ManageCategoriesView
            categories={categories}
            exercises={exercises}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onSwitchTab={(tab) => {
              if (tab === 'exercise') setActiveScreen('exercise-form');
            }}
          />
        )}
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed top-20 right-4 md:right-8 z-50 bg-[#00615f] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <CheckCircle2 className="w-5 h-5 text-[#befffc]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Navigation for Mobile */}
      <BottomNav
        activeScreen={activeScreen}
        onNavigate={(screen) => setActiveScreen(screen)}
      />
    </div>
  );
}
