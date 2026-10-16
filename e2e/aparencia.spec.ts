import { expect, test, type Page } from "@playwright/test";

// PNG 1x1 vermelho, para testar o envio sem arquivo externo.
const RED_PIXEL_PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==",
  "base64",
);

const createCharacter = async (page: Page, name: string) => {
  await page.goto("/");
  await page.getByLabel("Nome", { exact: true }).fill("Campanha de teste");
  await page.getByRole("button", { name: "Criar campanha" }).click();
  await expect(page).toHaveURL(/\/ficha$/);
  await page.getByRole("link", { name: "Painel" }).click();
  await page.getByLabel("Nome do personagem").fill(name);
  await page.getByRole("button", { name: "Criar ficha" }).click();
  await expect(page).toHaveURL(/personagens/);
};

test("escolhe arquétipo, ajusta no criador, desfaz e salva", async ({ page }) => {
  await createCharacter(page, "Lyra");
  await page.getByRole("link", { name: "Criar aparência" }).click();
  await expect(page).toHaveURL(/aparencia$/);

  await page.getByRole("button", { name: "Mago" }).click();
  await expect(page.getByRole("button", { name: "Mago" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Ajustar no criador" }).click();

  // Gênero fica ao lado da prévia e não apaga o penteado escolhido.
  const gender = page.getByRole("group", { name: "Gênero" });
  await gender.getByRole("button", { name: "Feminino" }).click();
  await expect(gender.getByRole("button", { name: "Feminino" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("img", { name: /^Avatar de Lyra\. Humano, feminino, idoso/ })).toBeVisible();

  // DEF-16: setas, Home e End trocam de aba; só a aba atual entra no Tab.
  await page.getByRole("tab", { name: "Corpo" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Raça" })).toBeFocused();
  await expect(page.getByRole("tab", { name: "Raça" })).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Cenário" })).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Corpo" })).toBeFocused();
  await expect(page.locator('[role="tab"][tabindex="0"]')).toHaveCount(1);
  await expect(page.getByRole("tabpanel", { name: "Corpo" })).toBeVisible();
  await page.getByRole("tab", { name: "Cabelo" }).click();
  const hair = page.getByRole("radiogroup", { name: "Penteado" });
  await expect(hair.getByRole("radio", { name: "Longo liso" })).toBeChecked();
  await expect(hair.getByRole("radio")).toHaveCount(18);
  await hair.getByText("Tranças", { exact: true }).click();
  await expect(hair.getByRole("radio", { name: "Tranças" })).toBeChecked();
  const hairColor = page.getByRole("radiogroup", { name: "Cor do cabelo" });
  await hairColor.getByRole("radio", { name: "Ruivo" }).check();
  await page.getByRole("button", { name: "Desfazer" }).click();
  await expect(hairColor.getByRole("radio", { name: "Branco" })).toBeChecked();
  await page.getByRole("button", { name: "Refazer" }).click();
  await expect(hairColor.getByRole("radio", { name: "Ruivo" })).toBeChecked();
  await page.getByRole("button", { name: "Sortear cabelo" }).click();
  await page.getByRole("button", { name: "Desfazer" }).click();
  await expect(hair.getByRole("radio", { name: "Tranças" })).toBeChecked();

  await page.getByRole("button", { name: "Salvar aparência" }).click();
  await expect(page).toHaveURL(/personagens\/[^/]+$/);
  await expect(page.getByRole("img", { name: "Avatar de Lyra" }).first()).toBeVisible();

  await page.getByRole("button", { name: /Rolar/ }).first().click();
  await expect(page.locator(".roll-dock").getByRole("img", { name: "Avatar de Lyra" })).toBeVisible();

  await page.getByRole("link", { name: "Painel" }).click();
  await expect(page).toHaveURL(/campanhas\/[^/]+$/);
  await expect(page.getByRole("link", { name: /Lyra/ }).getByRole("img", { name: "Avatar de Lyra" })).toBeVisible();
});

test("envia imagem com recorte e confirma a troca de caminho", async ({ page }) => {
  await createCharacter(page, "Bram");
  await page.getByRole("link", { name: "Criar aparência" }).click();
  await page.getByRole("button", { name: "Sortear tudo" }).click();
  await page.getByRole("button", { name: "Salvar aparência" }).click();
  await expect(page).toHaveURL(/personagens\/[^/]+$/);

  await page.getByRole("link", { name: "Editar aparência" }).click();
  await page.getByRole("link", { name: "Enviar imagem" }).click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth)).toBe(false); // DEF-11

  await page.getByLabel(/Imagem \(JPG/).setInputFiles({ name: "gif.gif", mimeType: "image/gif", buffer: RED_PIXEL_PNG });
  await expect(page.getByRole("alert").filter({ hasText: "JPG, PNG ou WebP" })).toBeVisible();
  await page.getByLabel(/Imagem \(JPG/).setInputFiles({ name: "falsa.jpg", mimeType: "image/jpeg", buffer: Buffer.from("<html><script>alert(1)</script>") });
  await expect(page.getByRole("alert").filter({ hasText: "não é uma imagem" })).toBeVisible();

  await page.getByLabel(/Imagem \(JPG/).setInputFiles({ name: "retrato.png", mimeType: "image/png", buffer: RED_PIXEL_PNG });
  const frame = page.getByRole("group", { name: /Área de recorte/ });
  await frame.focus();
  await page.keyboard.press("ArrowLeft");
  await page.getByLabel("Zoom").fill("2");
  await page.getByText("Quadrado").click();
  await page.getByRole("button", { name: "Usar este recorte" }).click();

  page.once("dialog", (dialog) => {
    expect(dialog.message()).toBe("Trocar o avatar atual?");
    void dialog.accept();
  });
  await page.getByRole("button", { name: "Salvar aparência" }).click();
  await expect(page).toHaveURL(/personagens\/[^/]+$/);
  const portrait = page.getByRole("img", { name: "Avatar de Bram" }).first();
  await expect(portrait).toHaveAttribute("src", /^data:image\/(webp|png)/);
  // DEF-15: listas usam a miniatura de 96 px (RNF-14: ≤ 30 KB).
  const thumbSrc = await page.locator(".roll-dock, body").first().evaluate(() => {
    const store = JSON.parse(localStorage.getItem("mesa:v1") ?? "{}");
    return store.characters?.find((c: { name: string }) => c.name === "Bram")?.avatar?.thumbUrl as string | undefined;
  });
  expect(thumbSrc).toMatch(/^data:image\/(webp|png)/);
  expect(Math.ceil(((thumbSrc?.length ?? 0) * 3) / 4)).toBeLessThan(30 * 1024);
  await page.getByRole("link", { name: "Painel" }).click();
  await expect(page.getByRole("link", { name: /Bram/ }).getByRole("img", { name: "Avatar de Bram" })).toHaveAttribute("src", thumbSrc ?? "");
});
