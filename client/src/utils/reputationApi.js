import { getAuthToken } from "./session";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function buildQuery(params = {}) {
  const query = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query.toString() ? `?${query.toString()}` : "";
}

async function requestReputation(path, options = {}) {
  const response = await fetch(`${API_URL}/api/reputation${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthToken()}`,
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Reputation service failed.");
  }

  return data;
}

async function getMyReputation() {
  const data = await requestReputation("/me");
  return data.reputation;
}

async function getLeaderboard(params = {}) {
  return requestReputation(`/leaderboard${buildQuery(params)}`);
}

async function grantReputationBonus(userId, reason) {
  const data = await requestReputation(`/users/${userId}/bonus`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });

  return data.reputation;
}

export { getLeaderboard, getMyReputation, grantReputationBonus };
