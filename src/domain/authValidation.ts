export const MIN_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateEmail = (email: string): string | null =>
  EMAIL_PATTERN.test(email.trim()) ? null : "Informe um e-mail válido.";

export const validatePassword = (password: string): string | null =>
  password.length >= MIN_PASSWORD_LENGTH ? null : `A senha precisa ter pelo menos ${MIN_PASSWORD_LENGTH} caracteres.`;

export const validatePasswordConfirmation = (password: string, confirmation: string): string | null =>
  password === confirmation ? null : "As senhas não são iguais.";

/** Traduz as mensagens do serviço de autenticação sem expor detalhes técnicos. */
export const friendlyAuthError = (message: string): string => {
  const text = message.toLowerCase();
  if (text.includes("invalid login credentials")) return "E-mail ou senha incorretos.";
  if (text.includes("email not confirmed")) return "Confirme seu e-mail pelo link que enviamos antes de entrar.";
  if (text.includes("already registered") || text.includes("already been registered")) return "Já existe uma conta com esse e-mail.";
  if (text.includes("rate limit") || text.includes("too many")) return "Muitas tentativas. Aguarde alguns minutos.";
  if (text.includes("same password")) return "Escolha uma senha diferente da atual.";
  if (text.includes("fetch") || text.includes("network")) return "Sem conexão com o serviço de contas. Tente de novo.";
  return "Não foi possível concluir. Tente de novo.";
};

const DEFAULT_NEXT = "/campanhas";

/** Destino depois do login: só caminhos internos, para o link não levar a outro site. */
export const safeNextPath = (value: string | null): string =>
  value && value.startsWith("/") && !value.startsWith("//") && !value.includes("\\") ? value : DEFAULT_NEXT;
