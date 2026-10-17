import { describe, expect, it } from "vitest";
import { friendlyAuthError, validateEmail, validatePassword, validatePasswordConfirmation } from "./authValidation";

describe("authValidation", () => {
  it("valida e-mail", () => {
    expect(validateEmail(" a@b.com ")).toBeNull();
    expect(validateEmail("a@b")).not.toBeNull();
    expect(validateEmail("")).not.toBeNull();
  });
  it("exige senha com 8 caracteres", () => {
    expect(validatePassword("1234567")).not.toBeNull();
    expect(validatePassword("12345678")).toBeNull();
  });
  it("confere a confirmação", () => {
    expect(validatePasswordConfirmation("abc", "abc")).toBeNull();
    expect(validatePasswordConfirmation("abc", "abd")).not.toBeNull();
  });
  it("traduz erros conhecidos e esconde os desconhecidos", () => {
    expect(friendlyAuthError("Invalid login credentials")).toBe("E-mail ou senha incorretos.");
    expect(friendlyAuthError("User already registered")).toContain("Já existe");
    expect(friendlyAuthError("boom 500 stack")).toBe("Não foi possível concluir. Tente de novo.");
  });
});
