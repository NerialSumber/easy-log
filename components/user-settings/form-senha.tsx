'use client';

import { useState, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Campo, classeCampo } from '@/components/campo';
import { mensagemDeErro, requisitar } from '@/lib/api';
import { Erro, Rodape } from './partes';

export function FormSenha({ onVoltar }: { onVoltar: () => void }) {
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const tipo = mostrar ? 'text' : 'password';

  async function salvar(event: FormEvent) {
    event.preventDefault();
    if (novaSenha.length < 6) {
      setErro('A nova senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmacao) {
      setErro('A confirmação não confere com a nova senha.');
      return;
    }

    setErro('');
    setSalvando(true);
    try {
      await requisitar('/api/auth/me', 'PUT', { senhaAtual, novaSenha });
      onVoltar();
    } catch (falha) {
      setErro(mensagemDeErro(falha));
      setSalvando(false);
    }
  }

  return (
    <form onSubmit={salvar} className="space-y-5">
      <Erro texto={erro} />
      <Campo rotulo="Senha atual">
        <input
          type={tipo}
          value={senhaAtual}
          onChange={(e) => setSenhaAtual(e.target.value)}
          placeholder="Digite a senha atual"
          required
          className={classeCampo}
        />
      </Campo>
      <div className="flex flex-col gap-2">
        <label htmlFor="nova-senha" className="text-ink text-sm font-bold">
          Nova senha
        </label>
        <div className="relative">
          <input
            id="nova-senha"
            type={tipo}
            value={novaSenha}
            onChange={(e) => setNovaSenha(e.target.value)}
            placeholder="Digite a nova senha"
            required
            className={`${classeCampo} pr-11`}
          />
          <button
            type="button"
            onClick={() => setMostrar(!mostrar)}
            aria-label={mostrar ? 'Ocultar senha' : 'Mostrar senha'}
            className="text-muted hover:text-accent absolute top-1/2 right-3 -translate-y-1/2"
          >
            {mostrar ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <Campo rotulo="Confirmar nova senha">
        <input
          type={tipo}
          value={confirmacao}
          onChange={(e) => setConfirmacao(e.target.value)}
          placeholder="Repita a nova senha"
          required
          className={classeCampo}
        />
      </Campo>
      <Rodape textoSalvar="Salvar senha" salvando={salvando} onCancelar={onVoltar} />
    </form>
  );
}
