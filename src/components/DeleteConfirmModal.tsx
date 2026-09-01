import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  itemName: string;
  type: 'exercise' | 'category';
  exerciseCount?: number;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  itemName,
  type,
  exerciseCount = 0,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="delete-confirm-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        id="delete-confirm-modal-card"
        className="bg-[#ffffff] rounded-2xl shadow-xl max-w-sm w-full p-6 flex flex-col gap-5 border border-[#bec9c7]/40 transform animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center text-center gap-3">
          <div className="bg-[#ffdad6] text-[#ba1a1a] p-4 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h3 className="font-semibold text-2xl text-[#191c1d]">{title || 'Tem certeza?'}</h3>
          <p className="text-sm text-[#3f4948] leading-relaxed">
            {type === 'category' ? (
              <>
                Remover a categoria <strong className="text-[#191c1d]">"{itemName}"</strong>{' '}
                {exerciseCount > 0
                  ? `e seus ${exerciseCount} exercício(s) vinculados? Esta ação é permanente.`
                  : 'excluirá esta categoria. Esta ação é permanente.'}
              </>
            ) : (
              <>
                Deseja realmente excluir o exercício <strong className="text-[#191c1d]">"{itemName}"</strong> do catálogo? Esta ação não pode ser desfeita.
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end w-full pt-2">
          <button
            id="modal-cancel-btn"
            type="button"
            className="w-full sm:w-auto border border-[#6f7978]/30 text-[#00615f] font-semibold text-sm px-5 py-2.5 rounded-full hover:bg-[#eceeee] transition-colors"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            id="modal-confirm-delete-btn"
            type="button"
            className="w-full sm:w-auto bg-[#ba1a1a] hover:bg-[#93000a] text-white font-semibold text-sm px-5 py-2.5 rounded-full transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            <Trash2 className="w-4 h-4" />
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
};
