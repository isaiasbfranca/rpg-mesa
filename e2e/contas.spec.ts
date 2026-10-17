import { expect, test, type Page } from "@playwright/test";

/** O botão pode ser clicado antes da hidratação (o envio nativo recarrega a página); repete clique e checagem até valer. */
const clickUntilAlert = async (page: Page, button: string, message: string) =>
  expect(async () => {
    await page.getByRole("button", { name: button }).click();
    await expect(page.getByRole("alert")).toHaveText(message, { timeout: 1000 });
  }).toPass();

const SCREENS = [["/entrar", "Entrar"], ["/cadastro", "Criar conta"], ["/recuperar", "Esqueci a senha"], ["/redefinir", "Nova senha"]] as const;

for (const [path, title] of SCREENS) {
  test(`${path} abre a tela de conta`, async ({ page }) => {
    await page.goto(path);
    await expect(page.getByRole("heading", { name: title })).toBeVisible();
  });
}

test("login valida os campos antes de chamar o serviço", async ({ page }) => {
  await page.goto("/entrar");
  await clickUntilAlert(page, "Entrar", "Informe um e-mail válido.");
  await page.getByLabel("E-mail").fill("a@b.com");
  await clickUntilAlert(page, "Entrar", "Informe a senha.");
});

test("cadastro confere a repetição da senha", async ({ page }) => {
  await page.goto("/cadastro");
  await expect(async () => {
    await page.getByLabel("Nome").fill("Ana");
    await page.getByLabel("E-mail").fill("ana@exemplo.com");
    await page.getByLabel("Senha", { exact: true }).fill("senhaforte1");
    await page.getByLabel("Repita a senha").fill("outra-senha");
    await page.getByRole("button", { name: "Criar conta" }).click();
    await expect(page.getByRole("alert")).toHaveText("As senhas não são iguais.", { timeout: 1000 });
  }).toPass();
});
