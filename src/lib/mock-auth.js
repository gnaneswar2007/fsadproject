import { apiRequest } from "@/lib/api";
import { upsertUser } from "@/lib/mock-db";

const STORAGE_KEY = "mock_auth_user";
const AUTH_STATE_EVENT = "mock-auth-state-changed";
const PROFILE_CACHE_KEY = "mock_profile_cache";
const ROLE_CACHE_KEY = "mock_role_cache";
const PENDING_SIGNUP_KEY = "pending_signup_auth";
const SUPER_ADMIN_EMAIL = "ganesh@gmail.com";

function notifyAuthStateChanged() {
  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}

export const AppRole = {
  ADMIN: "admin",
  DONOR: "donor",
  RECIPIENT: "recipient",
  ANALYST: "analyst",
};

function readMap(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "{}");
  } catch {
    return {};
  }
}

function writeMap(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

function roleForEmail(email) {
  if ((email || "").toLowerCase() === SUPER_ADMIN_EMAIL) return AppRole.ADMIN;
  const roleMap = readMap(ROLE_CACHE_KEY);
  return roleMap[email] || AppRole.DONOR;
}

function profileForEmail(email) {
  const profileMap = readMap(PROFILE_CACHE_KEY);
  return profileMap[email] || { full_name: "", organization_name: "" };
}

function cacheRoleAndProfile(email, role, fullName, organizationName) {
  const roleMap = readMap(ROLE_CACHE_KEY);
  roleMap[email] = role;
  writeMap(ROLE_CACHE_KEY, roleMap);

  const profileMap = readMap(PROFILE_CACHE_KEY);
  profileMap[email] = {
    full_name: fullName || "",
    organization_name: organizationName || "",
  };
  writeMap(PROFILE_CACHE_KEY, profileMap);
}

function setPendingSignup(email, password) {
  localStorage.setItem(PENDING_SIGNUP_KEY, JSON.stringify({ email, password }));
}

function getPendingSignup() {
  try {
    return JSON.parse(localStorage.getItem(PENDING_SIGNUP_KEY) || "null");
  } catch {
    return null;
  }
}

function clearPendingSignup() {
  localStorage.removeItem(PENDING_SIGNUP_KEY);
}

function persistSession(email) {
  const role = roleForEmail(email);
  const profile = profileForEmail(email);
  const sessionUser = {
    id: email,
    email,
    user_metadata: { role },
  };

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      user: sessionUser,
      role,
      profile,
    })
  );

  notifyAuthStateChanged();

  upsertUser({
    user_id: email,
    full_name: profile.full_name,
    organization_name: profile.organization_name,
    role,
    created_at: new Date().toISOString(),
  });

  return {
    data: { session: { user: sessionUser } },
    error: null,
  };
}

export async function signIn(email, password) {
  try {
    await apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    return persistSession(email);
  } catch (err) {
    return {
      data: null,
      error: { message: err.message || "Invalid email or password" },
    };
  }
}

export async function signUp(email, password, role, fullName, organizationName) {
  try {
    cacheRoleAndProfile(email, role, fullName, organizationName);

    await apiRequest("/auth/register", {
      method: "POST",
      body: {
        name: fullName,
        email,
        password,
      },
    });

    setPendingSignup(email, password);

    return {
      data: { requiresOtp: true, email },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: { message: err.message || "Registration failed" },
    };
  }
}

export async function verifySignupOtp(email, otp) {
  try {
    await apiRequest("/auth/verify-otp", {
      method: "POST",
      body: {
        email,
        otp,
        purpose: "REGISTER",
      },
    });

    const pending = getPendingSignup();
    if (pending?.email === email) {
      clearPendingSignup();
    }

    return {
      data: { verified: true, requiresLogin: true },
      error: null,
    };
  } catch (err) {
    return {
      data: null,
      error: { message: err.message || "OTP verification failed" },
    };
  }
}

export async function resendSignupOtp(email) {
  try {
    await apiRequest("/auth/resend-otp", {
      method: "POST",
      body: {
        email,
        purpose: "REGISTER",
      },
    });

    return { data: { resent: true }, error: null };
  } catch (err) {
    return {
      data: null,
      error: { message: err.message || "Could not resend OTP" },
    };
  }
}

export async function signOut() {
  localStorage.removeItem(STORAGE_KEY);
  notifyAuthStateChanged();
  return { error: null };
}

export async function getSession() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    return { data: { session: null }, error: null };
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      data: {
        session: {
          user: parsed.user
        }
      },
      error: null
    };
  } catch {
    return { data: { session: null }, error: null };
  }
}

export async function getUserRole(userId) {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed.role;
  } catch {
    return null;
  }
}

export async function getUserProfile(userId) {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return null;

  try {
    const parsed = JSON.parse(stored);
    return parsed.profile;
  } catch {
    return null;
  }
}
