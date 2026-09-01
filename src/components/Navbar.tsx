import React from 'react';
import { ArrowLeft, X, Edit3 } from 'lucide-react';
import { ActiveScreen } from '../types';
import logo from '../assets/logo.png';

interface NavbarProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  title?: string;
  onEdit?: () => void;
  isEditing?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onNavigate,
  title,
  onEdit,
  isEditing,
}) => {
  if (
    activeScreen === 'catalog' ||
    activeScreen === 'agenda' ||
    activeScreen === 'clients' ||
    activeScreen === 'client-detail'
  ) {
    return (
      <header className="bg-[#f8fafa] flex justify-center items-center px-4 md:px-8 w-full h-16 top-0 z-40 sticky border-b border-[#eceeee]/80 backdrop-blur-md bg-[#f8fafa]/95">
        <img
          id="app-brand-title"
          src={logo}
          alt="Alenka Rocha - Fisioterapeuta"
          className="h-9 md:h-11 w-auto cursor-pointer"
          onClick={() => onNavigate('catalog')}
        />
      </header>
    );
  }

  if (activeScreen === 'exercise-detail') {
    return (
      <header className="bg-[#f8fafa] flex justify-between items-center px-4 md:px-8 w-full h-16 top-0 z-40 sticky border-b border-[#eceeee]/80">
        <button
          id="detail-back-btn"
          onClick={() => onNavigate('catalog')}
          className="text-[#3f4948] hover:bg-[#eceeee] rounded-full p-2.5 transition-transform active:scale-95 flex items-center justify-center"
          aria-label="Voltar para o catálogo"
        >
          <ArrowLeft className="w-6 h-6 text-[#191c1d]" />
        </button>
        <span className="text-sm font-semibold text-[#506261] tracking-wider uppercase">
          Detalhes do Exercício
        </span>
        {onEdit && (
          <button
            id="detail-edit-btn"
            onClick={onEdit}
            className="flex items-center gap-1.5 text-[#191c1d] hover:text-[#00615f] hover:bg-[#eceeee] font-medium text-sm px-3 py-1.5 rounded-full transition-all"
          >
            <Edit3 className="w-4 h-4" />
            <span>Editar</span>
          </button>
        )}
      </header>
    );
  }

  if (activeScreen === 'exercise-form' || activeScreen === 'category-manage') {
    return (
      <header className="bg-[#f8fafa] flex justify-between items-center px-4 md:px-8 w-full h-16 top-0 z-40 sticky border-b border-[#eceeee]/80">
        <button
          id="form-back-btn"
          onClick={() => onNavigate('catalog')}
          className="text-[#3f4948] hover:bg-[#eceeee] rounded-full p-2.5 transition-transform active:scale-95 flex items-center justify-center"
          aria-label="Voltar para o catálogo"
        >
          <ArrowLeft className="w-5 h-5 text-[#191c1d]" />
        </button>
        <span className="text-sm font-semibold text-[#506261] tracking-wide">
          {activeScreen === 'exercise-form' && isEditing
            ? 'Editar Item'
            : activeScreen === 'exercise-form'
            ? 'Novo Cadastro'
            : 'Gerenciar Categorias'}
        </span>
        <div className="w-10"></div>
      </header>
    );
  }

  return null;
};
