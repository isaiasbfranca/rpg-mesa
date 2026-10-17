"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getLiveIdentity, endLiveSession, getLiveSession, listLiveRolls, openLiveChannel, rollLive, startLiveSession, type LiveRollRequest } from "@/data/live";
import { isAuthConfigured } from "@/auth/supabaseClient";
import { repository } from "@/data";
import { DiceParseError } from "@/domain/dice";
import { mergeLiveRoll, uniqueOnline, type LiveRoll, type LiveSession, type OnlineMember } from "@/domain/live";
import type { Id } from "@/domain/types";

const today = () => new Date().toISOString().slice(0, 10);

type Channel = ReturnType<typeof openLiveChannel>;

/**
 * Estado da sessão ao vivo de uma campanha. `available` fica falso sem conta (no navegador não há ao vivo).
 * A mestra entra sozinha ao abrir a sessão; jogadores entram com o botão "Entrar".
 */
export const useLiveSession = (campaignId: Id) => {
  const [available, setAvailable] = useState(false);
  const [session, setSession] = useState<LiveSession>();
  const [joined, setJoined] = useState(false);
  const [rolls, setRolls] = useState<LiveRoll[]>([]);
  const [online, setOnline] = useState<OnlineMember[]>([]);
  const [connected, setConnected] = useState(true);
  const [error, setError] = useState<string>();
  const identity = useRef<OnlineMember | undefined>(undefined);
  const channel = useRef<Channel | undefined>(undefined);
  const sessionRef = useRef<LiveSession | undefined>(undefined);

  const loadSession = useCallback(async () => {
    const current = await getLiveSession(campaignId);
    sessionRef.current = current;
    setSession(current);
    if (!current) {
      setJoined(false);
      setRolls([]);
      setOnline([]);
      return;
    }
    setRolls(await listLiveRolls(current.id));
  }, [campaignId]);

  useEffect(() => {
    if (!isAuthConfigured) return;
    let cancelled = false;
    getLiveIdentity()
      .then(async (me) => {
        if (cancelled || !me) return;
        identity.current = me;
        setAvailable(true);
        await loadSession();
        if (cancelled) return;
        channel.current = openLiveChannel(campaignId, {
          onSessionChange: () => void loadSession(),
          onRoll: (roll) => setRolls((current) => (roll && sessionRef.current ? mergeLiveRoll(current, roll) : current)),
          onOnline: (members) => setOnline(uniqueOnline(members)),
          onConnection: (isConnected) => {
            setConnected(isConnected);
            if (isConnected) void loadSession();
          },
        });
      })
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Falha ao abrir a sessão ao vivo."));
    return () => {
      cancelled = true;
      void channel.current?.close();
      channel.current = undefined;
    };
  }, [campaignId, loadSession]);

  useEffect(() => {
    channel.current?.setPresence(joined ? identity.current : undefined);
  }, [joined]);

  const guarded = useCallback(async (action: () => Promise<void>) => {
    try {
      await action();
      setError(undefined);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Algo deu errado.");
    }
  }, []);

  const start = useCallback(
    () => guarded(async () => {
      await startLiveSession(campaignId);
      await loadSession();
      setJoined(true);
    }),
    [campaignId, guarded, loadSession],
  );

  const end = useCallback(
    () => guarded(async () => {
      if (!session) return;
      await endLiveSession(session.id);
      await repository.createSessionLog({
        campaignId,
        date: today(),
        title: `Sessão ao vivo de ${new Date().toLocaleDateString("pt-BR")}`,
        summary: `${rolls.length} rolagens na sessão ao vivo.`,
      });
      await loadSession();
    }),
    [campaignId, guarded, loadSession, rolls.length, session],
  );

  const roll = useCallback(
    (request: LiveRollRequest) => {
      const current = sessionRef.current;
      if (!current) return;
      void (async () => {
        try {
          const result = await rollLive(current.id, request);
          setRolls((existing) => mergeLiveRoll(existing, result));
          setError(undefined);
        } catch (cause) {
          if (cause instanceof DiceParseError) setError(cause.message);
          else setError(connected ? "A rolagem não foi registrada. Tente de novo." : "Sem conexão: a rolagem não foi registrada.");
        }
      })();
    },
    [connected],
  );

  return { available, session, joined, rolls, online, connected, error, join: () => setJoined(true), leave: () => setJoined(false), start, end, roll };
};
