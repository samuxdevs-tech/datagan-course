'use client';

import React, { useState, useRef } from 'react';
import { X, Upload, FileText, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { Course } from '@/types';
import { normalizeCourse } from '@/lib/courseUtils';

interface ImportCourseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCourse: (course: Course) => Promise<void>;
}

export default function ImportCourseModal({
  isOpen,
  onClose,
  onImportCourse,
}: ImportCourseModalProps) {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleProcessCourseJson = async (parsed: any) => {
    try {
      const courseCandidate = parsed.course || (parsed.slug && parsed.title ? parsed : null);
      if (!courseCandidate || !courseCandidate.title) {
        throw new Error('El archivo JSON no contiene una estructura válida de curso (falta "title" o "modules").');
      }

      const normalized = normalizeCourse(courseCandidate);
      await onImportCourse(normalized);
      setSuccessMsg(`¡Curso "${normalized.title}" importado con éxito!`);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error procesando el archivo de curso.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target?.result as string;
        let parsed: any;
        try {
          parsed = JSON.parse(text);
        } catch {
          throw new Error('El archivo seleccionado no tiene un formato JSON válido.');
        }
        await handleProcessCourseJson(parsed);
      } catch (err: any) {
        setErrorMsg(err.message || 'Error leyendo el archivo JSON.');
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Error al leer el archivo desde el dispositivo.');
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleImportStarter = async () => {
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const res = await fetch('/datagan_course_complete.json');
      if (!res.ok) {
        throw new Error('No se pudo encontrar la plantilla del curso base.');
      }
      const data = await res.json();
      await handleProcessCourseJson(data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error cargando la plantilla predeterminada.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
      <div
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e5e5e5] overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabecera */}
        <div className="p-4 sm:p-5 border-b border-[#e5e5e5] bg-[#fafafa] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-[#f2f2f2] border border-[#e5e5e5] flex items-center justify-center text-[#0f0f0f]">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-[#0f0f0f]">
                Importar Curso
              </h2>
              <p className="text-xs text-[#606060]">
                Carga un archivo o plantilla de contenido
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

        {/* Contenido */}
        <div className="p-5 space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".json,application/json"
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Opción 1: Archivo local */}
          <button
            type="button"
            disabled={loading}
            onClick={() => fileInputRef.current?.click()}
            className="w-full p-4 rounded-xl border border-dashed border-[#cccccc] hover:border-[#0f0f0f] bg-[#fafafa] hover:bg-white text-left transition-all group cursor-pointer disabled:opacity-50"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white border border-[#e5e5e5] flex items-center justify-center text-[#0f0f0f] group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[#0f0f0f]">
                  Subir archivo JSON desde tu equipo
                </div>
                <div className="text-[11px] text-[#606060] mt-0.5">
                  Selecciona una exportación de curso (.json)
                </div>
              </div>
            </div>
          </button>

          {/* Opción 2: Plantilla oficial */}
          <div className="pt-2">
            <div className="text-[11px] font-semibold text-[#606060] mb-2 uppercase tracking-wide">
              O usa la plantilla oficial
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={handleImportStarter}
              className="w-full p-3 rounded-xl border border-[#e5e5e5] bg-white hover:bg-[#fafafa] flex items-center justify-between text-left transition-colors cursor-pointer disabled:opacity-50"
            >
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <div>
                  <div className="text-xs font-semibold text-[#0f0f0f]">
                    Cargar Programa DataGan 360
                  </div>
                  <div className="text-[11px] text-[#606060]">
                    Curso completo estructurado con videos y ejercicios
                  </div>
                </div>
              </div>
              <span className="text-xs font-semibold text-[#065fd4]">Cargar</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#e5e5e5] bg-[#fafafa] flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="py-2 px-4 rounded-full border border-[#e5e5e5] bg-white hover:bg-[#f2f2f2] text-xs font-semibold text-[#0f0f0f] transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
