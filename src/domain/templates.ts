import type { Field, ModifierRule, SheetTemplate } from "./sheet";

export type ExampleTemplate = {
  id: string;
  name: string;
  description: string;
  modifierRule: ModifierRule;
  defaultDie: number;
  template: SheetTemplate;
  /** Sistema de origem, quando o modelo segue um sistema conhecido (US-37). */
  system?: string;
  /** De onde vem o conteúdo e sob qual licença (US-37); modelos próprios do app não precisam. */
  source?: { name: string; license: string; url: string };
};

const attribute = (id: string, label: string): Field => ({ id, label, type: "atributo", required: true });

/** Modelos genéricos de exemplo para começar (RF-09). Não reproduzem nenhum sistema específico. */
export const EXAMPLE_TEMPLATES: ExampleTemplate[] = [
  {
    id: "classico-d20",
    name: "Clássico d20",
    description: "Seis atributos com modificador estilo D&D, PV e equipamento.",
    modifierRule: "dnd",
    defaultDie: 20,
    template: {
      version: 1,
      sections: [
        {
          id: "identidade",
          title: "Identidade",
          fields: [
            { id: "conceito", label: "Conceito", type: "texto", required: false, help: "Ex.: ladina meio-elfa" },
            { id: "nivel", label: "Nível", type: "numero", required: true },
          ],
        },
        {
          id: "atributos",
          title: "Atributos",
          fields: [
            attribute("for", "Força"),
            attribute("des", "Destreza"),
            attribute("con", "Constituição"),
            attribute("int", "Inteligência"),
            attribute("sab", "Sabedoria"),
            attribute("car", "Carisma"),
          ],
        },
        {
          id: "combate",
          title: "Combate",
          fields: [
            { id: "pv", label: "Pontos de vida", type: "numero", required: true },
            { id: "defesa", label: "Defesa", type: "numero", required: false },
          ],
        },
        {
          id: "extras",
          title: "Equipamento e história",
          fields: [
            { id: "equipamento", label: "Equipamento", type: "textoLongo", required: false },
            { id: "historia", label: "História", type: "textoLongo", required: false },
          ],
        },
      ],
    },
  },
  {
    id: "dnd5e-srd",
    name: "D&D 5ª edição (SRD)",
    system: "Dungeons & Dragons 5e",
    description: "Ficha de aventureiro com atributos, perícias de combate e magias, no estilo da 5ª edição.",
    source: {
      name: "System Reference Document 5.1, © Wizards of the Coast LLC",
      license: "Creative Commons Attribution 4.0 (CC BY 4.0)",
      url: "https://dnd.wizards.com/resources/systems-reference-document",
    },
    modifierRule: "dnd",
    defaultDie: 20,
    template: {
      version: 1,
      sections: [
        {
          id: "identidade",
          title: "Personagem",
          fields: [
            { id: "classe", label: "Classe", type: "texto", required: true },
            { id: "nivel", label: "Nível", type: "numero", required: true },
            { id: "raca", label: "Raça", type: "texto", required: true },
            { id: "antecedente", label: "Antecedente", type: "texto", required: false },
            { id: "alinhamento", label: "Alinhamento", type: "texto", required: false },
          ],
        },
        {
          id: "atributos",
          title: "Atributos",
          fields: [
            attribute("for", "Força"),
            attribute("des", "Destreza"),
            attribute("con", "Constituição"),
            attribute("int", "Inteligência"),
            attribute("sab", "Sabedoria"),
            attribute("car", "Carisma"),
          ],
        },
        {
          id: "combate",
          title: "Combate",
          fields: [
            { id: "ca", label: "Classe de Armadura", type: "numero", required: true },
            { id: "pv", label: "Pontos de vida", type: "numero", required: true },
            { id: "deslocamento", label: "Deslocamento (m)", type: "numero", required: false },
            { id: "proficiencia", label: "Bônus de proficiência", type: "numero", required: false },
            { id: "inspiracao", label: "Inspiração", type: "caixa", required: false },
          ],
        },
        {
          id: "pericias",
          title: "Perícias e idiomas",
          fields: [
            { id: "pericias", label: "Perícias treinadas", type: "textoLongo", required: false },
            { id: "idiomas", label: "Idiomas e proficiências", type: "textoLongo", required: false },
          ],
        },
        {
          id: "magias",
          title: "Magias e equipamento",
          fields: [
            { id: "magias", label: "Magias conhecidas", type: "textoLongo", required: false },
            { id: "equipamento", label: "Equipamento", type: "textoLongo", required: false },
            { id: "historia", label: "História", type: "textoLongo", required: false },
          ],
        },
      ],
    },
  },
  {
    id: "narrativo",
    name: "Narrativo simples",
    description: "Três atributos com valor direto, rolagem em d6 e campos livres.",
    modifierRule: "direto",
    defaultDie: 6,
    template: {
      version: 1,
      sections: [
        {
          id: "identidade",
          title: "Quem é",
          fields: [
            { id: "conceito", label: "Conceito", type: "texto", required: true },
            { id: "motivacao", label: "Motivação", type: "textoLongo", required: false },
          ],
        },
        {
          id: "atributos",
          title: "Atributos",
          fields: [attribute("corpo", "Corpo"), attribute("mente", "Mente"), attribute("alma", "Alma")],
        },
        {
          id: "estado",
          title: "Estado",
          fields: [
            { id: "ferido", label: "Ferido", type: "caixa", required: false },
            {
              id: "condicao",
              label: "Condição",
              type: "lista",
              required: false,
              options: ["Bem", "Abalado", "Exausto"],
            },
          ],
        },
      ],
    },
  },
  {
    id: "em-branco",
    name: "Em branco",
    description: "Só o nome do personagem. Monte o resto do seu jeito.",
    modifierRule: "nenhum",
    defaultDie: 20,
    template: {
      version: 1,
      sections: [{ id: "geral", title: "Geral", fields: [{ id: "anotacoes", label: "Anotações", type: "textoLongo", required: false }] }],
    },
  },
];
