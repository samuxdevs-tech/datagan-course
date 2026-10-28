"use client";

import React, { useState, useEffect } from 'react';
import { auth } from '@/lib/firebase';
import {
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  sendPasswordResetEmail
} from 'firebase/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const [isResetMode, setIsResetMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Escuchar el resultado de redirección (crucial para móviles y navegadores que bloquean popups)
    getRedirectResult(auth)
      .then((result) => {
        if (result && result.user) {
          router.push('/');
        }
      })
      .catch((err: any) => {
        console.error("Error en getRedirectResult:", err);
        handleAuthError(err);
      });
  }, [router]);

  const handleAuthError = (err: any) => {
    if (!err) return;
    const code = err.code || '';
    if (code === 'auth/unauthorized-domain') {
      setError('Dominio no autorizado: Debes agregar "datagan-edu.web.app" en Firebase Console > Authentication > Settings > Authorized domains.');
    } else if (code === 'auth/operation-not-allowed') {
      setError('El proveedor Google no está habilitado en Firebase Authentication de este proyecto.');
    } else if (code === 'auth/popup-blocked') {
      setError('El navegador bloqueó la ventana emergente. Reintentando por redirección...');
    } else if (code === 'auth/popup-closed-by-user') {
      setError('Se cerró la ventana de inicio de sesión de Google antes de completar.');
    } else {
      setError(err.message || 'No se pudo iniciar sesión con Google.');
    }
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');
    setLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('El correo o la contraseña son incorrectos.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Demasiados intentos fallidos. Inténtalo más tarde.');
      } else {
        setError('Error al iniciar sesión. Verifica tus credenciales.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setResetMessage('');

    if (!email) {
      setError('Ingresa tu correo para enviarte el enlace de recuperación.');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetMessage('Te hemos enviado un correo para restablecer tu contraseña. Revisa tu bandeja de entrada o carpeta de spam.');
    } catch (err: any) {
      setError('No pudimos enviar el correo de recuperación. Verifica que la dirección sea correcta.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setResetMessage('');
    setLoading(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      // Intentar primero con popup
      await signInWithPopup(auth, provider);
      router.push('/');
    } catch (err: any) {
      console.warn("Fallo signInWithPopup, evaluando fallback:", err);
      // Si el navegador bloqueó la ventana emergente (móviles, WebView, Chrome Android), fallback a redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/cancelled-popup-request') {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirErr: any) {
          handleAuthError(redirErr);
        }
      } else {
        handleAuthError(err);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f6f7f9] p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-[#d1d2e0] p-8">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-3">
            <Image src="/logo.webp" alt="TecnoGan" width={160} height={64} priority className="h-16 w-auto mx-auto object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-[#2a2b3f] mb-1">
            {isResetMode ? 'Restablecer Contraseña' : 'Datagan Academy'}
          </h1>
          <p className="text-[#595c73] text-sm">
            {isResetMode ? 'Te enviaremos un correo con las instrucciones' : 'Inicia sesión para continuar con tus cursos'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#fde8e8] border border-[#f8b4b4] text-[#9b1c1c] text-sm rounded-xl text-center leading-relaxed font-medium">
            {error}
          </div>
        )}

        {resetMessage && (
          <div className="mb-6 p-4 bg-[#def7ec] border border-[#bcf0da] text-[#03543f] text-sm rounded-xl text-center leading-relaxed">
            {resetMessage}
          </div>
        )}

        {isResetMode ? (
          <form onSubmit={handlePasswordReset} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-[#2a2b3f] mb-1.5">Correo Electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@ejemplo.com"
                className="w-full px-4 py-2.5 bg-white border border-[#d1d2e0] rounded-xl text-[#2a2b3f] placeholder-[#8c8fa3] text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#2a2b3f] hover:bg-[#1f202e] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 mt-2 shadow-sm"
            >
              {loading ? 'Enviando correo...' : 'Enviar Enlace de Recuperación'}
            </button>

            <div className="text-center mt-4">
              <button
                type="button"
                onClick={() => {
                  setIsResetMode(false);
                  setError('');
                  setResetMessage('');
                }}
                className="text-xs text-[#7c3aed] hover:underline font-medium"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        ) : (
          <>
            <button
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-[#d1d2e0] hover:bg-[#f8f9fa] text-[#2a2b3f] text-sm font-semibold rounded-xl transition-colors shadow-sm mb-6 disabled:opacity-50"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              Continuar con Google
            </button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#e2e4ea]"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-[#8c8fa3]">o con tu correo</span>
              </div>
            </div>

            <form onSubmit={handleEmailAuth} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-[#2a2b3f] mb-1.5">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@ejemplo.com"
                  className="w-full px-4 py-2.5 bg-white border border-[#d1d2e0] rounded-xl text-[#2a2b3f] placeholder-[#8c8fa3] text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-[#2a2b3f]">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsResetMode(true);
                      setError('');
                      setResetMessage('');
                    }}
                    className="text-xs text-[#7c3aed] hover:underline font-medium"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="w-full px-4 py-2.5 bg-white border border-[#d1d2e0] rounded-xl text-[#2a2b3f] placeholder-[#8c8fa3] text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-[#2a2b3f] hover:bg-[#1f202e] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 mt-2 shadow-sm"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>
          </>
        )}

        <div className="text-center mt-6 pt-6 border-t border-[#e2e4ea]">
          <p className="text-xs text-[#595c73]">
            ¿No tienes una cuenta?{' '}
            <Link href="/register" className="text-[#7c3aed] font-semibold hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
