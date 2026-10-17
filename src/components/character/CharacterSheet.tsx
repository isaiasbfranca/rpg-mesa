"use client";

import { useActor } from "@/hooks/useActor";
import { useRouteId } from "@/hooks/useRouteId";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useCampaign } from "@/components/campaign/CampaignContext";
import { CharacterAvatar } from "@/components/avatar/CharacterAvatar";
import { DiceRoller, LatestRoll } from "@/components/dice/DiceRoller";
import { repository } from "@/data";
import { attributeRollExpression } from "@/domain/dice";
import { canEditCharacter, characterVisibility } from "@/domain/permissions";
import { missingRequiredFields, valuesForTemplate, type FieldValue } from "@/domain/sheet";
import type { Character } from "@/domain/types";
import { useRollHistory } from "@/hooks/useRollHistory";
import { SheetFields } from "./SheetFields";

/** Salvamento automático: bem abaixo do limite de 2 s de RF-10. */
const AUTOSAVE_DELAY_MS = 600;

type SaveState = "salvo" | "salvando" | "pendente" | "erro";

const SAVE_LABELS: Record<SaveState, string> = { salvo: "Salvo", salvando: "Salvando…", pendente: "Salvando…", erro: "Não salvo" };

export const CharacterSheet = ({ characterId: routeId }: { characterId: string }) => {
  const router = useRouter();
  const characterId = useRouteId(routeId, "personagens") ?? "";
  const { campaign } = useCampaign();
  const actor = useActor();
  const [character, setCharacter] = useState<Character | null>();
  const [saveState, setSaveState] = useState<SaveState>("salvo");
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const dice = useRollHistory(campaign.id);

  useEffect(() => {
    if (!characterId) return;
    repository.getCharacter(characterId).then((found) => setCharacter(found ?? null));
  }, [characterId]);

  useEffect(() => () => clearTimeout(saveTimer.current), []);

  if (character === undefined) return <p className="muted">Carregando…</p>;
  if (character === null || characterVisibility(actor, character) === "nenhuma")
    return <p>Personagem não encontrado. <Link href={`/campanhas/${campaign.id}`}>Voltar</Link></p>;

  const editable = canEditCharacter(actor, campaign, character);
  const values = valuesForTemplate(campaign.template, character.values);
  const missing = missingRequiredFields(campaign.template, values);

  const scheduleSave = (next: Character) => {
    setCharacter(next);
    setSaveState("pendente");
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaveState("salvando");
      try {
        await repository.updateCharacter(next);
        setSaveState("salvo");
      } catch {
        setSaveState("erro");
      }
    }, AUTOSAVE_DELAY_MS);
  };

  const authorOf = (id: string) => (id === character.id ? character : undefined);

  const changeValue = (fieldId: string, value: FieldValue) =>
    scheduleSave({ ...character, values: { ...values, [fieldId]: value } });

  const remove = async () => {
    if (!window.confirm(`Excluir ${character.name}? Isso não pode ser desfeito.`)) return;
    await repository.deleteCharacter(character.id);
    router.push(`/campanhas/${campaign.id}`);
  };

  return (
    <div className="stack" style={{ paddingBottom: dice.history.length > 0 ? 140 : 0 }}>
      <div className="row" style={{ flexWrap: "nowrap" }}>
        <CharacterAvatar avatar={character.avatar} name={character.name} size={72} />
        {editable && (
          <Link href={`/campanhas/${campaign.id}/personagens/${character.id}/aparencia`} className="back-link">
            {character.avatar ? "Editar aparência" : "Criar aparência"}
          </Link>
        )}
      </div>
      <div className="row spread">
        <input
          aria-label="Nome do personagem" value={character.name} readOnly={!editable}
          onChange={(e) => scheduleSave({ ...character, name: e.target.value })}
          style={{ fontFamily: "var(--f-display)", fontSize: 24, flex: "1 1 240px" }}
        />
        <span className="muted" role="status">{SAVE_LABELS[saveState]}</span>
      </div>

      {character.kind === "npc" && editable && (
        <label className="inline">
          <input type="checkbox" checked={!character.hidden} onChange={(e) => scheduleSave({ ...character, hidden: !e.target.checked })} />
          Revelar este NPC aos jogadores
        </label>
      )}

      {missing.length > 0 && (
        <p className="muted">Faltam campos obrigatórios: {missing.map((f) => f.label).join(", ")}.</p>
      )}

      <SheetFields
        template={campaign.template}
        values={values}
        modifierRule={campaign.modifierRule}
        readOnly={!editable}
        onChange={changeValue}
        onRollAttribute={(field, modifier) =>
          dice.roll({
            expression: attributeRollExpression(campaign.defaultDie, modifier),
            label: `${character.name}: ${field.label}`,
            characterId: character.id,
          })
        }
      />

      <DiceRoller history={dice.history} error={dice.error} onRoll={dice.roll} showLatest={false} authorOf={authorOf} />

      {/* Resultado sempre à vista: na ficha a rolagem parte de qualquer ponto da tela. */}
      <div className="roll-dock" aria-live="polite" aria-atomic="true">
        {dice.history[0] && <LatestRoll roll={dice.history[0]} authorOf={authorOf} />}
      </div>

      {editable && <button type="button" className="danger" onClick={remove} style={{ alignSelf: "flex-start" }}>Excluir personagem</button>}
    </div>
  );
};
