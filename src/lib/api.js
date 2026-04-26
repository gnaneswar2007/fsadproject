import axios from "axios";

// Use relative path for dev proxy; fall back to full URL for production builds
const API_BASE_URL = import.meta.env.PROD
  ? (import.meta.env.VITE_API_BASE_URL || "https://fsadprojectbackend.onrender.com/api")
  : "/api";

function getErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  return payload.message || payload.error || fallback;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers = {} } = options;
  try {
    const response = await apiClient.request({
      url: path,
      method,
      headers,
      data: body,
    });
    return response.data ?? null;
  } catch (error) {
    const payload = error?.response?.data ?? null;
    const status = error?.response?.status;

    // Axios network/cors failures have no response object; preserve that signal.
    if (!error?.response) {
      throw new Error(error?.message || "Network error");
    }

    throw new Error(getErrorMessage(payload, `Request failed with status ${status}`));
  }
}

export function loginRequest(email, password) {
  return apiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function registerRequest({ name, email, password }) {
  return apiRequest("/auth/register", {
    method: "POST",
    body: {
      name,
      email,
      password,
    },
  });
}

export function verifyOtpRequest({ email, otp, purpose = "REGISTER" }) {
  return apiRequest("/auth/verify-otp", {
    method: "POST",
    body: {
      email,
      otp,
      purpose,
    },
  });
}

export function resendOtpRequest({ email, purpose = "REGISTER" }) {
  return apiRequest("/auth/resend-otp", {
    method: "POST",
    body: {
      email,
      purpose,
    },
  });
}
