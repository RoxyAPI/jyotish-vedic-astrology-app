export function hasApiKey(): boolean {
  return Boolean(process.env.ROXYAPI_KEY);
}
