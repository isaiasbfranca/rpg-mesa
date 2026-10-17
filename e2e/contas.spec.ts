import { expect, test } from "@playwright/test";

const SCREENS = [["/entrar", "Entrar"], ["/cadastro", "Criar conta"], ["/recuperar", "Esqueci a senha"], ["/redefinir", "Nova senha"]] as const;

for (const [path, title] of SCREENS) {
  test(`${path} abre a tela de conta`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });
}

test("login valida os campos antes de chamar o serviço", async ({ page }) => {
  await page.goto("/entrar");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("alert")).toHaveText("Informe um e-mail válido.");
  await page.getByLabel("E-mail").fill("a@b.com");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.getByRole("alert")).toHaveText("Informe a senha.");
});

test("cadastro confere a repetição da senha", async ({ page }) => {
  await page.goto("/cadastro");
  await page.getByLabel("Nome").fill("Ana");
  await page.getByLabel("E-mail").fill("ana@exemplo.com");
  await page.getByLabel("Senha", { exact: true }).fill("senhaforte1");
  await page.getByLabel("Repita a senha").fill("outra-senha");
  await page.getByRole("button", { name: "Criar conta" }).click();
  await expect(page.getByRole("alert")).toHaveText("As senhas não são iguais.");
});
