import React, { useState } from 'react';
import {
  ArrowLeft,
  MoreVertical,
  Edit3,
  Phone,
  MessageCircle,
  AlertTriangle,
  Calendar,
  Clock,
  RotateCcw,
  Plus,
  Trash2,
  CalendarDays,
  XCircle,
  Check,
} from 'lucide-react';
import { Student, ClassSession, PlanOption } from '../types';
import { STUDENT_PLANS } from '../data/initialData';
import { ExportCalendarModal } from './ExportCalendarModal';
import { generateGoogleCalendarUrl } from '../utils/calendarExport';

interface ClientDetailViewProps {
  student: Student;
  sessions: ClassSession[];
  onBack: () => void;
  onEdit: (student: Student) => void;
  onRescheduleSession: (session: ClassSession) => void;
  onConfirmAttendance: (session: ClassSession, didAttend?: boolean) => void;
  onAddSessionForStudent: (student: Student) => void;
  onDeleteStudent?: (studentId: string) => void;
}

export const ClientDetailView: React.FC<ClientDetailViewProps> = ({
  student,
  sessions,
  onBack,
  onEdit,
  onRescheduleSession,
  onConfirmAttendance,
  onAddSessionForStudent,
  onDeleteStudent,
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showActionsModal, setShowActionsModal] = useState(false);

  // Filter sessions belonging to this student
  const studentSessions = sessions
    .filter((s) => s.studentId === student.id)
    .sort((a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime());

  const currentPlan: PlanOption | undefined = STUDENT_PLANS.find((p) => p.id === student.planId);
  const isAvulsa = student.planId === 'avulsa';
  const hasPlan = student.totalPlanClasses > 0;

  const formatPhone = (phone: string) => {
    const clean = phone.replace(/\D/g, '');
    if (clean.length === 11) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
    }
    if (clean.length === 10) {
      return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
    }
    return phone;
  };

  const getWhatsAppLink = (phone: string, name: string) => {
    const clean = phone.replace(/\D/g, '');
    const fullNumber = clean.startsWith('55') ? clean : `55${clean}`;
    const text = encodeURIComponent(`Olá ${name}, tudo bem? Sobre suas aulas de Pilates...`);
    return `https://wa.me/${fullNumber}?text=${text}`;
  };

  const formatDateDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const weekdays = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];
    const weekday = weekdays[dateObj.getDay()];
    return `${weekday}, ${day}/${month}`;
  };

  return (
    <main className="w-full max-w-3xl mx-auto px-4 md:px-8 py-6 pb-28 md:pb-28 flex flex-col gap-6">
      {/* Top bar: back to Clientes + more actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#506261] hover:text-[#00615f] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Clientes</span>
        </button>

        <button
          onClick={() => setShowActionsModal(true)}
          className="p-2.5 rounded-full bg-white border border-[#bec9c7]/80 text-[#191c1d] hover:bg-[#eceeee] shadow-2xs transition-all cursor-pointer"
          title="Mais ações"
          aria-label="Mais ações"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>

      {/* Main Client Info Card */}
      <section className="bg-white rounded-2xl p-5 md:p-6 border border-[#bec9c7]/60 shadow-xs flex flex-col gap-5">
        {/* Name & Contact */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-[#eceeee] pb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-[#191c1d] tracking-tight">
              {student.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[#506261] mt-1.5">
              <span className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-[#00615f]" />
                {formatPhone(student.phone)}
              </span>
              <a
                href={getWhatsAppLink(student.phone, student.name)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-3 py-1 rounded-full text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Conversar no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Plan badge only (no price) */}
          <div className="self-start sm:self-auto">
            <span
              className={`inline-block px-3.5 py-1.5 rounded-full text-xs font-bold ${
                !hasPlan
                  ? 'bg-[#f2f4f4] text-[#6f7978] border border-[#bec9c7]/50'
                  : isAvulsa
                  ? 'bg-purple-100 text-purple-800 border border-purple-200'
                  : 'bg-[#d0e4e3] text-[#00615f] border border-[#00615f]/20'
              }`}
            >
              {!hasPlan ? 'Sem plano definido' : isAvulsa ? 'Aula Avulsa' : student.planName}
            </span>
          </div>
        </div>

        {/* Clean Layout for Aulas Restantes */}
        {hasPlan ? (
          <div className="bg-[#f4f7f6] p-4 sm:p-5 rounded-2xl border border-[#bec9c7]/50 flex items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-[#506261] block mb-0.5">
                Aulas Restantes
              </span>
              <span className="text-xs sm:text-sm font-semibold text-[#191c1d]">
                {student.totalPlanClasses} {student.totalPlanClasses === 1 ? 'aula no plano' : 'aulas no plano'}
              </span>
            </div>

            <div className="flex items-center gap-2.5 bg-white px-4 py-2.5 rounded-xl border border-[#bec9c7]/40 shadow-2xs">
              <span className="text-2xl sm:text-3xl font-extrabold text-[#00615f] leading-none">
                {student.remainingClasses}
              </span>
              <span className="text-xs font-semibold text-[#506261] border-l border-[#eceeee] pl-2.5 leading-tight">
                de {student.totalPlanClasses} restantes
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-[#f4f7f6] p-4 sm:p-5 rounded-2xl border border-[#bec9c7]/50 flex items-center justify-between gap-4 flex-wrap">
            <span className="text-sm text-[#506261]">
              Este cliente ainda não tem um plano ou aula agendada.
            </span>
            <button
              onClick={() => onAddSessionForStudent(student)}
              className="text-xs md:text-sm font-semibold text-white bg-[#00615f] hover:bg-[#00504e] px-4 py-2 rounded-full transition-colors flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agendar Plano</span>
            </button>
          </div>
        )}

        {/* Limitações do Cliente (Simples e Direto) */}
        {student.limitations ? (
          <div className="bg-[#fff9f0] border border-amber-200/80 rounded-xl p-3.5 flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs sm:text-sm text-amber-950 leading-relaxed">
              <strong className="font-semibold">Limitações: </strong>
              {student.limitations}
            </p>
          </div>
        ) : (
          <div className="text-xs text-[#6f7978] italic">
            Nenhuma restrição ou limitação física registrada.
          </div>
        )}
      </section>

      {/* Seção Agenda do Cliente (Referência Única de Horários) */}
      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-[#00615f]" />
            <h2 className="text-xl font-bold text-[#191c1d]">
              Agenda do Cliente
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {studentSessions.length > 0 && (
              <button
                onClick={() => setShowExportModal(true)}
                className="text-xs md:text-sm font-semibold text-[#506261] hover:text-[#00615f] hover:bg-[#eceeee] px-3.5 py-2 rounded-full border border-[#bec9c7]/80 transition-colors flex items-center gap-1.5 cursor-pointer"
                title="Exportar todas as aulas para o Google Agenda"
              >
                <Calendar className="w-3.5 h-3.5 text-[#00615f]" />
                <span>Exportar Agenda</span>
              </button>
            )}

            <button
              onClick={() => onAddSessionForStudent(student)}
              className="text-xs md:text-sm font-semibold text-[#00615f] hover:bg-[#d0e4e3]/30 px-3.5 py-2 rounded-full border border-[#00615f]/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agendar Aula</span>
            </button>
          </div>
        </div>

        {studentSessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-6 text-center border border-[#bec9c7]/40 shadow-xs flex flex-col items-center">
            <Calendar className="w-10 h-10 text-[#bec9c7] mb-2" />
            <p className="text-sm text-[#506261]">
              Nenhuma aula agendada no momento para este cliente.
            </p>
            <button
              onClick={() => onAddSessionForStudent(student)}
              className="mt-3 text-xs font-semibold text-[#00615f] hover:underline"
            >
              Criar primeiro agendamento
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {studentSessions.map((session) => {
              const isCompleted = session.status === 'completed';
              const gcalUrl = generateGoogleCalendarUrl(session, student);

              return (
                <div
                  key={session.id}
                  className={`bg-white rounded-xl p-4 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                    isCompleted
                      ? 'border-emerald-300 bg-emerald-50/20'
                      : 'border-[#bec9c7]/60 shadow-2xs hover:border-[#00615f]/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex flex-col items-center justify-center shrink-0 ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-[#d0e4e3]/50 text-[#00615f]'
                      }`}
                    >
                      <Clock className="w-4 h-4" />
                    </div>

                    <div>
                      {/* "Dia tal, tal hora" */}
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm md:text-base font-bold text-[#191c1d]">
                          {formatDateDisplay(session.date)}, {session.time}
                        </h4>
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" />
                            Cliente fez (Presencial)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#506261] bg-[#f2f4f4] px-2 py-0.5 rounded-full">
                            Agendada
                          </span>
                        )}
                      </div>

                      {/* "aula 1 de X" */}
                      <p className="text-xs text-[#506261] mt-0.5 font-medium">
                        {session.descriptionLabel || `Aula ${session.classNumber} de ${session.totalClasses}`}
                      </p>
                    </div>
                  </div>

                  {/* Actions: Google Agenda / Reagendar / "Cliente fez" / "Cliente não fez" */}
                  <div className="flex flex-wrap items-center gap-2 self-end sm:self-center">
                    <a
                      href={gcalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#506261] hover:text-[#00615f] hover:bg-[#d0e4e3]/30 border border-[#bec9c7]/60 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Adicionar esta aula individual ao Google Agenda"
                    >
                      <Calendar className="w-3.5 h-3.5 text-[#00615f]" />
                      <span>Google Agenda</span>
                    </a>

                    <button
                      onClick={() => onRescheduleSession(session)}
                      className="px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[#506261] hover:text-[#00615f] hover:bg-[#eceeee] border border-[#bec9c7]/60 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Mudar data ou horário"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reagendar</span>
                    </button>

                    {!isCompleted ? (
                      <button
                        onClick={() => onConfirmAttendance(session, true)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-white hover:bg-emerald-50/50 text-[#191c1d] border border-[#bec9c7]/80 hover:border-emerald-500 shadow-2xs transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                        title="Marcar que o cliente compareceu e realizou a aula presencial"
                      >
                        <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                        <span>Cliente fez</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onConfirmAttendance(session, false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-white border border-[#bec9c7] text-[#506261] hover:bg-rose-50 hover:text-rose-700 hover:border-rose-200 transition-colors flex items-center gap-1 cursor-pointer"
                        title="Desmarcar ou registrar que o cliente não compareceu"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cliente não fez</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Export to Google Calendar Modal */}
      <ExportCalendarModal
        student={student}
        sessions={sessions}
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
      />

      {/* Actions modal (3-dot menu): Editar / Excluir */}
      {showActionsModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
          onClick={() => setShowActionsModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-2 max-w-xs w-full shadow-xl border border-[#bec9c7]/60"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-sm font-bold text-[#191c1d] px-3.5 pt-3 pb-2">
              {student.name}
            </h3>
            <button
              onClick={() => {
                setShowActionsModal(false);
                onEdit(student);
              }}
              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-[#f2f4f4] text-[#191c1d] text-sm font-semibold transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[#00615f]" />
              <span>Editar Cliente</span>
            </button>
            {onDeleteStudent && (
              <button
                onClick={() => {
                  setShowActionsModal(false);
                  setShowDeleteConfirm(true);
                }}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-xl hover:bg-rose-50 text-rose-600 text-sm font-semibold transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Excluir Cliente</span>
              </button>
            )}
            <div className="pt-1 mt-1 border-t border-[#eceeee]">
              <button
                onClick={() => setShowActionsModal(false)}
                className="w-full text-center px-3.5 py-2.5 rounded-xl text-sm font-semibold text-[#506261] hover:bg-[#eceeee] cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl border border-[#bec9c7]/60 space-y-4">
            <h3 className="text-lg font-bold text-[#191c1d]">Excluir Cliente?</h3>
            <p className="text-sm text-[#506261]">
              Deseja realmente remover <strong>{student.name}</strong>? Seus dados e agendamentos serão removidos.
            </p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-[#bec9c7] text-sm font-semibold text-[#506261] hover:bg-[#eceeee] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  onDeleteStudent?.(student.id);
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold shadow-xs cursor-pointer"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
