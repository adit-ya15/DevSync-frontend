import axios from "axios";

const githubClient = axios.create({
  baseURL: "https://api.github.com",
  headers: {
    Accept: "application/vnd.github+json",
  },
});

const memoryCache = new Map();
const CACHE_TTL_MS = 2 * 60 * 1000;

const getCached = (key) => {
  const entry = memoryCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    memoryCache.delete(key);
    return null;
  }
  return entry.value;
};

const setCached = (key, value) => {
  memoryCache.set(key, { value, timestamp: Date.now() });
};

export const extractGithubUsername = (input) => {
  if (!input) return null;

  if (typeof input === "object") {
    return (
      extractGithubUsername(input.githubUsername) ||
      extractGithubUsername(input.githubUrl) ||
      null
    );
  }

  if (typeof input !== "string") return null;
  const trimmed = input.trim();
  if (!trimmed) return null;

  // If it's already just a username.
  if (!trimmed.includes("/")) return trimmed;

  try {
    // Handle full URL or path-like strings.
    const url = trimmed.startsWith("http") ? new URL(trimmed) : new URL(`https://github.com/${trimmed.replace(/^\/+/, "")}`);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[0] || null;
  } catch {
    // Fallback: last path segment.
    const parts = trimmed.split("/").filter(Boolean);
    return parts[parts.length - 1] || null;
  }
};

export const fetchGithubRepos = async (username, { perPage = 4, signal } = {}) => {
  const u = extractGithubUsername(username);
  if (!u) return [];

  const cacheKey = `repos:${u}:${perPage}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await githubClient.get(`/users/${encodeURIComponent(u)}/repos`, {
    params: {
      sort: "updated",
      per_page: perPage,
    },
    signal,
  });

  const repos = Array.isArray(res.data) ? res.data : [];
  setCached(cacheKey, repos);
  return repos;
};

export const fetchGithubActivity = async (username, { perPage = 6, signal } = {}) => {
  const u = extractGithubUsername(username);
  if (!u) return [];

  const cacheKey = `activity:${u}:${perPage}`;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const res = await githubClient.get(`/users/${encodeURIComponent(u)}/events/public`, {
    params: {
      per_page: perPage,
    },
    signal,
  });

  const events = Array.isArray(res.data) ? res.data : [];
  setCached(cacheKey, events);
  return events;
};

export const summarizeGithubEvent = (event) => {
  if (!event) return "";
  const repo = event?.repo?.name;
  const createdAt = event?.created_at;
  const type = event?.type;

  const action = (() => {
    switch (type) {
      case "PushEvent": {
        const count = event?.payload?.commits?.length;
        return `Pushed${count ? ` ${count} commit${count === 1 ? "" : "s"}` : ""}`;
      }
      case "PullRequestEvent": {
        const prAction = event?.payload?.action;
        return prAction ? `Pull request ${prAction}` : "Pull request activity";
      }
      case "IssuesEvent": {
        const issueAction = event?.payload?.action;
        return issueAction ? `Issue ${issueAction}` : "Issue activity";
      }
      case "IssueCommentEvent":
        return "Commented on an issue";
      case "WatchEvent":
        return "Starred";
      case "ForkEvent":
        return "Forked";
      case "CreateEvent": {
        const refType = event?.payload?.ref_type;
        return refType ? `Created ${refType}` : "Created";
      }
      case "ReleaseEvent": {
        const relAction = event?.payload?.action;
        return relAction ? `Release ${relAction}` : "Release activity";
      }
      default:
        return type ? type.replace(/Event$/, "") : "Activity";
    }
  })();

  const when = createdAt ? new Date(createdAt).toLocaleDateString([], { month: "short", day: "numeric" }) : "";

  return [action, repo ? `in ${repo}` : "", when ? `• ${when}` : ""].filter(Boolean).join(" ");
};
