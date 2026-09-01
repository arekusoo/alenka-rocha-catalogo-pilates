import React, { useState } from 'react';
import {
  Users,
  Search,
  Phone,
  MessageCircle,
  AlertTriangle,
  Calendar,
  ChevronRight,
  Edit2,
  Clock,
} from 'lucide-react';
import { Student } from '../types';

interface ClientsViewProps {
  students: Student[];
  onSelectStudent: (student: Student) => void;
  onEditStudent: (student: Student) => void;
  onAddNewStudent: () => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  students,
  onSelectStudent,
  onEditStudent,
  onAddNewStudent,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlanFilter, setSelectedPlanFilter] = useState<string>('all');

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.phone.includes(searchQuery) ||
      student.limitations.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.weeklySchedule.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlan =
      selectedPlanFilter === 'all'
        ? true
        : selectedPlanFilter === 'avulsa'
        ? student.planId === 'avulsa'
        : student.planId !== 'avulsa';

    return matchesSearch && matchesPlan;
  });

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
    const text = encodeURIComponent(`Olá ${name}, tudo bem? Aqui é do estúdio de Pilates!`);
    return `https://wa.me/${fullNumber}?text=${text}`;
  };

  return (
    <main className="w-full max-w-4xl mx-auto px-4 md:px-8 py-6 pb-28 md:pb-28 flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#191c1d] tracking-tight">
          Clientes
        </h1>
        <p className="text-xs md:text-sm text-[#506261] mt-0.5">
          {students.length} {students.length === 1 ? 'cliente cadastrado' : 'clientes cadastrados'}
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#506261]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nome, telefone, limitação..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#bec9c7]/80 rounded-full text-sm text-[#191c1d] placeholder-[#6f7978] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-all shadow-2xs"
          />
        </div>

        {/* Plan Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setSelectedPlanFilter('all')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedPlanFilter === 'all'
                ? 'bg-[#00615f] text-white shadow-2xs'
                : 'bg-[#f2f4f4] text-[#506261] hover:bg-[#eceeee]'
            }`}
          >
            Todos ({students.length})
          </button>
          <button
            onClick={() => setSelectedPlanFilter('monthly')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedPlanFilter === 'monthly'
                ? 'bg-[#00615f] text-white shadow-2xs'
                : 'bg-[#f2f4f4] text-[#506261] hover:bg-[#eceeee]'
            }`}
          >
            Planos Mensais
          </button>
          <button
            onClick={() => setSelectedPlanFilter('avulsa')}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              selectedPlanFilter === 'avulsa'
                ? 'bg-[#00615f] text-white shadow-2xs'
                : 'bg-[#f2f4f4] text-[#506261] hover:bg-[#eceeee]'
            }`}
          >
            Aulas Avulsas
          </button>
        </div>
      </div>

      {/* Student/Client List */}
      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-[#bec9c7]/40 shadow-xs flex flex-col items-center">
          <Users className="w-12 h-12 text-[#bec9c7] mb-3" />
          <h3 className="text-base font-bold text-[#191c1d]">Nenhum cliente encontrado</h3>
          <p className="text-sm text-[#506261] mt-1 max-w-sm">
            {searchQuery
              ? 'Nenhum resultado corresponde à sua pesquisa. Tente buscar por outros termos.'
              : 'Você ainda não possui clientes cadastrados. Adicione seu primeiro cliente!'}
          </p>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 text-xs font-semibold text-[#00615f] hover:underline"
            >
              Limpar busca
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredStudents.map((student) => {
            const isAvulsa = student.planId === 'avulsa';
            const isLowClasses = student.remainingClasses <= 1;

            return (
              <div
                key={student.id}
                onClick={() => onSelectStudent(student)}
                className="bg-white rounded-2xl p-5 border border-[#bec9c7]/50 shadow-xs hover:shadow-md hover:border-[#00615f]/40 transition-all cursor-pointer flex flex-col justify-between group relative"
              >
                <div>
                  {/* Top line: Name and Plan Tag */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-base md:text-lg font-bold text-[#191c1d] group-hover:text-[#00615f] transition-colors">
                        {student.name}
                      </h3>
                      {/* WhatsApp contact */}
                      <div className="flex items-center gap-1.5 text-xs text-[#506261] mt-0.5">
                        <Phone className="w-3.5 h-3.5 text-[#00615f]" />
                        <span>{formatPhone(student.phone)}</span>
                        <a
                          href={getWhatsAppLink(student.phone, student.name)}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded-full text-[11px] font-semibold transition-colors ml-1"
                          title="Conversar no WhatsApp"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>WhatsApp</span>
                        </a>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditStudent(student);
                      }}
                      className="p-1.5 text-[#6f7978] hover:text-[#00615f] hover:bg-[#d0e4e3]/30 rounded-lg transition-colors cursor-pointer"
                      title="Editar Cliente"
                      aria-label="Editar Cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Tags row: Remaining classes & Plan */}
                  <div className="flex flex-wrap items-center gap-2 my-2.5">
                    {/* Remaining Classes Tag */}
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        isLowClasses
                          ? 'bg-amber-50 text-amber-900 border border-amber-200'
                          : 'bg-[#d0e4e3]/60 text-[#00615f] border border-[#00615f]/20'
                      }`}
                    >
                      <Clock className="w-3.5 h-3.5" />
                      <span>{student.remainingClasses} {student.remainingClasses === 1 ? 'aula restante' : 'aulas restantes'}</span>
                    </span>

                    {/* Active Plan Tag */}
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium ${
                        isAvulsa
                          ? 'bg-purple-50 text-purple-700 border border-purple-200'
                          : 'bg-[#f2f4f4] text-[#3f4948] border border-[#bec9c7]/50'
                      }`}
                    >
                      {isAvulsa ? 'Aula Avulsa' : student.planName.split('–')[0].trim()}
                    </span>
                  </div>

                  {/* Weekly schedule if available */}
                  {student.weeklySchedule && (
                    <div className="flex items-center gap-1.5 text-xs text-[#506261] mb-2.5">
                      <Calendar className="w-3.5 h-3.5 text-[#00615f]" />
                      <span>{student.weeklySchedule}</span>
                    </div>
                  )}

                  {/* Client Limitations (Clean & concise) */}
                  {student.limitations ? (
                    <div className="bg-[#fff9f0] rounded-xl px-3 py-2 border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                      <p className="line-clamp-2 leading-relaxed font-normal">
                        {student.limitations}
                      </p>
                    </div>
                  ) : (
                    <div className="text-xs text-[#6f7978] italic">
                      Sem restrições físicas registradas.
                    </div>
                  )}
                </div>

                {/* Footer action */}
                <div className="mt-3.5 pt-2.5 border-t border-[#eceeee] flex items-center justify-between text-xs text-[#00615f] font-semibold">
                  <span>Ver horários e aulas</span>
                  <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
};
