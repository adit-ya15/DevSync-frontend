const trimTrailingSlash = (value) => {
	if (!value) return value;
	return value.endsWith("/") ? value.slice(0, -1) : value;
};

// Prefer explicit configuration, otherwise use same-origin `/api`.
// In development, Vite proxies `/api` to the backend to avoid CORS issues.
export const BASE_URL = trimTrailingSlash(import.meta.env.VITE_API_BASE_URL) || "/api";