import axios from "axios";


// Render backend for auth only
const RENDER_AUTH_BASE_URL = "https://fsadprojectbackend.onrender.com/api";
// Local backend for all other requests
const LOCAL_API_BASE_URL = "http://localhost:8080/api";

function getErrorMessage(payload, fallback) {
  if (!payload) return fallback;
  if (typeof payload === "string") return payload;
  return payload.message || payload.error || fallback;
}


function getApiClient(baseURL) {
  return axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });
}


export async function apiRequest(path, options = {}) {
  const { method = "GET", body, headers = {}, forceAuth = false } = options;
  // Route auth endpoints to Render, everything else to local
  const isAuth =
    path.startsWith("/auth/") ||
    path === "/auth/login" ||
    path === "/auth/register" ||
    path === "/auth/verify-otp" ||
    path === "/auth/resend-otp" ||
    forceAuth;
  const client = getApiClient(isAuth ? RENDER_AUTH_BASE_URL : LOCAL_API_BASE_URL);
  try {
    const response = await client.request({
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

    const requestError = new Error(getErrorMessage(payload, `Request failed with status ${status}`));
    requestError.status = status;
    requestError.payload = payload;
    throw requestError;
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
