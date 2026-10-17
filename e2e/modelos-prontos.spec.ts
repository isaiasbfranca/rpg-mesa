import { expect, test } from "@playwright/test";
import { foundTable } from "./helpers";

test("mestra escolhe o modelo D&D 5e, vê fonte e licença e a campanha nasce com a ficha pronta", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nome", { exact: true }).fill("Mesa SRD");
  const next = page.getByRole("button", { name: /^Tomo ›$/ });
  if (await next.isVisible()) await next.click();

  await page.getByText("D&D 5ª edição (SRD)").click();
  const preview = page.getByRole("region", { name: "Pré-visualização de D&D 5ª edição (SRD)" });
  await expect(preview).toContainText("Classe de Armadura");
  await expect(preview).toContainText("CC BY 4.0");
  await expect(preview.getByRole("link", { name: /System Reference Document/ })).toHaveAttribute("href", /^https:\/\//);

  await foundTable(page);
  await expect(page).toHaveURL(/\/ficha$/);
  await expect(page.getByText("Classe de Armadura").first()).toBeVisible();
});
