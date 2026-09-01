import React from 'react';
import { Dumbbell, Calendar, Users, PlusCircle } from 'lucide-react';
import { ActiveScreen } from '../types';

interface BottomNavProps {
  activeScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeScreen,
  onNavigate,
}) => {
  const isCatalog = activeScreen === 'catalog' || activeScreen === 'exercise-detail';
  const isAgenda = activeScreen === 'agenda';
  const isClients = activeScreen === 'clients' || activeScreen === 'client-detail';
  const isAddOrManage = activeScreen === 'exercise-form' || activeScreen === 'category-manage';

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-sm sm:max-w-md flex justify-around items-center p-1.5 bg-white/95 backdrop-blur-md border border-[#bec9c7]/40 shadow-2xl rounded-full z-50"
    >
      <button
        id="bottom-nav-catalog-btn"
        onClick={() => onNavigate('catalog')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2.5 sm:px-3.5 rounded-full text-xs font-semibold transition-all ${
          isCatalog
            ? 'bg-[#00615f] text-white shadow-sm'
            : 'text-[#506261] hover:text-[#00615f] hover:bg-[#d0e4e3]/30'
        }`}
      >
        <Dumbbell className="w-4 h-4" />
        <span className="hidden sm:inline">Catálogo</span>
      </button>

      <button
        id="bottom-nav-agenda-btn"
        onClick={() => onNavigate('agenda')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2.5 sm:px-3.5 rounded-full text-xs font-semibold transition-all ${
          isAgenda
            ? 'bg-[#00615f] text-white shadow-sm'
            : 'text-[#506261] hover:text-[#00615f] hover:bg-[#d0e4e3]/30'
        }`}
      >
        <Calendar className="w-4 h-4" />
        <span className="hidden sm:inline">Agenda</span>
      </button>

      <button
        id="bottom-nav-clients-btn"
        onClick={() => onNavigate('clients')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2.5 sm:px-3.5 rounded-full text-xs font-semibold transition-all ${
          isClients
            ? 'bg-[#00615f] text-white shadow-sm'
            : 'text-[#506261] hover:text-[#00615f] hover:bg-[#d0e4e3]/30'
        }`}
      >
        <Users className="w-4 h-4" />
        <span className="hidden sm:inline">Clientes</span>
      </button>

      <button
        id="bottom-nav-add-btn"
        onClick={() => onNavigate('exercise-form')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-2.5 sm:px-3.5 rounded-full text-xs font-semibold transition-all ${
          isAddOrManage
            ? 'bg-[#00615f] text-white shadow-sm'
            : 'text-[#506261] hover:text-[#00615f] hover:bg-[#d0e4e3]/30'
        }`}
      >
        <PlusCircle className="w-4 h-4" />
        <span className="hidden sm:inline">Novo</span>
      </button>
    </nav>
  );
};

