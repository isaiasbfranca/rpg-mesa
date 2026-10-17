import type { Page } from "@playwright/test";

/** No celular a criação é um assistente de 3 passos; no desktop tudo aparece junto. */
export const foundTable = async (page: Page) => {
  const next = page.getByRole("button", { name: /^(Tomo|Cadeiras) ›$/ });
  while (await next.isVisible()) await next.click();
  await page.getByRole("button", { name: "Fundar sem convocar agora" }).click();
};
