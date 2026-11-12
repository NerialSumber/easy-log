'use client';

import { useState } from 'react';
import { classeBotaoSecundario } from '@/components/campo';

const TEMA_NOTURNO = 'tema_noturno';
const FONTE_MAIOR = 'fonte_maior';

function lerPreferencia(chave: string) {
  return localStorage.getItem(chave) === 'true';
}

function aplicar(temaNoturno: boolean, fonteMaior: boolean) {
  document.body.classList.toggle('dark-theme', temaNoturno);
  document.documentElement.classList.toggle('large-font', fonteMaior);
}

export function aplicarPreferenciasSalvas() {
  aplicar(lerPreferencia(TEMA_NOTURNO), lerPreferencia(FONTE_MAIOR));
}

function Interruptor({
  titulo,
  descricao,
  ligado,
  onAlternar,
}: {
  titulo: string;
  descricao: string;
  ligado: boolean;
  onAlternar: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={ligado}
      onClick={onAlternar}
      className="border-line hover:bg-soft flex w-full items-center justify-between gap-4 rounded-lg border p-4 text-left transition"
    >
      <span className="min-w-0">
        <span className="text-ink block text-sm font-semibold">{titulo}</span>
        <span className="text-muted mt-1 block text-xs">{descricao}</span>
      </span>
      <span
        className={`relative h-6 w-11 shrink-0 rounded-full transition ${ligado ? 'bg-accent-fill' : 'bg-track'}`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-white transition ${ligado ? 'left-6' : 'left-1'}`}
        />
      </span>
    </button>
  );
}

export function Acessibilidade({ onConcluir }: { onConcluir: () => void }) {
  const [temaNoturno, setTemaNoturno] = useState(() => lerPreferencia(TEMA_NOTURNO));
  const [fonteMaior, setFonteMaior] = useState(() => lerPreferencia(FONTE_MAIOR));

  function salvar(tema: boolean, fonte: boolean) {
    setTemaNoturno(tema);
    setFonteMaior(fonte);
    localStorage.setItem(TEMA_NOTURNO, String(tema));
    localStorage.setItem(FONTE_MAIOR, String(fonte));
    aplicar(tema, fonte);
  }

  return (
    <div className="space-y-4">
      <Interruptor
        titulo="Tema noturno"
        descricao="Usar cores mais escuras no site"
        ligado={temaNoturno}
        onAlternar={() => salvar(!temaNoturno, fonteMaior)}
      />
      <Interruptor
        titulo="Aumentar tamanho da fonte"
        descricao="Deixar todas as letras do site maiores"
        ligado={fonteMaior}
        onAlternar={() => salvar(temaNoturno, !fonteMaior)}
      />
      <div className="border-line flex justify-end border-t pt-5">
        <button type="button" onClick={onConcluir} className={classeBotaoSecundario}>
          Concluir
        </button>
      </div>
    </div>
  );
}
