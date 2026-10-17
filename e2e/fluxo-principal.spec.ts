import { expect, test } from "@playwright/test";
import { foundTable } from "./helpers";

test("mestra cria campanha, monta ficha, rola, registra sessão e nota", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

  await page.goto("/");
  await page.getByLabel("Nome", { exact: true }).fill("A Coroa de Cinzas");
  await page.getByLabel("Sistema").fill("Tormenta adaptado");
  await foundTable(page);
  await expect(page).toHaveURL(/\/ficha$/);

  const identity = page.getByRole("region", { name: "Seção Identidade" });
  await identity.getByLabel("Novo campo").fill("Sorte");
  await identity.getByLabel("Tipo").selectOption("atributo");
  await identity.getByRole("button", { name: "Adicionar", exact: true }).click();
  await expect(identity.getByText("Sorte")).toBeVisible();

  await page.getByRole("link", { name: "Painel" }).first().click();
  await page.getByLabel("Nome do personagem").fill("Lyra");
  await page.getByRole("button", { name: "Criar ficha" }).click();
  await expect(page).toHaveURL(/personagens/);

  const forca = page.getByRole("spinbutton", { name: "Força" });
  await forca.fill("16");
  await expect(page.locator(".attr", { has: forca }).getByText("mod +3")).toBeVisible();
  await page.getByRole("button", { name: "Rolar Força" }).click();
  const dock = page.locator(".roll-dock");
  await expect(dock).toContainText("Lyra: Força");
  const total = Number(await dock.locator(".roll-total").textContent());
  expect(total).toBeGreaterThanOrEqual(4);
  expect(total).toBeLessThanOrEqual(23);

  await expect(page.getByRole("status")).toHaveText("Salvo");
  await page.reload();
  await expect(page.getByRole("spinbutton", { name: "Força" })).toHaveValue("16");

  await page.getByRole("link", { name: "Sessões" }).click();
  await expect(page).toHaveURL(/sessoes/);
  await page.getByLabel("Título", { exact: true }).fill("Sessão 1: a estrada");
  await page.getByLabel("Resumo").fill("O grupo saiu de Valkaria.");
  await page.getByRole("button", { name: "Salvar registro" }).click();
  await expect(page.getByRole("heading", { name: "Sessão 1: a estrada" })).toBeVisible();

  await page.getByRole("link", { name: "Notas" }).click();
  await expect(page).toHaveURL(/notas/);
  await page.getByLabel("Título", { exact: true }).fill("Taverna do Javali");
  await page.getByRole("button", { name: "Salvar nota" }).click();
  await expect(page.getByRole("heading", { name: "Taverna do Javali" })).toBeVisible();

  await page.getByRole("link", { name: "Painel" }).first().click();
  await expect(page.getByText("O grupo saiu de Valkaria.")).toBeVisible();

  const overflows = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflows).toBe(false);
  expect(errors).toEqual([]);
});

test("rolador avisa expressão sem operador (DEF-01)", async ({ page }) => {
  await page.goto("/dados");
  await page.getByLabel("Expressão").fill("1d20 5");
  await page.getByRole("button", { name: "Rolar", exact: true }).click();
  await expect(page.getByRole("alert").filter({ hasText: "Falta + ou −" })).toBeVisible();
});

test("dados corrompidos geram aviso e cópia (DEF-02)", async ({ page }) => {
  await page.goto("/dados");
  await page.evaluate(() => localStorage.setItem("mesa:v1", '{"campaigns": [{"id"'));
  await page.goto("/campanhas");
  await expect(page.getByRole("alert").filter({ hasText: "corrompidos" })).toBeVisible();
  const backups = await page.evaluate(() => Object.keys(localStorage).filter((k) => k.startsWith("mesa:v1:backup:")));
  expect(backups).toHaveLength(1);
});

test("fundar mesa, convocar na távola e montar rolagem pelos dados", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/campanhas");
  await page.getByLabel("Nome", { exact: true }).fill("Mesa da Távola");
  const next = page.getByRole("button", { name: /^(Tomo|Cadeiras) ›$/ });
  while (await next.isVisible()) await next.click();
  await page.getByRole("button", { name: "Mais um jogador" }).click();
  await page.getByRole("button", { name: "Fundar mesa e convocar" }).click();
  await expect(page).toHaveURL(/\/tavola$/);

  await page.getByRole("button", { name: "Gerar link" }).click();
  await expect(page.getByTestId("invite-link")).toContainText("/convite/?t=");
  const link = (await page.getByTestId("invite-link").textContent()) ?? "";

  await page.goto(link);
  await expect(page.getByRole("heading", { name: "Mesa da Távola" })).toBeVisible();
  await page.getByRole("button", { name: "Aceitar e sentar à mesa" }).click();
  await expect(page).toHaveURL(/\/campanhas\/[^/]+$/);

  await page.getByRole("link", { name: "Dados" }).first().click();
  await page.getByRole("button", { name: /^Adicionar d6/ }).click();
  await page.getByRole("button", { name: /^Adicionar d6/ }).click();
  await page.getByRole("button", { name: "Aumentar modificador" }).click();
  await expect(page.getByText("2d6 + 1")).toBeVisible();
  await page.getByRole("button", { name: "Lançar" }).click();
  await expect(page.getByLabel("Crônica de rolagens")).toContainText("2d6");
  expect(errors).toEqual([]);
});

test("assistente cria personagem com atributos rolados", async ({ page }) => {
  await page.goto("/campanhas");
  await page.getByLabel("Nome", { exact: true }).fill("Mesa do Assistente");
  await foundTable(page);
  await page.getByRole("link", { name: "Painel" }).first().click();
  await page.getByRole("link", { name: "Novo personagem (assistente)" }).click();
  await expect(page).toHaveURL(/personagens\/novo$/);

  await page.getByLabel("Nome do personagem").fill("Bram");
  await page.getByRole("button", { name: "Atributos ›" }).click();
  await page.getByRole("button", { name: "Lançar 4d6" }).click();
  const shield = page.getByRole("button", { name: /^Força: / });
  await page.getByRole("button", { name: /^Valor \d+$/ }).first().click();
  await shield.click();
  await expect(shield).not.toContainText("?");
  await page.getByRole("button", { name: "Semblante ›" }).click();
  await page.getByRole("button", { name: "Juramento ›" }).click();
  await page.getByRole("button", { name: "Criar personagem" }).click();
  await expect(page).toHaveURL(/personagens\/[^/]+$/);
  await expect(page.getByLabel("Nome do personagem")).toHaveValue("Bram");
});
