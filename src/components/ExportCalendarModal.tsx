import React, { useState } from 'react';
import {
  Calendar,
  Download,
  ExternalLink,
  X,
  CheckCircle,
  HelpCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Student, ClassSession } from '../types';
import {
  generateGoogleCalendarUrl,
  exportSessionsToIcs,
  formatGoogleCalendarDates,
} from '../utils/calendarExport';

interface ExportCalendarModalProps {
  student: Student;
  sessions: ClassSession[];
  isOpen: boolean;
  onClose: () => void;
}

export const ExportCalendarModal: React.FC<ExportCalendarModalProps> = ({
  student,
  sessions,
  isOpen,
  onClose,
}) => {
  const [downloaded, setDownloaded] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isOpen) return null;

  const clientSessions = sessions.filter((s) => s.studentId === student.id);

  const handleDownloadIcs = () => {
    exportSessionsToIcs(student, sessions);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 4000);
  };

  const formatDateDisplay = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-');
    const dateObj = new Date(Number(year), Number(month) - 1, Number(day));
    const weekdays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return `${weekdays[dateObj.getDay()]}, ${day}/${month}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/45 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl p-6 md:p-7 max-w-lg w-full shadow-2xl border border-[#bec9c7]/70 flex flex-col gap-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-[#eceeee] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#d0e4e3] flex items-center justify-center text-[#00615f]">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg md:text-xl font-bold text-[#191c1d]">
                Exportar para Google Agenda
              </h3>
              <p className="text-xs md:text-sm text-[#506261]">
                Cliente: <strong>{student.name}</strong> • {clientSessions.length} {clientSessions.length === 1 ? 'aula' : 'aulas'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#6f7978] hover:text-[#191c1d] hover:bg-[#f2f4f4] rounded-full transition-colors cursor-pointer"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Option 1: Baixar arquivo .ics completo */}
        <div className="bg-gradient-to-br from-[#f8fafa] to-[#edf5f4] p-5 rounded-2xl border border-[#00615f]/20 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#00615f] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Recomendado
            </span>
            <span className="text-xs text-[#506261]">Todas as {clientSessions.length} aulas</span>
          </div>

          <div>
            <h4 className="text-base font-bold text-[#191c1d]">
              Baixar Arquivo Completo (.ics)
            </h4>
            <p className="text-xs md:text-sm text-[#506261] mt-0.5 leading-relaxed">
              Gera um arquivo de calendário contendo todos os horários e detalhes. Compatível com <strong>Google Agenda</strong>, <strong>Apple Agenda</strong> e <strong>Outlook</strong>.
            </p>
          </div>

          <button
            onClick={handleDownloadIcs}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs ${
              downloaded
                ? 'bg-emerald-600 text-white'
                : 'bg-[#00615f] hover:bg-[#00504e] text-white active:scale-98'
            }`}
          >
            {downloaded ? (
              <>
                <CheckCircle className="w-4 h-4" />
                <span>Arquivo .ICS Baixado com Sucesso!</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Baixar Calendário do Cliente (.ics)</span>
              </>
            )}
          </button>

          {/* Quick Help Accordion */}
          <div>
            <button
              onClick={() => setShowInstructions(!showInstructions)}
              className="text-xs font-semibold text-[#00615f] hover:underline flex items-center gap-1 mt-1 cursor-pointer"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>{showInstructions ? 'Ocultar instruções' : 'Como importar no Google Agenda?'}</span>
            </button>

            {showInstructions && (
              <div className="mt-2.5 p-3.5 bg-white rounded-xl border border-[#bec9c7]/50 text-xs text-[#506261] space-y-1.5 animate-fade-in">
                <p className="font-bold text-[#191c1d]">No Google Agenda Web (Computador):</p>
                <ol className="list-decimal list-inside space-y-1 pl-1">
                  <li>Abra o <strong>Google Agenda</strong> (calendar.google.com).</li>
                  <li>Clique na engrenagem no topo e vá em <strong>Configurações</strong> &gt; <strong>Importar e exportar</strong>.</li>
                  <li>Selecione o arquivo baixado e clique em <strong>Importar</strong>. Pronto!</li>
                </ol>
                <p className="font-bold text-[#191c1d] pt-1">No Celular (Android / iPhone):</p>
                <p>Ao abrir o arquivo baixado, seu celular perguntará se deseja adicionar os eventos ao seu aplicativo de agenda padrão.</p>
              </div>
            )}
          </div>
        </div>

        {/* Option 2: Adicionar Aulas Individualmente com 1 Clique */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-[#191c1d]">
              Ou Adicione Aulas Individualmente (1 Clique):
            </h4>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {clientSessions.length === 0 ? (
              <p className="text-xs text-[#506261] text-center py-4">
                Nenhuma aula agendada para este cliente.
              </p>
            ) : (
              clientSessions.map((session) => {
                const gcalUrl = generateGoogleCalendarUrl(session, student);
                const isCompleted = session.status === 'completed';

                return (
                  <div
                    key={session.id}
                    className="p-3 bg-[#f8fafa] rounded-xl border border-[#bec9c7]/50 flex items-center justify-between gap-3 hover:bg-[#edf4f3]/60 transition-colors"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#191c1d]">
                          {formatDateDisplay(session.date)} às {session.time}
                        </span>
                        {isCompleted && (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                            Feita
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#506261]">
                        {session.descriptionLabel || `Aula ${session.classNumber} de ${session.totalClasses}`}
                      </p>
                    </div>

                    <a
                      href={gcalUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-[#bec9c7] text-[#00615f] hover:bg-[#00615f] hover:text-white hover:border-[#00615f] text-xs font-bold shadow-2xs transition-all cursor-pointer whitespace-nowrap"
                      title="Abrir no Google Agenda e salvar este evento"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Adicionar</span>
                      <ExternalLink className="w-3 h-3 opacity-70" />
                    </a>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-2 border-t border-[#eceeee]">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-[#bec9c7] text-sm font-semibold text-[#506261] hover:bg-[#eceeee] cursor-pointer transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
