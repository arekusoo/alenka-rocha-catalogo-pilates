import React, { useState, useEffect, useRef } from 'react';
import {
  Upload,
  Link as LinkIcon,
  Check,
} from 'lucide-react';
import { Exercise, Category, IntensityLevel, NewItemTab } from '../types';

interface NewExerciseViewProps {
  categories: Category[];
  editingExercise?: Exercise | null;
  onSaveExercise: (exerciseData: Omit<Exercise, 'id' | 'createdAt'>, exerciseId?: string) => void;
  onSwitchTab: (tab: NewItemTab) => void;
  onCancel: () => void;
}

export const NewExerciseView: React.FC<NewExerciseViewProps> = ({
  categories,
  editingExercise,
  onSaveExercise,
  onSwitchTab,
  onCancel,
}) => {
  const [name, setName] = useState(editingExercise?.name || '');
  const [videoUrl, setVideoUrl] = useState(editingExercise?.videoUrl || '');
  const [categoryId, setCategoryId] = useState(
    editingExercise?.categoryId || (categories.length > 0 ? categories[0].id : '')
  );
  const [intensity, setIntensity] = useState<IntensityLevel>(
    editingExercise?.intensity || 'iniciante'
  );
  const [typeTag, setTypeTag] = useState(editingExercise?.typeTag || 'Pilates Solo');
  const [description, setDescription] = useState(editingExercise?.description || '');

  // Image source modes: 'url' | 'upload'
  const [imageMode, setImageMode] = useState<'url' | 'upload'>('url');
  const [imageUrl, setImageUrl] = useState(
    editingExercise?.imageUrl ||
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80'
  );
  const [imageError, setImageError] = useState(false);
  const [imageUploadLoading, setImageUploadLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingExercise) {
      setName(editingExercise.name);
      setVideoUrl(editingExercise.videoUrl);
      setCategoryId(editingExercise.categoryId);
      setIntensity(editingExercise.intensity);
      setTypeTag(editingExercise.typeTag || 'Pilates Solo');
      setDescription(editingExercise.description);
      setImageUrl(editingExercise.imageUrl);
    }
  }, [editingExercise]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem deve ter no máximo 5MB.');
      return;
    }

    setImageUploadLoading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageUrl(event.target.result as string);
        setImageError(false);
      }
      setImageUploadLoading(false);
    };
    reader.onerror = () => {
      setImageUploadLoading(false);
      alert('Erro ao carregar a imagem.');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      alert('Por favor, informe o nome do exercício.');
      return;
    }

    if (!videoUrl.trim()) {
      alert('Por favor, informe o link do vídeo.');
      return;
    }

    const currentCat = categories.find((c) => c.id === categoryId);
    const categoryName = currentCat ? currentCat.name : 'Geral';

    onSaveExercise(
      {
        name: name.trim(),
        videoUrl: videoUrl.trim(),
        categoryId,
        categoryName,
        intensity,
        typeTag: typeTag.trim() || 'Pilates Solo',
        description: description.trim(),
        icon: currentCat ? currentCat.icon : 'person',
        imageUrl:
          imageUrl.trim() ||
          'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=1000&q=80',
        tags: [categoryName, intensity],
      },
      editingExercise?.id
    );
  };

  return (
    <main className="flex-grow pb-28 pt-6 px-4 md:px-8 max-w-3xl mx-auto w-full flex flex-col gap-6">
      {/* Segmented Control Tab (Exercício | Categoria | Cliente) */}
      <div className="flex bg-[#f2f4f4] rounded-xl p-1 border border-[#bec9c7]/60 w-full max-w-md mx-auto">
        <button
          type="button"
          className="flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold bg-[#00615f] text-white shadow-xs transition-all cursor-pointer"
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
          onClick={() => onSwitchTab('student')}
          className="flex-1 py-2.5 px-3 rounded-lg text-sm font-medium text-[#506261] hover:bg-[#ffffff]/60 transition-all cursor-pointer"
        >
          Cliente
        </button>
      </div>

      {/* Header text (Title and Description below tab) */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#191c1d] mb-1.5">
          {editingExercise ? 'Editar Exercício' : 'Novo Exercício'}
        </h1>
        <p className="text-sm md:text-base text-[#506261]">
          {editingExercise
            ? 'Atualize os detalhes, vídeo ou imagem deste movimento.'
            : 'Preencha as informações para cadastrar o movimento no catálogo.'}
        </p>
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Nome do Exercício */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="nome_exercicio"
            className="text-sm font-semibold text-[#191c1d] flex items-center gap-1"
          >
            Nome do Exercício <span className="text-[#ba1a1a]">*</span>
          </label>
          <input
            id="nome_exercicio"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Alongamento Cervical"
            className="bg-[#ffffff] border border-[#bec9c7] rounded-xl px-4 py-3 text-sm md:text-base text-[#191c1d] placeholder-[#6f7978] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-colors shadow-2xs"
          />
        </div>

        {/* Link do Vídeo */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="link_exercicio"
            className="text-sm font-semibold text-[#191c1d] flex items-center gap-1"
          >
            Link do Vídeo <span className="text-[#ba1a1a]">*</span>
          </label>
          <input
            id="link_exercicio"
            type="url"
            required
            value={videoUrl}
            onChange={(e) => setVideoUrl(e.target.value)}
            placeholder="https://youtube.com/watch?v=... ou link direto"
            className="bg-[#ffffff] border border-[#bec9c7] rounded-xl px-4 py-3 text-sm md:text-base text-[#191c1d] placeholder-[#6f7978] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-colors shadow-2xs"
          />
        </div>

        {/* Categoria and Tipo */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col space-y-1.5">
            <label
              htmlFor="categoria"
              className="text-sm font-semibold text-[#191c1d] flex items-center gap-1"
            >
              Categoria <span className="text-[#ba1a1a]">*</span>
            </label>
            <div className="relative">
              <select
                id="categoria"
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="appearance-none w-full bg-[#ffffff] border border-[#bec9c7] rounded-xl px-4 py-3 pr-10 text-sm md:text-base text-[#191c1d] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-colors shadow-2xs"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#506261]">
                ▼
              </div>
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <label
              htmlFor="tipo_modalidade"
              className="text-sm font-semibold text-[#191c1d]"
            >
              Modalidade / Equipamento
            </label>
            <input
              id="tipo_modalidade"
              type="text"
              value={typeTag}
              onChange={(e) => setTypeTag(e.target.value)}
              placeholder="Ex: Pilates Solo, Reformer, Cadillac"
              className="bg-[#ffffff] border border-[#bec9c7] rounded-xl px-4 py-3 text-sm md:text-base text-[#191c1d] placeholder-[#6f7978] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-colors shadow-2xs"
            />
          </div>
        </div>

        {/* Intensidade Segmented Radio */}
        <div className="flex flex-col space-y-2">
          <label className="text-sm font-semibold text-[#191c1d] flex items-center gap-1">
            Intensidade <span className="text-[#ba1a1a]">*</span>
          </label>
          <div className="flex bg-[#f2f4f4] rounded-xl p-1 border border-[#bec9c7]/60">
            <label className="flex-1 text-center cursor-pointer">
              <input
                type="radio"
                name="intensidade"
                value="iniciante"
                checked={intensity === 'iniciante'}
                onChange={() => setIntensity('iniciante')}
                className="sr-only peer"
              />
              <div className="py-2.5 px-3 rounded-lg text-sm font-medium text-[#506261] peer-checked:bg-[#00615f] peer-checked:text-white peer-checked:font-semibold peer-checked:shadow-xs transition-all">
                Iniciante
              </div>
            </label>
            <label className="flex-1 text-center cursor-pointer">
              <input
                type="radio"
                name="intensidade"
                value="intermediario"
                checked={intensity === 'intermediario'}
                onChange={() => setIntensity('intermediario')}
                className="sr-only peer"
              />
              <div className="py-2.5 px-3 rounded-lg text-sm font-medium text-[#506261] peer-checked:bg-[#00615f] peer-checked:text-white peer-checked:font-semibold peer-checked:shadow-xs transition-all">
                Intermediário
              </div>
            </label>
            <label className="flex-1 text-center cursor-pointer">
              <input
                type="radio"
                name="intensidade"
                value="avancado"
                checked={intensity === 'avancado'}
                onChange={() => setIntensity('avancado')}
                className="sr-only peer"
              />
              <div className="py-2.5 px-3 rounded-lg text-sm font-medium text-[#506261] peer-checked:bg-[#00615f] peer-checked:text-white peer-checked:font-semibold peer-checked:shadow-xs transition-all">
                Avançado
              </div>
            </label>
          </div>
        </div>

        {/* Descrição */}
        <div className="flex flex-col space-y-1.5">
          <label
            htmlFor="descricao_exercicio"
            className="text-sm font-semibold text-[#191c1d] flex items-center gap-1"
          >
            Descrição <span className="text-[#ba1a1a]">*</span>
          </label>
          <textarea
            id="descricao_exercicio"
            required
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Um exercício fundamental para o controle da respiração e fortalecimento do core..."
            className="bg-[#ffffff] border border-[#bec9c7] rounded-xl px-4 py-3 text-sm md:text-base text-[#191c1d] placeholder-[#6f7978] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none transition-colors shadow-2xs resize-y"
          />
        </div>

        {/* Imagem de Capa (Link Direto ou Upload) */}
        <div className="flex flex-col space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-semibold text-[#191c1d]">
              Imagem de Capa
            </label>
            {/* Mode selection tabs */}
            <div className="flex items-center gap-1 bg-[#f2f4f4] p-0.5 rounded-lg text-xs font-semibold text-[#506261]">
              <button
                type="button"
                onClick={() => setImageMode('url')}
                className={`px-3 py-1 rounded-md transition-all ${
                  imageMode === 'url' ? 'bg-[#00615f] text-white shadow-xs' : 'hover:text-[#191c1d]'
                }`}
              >
                Link Direto
              </button>
              <button
                type="button"
                onClick={() => setImageMode('upload')}
                className={`px-3 py-1 rounded-md transition-all ${
                  imageMode === 'upload' ? 'bg-[#00615f] text-white shadow-xs' : 'hover:text-[#191c1d]'
                }`}
              >
                Upload
              </button>
            </div>
          </div>

          {/* Mode 1: Direct Link / URL */}
          {imageMode === 'url' && (
            <div className="flex flex-col gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#6f7978]">
                  <LinkIcon className="w-4 h-4" />
                </div>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    setImageError(false);
                  }}
                  placeholder="Cole o link direto da imagem (https://...)"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#bec9c7] rounded-xl text-sm text-[#191c1d] placeholder-[#6f7978] focus:border-[#00615f] focus:ring-1 focus:ring-[#00615f] outline-none"
                />
              </div>
              <p className="text-xs text-[#506261]">
                Cole URLs diretas de imagens da internet.
              </p>
            </div>
          )}

          {/* Mode 2: File Upload */}
          {imageMode === 'upload' && (
            <div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept="image/png, image/jpeg, image/webp"
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#bec9c7] rounded-2xl p-8 flex flex-col items-center justify-center bg-white hover:bg-[#f8fafa] transition-colors cursor-pointer group"
              >
                <div className="w-12 h-12 rounded-full bg-[#d0e4e3]/40 flex items-center justify-center text-[#00615f] mb-2 group-hover:scale-110 transition-transform">
                  <Upload className="w-6 h-6" />
                </div>
                <p className="text-sm font-semibold text-[#191c1d]">
                  {imageUploadLoading
                    ? 'Processando imagem...'
                    : 'Clique para fazer upload ou arraste a imagem'}
                </p>
                <p className="text-xs text-[#6f7978] mt-1">PNG, JPG ou WebP até 5MB</p>
              </div>
            </div>
          )}

          {/* Active Image Preview Card */}
          {imageUrl && (
            <div className="mt-2 bg-[#f8fafa] border border-[#bec9c7]/60 rounded-xl p-3 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#eceeee] shrink-0 border border-[#bec9c7]/40">
                <img
                  src={imageUrl}
                  alt="Prévia da imagem"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-[#191c1d]">
                    {imageError ? '⚠️ Erro ao carregar URL' : '✅ Imagem Carregada'}
                  </span>
                </div>
                <p className="text-xs text-[#506261] truncate max-w-sm mt-0.5">
                  {imageUrl.startsWith('data:') ? 'Imagem carregada via upload' : imageUrl}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-1/3 py-3.5 px-6 border border-[#bec9c7] text-[#506261] hover:bg-[#eceeee] rounded-full text-sm font-semibold transition-colors order-2 sm:order-1"
          >
            Cancelar
          </button>
          <button
            type="submit"
            id="btn-salvar-exercicio"
            className="w-full sm:w-2/3 bg-[#00615f] hover:bg-[#00504e] active:scale-98 text-white rounded-full py-4 text-base font-semibold transition-all shadow-sm flex items-center justify-center gap-2 order-1 sm:order-2"
          >
            <Check className="w-5 h-5" />
            <span>{editingExercise ? 'Salvar Alterações' : 'Salvar Exercício'}</span>
          </button>
        </div>
      </form>
    </main>
  );
};
