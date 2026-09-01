import { Category, Exercise, PlanOption } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    id: 'mobilidade',
    name: 'Mobilidade de Coluna',
    icon: 'accessibility',
  },
  {
    id: 'core',
    name: 'Fortalecimento Core',
    icon: 'fitness_center',
  },
  {
    id: 'inferiores',
    name: 'Membros Inferiores',
    icon: 'directions_walk',
  },
  {
    id: 'costas',
    name: 'Costas & Postura',
    icon: 'back_hand',
  },
  {
    id: 'alongamento',
    name: 'Alongamento Global',
    icon: 'self_improvement',
  },
  {
    id: 'corpo_inteiro',
    name: 'Corpo Inteiro',
    icon: 'sports_gymnastics',
  },
];

export const PRESET_PILATES_IMAGES = [
  {
    label: 'The Hundred (Solo)',
    url: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Roll Up & Alongamento',
    url: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Single Leg Stretch',
    url: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Swan Dive / Reformer',
    url: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Ponte Pélvica & Glúteos',
    url: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Teaser & Core Power',
    url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Extensão de Coluna',
    url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1000&q=80',
  },
  {
    label: 'Pilates Studio Clássico',
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=1000&q=80',
  }
];

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'the-hundred',
    name: 'The Hundred',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX3m4_dM',
    categoryId: 'core',
    categoryName: 'Abdômen',
    intensity: 'iniciante',
    typeTag: 'Pilates Solo',
    description: "O 'The Hundred' é um exercício clássico de Pilates focado no aquecimento do corpo e fortalecimento do core. Ele estimula a circulação sanguínea e prepara a respiração para os movimentos seguintes.",
    detailedNotes: 'Instruções de Execução:\n1. Deite-se de costas no colchonete com os braços estendidos ao longo do corpo.\n2. Eleve as pernas em posição "mesa" (table top) ou a 45 graus com controle.\n3. Flexione a cabeça e o tronco superior retirando as escápulas do chão.\n4. Bombeie os braços vigorosamente para cima e para baixo enquanto inspira por 5 tempos e expira por 5 tempos, completando 10 ciclos (100 batimentos).',
    icon: 'person',
    imageUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-01-10T10:00:00.000Z',
    tags: ['Abdômen', 'Aquecimento', 'Respiração'],
  },
  {
    id: 'roll-up',
    name: 'Roll Up',
    videoUrl: 'https://www.youtube.com/watch?v=Yf9pX6z0P5w',
    categoryId: 'core',
    categoryName: 'Corpo Inteiro',
    intensity: 'intermediario',
    typeTag: 'Pilates Solo',
    description: 'O Roll Up é um dos movimentos fundamentais para mobilização vertebral e força abdominal profunda. Trabalha o alongamento da cadeia posterior com total controle e fluidez.',
    detailedNotes: 'Instruções de Execução:\n1. Deite-se em decúbito dorsal com pernas estendidas e calcanhares juntos.\n2. Estenda os braços acima da cabeça mantendo as costelas conectadas.\n3. Inspire trazendo os braços para a linha dos ombros, queixo ao peito.\n4. Expire articulando vértebra por vértebra, enrolando o tronco até alcançar os pés em forma de "C".',
    icon: 'self_improvement',
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-01-12T11:30:00.000Z',
    tags: ['Corpo Inteiro', 'Flexibilidade', 'Mobilidade'],
  },
  {
    id: 'single-leg-stretch',
    name: 'Single Leg Stretch',
    videoUrl: 'https://www.youtube.com/watch?v=r32qC7g0tTg',
    categoryId: 'inferiores',
    categoryName: 'Pernas',
    intensity: 'iniciante',
    typeTag: 'Pilates Solo',
    description: 'Exercício da série clássica de abdominais do Pilates. Focado na dissociação dos membros inferiores mantendo a estabilidade da pelve e alinhamento neutro da lombar.',
    detailedNotes: 'Instruções de Execução:\n1. Deite-se com joelhos flexionados no peito e tronco superior elevado.\n2. Abrace o joelho direito com as duas mãos enquanto estende a perna esquerda a 45 graus.\n3. Alterne as pernas com controle dinâmico, mantendo o abdômen contraído e a pelve estável.\n4. Mantenha os cotovelos ligeiramente abertos e a respiração ritmada.',
    icon: 'directions_walk',
    imageUrl: 'https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-01-15T09:15:00.000Z',
    tags: ['Pernas', 'Abdômen', 'Coordenação'],
  },
  {
    id: 'swan-dive',
    name: 'Swan Dive',
    videoUrl: 'https://www.youtube.com/watch?v=kYJzX3m4_dM',
    categoryId: 'costas',
    categoryName: 'Costas',
    intensity: 'avancado',
    typeTag: 'Pilates Aparelho & Solo',
    description: 'Movimento avançado de extensão da coluna vertebral que fortalece intensamente os eretores da espinha, glúteos e abre a caixa torácica contraindo a cadeia extensora.',
    detailedNotes: 'Instruções de Execução:\n1. Deite-se de bruços com as mãos apoiadas sob os ombros e pernas ligeiramente afastadas.\n2. Inspire enquanto empurra o chão e eleva o peito em extensão torácica longa.\n3. No nível avançado, balance o corpo à frente mantendo a curvatura e balance os braços.\n4. Mantenha o pescoço em linha com a coluna sem hiperextensão cervical.',
    icon: 'accessibility',
    imageUrl: 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-01-18T14:40:00.000Z',
    tags: ['Costas', 'Postura', 'Avançado'],
  },
  {
    id: 'criss-cross',
    name: 'Criss Cross',
    videoUrl: 'https://www.youtube.com/watch?v=Yf9pX6z0P5w',
    categoryId: 'core',
    categoryName: 'Abdômen',
    intensity: 'intermediario',
    typeTag: 'Pilates Solo',
    description: 'Excelente para tonificar os músculos oblíquos internos e externos, além de melhorar a coordenação respiratória durante a rotação da cintura escapular.',
    detailedNotes: 'Instruções de Execução:\n1. Mãos atrás da nuca sem puxar a cabeça.\n2. Gire a axila esquerda em direção ao joelho direito enquanto a perna esquerda estende.\n3. Mantenha a pelve totalmente firme no solo e alterne os lados de forma controlada.',
    icon: 'fitness_center',
    imageUrl: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-01-20T16:00:00.000Z',
    tags: ['Abdômen', 'Oblíquos', 'Core'],
  },
  {
    id: 'spine-stretch-forward',
    name: 'Spine Stretch Forward',
    videoUrl: 'https://www.youtube.com/watch?v=r32qC7g0tTg',
    categoryId: 'mobilidade',
    categoryName: 'Mobilidade de Coluna',
    intensity: 'iniciante',
    typeTag: 'Pilates Solo',
    description: 'Promove a descompressão dos discos vertebrais, alonga os isquiotibiais e reeduca a postura ereta na posição sentada.',
    detailedNotes: 'Instruções de Execução:\n1. Sente-se ereto com as pernas estendidas na largura dos ombros.\n2. Braços paralelos ao chão na altura dos ombros.\n3. Inspire crescendo para o teto e expire mergulhando para frente pelo topo da cabeça.',
    icon: 'self_improvement',
    imageUrl: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1000&q=80',
    createdAt: '2026-01-22T08:20:00.000Z',
    tags: ['Mobilidade', 'Alongamento', 'Coluna'],
  }
];

export const STUDENT_PLANS: PlanOption[] = [
  {
    id: '1x_week',
    name: '1x por semana (4 aulas mensais)',
    price: 'R$ 264,00',
    fullLabel: '1x por semana (4 aulas mensais) – R$ 264,00',
    totalClasses: 4,
    isMonthly: true,
  },
  {
    id: '2x_week',
    name: '2x por semana (8 aulas mensais)',
    price: 'R$ 404,00',
    fullLabel: '2x por semana (8 aulas mensais) – R$ 404,00',
    totalClasses: 8,
    isMonthly: true,
  },
  {
    id: '3x_week',
    name: '3x por semana (12 aulas mensais)',
    price: 'R$ 554,00',
    fullLabel: '3x por semana (12 aulas mensais) – R$ 554,00',
    totalClasses: 12,
    isMonthly: true,
  },
  {
    id: 'avulsa',
    name: 'Aula avulsa',
    price: 'R$ 80,00',
    fullLabel: 'Aula avulsa – R$ 80,00',
    totalClasses: 1,
    isMonthly: false,
  },
];

export const AVAILABLE_ICONS = [
  { id: 'person', name: 'person', label: 'Pessoa / Solo' },
  { id: 'fitness_center', name: 'fitness_center', label: 'Haltere / Força' },
  { id: 'accessibility', name: 'accessibility', label: 'Corpo Inteiro' },
  { id: 'directions_walk', name: 'directions_walk', label: 'Pernas / Caminhada' },
  { id: 'directions_run', name: 'directions_run', label: 'Corrida / Dinâmico' },
  { id: 'sports_gymnastics', name: 'sports_gymnastics', label: 'Ginástica / Equilíbrio' },
  { id: 'back_hand', name: 'back_hand', label: 'Mãos / Braços' },
  { id: 'self_improvement', name: 'self_improvement', label: 'Postura / Mente' },
];
