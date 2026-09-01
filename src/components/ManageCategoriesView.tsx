import React, { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Category, Exercise, NewItemTab } from '../types';
import { AVAILABLE_ICONS } from '../data/initialData';
import { ExerciseIcon } from './ExerciseIcon';
import { DeleteConfirmModal } from './DeleteConfirmModal';

interface ManageCategoriesViewProps {
  categories: Category[];
  exercises: Exercise[];
  onAddCategory: (categoryData: Omit<Category, 'id'>) => void;
  onDeleteCategory: (categoryId: string) => void;
  onSwitchTab: (tab: NewItemTab) => void;
}

export const ManageCategoriesView: React.FC<ManageCategoriesViewProps> = ({
  categories,
  exercises,
  onAddCategory,
  onDeleteCategory,
  onSwitchTab,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('accessibility');
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);

  // Compute count of exercises for each category
  const getCategoryExerciseCount = (catId: string, catName: string) => {
    return exercises.filter(
      (ex) => ex.categoryId === catId || ex.categoryName.toLowerCase() === catName.toLowerCase()
    ).length;
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategoryName.trim()) {
      alert('Por favor, digite o nome da categoria.');
      return;
    }

    onAddCategory({
      name: newCategoryName.trim(),
      icon: selectedIcon,
    });

    setNewCategoryName('');
  };

  return (
    <main className="flex-grow pb-28 pt-6 px-4 md:px-8 max-w-3xl mx-auto w-full flex flex-col gap-6">
      {/* Segmented Control Tab (Exercício | Categoria | Cliente) */}
      <div className="flex bg-[#f2f4f4] rounded-xl p-1 border border-[#bec9c7]/60 w-full max-w-md mx-auto">
        <button
          onClick={() => onSwitchTab('exercise')}
          className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium text-[#506261] hover:bg-[#ffffff]/60 transition-colors cursor-pointer"
        >
          Exercício
        </button>
        <button
          type="button"
          className="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold bg-[#00615f] text-white shadow-xs transition-all cursor-pointer"
        >
          Categoria
        </button>
        <button
          onClick={() => onSwitchTab('student')}
          className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium text-[#506261] hover:bg-[#ffffff]/60 transition-colors cursor-pointer"
        >
          Cliente
        </button>
      </div>

      {/* Header text (Title and Description below tab) */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#191c1d] mb-1.5">
          Categorias
        </h1>
        <p className="text-sm md:text-base text-[#506261]">
          Gerencie as categorias e grupos musculares para organizar seus exercícios.
        </p>
      </div>

      {/* Categories List Section */}
      <section className="flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <h2 className="font-bold text-lg md:text-xl text-[#191c1d]">
            Categorias Atuais
          </h2>
          <span className="text-xs font-semibold text-[#506261] bg-[#eceeee] px-2.5 py-1 rounded-full">
            {categories.length} grupos
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const count = getCategoryExerciseCount(cat.id, cat.name);
            return (
              <div
                key={cat.id}
                className="bg-white border border-[#bec9c7]/60 rounded-xl p-4 flex items-center justify-between shadow-2xs hover:shadow-xs transition-shadow"
              >
                <div className="flex items-center gap-3.5">
                  <div className="bg-[#d0e4e3] text-[#00615f] p-3 rounded-full flex items-center justify-center">
                    <ExerciseIcon name={cat.icon} size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm md:text-base text-[#191c1d]">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-[#506261]">
                      {count} {count === 1 ? 'exercício' : 'exercícios'}
                    </p>
                  </div>
                </div>

                <button
                  aria-label={`Deletar categoria ${cat.name}`}
                  onClick={() => setCategoryToDelete(cat)}
                  className="text-[#ba1a1a] hover:bg-[#ffdad6]/50 p-2.5 rounded-full transition-colors"
                  title="Excluir categoria"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Add New Category Section */}
      <section className="bg-[#eceeee]/50 border border-[#bec9c7] rounded-2xl p-6 shadow-2xs flex flex-col gap-4">
        <h2 className="font-bold text-xl text-[#191c1d]">Nova Categoria</h2>
        <form onSubmit={handleAddCategory} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="category-name-input"
              className="text-sm font-semibold text-[#191c1d]"
            >
              Nome da Categoria <span className="text-[#ba1a1a]">*</span>
            </label>
            <input
              id="category-name-input"
              type="text"
              required
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="Ex: Alongamento Cervical"
              className="border border-[#bec9c7] bg-white text-[#191c1d] rounded-xl p-3 focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-all text-sm md:text-base w-full shadow-2xs"
            />
          </div>

          <div className="flex flex-col gap-2">
            <span className="text-sm font-semibold text-[#191c1d]">
              Selecione um Ícone
            </span>
            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
              {AVAILABLE_ICONS.map((icon) => {
                const isSelected = selectedIcon === icon.name;
                return (
                  <button
                    type="button"
                    key={icon.id}
                    onClick={() => setSelectedIcon(icon.name)}
                    title={icon.label}
                    className={`aspect-square border rounded-xl flex items-center justify-center transition-all ${
                      isSelected
                        ? 'border-2 border-[#00615f] bg-[#d0e4e3] text-[#00615f] shadow-xs scale-105'
                        : 'border-[#bec9c7] bg-white text-[#506261] hover:bg-[#f8fafa]'
                    }`}
                  >
                    <ExerciseIcon name={icon.name} size={22} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-2 flex justify-end">
            <button
              type="submit"
              id="btn-adicionar-categoria"
              className="bg-[#00615f] hover:bg-[#00504e] active:scale-98 text-white font-semibold text-sm px-6 py-3.5 rounded-full shadow-sm flex items-center gap-2 transition-all"
            >
              <PlusCircle className="w-5 h-5" />
              <span>Adicionar Categoria</span>
            </button>
          </div>
        </form>
      </section>

      {/* Delete Category Modal */}
      {categoryToDelete && (
        <DeleteConfirmModal
          isOpen={!!categoryToDelete}
          onClose={() => setCategoryToDelete(null)}
          onConfirm={() => {
            if (categoryToDelete) {
              onDeleteCategory(categoryToDelete.id);
            }
          }}
          title="Tem certeza?"
          itemName={categoryToDelete.name}
          type="category"
          exerciseCount={getCategoryExerciseCount(
            categoryToDelete.id,
            categoryToDelete.name
          )}
        />
      )}
    </main>
  );
};
