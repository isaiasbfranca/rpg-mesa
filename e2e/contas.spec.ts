import { expect, test } from "@playwright/test";

/** Sem chave do serviço de contas o app segue sem login e as telas avisam isso. */
for (const [path, title] of [["/entrar", "Entrar"], ["/cadastro", "Criar conta"], ["/recuperar", "Esqueci a senha"], ["/redefinir", "Nova senha"]] as const) {
  test(`${path} avisa que as contas não estão ativadas`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
    await expect(page.getByText("As contas ainda não foram ativadas")).toBeVisible();
    await page.getByRole("link", { name: "Ir para as campanhas" }).click();
    await expect(page).toHaveURL(/\/campanhas/);
  });
}
