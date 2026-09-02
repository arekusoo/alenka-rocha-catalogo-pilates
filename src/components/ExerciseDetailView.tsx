import React, { useState } from 'react';
import { ExternalLink, Trash2, Dumbbell, Layers, Maximize2 } from 'lucide-react';
import { Exercise } from '../types';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { ExerciseIcon } from './ExerciseIcon';

interface ExerciseDetailViewProps {
  exercise: Exercise;
  onBack: () => void;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exerciseId: string) => void;
}

export const ExerciseDetailView: React.FC<ExerciseDetailViewProps> = ({
  exercise,
  onBack,
  onEdit,
  onDelete,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isImageFullscreen, setIsImageFullscreen] = useState(false);

  const getIntensityLabel = (intensity: string) => {
    switch (intensity) {
      case 'iniciante':
        return 'Baixa (Iniciante)';
      case 'intermediario':
        return 'Média (Intermediário)';
      case 'avancado':
        return 'Alta (Avançado)';
      default:
        return intensity;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 md:px-6 py-6 pb-28 md:pb-12 flex flex-col gap-6">
      {/* Exercise Cover Image */}
      <div className="relative w-full aspect-16/10 rounded-2xl overflow-hidden bg-[#eceeee] shadow-xs group">
        <img
          src={exercise.imageUrl}
          alt={exercise.name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80';
          }}
        />

        {/* Quick view fullscreen icon */}
        <button
          onClick={() => setIsImageFullscreen(true)}
          className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-xs transition-opacity opacity-0 group-hover:opacity-100"
          title="Ampliar imagem"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>

      {/* Title */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold text-[#00615f] tracking-tight">
          {exercise.name}
        </h1>
      </div>

      {/* Meta Chips */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#d0e4e3] text-[#00615f] border border-[#2b7a78]/20">
          <Dumbbell className="w-3.5 h-3.5" />
          <span>Intensidade: {getIntensityLabel(exercise.intensity)}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#eceeee] text-[#3f4948]">
          <Layers className="w-3.5 h-3.5" />
          <span>{exercise.typeTag || 'Pilates Solo'}</span>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#eceeee] text-[#3f4948]">
          <ExerciseIcon name={exercise.icon} size={14} />
          <span>{exercise.categoryName}</span>
        </div>
      </div>

      {/* Primary Description */}
      <div className="text-base md:text-lg text-[#191c1d] leading-relaxed font-normal">
        {exercise.description}
      </div>

      {/* Action Button: Ver Vídeo */}
      <div className="pt-2">
        <a
          id="btn-ver-video"
          href={exercise.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#00615f] hover:bg-[#00504e] active:scale-98 text-white font-semibold text-base py-4 px-6 rounded-2xl shadow-sm transition-all flex items-center justify-center gap-2.5 group cursor-pointer"
        >
          <ExternalLink className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span>Ver vídeo</span>
        </a>
      </div>

      {/* Delete Button */}
      <div className="text-center pt-1">
        <button
          id="btn-excluir-exercicio"
          onClick={() => setIsDeleteModalOpen(true)}
          className="text-[#ba1a1a] hover:text-[#93000a] hover:bg-[#ffdad6]/40 font-bold text-xs md:text-sm tracking-wider uppercase px-4 py-2 rounded-full transition-colors inline-flex items-center gap-1.5"
        >
          <Trash2 className="w-4 h-4" />
          <span>EXCLUIR EXERCÍCIO</span>
        </button>
      </div>

      {/* Image Fullscreen Modal */}
      {isImageFullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsImageFullscreen(false)}
        >
          <img
            src={exercise.imageUrl}
            alt={exercise.name}
            referrerPolicy="no-referrer"
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
          />
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => onDelete(exercise.id)}
        title="Excluir Exercício"
        itemName={exercise.name}
        type="exercise"
      />
    </div>
  );
};
