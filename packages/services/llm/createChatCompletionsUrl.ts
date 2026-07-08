export const createChatCompletionsUrl = (baseUrl: string): string => {
  const normalizedBaseUrl = baseUrl.replace(/\/+$/u, '');
  const apiBaseUrl = normalizedBaseUrl.endsWith('/v1') ? normalizedBaseUrl : `${normalizedBaseUrl}/v1`;

  return `${apiBaseUrl}/chat/completions`;
};
