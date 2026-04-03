const trimTrailingSlash = (value) => {
	if (!value) return value;
	return value.endsWith("/") ? value.slice(0, -1) : value;
};

const isAbsoluteHttpUrl = (value) => /^https?:\/\//i.test(value || "");

// Prefer explicit configuration, otherwise use same-origin `/api`.
// In development, Vite proxies `/api` to the backend to avoid CORS issues.
const configuredBaseUrl = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL);

const isDev = Boolean(import.meta.env.DEV);
const looksLikeLocalBackend =
	configuredBaseUrl &&
	/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(configuredBaseUrl);

export const BASE_URL = (isDev && looksLikeLocalBackend) ? "/api" : (configuredBaseUrl || "/api");

const runtimeOrigin =
	typeof window !== "undefined" ? window.location.origin : "";

export const SERVER_ORIGIN = isAbsoluteHttpUrl(configuredBaseUrl)
	? configuredBaseUrl.replace(/\/api$/i, "")
	: runtimeOrigin;
