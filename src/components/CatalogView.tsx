import React, { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, Plus, Sparkles, Filter, ChevronDown } from 'lucide-react';
import { Exercise, Category, IntensityLevel } from '../types';
import { ExerciseIcon } from './ExerciseIcon';

interface CatalogViewProps {
  exercises: Exercise[];
  categories: Category[];
  onSelectExercise: (exercise: Exercise) => void;
  onAddNewExercise: () => void;
  onManageCategories: () => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  exercises,
  categories,
  onSelectExercise,
  onAddNewExercise,
  onManageCategories,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIntensity, setSelectedIntensity] = useState<IntensityLevel | 'all'>('all');
  const [showIntensityDropdown, setShowIntensityDropdown] = useState(false);

  // Filter exercises
  const filteredExercises = useMemo(() => {
    return exercises.filter((ex) => {
      // Search filter
      const matchesSearch =
        searchQuery.trim() === '' ||
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.categoryName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ex.tags && ex.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      // Category filter
      const matchesCategory =
        selectedCategory === 'all' ||
        ex.categoryId === selectedCategory ||
        ex.categoryName.toLowerCase() === selectedCategory.toLowerCase();

      // Intensity filter
      const matchesIntensity =
        selectedIntensity === 'all' || ex.intensity === selectedIntensity;

      return matchesSearch && matchesCategory && matchesIntensity;
    });
  }, [exercises, searchQuery, selectedCategory, selectedIntensity]);

  // Render intensity level bars and badge
  const renderIntensityBadge = (level: IntensityLevel) => {
    switch (level) {
      case 'iniciante':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d0e4e3]/50 text-[#00615f] border border-[#2b7a78]/20">
            <span className="flex items-end gap-0.5 h-3">
              <span className="w-1 h-1.5 bg-[#00615f] rounded-xs"></span>
              <span className="w-1 h-2.5 bg-[#bec9c7] rounded-xs"></span>
              <span className="w-1 h-3 bg-[#bec9c7] rounded-xs"></span>
            </span>
            <span>Iniciante</span>
          </div>
        );
      case 'intermediario':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#d0e4e3]/50 text-[#506261] border border-[#bec9c7]">
            <span className="flex items-end gap-0.5 h-3">
              <span className="w-1 h-1.5 bg-[#506261] rounded-xs"></span>
              <span className="w-1 h-2.5 bg-[#506261] rounded-xs"></span>
              <span className="w-1 h-3 bg-[#bec9c7] rounded-xs"></span>
            </span>
            <span>Intermediário</span>
          </div>
        );
      case 'avancado':
        return (
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eceeee] text-[#191c1d] border border-[#bec9c7]">
            <span className="flex items-end gap-0.5 h-3">
              <span className="w-1 h-1.5 bg-[#00615f] rounded-xs"></span>
              <span className="w-1 h-2.5 bg-[#00615f] rounded-xs"></span>
              <span className="w-1 h-3 bg-[#00615f] rounded-xs"></span>
            </span>
            <span>Avançado</span>
          </div>
        );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 md:px-8 py-6 pb-28 md:pb-28">
      {/* Title */}
      <div className="mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-[#191c1d] tracking-tight">
          Catálogo de Exercícios
        </h2>
        <p className="text-sm text-[#506261] mt-0.5">
          {exercises.length} movimentos cadastrados para suas aulas e prescrições
        </p>
      </div>

      {/* Search and Intensity Filter row */}
      <div className="flex items-center gap-3 mb-5">
        {/* Search input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6f7978]">
            <Search className="w-4 h-4" />
          </div>
          <input
            id="search-exercise-input"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar exercício..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#bec9c7]/80 rounded-full text-sm text-[#191c1d] placeholder-[#6f7978] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-all shadow-2xs"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#6f7978] hover:text-[#191c1d]"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Intensity Filter Button */}
        <div className="relative">
          <button
            id="filter-intensity-btn"
            onClick={() => setShowIntensityDropdown(!showIntensityDropdown)}
            className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedIntensity !== 'all'
                ? 'bg-[#00615f] text-white shadow-2xs'
                : 'bg-[#f2f4f4] text-[#506261] hover:bg-[#eceeee]'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {selectedIntensity === 'all'
                ? 'Intensidade'
                : selectedIntensity === 'iniciante'
                ? 'Iniciante'
                : selectedIntensity === 'intermediario'
                ? 'Intermediário'
                : 'Avançado'}
            </span>
            <ChevronDown className="w-3.5 h-3.5 opacity-70" />
          </button>

          {/* Intensity Dropdown Popover */}
          {showIntensityDropdown && (
            <div
              id="intensity-dropdown-menu"
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-[#bec9c7]/50 py-1.5 z-30 animate-in fade-in zoom-in-95 duration-100"
            >
              <div className="px-3 py-1.5 text-xs font-semibold text-[#6f7978] uppercase border-b border-[#eceeee]">
                Filtrar por Intensidade
              </div>
              <button
                onClick={() => {
                  setSelectedIntensity('all');
                  setShowIntensityDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                  selectedIntensity === 'all'
                    ? 'bg-[#d0e4e3]/30 text-[#00615f] font-semibold'
                    : 'text-[#191c1d] hover:bg-[#f8fafa]'
                }`}
              >
                <span>Todas</span>
                {selectedIntensity === 'all' && <span className="w-2 h-2 rounded-full bg-[#00615f]"></span>}
              </button>
              <button
                onClick={() => {
                  setSelectedIntensity('iniciante');
                  setShowIntensityDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                  selectedIntensity === 'iniciante'
                    ? 'bg-[#d0e4e3]/30 text-[#00615f] font-semibold'
                    : 'text-[#191c1d] hover:bg-[#f8fafa]'
                }`}
              >
                <span>Iniciante</span>
                {selectedIntensity === 'iniciante' && <span className="w-2 h-2 rounded-full bg-[#00615f]"></span>}
              </button>
              <button
                onClick={() => {
                  setSelectedIntensity('intermediario');
                  setShowIntensityDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                  selectedIntensity === 'intermediario'
                    ? 'bg-[#d0e4e3]/30 text-[#00615f] font-semibold'
                    : 'text-[#191c1d] hover:bg-[#f8fafa]'
                }`}
              >
                <span>Intermediário</span>
                {selectedIntensity === 'intermediario' && <span className="w-2 h-2 rounded-full bg-[#00615f]"></span>}
              </button>
              <button
                onClick={() => {
                  setSelectedIntensity('avancado');
                  setShowIntensityDropdown(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between transition-colors ${
                  selectedIntensity === 'avancado'
                    ? 'bg-[#d0e4e3]/30 text-[#00615f] font-semibold'
                    : 'text-[#191c1d] hover:bg-[#f8fafa]'
                }`}
              >
                <span>Avançado</span>
                {selectedIntensity === 'avancado' && <span className="w-2 h-2 rounded-full bg-[#00615f]"></span>}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Category Pills (Horizontal Scroll) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 no-scrollbar">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
            selectedCategory === 'all'
              ? 'bg-[#00615f] text-white shadow-2xs'
              : 'bg-[#f2f4f4] text-[#506261] hover:bg-[#eceeee]'
          }`}
        >
          Todos
        </button>

        {/* Dynamic Category Chips matching screenshots */}
        {categories.map((cat) => {
          const isSelected = selectedCategory === cat.id || selectedCategory === cat.name;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#00615f] text-white shadow-2xs'
                  : 'bg-[#f2f4f4] text-[#506261] hover:bg-[#eceeee]'
              }`}
            >
              <ExerciseIcon name={cat.icon} size={14} />
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Exercise Cards Grid */}
      {filteredExercises.length === 0 ? (
        <div className="bg-white border border-[#bec9c7]/40 rounded-2xl p-12 text-center flex flex-col items-center justify-center my-8 shadow-xs">
          <div className="w-16 h-16 rounded-full bg-[#d0e4e3]/40 flex items-center justify-center text-[#00615f] mb-4">
            <Filter className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-[#191c1d] mb-1">
            Nenhum exercício encontrado
          </h3>
          <p className="text-sm text-[#506261] max-w-sm mb-6">
            Não encontramos movimentos com os filtros atuais. Tente buscar outro termo ou cadastre um novo exercício.
          </p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedIntensity('all');
              }}
              className="px-4 py-2 border border-[#bec9c7] text-[#191c1d] text-sm font-semibold rounded-full hover:bg-[#eceeee] transition-colors"
            >
              Limpar Filtros
            </button>
            <button
              onClick={onAddNewExercise}
              className="px-5 py-2 bg-[#00615f] text-white text-sm font-semibold rounded-full hover:bg-[#00504e] transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-4 h-4" /> Cadastrar Exercício
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredExercises.map((exercise) => (
            <div
              key={exercise.id}
              id={`exercise-card-${exercise.id}`}
              onClick={() => onSelectExercise(exercise)}
              className="bg-white border border-[#bec9c7]/50 rounded-2xl overflow-hidden p-4 shadow-xs hover:shadow-md hover:border-[#00615f]/40 transition-all cursor-pointer flex flex-col gap-4 group"
            >
              {/* Exercise Image */}
              <div className="relative aspect-4/3 w-full bg-[#eceeee] rounded-xl overflow-hidden">
                <img
                  src={exercise.imageUrl}
                  alt={exercise.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-300"
                  onError={(e) => {
                    // graceful fallback image if broken link
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80';
                  }}
                />
              </div>

              {/* Title and Badges */}
              <div className="flex flex-col items-center text-center gap-2.5 pb-1">
                <h3 className="font-bold text-xl md:text-2xl text-[#191c1d] group-hover:text-[#00615f] transition-colors">
                  {exercise.name}
                </h3>

                <div className="flex flex-wrap items-center justify-center gap-2">
                  {/* Intensity Tag with Bars */}
                  {renderIntensityBadge(exercise.intensity)}

                  {/* Category / Muscle Target Tag */}
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#eceeee] text-[#3f4948]">
                    <ExerciseIcon name={exercise.icon} size={14} />
                    <span>{exercise.categoryName}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
