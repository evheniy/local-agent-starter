export const getChatBaseUrl = () => process.env.CHAT ?? process.env.API ?? window.location.origin;
