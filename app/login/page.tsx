'use client';

import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Logo } from '@/components/logo';

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
    <main className="bg-canvas flex min-h-screen">
      <aside className="hidden min-h-screen w-[42%] flex-col justify-between bg-black px-14 py-12 text-white lg:flex">
        <div className="h-px w-10 bg-[#9f1b1b]" />
        <div>
          <Logo className="size-24" />
          <p className="mt-10 text-4xl font-medium tracking-tight">Easy-Log</p>
          <p className="mt-4 max-w-xs text-base leading-relaxed text-neutral-400">
            Projetos, madeira e prazos da oficina.
          </p>
        </div>
        <p className="text-sm text-neutral-500">Easy Log</p>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center px-6 py-16">
          <div className="w-full max-w-sm">
            <div className="text-ink mb-8 flex items-center gap-3 lg:hidden">
              <Logo className="size-10" />
              <span className="text-lg font-medium tracking-tight">Easy-Log</span>
            </div>

            <h1 className="text-ink text-2xl font-medium tracking-tight">
              Acesse sua conta
            </h1>

            {error ? (
              <p className="border-danger bg-danger-soft text-danger mt-6 border px-4 py-3 text-sm">
                {error}
              </p>
            ) : null}

            <form onSubmit={handleLogin} className="mt-8 space-y-5">
              <div>
                <label htmlFor="email" className="text-ink mb-2 block text-sm">
                  E-mail
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-line bg-soft text-ink focus:border-accent focus:bg-surface w-full rounded-lg border px-4 py-3 outline-none"
                  placeholder="admin@easylog.com"
                  autoComplete="email"
                  required
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label htmlFor="senha" className="text-ink text-sm">
                    Senha
                  </label>
                  <a href="#" className="text-accent text-sm">
                    Esqueci a senha?
                  </a>
                </div>
                <div className="relative">
                  <input
                    id="senha"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-line bg-soft text-ink focus:border-accent focus:bg-surface w-full rounded-lg border px-4 py-3 pr-12 outline-none"
                    placeholder="••••••••"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    className="text-faint hover:text-ink absolute top-1/2 right-4 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOff className="size-5" />
                    ) : (
                      <Eye className="size-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="bg-accent-fill text-on-accent w-full rounded-lg px-4 py-3 text-sm font-medium hover:opacity-90 disabled:opacity-60"
              >
                {enviando ? 'Aguarde...' : 'Entrar'}
              </button>
            </form>

            <p className="text-muted mt-6 text-sm">
              Não possui acesso? Peça uma conta ao administrador.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
