'use client';

import { useState, type FormEvent } from 'react';
import Image from 'next/image';
import { Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

type UsuarioSessao = {
  id: string;
  nome: string;
  email: string;
  role: 'ADMIN' | 'PROJETISTA';
  roleLabel: string;
};

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setEnviando(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = (await res.json()) as UsuarioSessao | { error?: string };
      if (!res.ok) {
        setError(('error' in data && data.error) || 'Não foi possível entrar.');
        return;
      }

      localStorage.setItem('current_user', JSON.stringify(data));
      window.dispatchEvent(new Event('easylog-user'));
      router.push('/');
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full flex-row items-center justify-center overflow-hidden bg-slate-50">
      <div className="relative hidden min-h-screen w-1/2 flex-col items-center justify-center border-r-8 border-orange-600 bg-slate-950 p-12 text-center lg:flex">
        <div className="absolute inset-0 z-0">
          <Image
            src="/fundo-marcenaria.jpg"
            alt="Background Marcenaria"
            fill
            className="object-cover opacity-30"
            priority
          />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-6">
            <Image
              src="/logo.jpg"
              alt="Logo Easy-Log"
              width={180}
              height={180}
              className="rounded-xl"
              priority
            />
          </div>

          <h1 className="mb-5 text-6xl font-extrabold tracking-tight text-white drop-shadow-lg">
            Easy-Log
          </h1>

          <p className="max-w-md text-xl leading-relaxed font-medium text-slate-200 drop-shadow-md">
            Simplifique sua oficina com Easy-log
          </p>
        </div>
      </div>

      <div className="flex w-full items-center justify-center p-6 md:p-12 lg:w-1/2">
        <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-10 shadow-2xl shadow-slate-200">
          <div className="mb-8 text-center">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900">
              Acesse sua conta
            </h2>
            <p className="mt-2 font-medium text-slate-500">Bem-vindo de volta!</p>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-100 p-3 text-center text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-800">E-mail</label>
              <div className="relative">
                <Mail className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pr-4 pl-12 text-slate-950 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-orange-500"
                  placeholder="admin@easylog.com"
                  required
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex justify-between">
                <label className="block text-sm font-semibold text-slate-800">Senha</label>
                <a href="#" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
                  Esqueci a senha?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-4 pr-12 pl-12 text-slate-950 transition-all outline-none focus:bg-white focus:ring-2 focus:ring-orange-500"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute top-1/2 right-4 -translate-y-1/2"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 transition-colors hover:text-slate-600" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 transition-colors hover:text-slate-600" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-4 pt-4">
              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-2xl bg-orange-600 px-4 py-4 font-bold text-white shadow-lg shadow-orange-100 transition-all hover:bg-orange-700 active:scale-[0.98] disabled:opacity-60"
              >
                {enviando ? 'Aguarde...' : 'Entrar no Sistema'}
              </button>
              <p className="text-center text-sm font-medium text-slate-600">
                Não possui acesso? Peça uma conta ao administrador.
              </p>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
