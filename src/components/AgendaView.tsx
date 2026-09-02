import React, { useState, useMemo } from 'react';
import {
  Calendar,
  Clock,
  CheckCircle,
  RotateCcw,
  User,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Search,
  Check,
  CalendarDays,
  CalendarCheck,
  Filter,
  XCircle,
  History,
  AlertCircle,
  MoreVertical,
  X,
} from 'lucide-react';
import { ClassSession, Student } from '../types';
import { generateGoogleCalendarUrl } from '../utils/calendarExport';

interface AgendaViewProps {
  sessions: ClassSession[];
  students: Student[];
  onConfirmAttendance: (session: ClassSession, didAttend?: boolean) => void;
  onRescheduleSession: (session: ClassSession, newDate: string, newTime: string) => void;
  onSelectStudent?: (student: Student) => void;
}

export const AgendaView: React.FC<AgendaViewProps> = ({
  sessions,
  students,
  onConfirmAttendance,
  onRescheduleSession,
  onSelectStudent,
}) => {
  const [activeTab, setActiveTab] = useState<'daily' | 'monthly'>('daily');
  const [dailyViewMode, setDailyViewMode] = useState<'upcoming' | 'history' | 'pending'>('upcoming');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonthOffset, setSelectedMonthOffset] = useState(0); // 0 = current month, -1 = previous, +1 = next
  const [pendingStudentFilter, setPendingStudentFilter] = useState<string>('all');

  // Reschedule modal state
  const [reschedulingSession, setReschedulingSession] = useState<ClassSession | null>(null);
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');

  // Actions menu modal state (Google Agenda / Reagendar / Cliente fez)
  const [actionsSession, setActionsSession] = useState<ClassSession | null>(null);

  // Today reference in YYYY-MM-DD
  const todayStr = useMemo(() => {
    const pad = (n: number) => String(n).padStart(2, '0');
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
  }, []);

  // Helper check if a session belongs to History (completed OR past date)
  const isHistorySession = (session: ClassSession) => {
    return session.status === 'completed' || session.date < todayStr;
  };

  // Count of past/completed sessions, used by the "Ver Histórico" empty-state link
  const historyCount = useMemo(() => {
    return sessions.filter((s) => s.status === 'completed' || s.date < todayStr).length;
  }, [sessions, todayStr]);

  // Helper date formatter
  const formatDateHeader = (dateStr: string) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    const dateObj = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(year, month - 1, day);
    targetDate.setHours(0, 0, 0, 0);

    const diffTime = targetDate.getTime() - today.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

    const weekdays = [
      'Domingo',
      'Segunda-feira',
      'Terça-feira',
      'Quarta-feira',
      'Quinta-feira',
      'Sexta-feira',
      'Sábado',
    ];
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];

    const weekday = weekdays[dateObj.getDay()];
    const monthName = months[dateObj.getMonth()];

    if (diffDays === 0) {
      return { title: 'Hoje', subtitle: `${weekday}, ${day} de ${monthName}` };
    }
    if (diffDays === 1) {
      return { title: 'Amanhã', subtitle: `${weekday}, ${day} de ${monthName}` };
    }
    if (diffDays === -1) {
      return { title: 'Ontem', subtitle: `${weekday}, ${day} de ${monthName}` };
    }
    return { title: `${weekday}`, subtitle: `${day} de ${monthName}, ${year}` };
  };

  // Group sessions by date for daily agenda (filtered by upcoming or history)
  const groupedSessions = useMemo<Record<string, ClassSession[]>>(() => {
    const filtered = sessions.filter((session) => {
      // History vs Upcoming filter
      const isHistory = isHistorySession(session);
      if (dailyViewMode === 'history' && !isHistory) return false;
      if (dailyViewMode === 'upcoming' && isHistory) return false;

      // Search query filter
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return (
        session.studentName.toLowerCase().includes(q) ||
        (session.descriptionLabel && session.descriptionLabel.toLowerCase().includes(q)) ||
        (session.studentLimitations && session.studentLimitations.toLowerCase().includes(q)) ||
        session.date.includes(q)
      );
    });

    // Sort by date then time (ascending for upcoming, descending for history)
    const sorted = [...filtered].sort((a, b) => {
      const dateTimeA = new Date(`${a.date}T${a.time}`).getTime();
      const dateTimeB = new Date(`${b.date}T${b.time}`).getTime();
      return dailyViewMode === 'history' ? dateTimeB - dateTimeA : dateTimeA - dateTimeB;
    });

    const groups: Record<string, ClassSession[]> = {};
    sorted.forEach((session) => {
      if (!groups[session.date]) {
        groups[session.date] = [];
      }
      groups[session.date].push(session);
    });

    return groups;
  }, [sessions, searchQuery, dailyViewMode, todayStr]);

  // Sessions that should already have happened but were never marked "Cliente fez"
  const allPendingSessions = useMemo(() => {
    return sessions.filter((s) => s.status !== 'completed' && s.date < todayStr);
  }, [sessions, todayStr]);

  // Distinct clients that have at least one pending session, for the filter selector
  const pendingStudentOptions = useMemo(() => {
    const ids = Array.from(new Set(allPendingSessions.map((s) => s.studentId)));
    return ids
      .map((id) => students.find((st) => st.id === id))
      .filter((st): st is Student => !!st)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [allPendingSessions, students]);

  // Pending sessions filtered by client, grouped by date (oldest first)
  const groupedPendingSessions = useMemo<Record<string, ClassSession[]>>(() => {
    const filtered =
      pendingStudentFilter === 'all'
        ? allPendingSessions
        : allPendingSessions.filter((s) => s.studentId === pendingStudentFilter);

    const sorted = [...filtered].sort(
      (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime()
    );

    const groups: Record<string, ClassSession[]> = {};
    sorted.forEach((session) => {
      if (!groups[session.date]) groups[session.date] = [];
      groups[session.date].push(session);
    });
    return groups;
  }, [allPendingSessions, pendingStudentFilter]);

  // Current month reference for monthly report
  const selectedDateMonth = useMemo(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + selectedMonthOffset);
    return d;
  }, [selectedMonthOffset]);

  const monthYearLabel = useMemo(() => {
    const months = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return `${months[selectedDateMonth.getMonth()]} de ${selectedDateMonth.getFullYear()}`;
  }, [selectedDateMonth]);

  // Monthly statistics per student/client
  const monthlyReport = useMemo(() => {
    const targetYear = selectedDateMonth.getFullYear();
    const targetMonth = selectedDateMonth.getMonth() + 1; // 1-12
    const targetMonthStr = targetMonth.toString().padStart(2, '0');
    const prefix = `${targetYear}-${targetMonthStr}`;

    const monthSessions = sessions.filter((s) => s.date.startsWith(prefix));

    return students.map((student) => {
      const studentMonthSessions = monthSessions.filter((s) => s.studentId === student.id);
      const completedSessions = studentMonthSessions.filter((s) => s.status === 'completed');
      const scheduledSessions = studentMonthSessions.filter((s) => s.status === 'scheduled');

      // Unique days of attended classes
      const attendedDays = Array.from(
        new Set(
          completedSessions.map((s) => {
            const day = s.date.split('-')[2];
            return day;
          })
        )
      ).sort((a, b) => Number(a) - Number(b));

      // All scheduled days
      const allDays = Array.from(
        new Set(
          studentMonthSessions.map((s) => {
            const day = s.date.split('-')[2];
            return `${day} (${s.time})`;
          })
        )
      );

      return {
        student,
        totalCompleted: completedSessions.length,
        totalScheduled: scheduledSessions.length,
        totalInMonth: studentMonthSessions.length,
        attendedDays,
        allDays,
      };
    });
  }, [students, sessions, selectedDateMonth]);

  const handleOpenReschedule = (session: ClassSession) => {
    setReschedulingSession(session);
    setNewDate(session.date);
    setNewTime(session.time);
  };

  const handleSaveReschedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (reschedulingSession && newDate && newTime) {
      onRescheduleSession(reschedulingSession, newDate, newTime);
      setReschedulingSession(null);
    }
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 md:px-8 py-6 pb-28 md:pb-28 flex flex-col gap-6">
      {/* Top Segmented Control Tab */}
      <div className="flex bg-[#f2f4f4] rounded-xl p-1 border border-[#bec9c7]/60 w-full max-w-md mx-auto">
        <button
          onClick={() => setActiveTab('daily')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'daily'
              ? 'bg-[#00615f] text-white shadow-xs'
              : 'text-[#506261] hover:bg-[#ffffff]/60'
          }`}
        >
          Agenda Diária
        </button>
        <button
          onClick={() => setActiveTab('monthly')}
          className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
            activeTab === 'monthly'
              ? 'bg-[#00615f] text-white shadow-xs'
              : 'text-[#506261] hover:bg-[#ffffff]/60'
          }`}
        >
          Relação Mensal
        </button>
      </div>

      {/* Header Description & Histórico/Próximas toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-left">
          <h1 className="text-2xl md:text-3xl font-bold text-[#191c1d] tracking-tight">
            {activeTab === 'monthly'
              ? 'Relação Mensal de Clientes'
              : dailyViewMode === 'pending'
              ? 'Aulas Pendentes'
              : dailyViewMode === 'history'
              ? 'Histórico de Aulas'
              : 'Agenda de Aulas'}
          </h1>
          <p className="text-sm text-[#506261] mt-0.5">
            {activeTab === 'monthly'
              ? 'Controle de frequência e quantidade de aulas realizadas por cliente a cada mês.'
              : dailyViewMode === 'pending'
              ? 'Aulas que já deveriam ter acontecido e ainda não foram marcadas como realizadas.'
              : dailyViewMode === 'history'
              ? 'Aulas concluídas e datas anteriores registradas.'
              : 'Controle de quem esteve presencial para hoje e próximos dias.'}
          </p>
        </div>

        {activeTab === 'daily' && (
          <div className="flex items-center gap-1.5 bg-[#f2f4f4] p-1 rounded-xl border border-[#bec9c7]/60 self-start sm:self-auto shrink-0 shadow-2xs">
            <button
              onClick={() => setDailyViewMode('upcoming')}
              className={`px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                dailyViewMode === 'upcoming'
                  ? 'bg-[#00615f] text-white shadow-xs'
                  : 'text-[#506261] hover:text-[#191c1d] hover:bg-white/60'
              }`}
              title="Exibir aulas de hoje e próximas agendadas"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Próximas</span>
            </button>

            <button
              onClick={() => setDailyViewMode('history')}
              className={`px-3 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                dailyViewMode === 'history'
                  ? 'bg-[#00615f] text-white shadow-xs'
                  : 'text-[#506261] hover:text-[#191c1d] hover:bg-white/60'
              }`}
              title="Exibir histórico de aulas já feitas e datas passadas"
            >
              <History className="w-3.5 h-3.5" />
              <span>Histórico</span>
            </button>

            <button
              onClick={() => setDailyViewMode('pending')}
              className={`px-3.5 py-2 rounded-full text-xs md:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                dailyViewMode === 'pending'
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'text-amber-700 hover:bg-amber-50'
              }`}
              title="Exibir aulas atrasadas que ainda não foram confirmadas"
            >
              <AlertCircle className="w-3.5 h-3.5" />
              <span>Pendentes</span>
            </button>
          </div>
        )}
      </div>

      {/* TAB 1: DAILY AGENDA (Próximas / Histórico) */}
      {activeTab === 'daily' && dailyViewMode !== 'pending' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#506261]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                dailyViewMode === 'history'
                  ? 'Buscar no histórico por cliente, data ou limitação...'
                  : 'Buscar por cliente, limitação ou data...'
              }
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#bec9c7]/80 rounded-full text-sm text-[#191c1d] placeholder-[#6f7978] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-all shadow-2xs"
            />
          </div>

          {/* Grouped Days List (Google Calendar style list) */}
          {Object.keys(groupedSessions).length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#bec9c7]/40 shadow-xs flex flex-col items-center">
              {dailyViewMode === 'history' ? (
                <History className="w-12 h-12 text-[#bec9c7] mb-3" />
              ) : (
                <Calendar className="w-12 h-12 text-[#bec9c7] mb-3" />
              )}
              <h3 className="text-base font-bold text-[#191c1d]">
                {dailyViewMode === 'history'
                  ? 'Nenhum histórico de aula encontrado'
                  : 'Nenhuma aula futura encontrada'}
              </h3>
              <p className="text-sm text-[#506261] mt-1 max-w-sm">
                {searchQuery
                  ? 'Nenhum resultado corresponde à sua pesquisa.'
                  : dailyViewMode === 'history'
                  ? 'As aulas marcadas como realizadas ou de datas passadas aparecerão automaticamente aqui.'
                  : 'Não há aulas agendadas para hoje ou próximos dias. Verifique o botão de Histórico para conferir aulas já realizadas.'}
              </p>
              {dailyViewMode === 'upcoming' && historyCount > 0 && !searchQuery && (
                <button
                  onClick={() => setDailyViewMode('history')}
                  className="mt-4 px-4 py-2 bg-[#d0e4e3]/50 hover:bg-[#d0e4e3] text-[#00615f] font-semibold text-xs rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Ver Histórico ({historyCount} aulas)</span>
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              {(Object.entries(groupedSessions) as [string, ClassSession[]][]).map(([dateStr, dateSessions]) => {
                const headerInfo = formatDateHeader(dateStr);
                const isToday = headerInfo.title === 'Hoje';

                return (
                  <div key={dateStr} className="space-y-3">
                    {/* Sticky-like Date Header */}
                    <div
                      className={`flex items-baseline justify-between px-3 py-2 rounded-xl border ${
                        isToday
                          ? 'bg-[#d0e4e3]/40 border-[#00615f]/30'
                          : 'bg-[#f8fafa] border-[#eceeee]'
                      }`}
                    >
                      <div className="flex items-baseline gap-2">
                        <span
                          className={`text-base font-bold tracking-tight ${
                            isToday ? 'text-[#00615f]' : 'text-[#191c1d]'
                          }`}
                        >
                          {headerInfo.title}
                        </span>
                        <span className="text-xs text-[#506261] font-medium">
                          • {headerInfo.subtitle}
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#506261] bg-white px-2.5 py-0.5 rounded-full border border-[#bec9c7]/40">
                        {dateSessions.length} {dateSessions.length === 1 ? 'aula' : 'aulas'}
                      </span>
                    </div>

                    {/* Sessions list under this day */}
                    <div className="space-y-3">
                      {dateSessions.map((session) => {
                        const isCompleted = session.status === 'completed';
                        const matchingStudent = students.find((s) => s.id === session.studentId);
                        const limitations =
                          session.studentLimitations || matchingStudent?.limitations;

                        return (
                          <div
                            key={session.id}
                            className={`bg-white rounded-2xl p-4 md:p-5 border transition-all ${
                              isCompleted
                                ? 'border-emerald-300 bg-emerald-50/20'
                                : 'border-[#bec9c7]/60 shadow-xs hover:border-[#00615f]/50'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              {/* Left side: Time & Client Details */}
                              <div className="flex items-start gap-3.5 min-w-0">
                                {/* Time block badge */}
                                <div
                                  className={`px-3 py-2 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold ${
                                    isCompleted
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-[#00615f] text-white shadow-2xs'
                                  }`}
                                >
                                  <Clock className="w-3.5 h-3.5 mb-0.5 opacity-80" />
                                  <span className="text-sm md:text-base leading-none">
                                    {session.time}
                                  </span>
                                </div>

                                <div className="space-y-1 min-w-0">
                                  {/* Client Name */}
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <h3
                                      onClick={() =>
                                        matchingStudent && onSelectStudent?.(matchingStudent)
                                      }
                                      className="text-base md:text-lg font-bold text-[#191c1d] hover:text-[#00615f] cursor-pointer transition-colors"
                                    >
                                      {session.studentName}
                                    </h3>
                                    {isCompleted ? (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/90 px-2.5 py-0.5 rounded-full border border-emerald-200">
                                        <Check className="w-3 h-3" />
                                        Cliente fez
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#506261] bg-[#f2f4f4] px-2 py-0.5 rounded-full">
                                        Agendada
                                      </span>
                                    )}
                                  </div>

                                  {/* Description: Aula X de Y */}
                                  <p className="text-xs md:text-sm font-semibold text-[#00615f]">
                                    {session.descriptionLabel ||
                                      `Aula ${session.classNumber} de ${session.totalClasses}`}
                                  </p>

                                  {/* Limitations note */}
                                  {limitations && (
                                    <div className="flex items-center gap-1.5 text-xs text-[#506261] bg-[#fff9f0] border border-amber-200/80 px-2.5 py-1 rounded-lg mt-1.5 max-w-lg">
                                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                      <span className="line-clamp-1">
                                        <strong>Limitações:</strong> {limitations}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Right side: Actions menu (Google Agenda / Reagendar / Cliente fez) */}
                              <button
                                onClick={() => setActionsSession(session)}
                                className="p-2 rounded-full text-[#506261] hover:text-[#00615f] hover:bg-[#eceeee] border border-[#bec9c7]/70 transition-all active:scale-95 cursor-pointer shrink-0"
                                title="Ver ações desta aula"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Pendentes (dentro da Agenda Diária: aulas que já passaram e não foram marcadas como feitas) */}
      {activeTab === 'daily' && dailyViewMode === 'pending' && (
        <div className="space-y-6">
          {/* Client filter selector */}
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#506261] pointer-events-none" />
            <select
              value={pendingStudentFilter}
              onChange={(e) => setPendingStudentFilter(e.target.value)}
              className="w-full sm:w-72 pl-10 pr-4 py-2.5 bg-white border border-[#bec9c7]/80 rounded-full text-sm text-[#191c1d] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-all shadow-2xs cursor-pointer appearance-none"
            >
              <option value="all">
                Todos os clientes ({allPendingSessions.length} {allPendingSessions.length === 1 ? 'aula' : 'aulas'})
              </option>
              {pendingStudentOptions.map((st) => (
                <option key={st.id} value={st.id}>
                  {st.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#506261] pointer-events-none" />
          </div>

          {Object.keys(groupedPendingSessions).length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-[#bec9c7]/40 shadow-xs flex flex-col items-center">
              <CalendarCheck className="w-12 h-12 text-[#bec9c7] mb-3" />
              <h3 className="text-base font-bold text-[#191c1d]">
                Nenhuma aula pendente
              </h3>
              <p className="text-sm text-[#506261] mt-1 max-w-sm">
                {pendingStudentFilter === 'all'
                  ? 'Não há aulas atrasadas sem confirmação de presença. Tudo em dia!'
                  : 'Este cliente não tem aulas atrasadas sem confirmação de presença.'}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {(Object.entries(groupedPendingSessions) as [string, ClassSession[]][]).map(
                ([dateStr, dateSessions]) => {
                  const headerInfo = formatDateHeader(dateStr);

                  return (
                    <div key={dateStr} className="space-y-3">
                      <div className="flex items-baseline justify-between px-3 py-2">
                        <div className="flex items-baseline gap-2">
                          <span className="text-base font-bold tracking-tight text-[#191c1d]">
                            {headerInfo.title}
                          </span>
                          <span className="text-xs text-[#506261] font-medium">
                            • {headerInfo.subtitle}
                          </span>
                        </div>
                        <span className="text-xs font-semibold text-[#506261]">
                          {dateSessions.length} {dateSessions.length === 1 ? 'aula' : 'aulas'}
                        </span>
                      </div>

                      <div className="space-y-3">
                        {dateSessions.map((session) => {
                          const matchingStudent = students.find((s) => s.id === session.studentId);
                          const limitations = session.studentLimitations || matchingStudent?.limitations;

                          return (
                            <div
                              key={session.id}
                              className="bg-white rounded-2xl p-4 md:p-5 border border-[#bec9c7]/60 shadow-xs hover:border-[#00615f]/40 transition-all"
                            >
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex items-start gap-3.5">
                                  <div className="px-3 py-2 rounded-xl flex flex-col items-center justify-center shrink-0 font-bold bg-[#d0e4e3]/50 text-[#00615f]">
                                    <Clock className="w-3.5 h-3.5 mb-0.5 opacity-80" />
                                    <span className="text-sm md:text-base leading-none">
                                      {session.time}
                                    </span>
                                  </div>

                                  <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                      <h3
                                        onClick={() =>
                                          matchingStudent && onSelectStudent?.(matchingStudent)
                                        }
                                        className="text-base md:text-lg font-bold text-[#191c1d] hover:text-[#00615f] cursor-pointer transition-colors"
                                      >
                                        {session.studentName}
                                      </h3>
                                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-200">
                                        Pendente
                                      </span>
                                    </div>

                                    <p className="text-xs md:text-sm font-semibold text-[#00615f]">
                                      {session.descriptionLabel ||
                                        `Aula ${session.classNumber} de ${session.totalClasses}`}
                                    </p>

                                    {limitations && (
                                      <div className="flex items-center gap-1.5 text-xs text-[#506261] bg-[#fff9f0] border border-amber-200/80 px-2.5 py-1 rounded-lg mt-1.5 max-w-lg">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                        <span className="line-clamp-1">
                                          <strong>Limitações:</strong> {limitations}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Only action available: Reagendar */}
                                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                                  <button
                                    onClick={() => handleOpenReschedule(session)}
                                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-[#00615f] hover:bg-[#00504e] transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                                    title="Mudar data ou horário da aula"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span>Reagendar</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: MONTHLY REPORT (Relação Geral de Clientes por Mês) */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          {/* Month selector navigation */}
          <div className="bg-white rounded-2xl p-4 border border-[#bec9c7]/60 shadow-xs flex items-center justify-between">
            <button
              onClick={() => setSelectedMonthOffset((prev) => prev - 1)}
              className="p-2 rounded-full hover:bg-[#eceeee] text-[#191c1d] transition-colors cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="text-center">
              <span className="text-xs text-[#506261] block font-medium">Visualizando</span>
              <h3 className="text-lg font-bold text-[#00615f] capitalize">{monthYearLabel}</h3>
            </div>

            <button
              onClick={() => setSelectedMonthOffset((prev) => prev + 1)}
              className="p-2 rounded-full hover:bg-[#eceeee] text-[#191c1d] transition-colors cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Client Monthly Cards */}
          <div className="space-y-3">
            {monthlyReport.map(({ student, totalCompleted, totalInMonth, attendedDays, allDays }) => {
              const isAvulsa = student.planId === 'avulsa';

              return (
                <div
                  key={student.id}
                  className="bg-white rounded-2xl p-5 border border-[#bec9c7]/60 shadow-xs flex flex-col gap-3.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eceeee] pb-3">
                    <div>
                      <h4
                        onClick={() => onSelectStudent?.(student)}
                        className="text-base md:text-lg font-bold text-[#191c1d] hover:text-[#00615f] cursor-pointer transition-colors"
                      >
                        {student.name}
                      </h4>
                      <span className="text-xs text-[#506261]">
                        {isAvulsa ? 'Aula Avulsa' : student.planName}
                      </span>
                    </div>

                    {/* Classes Count Tag */}
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#d0e4e3]/60 text-[#00615f] border border-[#00615f]/20">
                        <CheckCircle className="w-3.5 h-3.5" />
                        {totalCompleted} {totalCompleted === 1 ? 'aula realizada' : 'aulas realizadas'}
                      </span>
                    </div>
                  </div>

                  {/* Attended Days List */}
                  <div className="text-xs text-[#3f4948]">
                    <span className="font-semibold text-[#191c1d] block mb-1.5">
                      Dias com aula realizada neste mês:
                    </span>
                    {attendedDays.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {attendedDays.map((day) => (
                          <span
                            key={day}
                            className="bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-lg font-semibold"
                          >
                            Dia {day}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[#6f7978] italic">
                        Nenhuma presença registrada ainda neste mês.
                      </span>
                    )}
                  </div>

                  {/* Scheduled dates */}
                  {allDays.length > 0 && (
                    <div className="text-xs text-[#506261] pt-1">
                      <span className="font-medium text-[#6f7978]">
                        Datas na agenda:{' '}
                      </span>
                      <span>{allDays.join(', ')}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reschedule Modal */}
      {reschedulingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#bec9c7]/60 space-y-4">
            <div className="flex items-center justify-between border-b border-[#eceeee] pb-3">
              <div>
                <h3 className="text-lg font-bold text-[#191c1d]">Reagendar Aula</h3>
                <p className="text-xs text-[#506261] mt-0.5">
                  Cliente: <strong>{reschedulingSession.studentName}</strong>
                </p>
              </div>
              <span className="text-xs font-semibold bg-[#d0e4e3] text-[#00615f] px-2.5 py-1 rounded-full">
                {reschedulingSession.descriptionLabel || 'Aula'}
              </span>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#191c1d] mb-1.5">
                  Nova Data:
                </label>
                <input
                  type="date"
                  required
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full bg-[#f8fafa] border border-[#bec9c7] rounded-xl px-3.5 py-2.5 text-sm text-[#191c1d] focus:border-[#00615f] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#191c1d] mb-1.5">
                  Novo Horário:
                </label>
                <input
                  type="time"
                  required
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full bg-[#f8fafa] border border-[#bec9c7] rounded-xl px-3.5 py-2.5 text-sm text-[#191c1d] focus:border-[#00615f] outline-none"
                />
              </div>

              <div className="flex gap-3 pt-3 border-t border-[#eceeee]">
                <button
                  type="button"
                  onClick={() => setReschedulingSession(null)}
                  className="flex-1 py-2.5 rounded-xl border border-[#bec9c7] text-sm font-semibold text-[#506261] hover:bg-[#eceeee] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#00615f] hover:bg-[#00504e] text-white text-sm font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Salvar Reagendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Actions Modal (Google Agenda / Reagendar / Cliente fez) */}
      {actionsSession && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fade-in"
          onClick={() => setActionsSession(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl p-5 max-w-sm w-full shadow-2xl border border-[#bec9c7]/60 space-y-3 max-h-[85vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-[#eceeee] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#191c1d]">Ações da Aula</h3>
                <p className="text-xs text-[#506261] mt-0.5">
                  Cliente: <strong>{actionsSession.studentName}</strong>
                </p>
              </div>
              <button
                onClick={() => setActionsSession(null)}
                className="p-1.5 rounded-full text-[#506261] hover:bg-[#eceeee] cursor-pointer"
                title="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 pt-1">
              <a
                href={generateGoogleCalendarUrl(
                  actionsSession,
                  students.find((s) => s.id === actionsSession.studentId)
                )}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActionsSession(null)}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-[#191c1d] hover:bg-[#eceeee] border border-[#bec9c7]/70 transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <Calendar className="w-4 h-4 text-[#00615f]" />
                <span>Agendar no Google Agenda</span>
              </a>

              <button
                onClick={() => {
                  handleOpenReschedule(actionsSession);
                  setActionsSession(null);
                }}
                className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-[#191c1d] hover:bg-[#eceeee] border border-[#bec9c7]/70 transition-all flex items-center gap-2.5 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#00615f]" />
                <span>Reagendar</span>
              </button>

              {actionsSession.status !== 'completed' ? (
                <button
                  onClick={() => {
                    onConfirmAttendance(actionsSession, true);
                    setActionsSession(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-[#191c1d] hover:bg-emerald-50/50 border border-[#bec9c7]/70 hover:border-emerald-500 transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                  <span>Cliente fez</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    onConfirmAttendance(actionsSession, false);
                    setActionsSession(null);
                  }}
                  className="w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-[#506261] hover:bg-rose-50 hover:text-rose-700 border border-[#bec9c7]/70 hover:border-rose-200 transition-all flex items-center gap-2.5 cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Cliente não fez</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
};
