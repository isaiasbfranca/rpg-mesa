import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { foundTable } from "./helpers";

const WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

const expectNoViolations = async (page: Page) => {
  const { violations } = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();
  const summary = violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.map((n) => n.target.join(" ")).join(" | ")}`);
  expect(summary).toEqual([]);
};

test("telas principais não têm violações WCAG A/AA (RNF-07)", async ({ page }) => {
  await page.goto("/");
  await expectNoViolations(page);

  await page.getByLabel("Nome", { exact: true }).fill("Mesa axe");
  await foundTable(page);
  await expect(page).toHaveURL(/\/ficha$/);
  const campaignUrl = page.url().replace(/\/ficha$/, "");
  await expectNoViolations(page);

  for (const name of ["Painel", "Távola", "Sessões", "Notas", "Dados"]) {
    await page.getByRole("link", { name, exact: true }).first().click();
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    await expectNoViolations(page);
  }

  await page.goto(campaignUrl);
  await page.getByLabel("Nome do personagem").fill("Lyra");
  await page.getByRole("button", { name: "Criar ficha" }).click();
  await expect(page).toHaveURL(/personagens/);
  await expectNoViolations(page);

  await page.getByRole("link", { name: "Criar aparência" }).click();
  await expect(page).toHaveURL(/aparencia$/);
  await expectNoViolations(page);
});
