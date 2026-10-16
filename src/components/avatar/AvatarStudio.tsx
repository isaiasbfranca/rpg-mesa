"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { useCampaign } from "@/components/campaign/CampaignContext";
import { repository } from "@/data";
import { portraitOf, type Avatar } from "@/domain/avatar";
import {
  applyChoice,
  BASE_PORTRAIT,
  fieldLabel,
  LAYER_GROUPS,
  optionsOf,
  randomizeGroup,
  randomPortrait,
  type PortraitConfig,
  type PortraitKey,
} from "@/domain/portrait";
import { canEditCharacter } from "@/domain/permissions";
import type { Character } from "@/domain/types";
import { useActor } from "@/hooks/useActor";
import { useBeforeUnload } from "@/hooks/useBeforeUnload";
import { CharacterAvatar } from "./CharacterAvatar";
import { ImageCropper } from "./ImageCropper";
import { PortraitBuilder } from "./PortraitBuilder";
import { PresetGallery } from "./PresetGallery";

type Tab = "montar" | "galeria" | "enviar";
const TABS: { id: Tab; label: string }[] = [
  { id: "montar", label: "Montar" },
  { id: "galeria", label: "Galeria" },
  { id: "enviar", label: "Enviar imagem" },
];
const UNDO_LIMIT = 40;

const sameAvatar = (a?: Avatar, b?: Avatar) => JSON.stringify(a) === JSON.stringify(b);

/** Os três caminhos do E12 levam ao mesmo rascunho; só "Salvar aparência" grava na ficha. */
export const AvatarStudio = ({ characterId }: { characterId: string }) => {
  const router = useRouter();
  const { campaign } = useCampaign();
  const actor = useActor();
  const [character, setCharacter] = useState<Character | null>();
  const [tab, setTab] = useState<Tab>("galeria");
  const [draft, setDraft] = useState<Avatar>();
  const [groupId, setGroupId] = useState(LAYER_GROUPS[0]!.id);
  const [undoStack, setUndoStack] = useState<PortraitConfig[]>([]);
  const [redoStack, setRedoStack] = useState<PortraitConfig[]>([]);
  const [staleNotice, setStaleNotice] = useState<string>();
  /** Arrastar no seletor de cor gera muitas mudanças seguidas; viram um passo só de desfazer. */
  const pickerKey = useRef<PortraitKey>(undefined);

  useEffect(() => {
    repository.getCharacter(characterId).then((found) => {
      setCharacter(found ?? null);
      const avatar = found?.avatar;
      if (avatar?.kind === "camadas") {
        const { cfg, stale, migrated } = portraitOf(avatar);
        if (migrated) setStaleNotice("Este retrato foi feito no criador antigo e foi convertido para o novo. Confira e salve.");
        else if (stale.length > 0)
          setStaleNotice(`Algumas escolhas não existem mais e voltaram ao padrão: ${stale.map(fieldLabel).join(", ")}.`);
        setDraft({ kind: "camadas", cfg, ...(avatar.presetId && !migrated ? { presetId: avatar.presetId } : {}) });
      } else setDraft(avatar);
      if (avatar) setTab(avatar.kind === "imagem" ? "enviar" : "montar");
    });
  }, [characterId]);

  const dirty = character ? !sameAvatar(draft, character.avatar) : false;

  // Fechar ou recarregar a aba com mudança não salva pede confirmação do navegador (CT-AVA-08).
  useBeforeUnload(dirty);

  if (character === undefined) return <p className="muted">Carregando…</p>;
  const sheetUrl = `/campanhas/${campaign.id}/personagens/${characterId}`;
  if (character === null || !canEditCharacter(actor, campaign, character))
    return <p>Você não pode editar a aparência deste personagem. <Link href={sheetUrl}>Voltar à ficha</Link></p>;

  const currentCfg = draft?.kind === "camadas" ? draft.cfg : BASE_PORTRAIT;

  const changePortrait = (next: PortraitConfig, presetId?: string) => {
    setUndoStack((stack) => [...stack, currentCfg].slice(-UNDO_LIMIT));
    setRedoStack([]);
    setDraft({ kind: "camadas", cfg: next, ...(presetId ? { presetId } : {}) });
  };

  const choose = (key: PortraitKey, value: string, fromPicker = false) => {
    const next = applyChoice(currentCfg, key, value);
    if (draft?.kind === "camadas" && JSON.stringify(next) === JSON.stringify(currentCfg)) return;
    const continuing = fromPicker && pickerKey.current === key;
    pickerKey.current = fromPicker ? key : undefined;
    if (draft?.kind === "camadas" && continuing) {
      setDraft({ kind: "camadas", cfg: next });
      return;
    }
    changePortrait(next);
  };

  const groupLabel = LAYER_GROUPS.find((g) => g.id === groupId)?.label ?? "";

  const undo = () => {
    const previous = undoStack.at(-1);
    if (!previous) return;
    pickerKey.current = undefined;
    setUndoStack(undoStack.slice(0, -1));
    setRedoStack([...redoStack, currentCfg]);
    setDraft({ kind: "camadas", cfg: previous });
  };

  const redo = () => {
    const next = redoStack.at(-1);
    if (!next) return;
    pickerKey.current = undefined;
    setRedoStack(redoStack.slice(0, -1));
    setUndoStack([...undoStack, currentCfg]);
    setDraft({ kind: "camadas", cfg: next });
  };

  const leave = (event: MouseEvent) => {
    if (dirty && !window.confirm("Sair sem salvar a aparência?")) event.preventDefault();
  };

  const save = async () => {
    if (!draft) return;
    const replacing = character.avatar && character.avatar.kind !== draft.kind;
    if (replacing && !window.confirm("Trocar o avatar atual?")) return;
    await repository.updateCharacter({ ...character, avatar: draft });
    router.push(sheetUrl);
  };

  return (
    <div className="stack">
      <div className="row spread">
        <h2>Aparência de {character.name}</h2>
        <Link href={sheetUrl} className="back-link muted" onClick={leave}>Voltar à ficha</Link>
      </div>

      {staleNotice && <p className="card" role="status">{staleNotice}</p>}

      <div className="studio">
        <section className="card studio-preview" aria-label="Pré-visualização">
          <div className="studio-portrait">
            <div aria-live="polite">
              <CharacterAvatar avatar={draft} name={character.name} size={200} mode="card" describe />
            </div>
            <p className="portrait-plate">{character.name}</p>
          </div>
          <div className="stack" style={{ gap: 8 }}>
            {!draft && <p className="muted" style={{ fontSize: 14 }}>Escolha um retrato na galeria, monte o seu ou envie uma imagem.</p>}
            <div className="studio-actions">
              <button type="button" className="secondary" onClick={() => { changePortrait(randomPortrait()); setTab("montar"); }}>Sortear tudo</button>
              {tab === "montar" && (
                <button type="button" className="secondary" onClick={() => changePortrait(randomizeGroup(currentCfg, groupId))}>
                  Sortear {groupLabel.toLowerCase()}
                </button>
              )}
              <button type="button" className="secondary" onClick={undo} disabled={undoStack.length === 0}>Desfazer</button>
              <button type="button" className="secondary" onClick={redo} disabled={redoStack.length === 0}>Refazer</button>
              <button type="button" className="primary" onClick={save} disabled={!draft || sameAvatar(draft, character.avatar)}>
                Salvar aparência
              </button>
            </div>
          </div>
          <div className="segmented studio-gender" role="group" aria-label="Gênero">
            {optionsOf("genero").map(([id, label]) => (
              <button key={id} type="button" aria-pressed={draft?.kind === "camadas" && currentCfg.genero === id} onClick={() => { choose("genero", id); setTab("montar"); }}>
                {label}
              </button>
            ))}
          </div>
        </section>

        <div className="stack">
          <nav className="tabs" aria-label="Como criar a aparência" style={{ marginBottom: 0 }}>
            {TABS.map((t) => (
              <a
                key={t.id} href={`#${t.id}`} aria-current={tab === t.id ? "page" : undefined}
                onClick={(event) => { event.preventDefault(); setTab(t.id); }}
              >
                {t.label}
              </a>
            ))}
          </nav>

          {tab === "galeria" && (
            <div className="stack">
              <PresetGallery
                selectedId={draft?.kind === "camadas" ? draft.presetId : undefined}
                onSelect={(preset) => changePortrait(preset.cfg, preset.id)}
              />
              <button type="button" className="secondary" disabled={draft?.kind !== "camadas"} onClick={() => setTab("montar")} style={{ alignSelf: "flex-start" }}>
                Ajustar no criador
              </button>
            </div>
          )}
          {tab === "montar" && (
            <PortraitBuilder cfg={currentCfg} groupId={groupId} onGroupChange={setGroupId} onChange={choose} />
          )}
          {tab === "enviar" && (
            <div className="card">
              <ImageCropper
                onCrop={(image, shape) => setDraft({ kind: "imagem", ...image, shape })}
                onCancel={() => setDraft(character.avatar)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
