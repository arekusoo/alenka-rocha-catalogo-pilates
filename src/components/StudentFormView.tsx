import React, { useState, useEffect } from 'react';
import { Phone, User, Check } from 'lucide-react';
import { Student, NewItemTab } from '../types';

interface StudentFormViewProps {
  editingStudent?: Student | null;
  onSaveStudent: (studentData: Omit<Student, 'id' | 'createdAt'>, studentId?: string) => void;
  onSwitchTab: (tab: NewItemTab) => void;
  onCancel: () => void;
}

export const StudentFormView: React.FC<StudentFormViewProps> = ({
  editingStudent,
  onSaveStudent,
  onSwitchTab,
  onCancel,
}) => {
  const [name, setName] = useState(editingStudent?.name || '');
  const [phone, setPhone] = useState(editingStudent?.phone || '');
  const [limitations, setLimitations] = useState(editingStudent?.limitations || '');

  useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name);
      setPhone(editingStudent.phone);
      setLimitations(editingStudent.limitations || '');
    }
  }, [editingStudent]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor, informe o nome do cliente.');
      return;
    }

    if (!phone.trim()) {
      alert('Por favor, informe o número de WhatsApp do cliente.');
      return;
    }

    const studentData: Omit<Student, 'id' | 'createdAt'> = {
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      planId: editingStudent?.planId || '1x_week',
      planName: editingStudent?.planName || 'Sem plano definido',
      remainingClasses: editingStudent?.remainingClasses ?? 0,
      totalPlanClasses: editingStudent?.totalPlanClasses ?? 0,
      limitations: limitations.trim(),
      weeklySchedule: editingStudent?.weeklySchedule || 'Sem aulas agendadas ainda',
      startDate: editingStudent?.startDate,
    };

    onSaveStudent(studentData, editingStudent?.id);
  };

  return (
    <main className="flex-grow pb-28 pt-6 px-4 md:px-8 max-w-3xl mx-auto w-full flex flex-col gap-6">
      {/* Segmented Control Tab (Exercício | Categoria | Cliente) */}
      <div className="flex bg-[#f2f4f4] rounded-xl p-1 border border-[#bec9c7]/60 w-full max-w-md mx-auto">
        <button
          type="button"
          onClick={() => onSwitchTab('exercise')}
          className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium text-[#506261] hover:bg-[#ffffff]/60 transition-all cursor-pointer"
        >
          Exercício
        </button>
        <button
          type="button"
          onClick={() => onSwitchTab('category')}
          className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium text-[#506261] hover:bg-[#ffffff]/60 transition-all cursor-pointer"
        >
          Categoria
        </button>
        <button
          type="button"
          className="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold bg-[#00615f] text-white shadow-xs transition-all cursor-pointer"
        >
          Cliente
        </button>
      </div>

      {/* Header text */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#191c1d] mb-1.5">
          {editingStudent ? 'Editar Cliente' : 'Novo Cliente'}
        </h1>
        <p className="text-sm md:text-base text-[#506261]">
          {editingStudent
            ? 'Atualize os dados e limitações físicas deste cliente.'
            : 'Preencha os dados do cliente. O plano e as aulas podem ser agendados na próxima etapa, se você quiser.'}
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Nome do Cliente */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="nome_cliente"
            className="text-sm font-semibold text-[#191c1d] flex items-center gap-1"
          >
            Nome do Cliente <span className="text-[#ba1a1a]">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f7978]" />
            <input
              id="nome_cliente"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mariana Silva"
              className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#bec9c7] rounded-xl text-sm md:text-base text-[#191c1d] placeholder-[#6f7978] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* 2. WhatsApp (Número) */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="whatsapp_cliente"
            className="text-sm font-semibold text-[#191c1d] flex items-center gap-1"
          >
            WhatsApp (Número com DDD) <span className="text-[#ba1a1a]">*</span>
          </label>
          <div className="relative">
            <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6f7978]" />
            <input
              id="whatsapp_cliente"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ex: 11987654321"
              className="w-full pl-10 pr-4 py-3 bg-[#ffffff] border border-[#bec9c7] rounded-xl text-sm md:text-base text-[#191c1d] placeholder-[#6f7978] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-colors shadow-2xs"
            />
          </div>
          <p className="text-xs text-[#506261]">
            Utilizado para confirmações e contato direto via WhatsApp no app.
          </p>
        </div>

        {/* 3. Limitações do Cliente (Texto Simples) */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="limitacoes_cliente"
            className="text-sm font-semibold text-[#191c1d] flex items-center gap-1"
          >
            Limitações do Cliente (Restrições, Lesões ou Observações)
          </label>
          <textarea
            id="limitacoes_cliente"
            rows={3}
            value={limitations}
            onChange={(e) => setLimitations(e.target.value)}
            placeholder="Ex: Hérnia de disco L4-L5, evitar flexão profunda de tronco com sobrecarga. Condromalácia patelar grau I."
            className="bg-[#ffffff] border border-[#bec9c7] rounded-xl px-4 py-3 text-sm md:text-base text-[#191c1d] placeholder-[#6f7978] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-colors shadow-2xs resize-y"
          />
          <p className="text-xs text-[#506261]">
            Ficará visível como lembrete rápido em todos os cards da agenda e na ficha do cliente.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-1/3 py-3.5 px-6 border border-[#bec9c7] text-[#506261] hover:bg-[#eceeee] rounded-full text-sm font-semibold transition-colors order-2 sm:order-1 cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            id="btn-salvar-cliente"
            className="w-full sm:w-2/3 bg-[#00615f] hover:bg-[#00504e] active:scale-98 text-white rounded-full py-4 text-base font-semibold transition-all shadow-sm flex items-center justify-center gap-2 order-1 sm:order-2 cursor-pointer"
          >
            <Check className="w-5 h-5" />
            <span>{editingStudent ? 'Salvar Alterações' : 'Salvar Cliente'}</span>
          </button>
        </div>
      </form>
    </main>
  );
};
