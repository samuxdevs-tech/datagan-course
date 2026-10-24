'use client';

import React, { useState } from 'react';
import { X, BookOpen, Plus } from 'lucide-react';
import { Course, ProgressionMode } from '@/types';
import { generateCourseLicenseToken } from '@/lib/licenseUtils';

interface CreateCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateCourse: (course: Course) => Promise<void>;
}

export default function CreateCourseModal({
  isOpen,
  onClose,
  onCreateCourse,
}: CreateCourseModalProps) {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [category, setCategory] = useState('Formación Profesional');
  const [level, setLevel] = useState('Intermedio');
  const [progressionMode, setProgressionMode] = useState<ProgressionMode>('lesson_strict');
  const [visibility, setVisibility] = useState<'public' | 'draft'>('public');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    const cleanSlug =
      title
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || `curso-${Date.now()}`;

    const newCourse: Course = {
      slug: cleanSlug,
      title: title.trim(),
      subtitle: subtitle.trim() || 'Programa de formación técnica y profesional.',
      description:
        'Aprende los conceptos fundamentales y aplicaciones prácticas con ejercicios interactivos.',
      thumbnail: '',
      instructor: {
        name: 'Ivan Perez Tech (IPT)',
        role: 'Instructor Principal',
        avatar: '/favicon.png',
      },
      category,
      level,
      rating: 5.0,
      ratingsCount: 0,
      published: visibility === 'public',
      visibility,
      progressionMode,
      approxHours: '12 horas',
      licenseToken: generateCourseLicenseToken(cleanSlug),
      modules: [
        {
          id: `mod-${Date.now()}`,
          title: 'Módulo 1: Fundamentos y Conceptos Clave',
          description: 'Bases teóricas y preparación del entorno de trabajo.',
          order: 1,
          lessons: [
            {
              id: `les-${Date.now()}`,
              title: '1.1 Bienvenida y Objetivos del Curso',
              description: 'Introducción a los contenidos que desarrollaremos en el programa.',
              order: 1,
              videoType: 'youtube',
              videoUrl: '',
              duration: '10 min',
              checkpointQuiz: [],
              resources: [],
            },
          ],
        },
      ],
    };

    try {
      await onCreateCourse(newCourse);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#e5e5e5] overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera estilo Google / YouTube */}
        <div className="p-4 sm:p-5 border-b border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f2f2f2] border border-[#e5e5e5] flex items-center justify-center text-[#0f0f0f]">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0f0f0f]">
                Crear Nuevo Curso
              </h2>
              <p className="text-xs text-[#606060]">
                Publica un nuevo programa de formación en el catálogo
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#606060] hover:text-[#0f0f0f] hover:bg-[#ebebeb] transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#0f0f0f]">
              Título del Curso <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej: Arquitectura de Software e IA Aplicada"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5e5] text-xs font-medium text-[#0f0f0f] bg-white focus:outline-none focus:border-[#0f0f0f] transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#0f0f0f]">
              Subtítulo o descripción breve
            </label>
            <input
              type="text"
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              placeholder="Ej: Domina el desarrollo moderno con rigor de ingeniería"
              className="w-full px-3.5 py-2.5 rounded-xl border border-[#e5e5e5] text-xs text-[#0f0f0f] bg-white focus:outline-none focus:border-[#0f0f0f] transition-colors"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#0f0f0f]">Categoría</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#e5e5e5] text-xs text-[#0f0f0f] bg-white cursor-pointer focus:outline-none focus:border-[#0f0f0f]"
              >
                <option value="Formación Profesional">Formación Profesional</option>
                <option value="Ingeniería y Tecnología">Ingeniería y Tecnología</option>
                <option value="Inteligencia Artificial">Inteligencia Artificial</option>
                <option value="Diseño y Producto">Diseño y Producto</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#0f0f0f]">Nivel</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#e5e5e5] text-xs text-[#0f0f0f] bg-white cursor-pointer focus:outline-none focus:border-[#0f0f0f]"
              >
                <option value="Todos los niveles">Todos los niveles</option>
                <option value="Principiante">Principiante</option>
                <option value="Intermedio">Intermedio</option>
                <option value="Avanzado">Avanzado</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#0f0f0f]">Avance de Clases</label>
              <select
                value={progressionMode}
                onChange={(e) => setProgressionMode(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#e5e5e5] text-xs text-[#0f0f0f] bg-white cursor-pointer focus:outline-none focus:border-[#0f0f0f]"
              >
                <option value="lesson_strict">Estricto por Lección</option>
                <option value="module_strict">Estricto por Módulo</option>
                <option value="free">Libre (Sin bloqueos)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#0f0f0f]">Visibilidad Inicial</label>
              <select
                value={visibility}
                onChange={(e) => setVisibility(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl border border-[#e5e5e5] text-xs text-[#0f0f0f] bg-white cursor-pointer focus:outline-none focus:border-[#0f0f0f]"
              >
                <option value="public">Público (En catálogo)</option>
                <option value="draft">Borrador (Oculto)</option>
              </select>
            </div>
          </div>

          {/* Botones de acción */}
          <div className="pt-4 border-t border-[#e5e5e5] flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 px-4 rounded-full border border-[#e5e5e5] bg-white hover:bg-[#f2f2f2] text-xs font-semibold text-[#0f0f0f] transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !title.trim()}
              className="py-2.5 px-5 rounded-full bg-[#0f0f0f] hover:bg-[#272727] text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Creando...' : 'Crear Curso'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
