import React from 'react';
import { Dumbbell, PlusCircle } from 'lucide-react';
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
  const isAddOrManage = activeScreen === 'exercise-form' || activeScreen === 'category-manage';

  return (
    <nav
      id="bottom-navigation-bar"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2.5rem)] max-w-xs sm:max-w-sm flex justify-around items-center p-1.5 bg-white/95 backdrop-blur-md border border-[#bec9c7]/40 shadow-2xl rounded-full z-50"
    >
      <button
        id="bottom-nav-catalog-btn"
        onClick={() => onNavigate('catalog')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-semibold transition-all ${
          isCatalog
            ? 'bg-[#00615f] text-white shadow-sm'
            : 'text-[#506261] hover:text-[#00615f] hover:bg-[#d0e4e3]/30'
        }`}
      >
        <Dumbbell className="w-4 h-4" />
        <span>Catálogo</span>
      </button>

      <button
        id="bottom-nav-add-btn"
        onClick={() => onNavigate('exercise-form')}
        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-full text-xs font-semibold transition-all ${
          isAddOrManage
            ? 'bg-[#00615f] text-white shadow-sm'
            : 'text-[#506261] hover:text-[#00615f] hover:bg-[#d0e4e3]/30'
        }`}
      >
        <PlusCircle className="w-4 h-4" />
        <span>Novo</span>
      </button>
    </nav>
  );
};

