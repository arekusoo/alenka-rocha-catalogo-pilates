import React, { useState } from 'react';
import { Calendar, Clock, User, X } from 'lucide-react';
import { Student, ClassSession } from '../types';

interface AddSessionModalProps {
  student: Student;
  onClose: () => void;
  onSaveSession: (sessionData: Omit<ClassSession, 'id'>) => void;
}

export const AddSessionModal: React.FC<AddSessionModalProps> = ({
  student,
  onClose,
  onSaveSession,
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const [date, setDate] = useState(todayStr);
  const [time, setTime] = useState('08:00');
  const [descriptionLabel, setDescriptionLabel] = useState(
    student.planId === 'avulsa' ? 'Aula Avulsa' : `Aula Extra / Reposição`
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!date || !time) {
      alert('Preencha a data e o horário.');
      return;
    }

    onSaveSession({
      studentId: student.id,
      studentName: student.name,
      studentPhone: student.phone,
      studentLimitations: student.limitations,
      date,
      time,
      classNumber: 1,
      totalClasses: student.totalPlanClasses,
      descriptionLabel: descriptionLabel.trim() || 'Aula Agendada',
      status: 'scheduled',
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#bec9c7]/60 space-y-4">
        <div className="flex items-center justify-between border-b border-[#eceeee] pb-3">
          <div>
            <h3 className="text-lg font-bold text-[#191c1d]">Agendar Nova Aula</h3>
            <p className="text-xs text-[#506261]">
              Cliente: <strong>{student.name}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#6f7978] hover:text-[#191c1d] hover:bg-[#eceeee] rounded-full transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-1">
          <div>
            <label className="block text-xs font-semibold text-[#191c1d] mb-1.5">
              Data da Aula:
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-[#f8fafa] border border-[#bec9c7] rounded-xl px-3.5 py-2.5 text-sm text-[#191c1d] focus:border-[#00615f] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191c1d] mb-1.5">
              Horário:
            </label>
            <input
              type="time"
              required
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full bg-[#f8fafa] border border-[#bec9c7] rounded-xl px-3.5 py-2.5 text-sm text-[#191c1d] focus:border-[#00615f] outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#191c1d] mb-1.5">
              Identificação / Descrição da Aula:
            </label>
            <input
              type="text"
              value={descriptionLabel}
              onChange={(e) => setDescriptionLabel(e.target.value)}
              placeholder="Ex: Aula 4 de 8, Reposição, etc."
              className="w-full bg-[#f8fafa] border border-[#bec9c7] rounded-xl px-3.5 py-2.5 text-sm text-[#191c1d] focus:border-[#00615f] outline-none"
            />
          </div>

          <div className="flex gap-3 pt-3 border-t border-[#eceeee]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-[#bec9c7] text-sm font-semibold text-[#506261] hover:bg-[#eceeee] cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#00615f] hover:bg-[#00504e] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Confirmar Agendamento
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
