import { expect, test } from "@playwright/test";
import { foundTable } from "./helpers";

test("mestra edita e exclui sessão, arquiva e reativa a campanha", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Nome", { exact: true }).fill("Mesa de Teste");
  await foundTable(page);
  await page.getByRole("link", { name: "Sessões" }).first().click();

  await page.getByLabel("Título", { exact: true }).fill("Sessão 1");
  await page.getByRole("button", { name: "Salvar registro" }).click();
  await page.getByRole("button", { name: "Editar" }).click();
  await page.getByRole("form", { name: /Editar sessão/ }).getByLabel("Título").fill("Sessão 1: revisada");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.getByRole("heading", { name: "Sessão 1: revisada" })).toBeVisible();

  await page.getByRole("button", { name: "Excluir" }).click();
  await page.getByRole("button", { name: "Confirmar exclusão" }).click();
  await expect(page.getByText("Nenhuma sessão registrada ainda.")).toBeVisible();

  await page.getByRole("link", { name: "Painel" }).first().click();
  await page.getByRole("button", { name: "Arquivar campanha" }).click();
  await page.getByRole("button", { name: "Confirmar arquivamento" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Campanha arquivada" })).toBeVisible();

  await page.getByRole("link", { name: "Sessões" }).first().click();
  await expect(page.getByRole("form", { name: "Registrar sessão" })).toHaveCount(0);

  await page.getByRole("link", { name: "Painel" }).first().click();
  await page.getByRole("button", { name: "Reativar campanha" }).click();
  await expect(page.getByRole("button", { name: "Arquivar campanha" })).toBeVisible();
});
