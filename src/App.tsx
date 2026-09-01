import React, { useState, useEffect } from 'react';
import { ActiveScreen, Exercise, Category } from './types';
import { INITIAL_CATEGORIES, INITIAL_EXERCISES } from './data/initialData';
import { supabase } from './lib/supabaseClient';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { CatalogView } from './components/CatalogView';
import { ExerciseDetailView } from './components/ExerciseDetailView';
import { NewExerciseView } from './components/NewExerciseView';
import { ManageCategoriesView } from './components/ManageCategoriesView';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('catalog');
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load catalog from Supabase (shared across every visitor)
  useEffect(() => {
    const loadCatalog = async () => {
      const [categoriesRes, exercisesRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('exercises').select('*').order('createdAt', { ascending: false }),
      ]);

      if (categoriesRes.error || exercisesRes.error) {
        console.error('Error loading catalog from Supabase:', categoriesRes.error || exercisesRes.error);
        setCategories(INITIAL_CATEGORIES);
        setExercises(INITIAL_EXERCISES);
      } else {
        setCategories(categoriesRes.data as Category[]);
        setExercises(exercisesRes.data as Exercise[]);
      }
      setIsLoading(false);
    };

    loadCatalog();
  }, []);

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

  const handleSaveExercise = async (
    exerciseData: Omit<Exercise, 'id' | 'createdAt'>,
    exerciseId?: string
  ) => {
    if (exerciseId) {
      // Editing existing
      const { error } = await supabase.from('exercises').update(exerciseData).eq('id', exerciseId);
      if (error) {
        console.error('Error updating exercise:', error);
        showToast('Erro ao atualizar exercício.');
        return;
      }
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
      const { error } = await supabase.from('exercises').insert(newEx);
      if (error) {
        console.error('Error creating exercise:', error);
        showToast('Erro ao cadastrar exercício.');
        return;
      }
      setExercises((prev) => [newEx, ...prev]);
      showToast('Novo exercício cadastrado!');
      setSelectedExercise(newEx);
      setActiveScreen('catalog');
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    const { error } = await supabase.from('exercises').delete().eq('id', exerciseId);
    if (error) {
      console.error('Error deleting exercise:', error);
      showToast('Erro ao excluir exercício.');
      return;
    }
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    setSelectedExercise(null);
    setActiveScreen('catalog');
    showToast('Exercício excluído com sucesso.');
  };

  const handleAddCategory = async (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    const { error } = await supabase.from('categories').insert(newCat);
    if (error) {
      console.error('Error creating category:', error);
      showToast('Erro ao criar categoria.');
      return;
    }
    setCategories((prev) => [...prev, newCat]);
    showToast(`Categoria "${categoryData.name}" criada com sucesso!`);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    // The "categories" row deletion cascades to its exercises in the database.
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) {
      console.error('Error deleting category:', error);
      showToast('Erro ao excluir categoria.');
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setExercises((prev) => prev.filter((ex) => ex.categoryId !== categoryId));
    showToast(`Categoria ${cat ? `"${cat.name}"` : ''} excluída.`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafa] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00615f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
