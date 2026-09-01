import React, { useState, useEffect } from 'react';
import { ActiveScreen, Exercise, Category, Student, ClassSession, NewItemTab, PlanOption } from './types';
import { INITIAL_CATEGORIES, INITIAL_EXERCISES } from './data/initialData';
import { supabase } from './lib/supabaseClient';
import { Navbar } from './components/Navbar';
import { BottomNav } from './components/BottomNav';
import { CatalogView } from './components/CatalogView';
import { ExerciseDetailView } from './components/ExerciseDetailView';
import { NewExerciseView } from './components/NewExerciseView';
import { ManageCategoriesView } from './components/ManageCategoriesView';
import { ClientsView } from './components/ClientsView';
import { ClientDetailView } from './components/ClientDetailView';
import { StudentFormView } from './components/StudentFormView';
import { AgendaView } from './components/AgendaView';
import { ScheduleSessionsModal, ScheduledClassInput } from './components/ScheduleSessionsModal';
import { CheckCircle2 } from 'lucide-react';

export default function App() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [activeScreen, setActiveScreen] = useState<ActiveScreen>('catalog');
  const [formActiveTab, setFormActiveTab] = useState<NewItemTab>('exercise');

  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Quick Add Session modal for a specific student
  const [schedulingStudent, setSchedulingStudent] = useState<Student | null>(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Load catalog + clients/agenda from Supabase (shared across every visitor)
  useEffect(() => {
    const loadCatalog = async () => {
      const [categoriesRes, exercisesRes, studentsRes, sessionsRes] = await Promise.all([
        supabase.from('categories').select('*'),
        supabase.from('exercises').select('*').order('createdAt', { ascending: false }),
        supabase.from('students').select('*').order('createdAt', { ascending: false }),
        supabase.from('class_sessions').select('*'),
      ]);

      if (categoriesRes.error || exercisesRes.error) {
        console.error('Error loading catalog from Supabase:', categoriesRes.error || exercisesRes.error);
        setCategories(INITIAL_CATEGORIES);
        setExercises(INITIAL_EXERCISES);
      } else {
        setCategories(categoriesRes.data as Category[]);
        setExercises(exercisesRes.data as Exercise[]);
      }

      if (studentsRes.error || sessionsRes.error) {
        console.error('Error loading clients/agenda from Supabase:', studentsRes.error || sessionsRes.error);
        setStudents([]);
        setSessions([]);
      } else {
        setStudents(studentsRes.data as Student[]);
        setSessions(sessionsRes.data as ClassSession[]);
      }

      setIsLoading(false);
    };

    loadCatalog();
  }, []);

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage(null);
    }, 3200);
  };

  // --- Exercise Handlers ---
  const handleSelectExercise = (exercise: Exercise) => {
    setSelectedExercise(exercise);
    setActiveScreen('exercise-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewExercise = () => {
    setEditingExercise(null);
    setFormActiveTab('exercise');
    setActiveScreen('exercise-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormActiveTab('exercise');
    setActiveScreen('exercise-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveExercise = async (
    exerciseData: Omit<Exercise, 'id' | 'createdAt'>,
    exerciseId?: string
  ) => {
    if (exerciseId) {
      // Editing existing
      const { error } = await supabase.from('exercises').update(exerciseData).eq('id', exerciseId);
      if (error) {
        console.error('Error updating exercise:', error);
        showToast('Erro ao atualizar exercício.');
        return;
      }
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId
            ? {
                ...ex,
                ...exerciseData,
              }
            : ex
        )
      );
      if (selectedExercise && selectedExercise.id === exerciseId) {
        setSelectedExercise({
          ...selectedExercise,
          ...exerciseData,
        });
      }
      showToast('Exercício atualizado com sucesso!');
      setActiveScreen('exercise-detail');
    } else {
      // Creating new
      const newEx: Exercise = {
        ...exerciseData,
        id: `ex-${Date.now()}`,
        createdAt: new Date().toISOString(),
      };
      const { error } = await supabase.from('exercises').insert(newEx);
      if (error) {
        console.error('Error creating exercise:', error);
        showToast('Erro ao cadastrar exercício.');
        return;
      }
      setExercises((prev) => [newEx, ...prev]);
      showToast('Novo exercício cadastrado!');
      setSelectedExercise(newEx);
      setActiveScreen('catalog');
    }
  };

  const handleDeleteExercise = async (exerciseId: string) => {
    const { error } = await supabase.from('exercises').delete().eq('id', exerciseId);
    if (error) {
      console.error('Error deleting exercise:', error);
      showToast('Erro ao excluir exercício.');
      return;
    }
    setExercises((prev) => prev.filter((ex) => ex.id !== exerciseId));
    setSelectedExercise(null);
    setActiveScreen('catalog');
    showToast('Exercício excluído com sucesso.');
  };

  // --- Category Handlers ---
  const handleAddCategory = async (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    const { error } = await supabase.from('categories').insert(newCat);
    if (error) {
      console.error('Error creating category:', error);
      showToast('Erro ao criar categoria.');
      return;
    }
    setCategories((prev) => [...prev, newCat]);
    showToast(`Categoria "${categoryData.name}" criada com sucesso!`);
  };

  const handleDeleteCategory = async (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    // The "categories" row deletion cascades to its exercises in the database.
    const { error } = await supabase.from('categories').delete().eq('id', categoryId);
    if (error) {
      console.error('Error deleting category:', error);
      showToast('Erro ao excluir categoria.');
      return;
    }
    setCategories((prev) => prev.filter((c) => c.id !== categoryId));
    setExercises((prev) => prev.filter((ex) => ex.categoryId !== categoryId));
    showToast(`Categoria ${cat ? `"${cat.name}"` : ''} excluída.`);
  };

  // --- Student (Client) Handlers ---
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setActiveScreen('client-detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddNewStudent = () => {
    setEditingStudent(null);
    setFormActiveTab('student');
    setActiveScreen('exercise-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
    setFormActiveTab('student');
    setActiveScreen('exercise-form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSaveStudent = async (
    studentData: Omit<Student, 'id' | 'createdAt'>,
    studentId?: string
  ) => {
    if (studentId) {
      // Editing existing
      const { error } = await supabase.from('students').update(studentData).eq('id', studentId);
      if (error) {
        console.error('Error updating student:', error);
        showToast('Erro ao atualizar cliente.');
        return;
      }
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, ...studentData } : s))
      );
      if (selectedStudent && selectedStudent.id === studentId) {
        setSelectedStudent({
          ...selectedStudent,
          ...studentData,
        });
      }

      // Keep student name/phone/limitations in sync on their future sessions
      const { error: sessionsError } = await supabase
        .from('class_sessions')
        .update({
          studentName: studentData.name,
          studentPhone: studentData.phone,
          studentLimitations: studentData.limitations,
        })
        .eq('studentId', studentId);
      if (sessionsError) {
        console.error('Error syncing sessions after student update:', sessionsError);
      }
      setSessions((prev) =>
        prev.map((sess) =>
          sess.studentId === studentId
            ? {
                ...sess,
                studentName: studentData.name,
                studentPhone: studentData.phone,
                studentLimitations: studentData.limitations,
              }
            : sess
        )
      );

      showToast('Aluno atualizado com sucesso!');
      setActiveScreen('client-detail');
    } else {
      // Creating new
      const newStudentId = `student-${Date.now()}`;
      const newStudent: Student = {
        ...studentData,
        id: newStudentId,
        createdAt: new Date().toISOString(),
      };
      const { error } = await supabase.from('students').insert(newStudent);
      if (error) {
        console.error('Error creating student:', error);
        showToast('Erro ao cadastrar cliente.');
        return;
      }

      setStudents((prev) => [newStudent, ...prev]);
      showToast(`Aluno ${newStudent.name} cadastrado com sucesso!`);
      setSelectedStudent(newStudent);
      setActiveScreen('clients');
      // Offer to schedule a plan/class right away; the studio owner can skip it.
      setSchedulingStudent(newStudent);
    }
  };

  const handleDeleteStudent = async (studentId: string) => {
    // The "students" row deletion cascades to its sessions in the database.
    const { error } = await supabase.from('students').delete().eq('id', studentId);
    if (error) {
      console.error('Error deleting student:', error);
      showToast('Erro ao excluir cliente.');
      return;
    }
    setStudents((prev) => prev.filter((s) => s.id !== studentId));
    setSessions((prev) => prev.filter((sess) => sess.studentId !== studentId));
    setSelectedStudent(null);
    setActiveScreen('clients');
    showToast('Aluno e agendamentos excluídos com sucesso.');
  };

  // --- Class Sessions / Agenda Handlers ---
  const handleConfirmAttendance = async (session: ClassSession, didAttend: boolean = true) => {
    const isMarkingCompleted = didAttend;
    const newStatus = isMarkingCompleted ? 'completed' : 'scheduled';
    const newCompletedAt = isMarkingCompleted ? new Date().toISOString() : null;

    const { error } = await supabase
      .from('class_sessions')
      .update({ status: newStatus, completedAt: newCompletedAt })
      .eq('id', session.id);
    if (error) {
      console.error('Error updating session status:', error);
      showToast('Erro ao atualizar presença.');
      return;
    }

    // Update remaining classes for student (+1 if reverting, -1 if marking completed)
    const student = students.find((st) => st.id === session.studentId);
    if (student) {
      const delta = isMarkingCompleted ? -1 : 1;
      const newRemaining = Math.min(
        student.totalPlanClasses,
        Math.max(0, student.remainingClasses + delta)
      );
      const { error: studentError } = await supabase
        .from('students')
        .update({ remainingClasses: newRemaining })
        .eq('id', student.id);
      if (studentError) {
        console.error('Error updating student remaining classes:', studentError);
      }
      setStudents((prev) =>
        prev.map((st) => (st.id === student.id ? { ...st, remainingClasses: newRemaining } : st))
      );
      if (selectedStudent && selectedStudent.id === student.id) {
        setSelectedStudent((prev) => (prev ? { ...prev, remainingClasses: newRemaining } : null));
      }
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === session.id
          ? { ...s, status: newStatus, completedAt: newCompletedAt ?? undefined }
          : s
      )
    );

    if (isMarkingCompleted) {
      showToast(`Presença confirmada para ${session.studentName}!`);
    } else {
      showToast(`Presença desmarcada para ${session.studentName}. Saldo restaurado.`);
    }
  };

  const handleRescheduleSession = async (
    session: ClassSession,
    newDate: string,
    newTime: string
  ) => {
    const wasCompleted = session.status === 'completed';

    const { error } = await supabase
      .from('class_sessions')
      .update({ date: newDate, time: newTime, status: 'scheduled', completedAt: null })
      .eq('id', session.id);
    if (error) {
      console.error('Error rescheduling session:', error);
      showToast('Erro ao reagendar aula.');
      return;
    }

    setSessions((prev) =>
      prev.map((s) =>
        s.id === session.id
          ? { ...s, date: newDate, time: newTime, status: 'scheduled', completedAt: undefined }
          : s
      )
    );

    // If it was completed before rescheduling, restore 1 class to balance
    if (wasCompleted) {
      const student = students.find((st) => st.id === session.studentId);
      if (student) {
        const newRemaining = Math.min(student.totalPlanClasses, student.remainingClasses + 1);
        const { error: studentError } = await supabase
          .from('students')
          .update({ remainingClasses: newRemaining })
          .eq('id', student.id);
        if (studentError) {
          console.error('Error restoring student remaining classes:', studentError);
        }
        setStudents((prev) =>
          prev.map((st) => (st.id === student.id ? { ...st, remainingClasses: newRemaining } : st))
        );
        if (selectedStudent && selectedStudent.id === student.id) {
          setSelectedStudent((prev) =>
            prev ? { ...prev, remainingClasses: newRemaining } : null
          );
        }
      }
    }

    showToast(`Aula de ${session.studentName} reagendada com sucesso!`);
  };

  // Schedules a batch of classes for a student, either as their first plan
  // (student has no classes yet) or as extra classes added on top of an
  // already active plan (the existing plan is kept; only the class count and
  // descriptions grow).
  const handleScheduleSessions = async (
    student: Student,
    plan: PlanOption,
    slots: ScheduledClassInput[]
  ) => {
    const hasActivePlan = student.totalPlanClasses > 0;
    const startingClassNumber = hasActivePlan ? student.totalPlanClasses + 1 : 1;
    const newTotal = hasActivePlan ? student.totalPlanClasses + slots.length : plan.totalClasses;

    const dayNames = [
      'Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado',
    ];
    const getDayName = (dateStr: string) => {
      const [year, month, day] = dateStr.split('-').map(Number);
      return dayNames[new Date(year, month - 1, day).getDay()] || '';
    };

    const newSessions: ClassSession[] = slots.map((slot, idx) => ({
      id: `session-${Date.now()}-${idx}`,
      studentId: student.id,
      studentName: student.name,
      studentPhone: student.phone,
      studentLimitations: student.limitations,
      date: slot.date,
      time: slot.time,
      classNumber: startingClassNumber + idx,
      totalClasses: newTotal,
      descriptionLabel:
        plan.id === 'avulsa' && !hasActivePlan
          ? 'Aula Avulsa'
          : `Aula ${startingClassNumber + idx} de ${newTotal}`,
      status: 'scheduled',
    }));

    const { error: sessionsError } = await supabase.from('class_sessions').insert(newSessions);
    if (sessionsError) {
      console.error('Error scheduling sessions:', sessionsError);
      showToast('Erro ao agendar aulas.');
      return;
    }

    const daysFound = Array.from(new Set(slots.map((s) => getDayName(s.date)))).filter(Boolean);
    const weeklySchedule =
      daysFound.length > 0 ? `${daysFound.join(' e ')} às ${slots[0]?.time || '08:00'}` : plan.name;

    const studentUpdate: Partial<Student> = hasActivePlan
      ? { totalPlanClasses: newTotal, remainingClasses: student.remainingClasses + slots.length }
      : {
          planId: plan.id,
          planName: plan.name,
          totalPlanClasses: newTotal,
          remainingClasses: newTotal,
          weeklySchedule,
          startDate: slots[0]?.date,
        };

    const { error: studentError } = await supabase.from('students').update(studentUpdate).eq('id', student.id);
    if (studentError) {
      console.error('Error updating student after scheduling:', studentError);
    }

    setStudents((prev) => prev.map((s) => (s.id === student.id ? { ...s, ...studentUpdate } : s)));
    if (selectedStudent && selectedStudent.id === student.id) {
      setSelectedStudent((prev) => (prev ? { ...prev, ...studentUpdate } : null));
    }
    setSessions((prev) => [...newSessions, ...prev]);
    setSchedulingStudent(null);
    showToast(`Aulas agendadas com sucesso para ${student.name}!`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f8fafa] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#00615f] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafa] text-[#191c1d] flex flex-col font-sans selection:bg-[#2b7a78] selection:text-[#befffc]">
      {/* Top App Bar */}
      <Navbar
        activeScreen={activeScreen}
        onNavigate={(screen) => setActiveScreen(screen)}
        isEditing={!!editingExercise || !!editingStudent}
        onEdit={
          activeScreen === 'exercise-detail' && selectedExercise
            ? () => handleEditExercise(selectedExercise)
            : undefined
        }
      />

      {/* Main View Transition */}
      <div className="flex-1 flex flex-col">
        {/* Screen: CATALOG */}
        {activeScreen === 'catalog' && (
          <CatalogView
            exercises={exercises}
            categories={categories}
            onSelectExercise={handleSelectExercise}
            onAddNewExercise={handleAddNewExercise}
            onManageCategories={() => {
              setFormActiveTab('category');
              setActiveScreen('category-manage');
            }}
          />
        )}

        {/* Screen: AGENDA */}
        {activeScreen === 'agenda' && (
          <AgendaView
            sessions={sessions}
            students={students}
            onConfirmAttendance={handleConfirmAttendance}
            onRescheduleSession={handleRescheduleSession}
            onSelectStudent={handleSelectStudent}
          />
        )}

        {/* Screen: CLIENTS LIST */}
        {activeScreen === 'clients' && (
          <ClientsView
            students={students}
            onSelectStudent={handleSelectStudent}
            onEditStudent={handleEditStudent}
            onAddNewStudent={handleAddNewStudent}
          />
        )}

        {/* Screen: CLIENT DETAIL */}
        {activeScreen === 'client-detail' && selectedStudent && (
          <ClientDetailView
            student={selectedStudent}
            sessions={sessions}
            onBack={() => setActiveScreen('clients')}
            onEdit={handleEditStudent}
            onRescheduleSession={() => setActiveScreen('agenda')}
            onConfirmAttendance={handleConfirmAttendance}
            onAddSessionForStudent={(student) => setSchedulingStudent(student)}
            onDeleteStudent={handleDeleteStudent}
          />
        )}

        {/* Screen: EXERCISE DETAIL */}
        {activeScreen === 'exercise-detail' && selectedExercise && (
          <ExerciseDetailView
            exercise={selectedExercise}
            onBack={() => setActiveScreen('catalog')}
            onEdit={handleEditExercise}
            onDelete={handleDeleteExercise}
          />
        )}

        {/* Screen: FORM (+ Novo) with 3 unified tabs: Exercício | Categoria | Cliente */}
        {activeScreen === 'exercise-form' && formActiveTab === 'exercise' && (
          <NewExerciseView
            categories={categories}
            editingExercise={editingExercise}
            onSaveExercise={handleSaveExercise}
            onSwitchTab={(tab) => {
              setFormActiveTab(tab);
              if (tab === 'category') setActiveScreen('category-manage');
            }}
            onCancel={() => {
              if (editingExercise) {
                setActiveScreen('exercise-detail');
              } else {
                setActiveScreen('catalog');
              }
            }}
          />
        )}

        {activeScreen === 'exercise-form' && formActiveTab === 'student' && (
          <StudentFormView
            editingStudent={editingStudent}
            onSaveStudent={handleSaveStudent}
            onSwitchTab={(tab) => {
              setFormActiveTab(tab);
              if (tab === 'category') setActiveScreen('category-manage');
            }}
            onCancel={() => {
              if (editingStudent) {
                setActiveScreen('client-detail');
              } else {
                setActiveScreen('clients');
              }
            }}
          />
        )}

        {/* Screen: CATEGORIES MANAGEMENT */}
        {(activeScreen === 'category-manage' ||
          (activeScreen === 'exercise-form' && formActiveTab === 'category')) && (
          <ManageCategoriesView
            categories={categories}
            exercises={exercises}
            onAddCategory={handleAddCategory}
            onDeleteCategory={handleDeleteCategory}
            onSwitchTab={(tab) => {
              setFormActiveTab(tab);
              if (tab === 'exercise' || tab === 'student') {
                setActiveScreen('exercise-form');
              }
            }}
          />
        )}
      </div>

      {/* Schedule Plan / Classes Modal for Student */}
      {schedulingStudent && (
        <ScheduleSessionsModal
          student={schedulingStudent}
          onClose={() => setSchedulingStudent(null)}
          onConfirm={(plan, slots) => handleScheduleSessions(schedulingStudent, plan, slots)}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div
          id="app-toast-notification"
          className="fixed top-20 right-4 md:right-8 z-50 bg-white text-[#2a2a2a] border border-[#e5e5e5] px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm font-medium animate-in fade-in slide-in-from-top-4 duration-200"
        >
          <CheckCircle2 className="w-5 h-5 text-[#00615f]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Bottom Navigation */}
      <BottomNav
        activeScreen={activeScreen}
        onNavigate={(screen) => {
          if (screen === 'exercise-form') {
            setEditingExercise(null);
            setEditingStudent(null);
          }
          setActiveScreen(screen);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </div>
  );
}
