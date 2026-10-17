"use client";

import type { useLiveSession } from "@/hooks/useLiveSession";

type Props = { live: ReturnType<typeof useLiveSession>; isMaster: boolean };

/** Faixa da sessão ao vivo: abrir, entrar, ver quem está online e encerrar (US-40). */
export const LiveBar = ({ live, isMaster }: Props) => {
  const { session, joined, online, connected, error } = live;

  return (
    <section className="card stack" aria-label="Sessão ao vivo" style={{ gap: 8 }}>
      {!session && (
        <div className="row spread">
          <p className="muted">Nenhuma sessão ao vivo aberta.</p>
          {isMaster && <button type="button" onClick={live.start}>Iniciar sessão ao vivo</button>}
        </div>
      )}

      {session && !joined && (
        <div className="row spread">
          <p role="status"><span className="live-dot" /> Sessão ao vivo em andamento</p>
          <button type="button" onClick={live.join}>Entrar</button>
        </div>
      )}

      {session && joined && (
        <>
          <div className="row spread">
            <p role="status"><span className="live-dot" /> {connected ? "Você está na sessão ao vivo" : "Reconectando…"}</p>
            <span className="row">
              <button type="button" className="secondary" onClick={live.leave}>Sair</button>
              {isMaster && <button type="button" onClick={live.end}>Encerrar sessão</button>}
            </span>
          </div>
          <p className="muted" aria-label="Quem está online">
            Online agora: {online.length === 0 ? "só você" : online.map((member) => member.name).join(", ")}
          </p>
        </>
      )}

      {error && !joined && <p className="error" role="alert">{error}</p>}
    </section>
  );
};
