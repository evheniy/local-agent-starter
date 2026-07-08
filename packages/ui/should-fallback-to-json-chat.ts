export const shouldFallbackToJsonChat = (error: unknown) => {
  if (error instanceof DOMException && error.name === 'AbortError') {
    return false;
  }

  return true;
};
