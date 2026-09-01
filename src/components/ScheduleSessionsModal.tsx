import React, { useState } from 'react';
import { Calendar, Clock, X, Check } from 'lucide-react';
import { Student, StudentPlanType, PlanOption } from '../types';
import { STUDENT_PLANS } from '../data/initialData';

export interface ScheduledClassInput {
  date: string;
  time: string;
}

interface ScheduleSessionsModalProps {
  student: Student;
  onClose: () => void;
  onConfirm: (plan: PlanOption, slots: ScheduledClassInput[]) => void;
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

export const ScheduleSessionsModal: React.FC<ScheduleSessionsModalProps> = ({
  student,
  onClose,
  onConfirm,
}) => {
  const hasActivePlan = student.totalPlanClasses > 0;

  const [selectedPlanId, setSelectedPlanId] = useState<StudentPlanType>(
    hasActivePlan ? student.planId : '1x_week'
  );
  const [sameTimeForAll, setSameTimeForAll] = useState(true);
  const [masterTime, setMasterTime] = useState('08:00');
  const [classSlots, setClassSlots] = useState<ScheduledClassInput[]>(() =>
    generateDefaultClassDates(hasActivePlan ? student.planId : '1x_week', '08:00')
  );

  const handlePlanChange = (newPlanId: StudentPlanType) => {
    setSelectedPlanId(newPlanId);
    const plan = STUDENT_PLANS.find((p) => p.id === newPlanId) || STUDENT_PLANS[0];
    const targetCount = plan.totalClasses;

    setClassSlots((prev) => {
      const newDefaults = generateDefaultClassDates(newPlanId, masterTime);
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

  const handleMasterTimeChange = (newTime: string) => {
    setMasterTime(newTime);
    if (sameTimeForAll) {
      setClassSlots((prev) => prev.map((slot) => ({ ...slot, time: newTime })));
    }
  };

  const handleToggleSameTime = (checked: boolean) => {
    setSameTimeForAll(checked);
    if (checked) {
      setClassSlots((prev) => prev.map((slot) => ({ ...slot, time: masterTime })));
    }
  };

  const handleSlotDateChange = (index: number, newDate: string) => {
    setClassSlots((prev) => {
      const next = [...prev];
      if (next[index]) next[index] = { ...next[index], date: newDate };
      return next;
    });
  };

  const handleSlotTimeChange = (index: number, newTime: string) => {
    if (sameTimeForAll) {
      setMasterTime(newTime);
      setClassSlots((prev) => prev.map((slot) => ({ ...slot, time: newTime })));
    } else {
      setClassSlots((prev) => {
        const next = [...prev];
        if (next[index]) next[index] = { ...next[index], time: newTime };
        return next;
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    for (let i = 0; i < classSlots.length; i++) {
      if (!classSlots[i].date || !classSlots[i].time) {
        alert(`Por favor, preencha a data e horário da Aula ${i + 1}.`);
        return;
      }
    }
    const plan = STUDENT_PLANS.find((p) => p.id === selectedPlanId) || STUDENT_PLANS[0];
    onConfirm(plan, classSlots);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-[#bec9c7]/60">
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-[#eceeee] sticky top-0 bg-white z-10">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-[#191c1d]">Agendar Aulas</h3>
            <p className="text-xs md:text-sm text-[#506261]">
              Cliente: <strong>{student.name}</strong>
              {hasActivePlan && ' • as novas aulas serão somadas ao plano atual'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6f7978] hover:text-[#191c1d] hover:bg-[#f2f4f4] rounded-full transition-colors cursor-pointer shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-5">
          {/* Seletor de Planos */}
          <div className="flex flex-col space-y-2.5">
            <label className="text-sm font-semibold text-[#191c1d] flex items-center gap-1">
              Plano / Contrato <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {STUDENT_PLANS.map((plan) => {
                const isSelected = selectedPlanId === plan.id;
                return (
                  <label
                    key={plan.id}
                    className={`flex items-center justify-between p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-2 border-[#00615f] bg-[#d0e4e3]/30 shadow-xs'
                        : 'border-[#bec9c7] bg-white hover:bg-[#f8fafa]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="radio"
                        name="plano_agendamento"
                        value={plan.id}
                        checked={isSelected}
                        onChange={() => handlePlanChange(plan.id)}
                        className="w-4 h-4 text-[#00615f] focus:ring-[#00615f] shrink-0"
                      />
                      <div className="min-w-0">
                        <span className="text-sm md:text-base font-bold text-[#191c1d] block truncate">
                          {plan.name}
                        </span>
                        <span className="text-xs text-[#506261]">
                          {plan.isMonthly
                            ? `${plan.totalClasses} aulas no ciclo mensal`
                            : 'Cobrança por sessão avulsa'}
                        </span>
                      </div>
                    </div>

                    <span className="text-sm md:text-base font-bold text-[#00615f] shrink-0 pl-2">
                      {plan.price}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Agenda das Aulas */}
          <div className="flex flex-col space-y-3 pt-3 border-t border-[#eceeee]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <h2 className="text-base font-bold text-[#191c1d] flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-[#00615f]" />
                  <span>Agenda das Aulas ({classSlots.length} {classSlots.length === 1 ? 'aula' : 'aulas'})</span>
                </h2>
                <p className="text-xs text-[#506261]">
                  Defina a data e o horário para cada uma das {classSlots.length} aulas.
                </p>
              </div>

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

            {sameTimeForAll && (
              <div className="bg-[#d0e4e3]/30 border border-[#bec9c7] rounded-xl p-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Clock className="w-4 h-4 text-[#00615f] shrink-0" />
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-[#191c1d] block">
                      Horário padrão para todas as {classSlots.length} aulas:
                    </span>
                    <span className="text-[11px] text-[#506261]">
                      Ao alterar aqui, todos os horários abaixo são atualizados.
                    </span>
                  </div>
                </div>
                <input
                  type="time"
                  value={masterTime}
                  onChange={(e) => handleMasterTimeChange(e.target.value)}
                  className="bg-white border border-[#bec9c7] rounded-lg px-3 py-1.5 text-sm font-bold text-[#00615f] focus:border-[#00615f] outline-none shadow-2xs cursor-pointer shrink-0 max-w-[7.5rem]"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {classSlots.map((slot, index) => {
                const dayName = getDayOfWeekName(slot.date);
                return (
                  <div
                    key={`slot-${index}`}
                    className="min-w-0 bg-white border border-[#bec9c7] rounded-xl p-3.5 shadow-2xs hover:border-[#00615f]/60 transition-colors flex flex-col gap-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-[#00615f] bg-[#d0e4e3]/40 px-2.5 py-0.5 rounded-full shrink-0">
                        Aula {index + 1}
                      </span>
                      {dayName && (
                        <span className="text-[11px] font-semibold text-[#506261] truncate">
                          {dayName}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-row gap-2 pt-1">
                      <div className="min-w-0 flex-1">
                        <label className="block text-[11px] font-semibold text-[#506261] mb-1">
                          Data:
                        </label>
                        <input
                          type="date"
                          required
                          value={slot.date}
                          onChange={(e) => handleSlotDateChange(index, e.target.value)}
                          className="w-full min-w-0 bg-[#f8fafa] border border-[#bec9c7] rounded-lg px-2 py-1.5 text-xs text-[#191c1d] focus:border-[#00615f] outline-none transition-colors cursor-pointer"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <label className="block text-[11px] font-semibold text-[#506261] mb-1">
                          Horário:
                        </label>
                        <input
                          type="time"
                          required
                          value={slot.time}
                          onChange={(e) => handleSlotTimeChange(index, e.target.value)}
                          className={`w-full min-w-0 bg-[#f8fafa] border border-[#bec9c7] rounded-lg px-2 py-1.5 text-xs text-[#191c1d] focus:border-[#00615f] outline-none transition-colors cursor-pointer ${
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
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 border-t border-[#eceeee] mt-1">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-1/3 py-3 px-6 border border-[#bec9c7] text-[#506261] hover:bg-[#eceeee] rounded-full text-sm font-semibold transition-colors order-2 sm:order-1 cursor-pointer"
            >
              Agora não
            </button>
            <button
              type="submit"
              className="w-full sm:w-2/3 bg-[#00615f] hover:bg-[#00504e] active:scale-98 text-white rounded-full py-3.5 text-sm md:text-base font-semibold transition-all shadow-sm flex items-center justify-center gap-2 order-1 sm:order-2 cursor-pointer"
            >
              <Check className="w-5 h-5" />
              <span>Confirmar Agendamento</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
