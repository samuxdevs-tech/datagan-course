"use client";

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/lib/firebase';
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { ref, set } from 'firebase/database';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

export default function RegisterPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    getRedirectResult(auth)
      .then(async (result) => {
        if (result && result.user) {
          const user = result.user;
          const displayName = user.displayName || '';
          const nameParts = displayName.trim().split(' ');
          const parsedFirst = nameParts[0] || (user.email ? user.email.split('@')[0] : 'Usuario');
          const parsedLast = nameParts.slice(1).join(' ') || '';

          await set(ref(db, `users/${user.uid}/profile`), {
            firstName: parsedFirst,
            lastName: parsedLast,
            displayName: displayName || parsedFirst,
            photoURL: user.photoURL || '',
            email: user.email,
            updatedAt: Date.now()
          });

          await set(ref(db, `users/${user.uid}/info`), {
            username: displayName || parsedFirst,
            email: user.email,
            createdAt: Date.now()
          });

          router.push('/');
        }
      })
      .catch((err: any) => {
        console.error("Error redirect register:", err);
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
      setError('Se cerró la ventana de registro de Google antes de completar.');
    } else {
      setError(err.message || 'No se pudo registrar con Google.');
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();

      await updateProfile(user, {
        displayName: fullName
      });

      await set(ref(db, `users/${user.uid}/profile`), {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: fullName,
        email: user.email,
        createdAt: Date.now()
      });

      await set(ref(db, `users/${user.uid}/info`), {
        username: fullName,
        email: user.email,
        createdAt: Date.now()
      });

      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError('Este correo electrónico ya está registrado. Inicia sesión.');
      } else if (err.code === 'auth/weak-password') {
        setError('La contraseña debe tener al menos 6 caracteres.');
      } else {
        setError(err.message || 'Ocurrió un error al registrar la cuenta.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError('');
    setLoading(true);

    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const displayName = user.displayName || '';
      const nameParts = displayName.trim().split(' ');
      const parsedFirst = nameParts[0] || (user.email ? user.email.split('@')[0] : 'Usuario');
      const parsedLast = nameParts.slice(1).join(' ') || '';

      await set(ref(db, `users/${user.uid}/profile`), {
        firstName: parsedFirst,
        lastName: parsedLast,
        displayName: displayName || parsedFirst,
        photoURL: user.photoURL || '',
        email: user.email,
        updatedAt: Date.now()
      });

      await set(ref(db, `users/${user.uid}/info`), {
        username: displayName || parsedFirst,
        email: user.email,
        createdAt: Date.now()
      });

      router.push('/');
    } catch (err: any) {
      console.warn("Fallo signInWithPopup en register, evaluando fallback:", err);
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
          <h1 className="text-2xl font-bold text-[#2a2b3f] mb-1">Crear Cuenta</h1>
          <p className="text-[#595c73] text-sm">Únete a Datagan Academy</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-[#fde8e8] border border-[#f8b4b4] text-[#9b1c1c] text-sm rounded-xl text-center leading-relaxed font-medium">
            {error}
          </div>
        )}

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
          Registrarse con Google
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#e2e4ea]"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-3 bg-white text-[#8c8fa3]">o con tu correo</span>
          </div>
        </div>

        <form onSubmit={handleEmailRegister} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-[#2a2b3f] mb-1.5">Nombre</label>
              <input
                type="text"
                required
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Nombre"
                className="w-full px-4 py-2.5 bg-white border border-[#d1d2e0] rounded-xl text-[#2a2b3f] placeholder-[#8c8fa3] text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#2a2b3f] mb-1.5">Apellido</label>
              <input
                type="text"
                required
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Apellido"
                className="w-full px-4 py-2.5 bg-white border border-[#d1d2e0] rounded-xl text-[#2a2b3f] placeholder-[#8c8fa3] text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
              />
            </div>
          </div>

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
            <label className="block text-sm font-semibold text-[#2a2b3f] mb-1.5">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full px-4 py-2.5 bg-white border border-[#d1d2e0] rounded-xl text-[#2a2b3f] placeholder-[#8c8fa3] text-sm focus:outline-none focus:border-[#7c3aed] focus:ring-1 focus:ring-[#7c3aed] transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#2a2b3f] hover:bg-[#1f202e] text-white text-sm font-semibold rounded-xl transition-colors disabled:opacity-50 mt-2 shadow-sm"
          >
            {loading ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-[#e2e4ea]">
          <p className="text-xs text-[#595c73]">
            ¿Ya tienes una cuenta?{' '}
            <Link href="/login" className="text-[#7c3aed] font-semibold hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
