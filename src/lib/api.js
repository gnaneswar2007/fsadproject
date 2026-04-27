
import axios from "axios";



// Render backend for auth only
const RENDER_AUTH_BASE_URL = "https://fsadprojectbackend.onrender.com/api";
// Local backend for all other requests
const LOCAL_API_BASE_URL = "http://localhost:8080/api";

// Use Render backend for auth endpoints
const AUTH_API_BASE_URL = "https://fsadprojectbackend.onrender.com/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";


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


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


const authApiClient = axios.create({
  baseURL: AUTH_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});


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
  
  // Add JWT token to headers if available
  const token = localStorage.getItem('jwt_token');
  const authHeaders = token ? { ...headers, 'Authorization': `Bearer ${token}` } : headers;
  

  try {
    const response = await client.request({
      url: path,
      method,
      headers: authHeaders,
      data: body,
    });
    return response.data ?? null;
  } catch (error) {
    const payload = error?.response?.data ?? null;
    const status = error?.response?.status;
    if (!error?.response) {
      throw new Error(error?.message || "Network error");
    }
    const message = getErrorMessage(payload, `Request failed with status ${status}`);
    throw new Error(message);
  }
}

async function authApiRequest(path, options = {}) {
  const { method = "GET", body, headers = {} } = options;
  try {
    const response = await authApiClient.request({
      url: path,
      method,
      headers,
      data: body,
    });
    return response.data ?? null;
  } catch (error) {
    const payload = error?.response?.data ?? null;
    const status = error?.response?.status;
    if (!error?.response) {
      throw new Error(error?.message || "Network error");
    }


    const requestError = new Error(getErrorMessage(payload, `Request failed with status ${status}`));
    requestError.status = status;
    requestError.payload = payload;
    throw requestError;

  }
}


// Auth endpoints use Render backend
export function loginRequest(email, password) {
  return authApiRequest("/auth/login", {
    method: "POST",
    body: { email, password },
  });
}

export function registerRequest({ name, email, password }) {
  return authApiRequest("/auth/register", {
    method: "POST",
    body: {
      name,
      email,
      password,
    },
  });
}

export function verifyOtpRequest({ email, otp, purpose = "REGISTER" }) {
  return authApiRequest("/auth/verify-otp", {
    method: "POST",
    body: {
      email,
      otp,
      purpose,
    },
  });
}

export function resendOtpRequest({ email, purpose = "REGISTER" }) {
  return authApiRequest("/auth/resend-otp", {
    method: "POST",
    body: {
      email,
      purpose,
    },
  });
}
