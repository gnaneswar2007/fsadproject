// Mock authentication system (replaces Supabase auth)
import { upsertUser } from "@/lib/mock-db";

const MOCK_USERS = [
  { id: "admin-1", email: "demo.admin@foodsaver.app", password: "demo1234", role: "admin", full_name: "Demo Admin", organization_name: null },
  { id: "donor-1", email: "demo.donor@foodsaver.app", password: "demo1234", role: "donor", full_name: "Demo Donor", organization_name: null },
  { id: "recipient-1", email: "demo.recipient@foodsaver.app", password: "demo1234", role: "recipient", full_name: "Demo Recipient", organization_name: "Demo Organization" },
  { id: "analyst-1", email: "demo.analyst@foodsaver.app", password: "demo1234", role: "analyst", full_name: "Demo Analyst", organization_name: null },
];

const STORAGE_KEY = "mock_auth_user";

export const AppRole = {
  ADMIN: "admin",
  DONOR: "donor",
  RECIPIENT: "recipient",
  ANALYST: "analyst",
};

export async function signIn(email, password) {
  const user = MOCK_USERS.find(u => u.email === email && u.password === password);

  if (!user) {
    return {
      data: null,
      error: { message: "Invalid email or password" }
    };
  }

  const mockSession = {
    user: {
      id: user.id,
      email: user.email,
      user_metadata: { role: user.role }
    }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    user: mockSession.user,
    role: user.role,
    profile: {
      full_name: user.full_name,
      organization_name: user.organization_name
    }
  }));

  // Persist to users store so admin pages can list registered users
  upsertUser({
    user_id: user.id,
    full_name: user.full_name,
    organization_name: user.organization_name,
    role: user.role,
    created_at: new Date().toISOString(),
  });

  return {
    data: mockSession,
    error: null
  };
}

export async function signUp(email, password, role, fullName, organizationName) {
  const existingUser = MOCK_USERS.find(u => u.email === email);

  if (existingUser) {
    return {
      data: null,
      error: { message: "User already registered" }
    };
  }

  const newUser = {
    id: `${role}-${Date.now()}`,
    email,
    password,
    role,
    full_name: fullName,
    organization_name: organizationName
  };

  MOCK_USERS.push(newUser);

  const mockSession = {
    user: {
      id: newUser.id,
      email: newUser.email,
      user_metadata: { role: newUser.role }
    }
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    user: mockSession.user,
    role: newUser.role,
    profile: {
      full_name: newUser.full_name,
      organization_name: newUser.organization_name
    }
  }));

  // Persist to users store
  upsertUser({
    user_id: newUser.id,
    full_name: newUser.full_name,
    organization_name: newUser.organization_name,
    role: newUser.role,
    created_at: new Date().toISOString(),
  });

  return {
    data: { session: mockSession },
    error: null
  };
}

export async function signOut() {
  localStorage.removeItem(STORAGE_KEY);
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
