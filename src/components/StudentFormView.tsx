import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Phone,
  User,
  Clock,
  Check,
  CheckSquare,
  Square,
  Sparkles,
} from 'lucide-react';
import { Student, StudentPlanType, NewItemTab } from '../types';
import { STUDENT_PLANS } from '../data/initialData';

export interface ScheduledClassInput {
  date: string;
  time: string;
}

interface StudentFormViewProps {
  editingStudent?: Student | null;
  onSaveStudent: (
    studentData: Omit<Student, 'id' | 'createdAt'>,
    studentId?: string,
    scheduledClasses?: ScheduledClassInput[]
  ) => void;
  onSwitchTab: (tab: NewItemTab) => void;
  onCancel: () => void;
}

// Helper to generate default dates starting from today
function generateDefaultClassDates(planId: StudentPlanType, defaultTime = '08:00'): ScheduledClassInput[] {
  const plan = STUDENT_PLANS.find((p) => p.id === planId) || STUDENT_PLANS[0];
  const total = plan.totalClasses;
  const result: ScheduledClassInput[] = [];

  const now = new Date();
  const current = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (planId === 'avulsa') {
    const yyyy = current.getFullYear();
    const mm = String(current.getMonth() + 1).padStart(2, '0');
    const dd = String(current.getDate()).padStart(2, '0');
    return [{ date: `${yyyy}-${mm}-${dd}`, time: defaultTime }];
  }

  if (planId === '1x_week') {
    // Every 7 days
    for (let i = 0; i < total; i++) {
      const d = new Date(current.getTime() + i * 7 * 24 * 60 * 60 * 1000);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      result.push({ date: `${yyyy}-${mm}-${dd}`, time: defaultTime });
    }
    return result;
  }

  if (planId === '2x_week') {
    // 2x per week (e.g. alternating +2 / +5 days)
    let added = 0;
    const temp = new Date(current);
    while (added < total) {
      const yyyy = temp.getFullYear();
      const mm = String(temp.getMonth() + 1).padStart(2, '0');
      const dd = String(temp.getDate()).padStart(2, '0');
      result.push({ date: `${yyyy}-${mm}-${dd}`, time: defaultTime });
      added++;
      if (added % 2 === 1) {
        temp.setDate(temp.getDate() + 2);
      } else {
        temp.setDate(temp.getDate() + 5);
      }
    }
    return result;
  }

  if (planId === '3x_week') {
    // 3x per week (e.g. +2, +2, +3 days)
    let added = 0;
    const temp = new Date(current);
    while (added < total) {
      const yyyy = temp.getFullYear();
      const mm = String(temp.getMonth() + 1).padStart(2, '0');
      const dd = String(temp.getDate()).padStart(2, '0');
      result.push({ date: `${yyyy}-${mm}-${dd}`, time: defaultTime });
      added++;
      if (added % 3 === 1 || added % 3 === 2) {
        temp.setDate(temp.getDate() + 2);
      } else {
        temp.setDate(temp.getDate() + 3);
      }
    }
    return result;
  }

  return [{ date: new Date().toISOString().split('T')[0], time: defaultTime }];
}

function getDayOfWeekName(dateStr: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const d = new Date(year, month - 1, day);
    const dayNames = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];
    return dayNames[d.getDay()] || '';
  } catch {
    return '';
  }
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
  const [selectedPlanId, setSelectedPlanId] = useState<StudentPlanType>(
    editingStudent?.planId || '1x_week'
  );

  // Same time for all classes checkbox & common time
  const [sameTimeForAll, setSameTimeForAll] = useState(true);
  const [masterTime, setMasterTime] = useState('08:00');

  // Dynamic list of class dates/times based on selected plan
  const [classSlots, setClassSlots] = useState<ScheduledClassInput[]>(() =>
    generateDefaultClassDates(editingStudent?.planId || '1x_week', '08:00')
  );

  // When plan changes, re-generate or adjust class slots count
  const handlePlanChange = (newPlanId: StudentPlanType) => {
    setSelectedPlanId(newPlanId);
    const plan = STUDENT_PLANS.find((p) => p.id === newPlanId) || STUDENT_PLANS[0];
    const targetCount = plan.totalClasses;

    setClassSlots((prev) => {
      const currentTime = sameTimeForAll ? masterTime : prev[0]?.time || masterTime;
      const newDefaults = generateDefaultClassDates(newPlanId, currentTime);

      const updated: ScheduledClassInput[] = [];
      for (let i = 0; i < targetCount; i++) {
        if (prev[i]) {
          updated.push({
            date: prev[i].date,
            time: sameTimeForAll ? masterTime : prev[i].time,
          });
        } else {
          updated.push(newDefaults[i] || { date: new Date().toISOString().split('T')[0], time: masterTime });
        }
      }
      return updated;
    });
  };

  // Sync master time to all slots when checkbox is active
  const handleMasterTimeChange = (newTime: string) => {
    setMasterTime(newTime);
    if (sameTimeForAll) {
      setClassSlots((prev) =>
        prev.map((slot) => ({
          ...slot,
          time: newTime,
        }))
      );
    }
  };

  // Toggle same time checkbox
  const handleToggleSameTime = (checked: boolean) => {
    setSameTimeForAll(checked);
    if (checked) {
      setClassSlots((prev) =>
        prev.map((slot) => ({
          ...slot,
          time: masterTime,
        }))
      );
    }
  };

  // Update specific class slot date
  const handleSlotDateChange = (index: number, newDate: string) => {
    setClassSlots((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], date: newDate };
      }
      return next;
    });
  };

  // Update specific class slot time
  const handleSlotTimeChange = (index: number, newTime: string) => {
    if (sameTimeForAll) {
      setMasterTime(newTime);
      setClassSlots((prev) =>
        prev.map((slot) => ({
          ...slot,
          time: newTime,
        }))
      );
    } else {
      setClassSlots((prev) => {
        const next = [...prev];
        if (next[index]) {
          next[index] = { ...next[index], time: newTime };
        }
        return next;
      });
    }
  };

  useEffect(() => {
    if (editingStudent) {
      setName(editingStudent.name);
      setPhone(editingStudent.phone);
      setLimitations(editingStudent.limitations || '');
      setSelectedPlanId(editingStudent.planId);
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

    // Validate that all class slots have dates and times
    for (let i = 0; i < classSlots.length; i++) {
      if (!classSlots[i].date || !classSlots[i].time) {
        alert(`Por favor, preencha a data e horário da Aula ${i + 1}.`);
        return;
      }
    }

    const planObj = STUDENT_PLANS.find((p) => p.id === selectedPlanId) || STUDENT_PLANS[0];

    // Compute weekly schedule summary string for student card
    const daysFound = Array.from(new Set(classSlots.map((s) => getDayOfWeekName(s.date)))).filter(Boolean);
    const scheduleSummary =
      daysFound.length > 0
        ? `${daysFound.join(' e ')} às ${sameTimeForAll ? masterTime : classSlots[0]?.time || '08:00'}`
        : `${planObj.name}`;

    const studentData: Omit<Student, 'id' | 'createdAt'> = {
      name: name.trim(),
      phone: phone.replace(/\D/g, ''),
      planId: selectedPlanId,
      planName: planObj.name,
      remainingClasses: editingStudent ? editingStudent.remainingClasses : planObj.totalClasses,
      totalPlanClasses: planObj.totalClasses,
      limitations: limitations.trim(),
      weeklySchedule: scheduleSummary,
      startDate: classSlots[0]?.date || new Date().toISOString().split('T')[0],
    };

    onSaveStudent(studentData, editingStudent?.id, classSlots);
  };

  const currentPlan = STUDENT_PLANS.find((p) => p.id === selectedPlanId) || STUDENT_PLANS[0];

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
            ? 'Atualize o plano, horários e limitações físicas deste cliente.'
            : 'Preencha os dados do cliente, selecione o plano e defina as datas das aulas.'}
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

        {/* 4. Seletor de Planos */}
        <div className="flex flex-col space-y-2.5 pt-1">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[#191c1d] flex items-center gap-1">
              Plano Contratado <span className="text-[#ba1a1a]">*</span>
            </label>
            <span className="text-xs font-semibold text-[#00615f] bg-[#d0e4e3]/50 px-2.5 py-1 rounded-full">
              {currentPlan.totalClasses} {currentPlan.totalClasses === 1 ? 'aula' : 'aulas na agenda'}
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2.5">
            {STUDENT_PLANS.map((plan) => {
              const isSelected = selectedPlanId === plan.id;
              return (
                <label
                  key={plan.id}
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-2 border-[#00615f] bg-[#d0e4e3]/30 shadow-xs'
                      : 'border-[#bec9c7] bg-white hover:bg-[#f8fafa]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="plano_cliente"
                      value={plan.id}
                      checked={isSelected}
                      onChange={() => handlePlanChange(plan.id)}
                      className="w-4 h-4 text-[#00615f] focus:ring-[#00615f]"
                    />
                    <div>
                      <span className="text-sm md:text-base font-bold text-[#191c1d] block">
                        {plan.name}
                      </span>
                      <span className="text-xs text-[#506261]">
                        {plan.isMonthly
                          ? `${plan.totalClasses} aulas no ciclo mensal`
                          : 'Cobrança por sessão avulsa'}
                      </span>
                    </div>
                  </div>

                  <span className="text-sm md:text-base font-bold text-[#00615f] shrink-0">
                    {plan.price}
                  </span>
                </label>
              );
            })}
          </div>
        </div>

        {/* 5. Agenda das Aulas (POSICIONADA APÓS O PLANO COM SELETORES DINÂMICOS) */}
        <div className="flex flex-col space-y-3 pt-3 border-t border-[#eceeee]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div>
              <h2 className="text-base font-bold text-[#191c1d] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#00615f]" />
                <span>Agenda das Aulas ({classSlots.length} {classSlots.length === 1 ? 'aula' : 'aulas'})</span>
              </h2>
              <p className="text-xs text-[#506261]">
                Defina a data e o horário para cada uma das {classSlots.length} aulas do plano selecionado.
              </p>
            </div>

            {/* Checkbox: Mesmo horário para todas as aulas */}
            <label className="inline-flex items-center gap-2 bg-[#f2f4f4] hover:bg-[#eceeee] px-3.5 py-2 rounded-xl border border-[#bec9c7]/80 cursor-pointer transition-colors shrink-0">
              <input
                type="checkbox"
                checked={sameTimeForAll}
                onChange={(e) => handleToggleSameTime(e.target.checked)}
                className="w-4 h-4 text-[#00615f] rounded-sm focus:ring-[#00615f] accent-[#00615f]"
              />
              <span className="text-xs font-semibold text-[#191c1d]">
                Mesmo horário para todas as aulas
              </span>
            </label>
          </div>

          {/* Master time selector if sameTimeForAll is active */}
          {sameTimeForAll && (
            <div className="bg-[#d0e4e3]/30 border border-[#bec9c7] rounded-xl p-3.5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-[#00615f] shrink-0" />
                <div>
                  <span className="text-xs font-bold text-[#191c1d] block">
                    Horário padrão para todas as {classSlots.length} aulas:
                  </span>
                  <span className="text-[11px] text-[#506261]">
                    Ao alterar aqui, todos os campos de horário abaixo serão atualizados automaticamente.
                  </span>
                </div>
              </div>
              <input
                type="time"
                value={masterTime}
                onChange={(e) => handleMasterTimeChange(e.target.value)}
                className="bg-white border border-[#bec9c7] rounded-lg px-3 py-1.5 text-sm font-bold text-[#00615f] focus:border-[#00615f] outline-none shadow-2xs cursor-pointer"
              />
            </div>
          )}

          {/* Dynamic list of Class Selectors (Aula 1, Aula 2, ... Aula N) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {classSlots.map((slot, index) => {
              const dayName = getDayOfWeekName(slot.date);
              return (
                <div
                  key={`slot-${index}`}
                  className="bg-white border border-[#bec9c7] rounded-xl p-3.5 shadow-2xs hover:border-[#00615f]/60 transition-colors flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#00615f] bg-[#d0e4e3]/40 px-2.5 py-0.5 rounded-full">
                      Aula {index + 1}
                    </span>
                    {dayName && (
                      <span className="text-[11px] font-semibold text-[#506261]">
                        {dayName}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    {/* Date picker */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#506261] mb-1">
                        Data:
                      </label>
                      <input
                        type="date"
                        required
                        value={slot.date}
                        onChange={(e) => handleSlotDateChange(index, e.target.value)}
                        className="w-full bg-[#f8fafa] border border-[#bec9c7] rounded-lg px-2.5 py-1.5 text-xs text-[#191c1d] focus:border-[#00615f] outline-none transition-colors cursor-pointer"
                      />
                    </div>

                    {/* Time picker */}
                    <div>
                      <label className="block text-[11px] font-semibold text-[#506261] mb-1">
                        Horário:
                      </label>
                      <input
                        type="time"
                        required
                        value={slot.time}
                        onChange={(e) => handleSlotTimeChange(index, e.target.value)}
                        className={`w-full bg-[#f8fafa] border border-[#bec9c7] rounded-lg px-2.5 py-1.5 text-xs text-[#191c1d] focus:border-[#00615f] outline-none transition-colors cursor-pointer ${
                          sameTimeForAll ? 'font-semibold text-[#00615f]' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
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
            <span>{editingStudent ? 'Salvar Alterações' : 'Cadastrar Cliente e Agendar'}</span>
          </button>
        </div>
      </form>
    </main>
  );
};
