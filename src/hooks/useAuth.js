import { useEffect, useState } from "react";

const STORAGE_KEY = "mock_auth_user";
const AUTH_STATE_EVENT = "mock-auth-state-changed";

function buildAuthState() {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (!stored) {
    return {
      user: null,
      session: null,
      role: null,
      loading: false,
    };
  }

  try {
    const parsed = JSON.parse(stored);
    return {
      user: parsed.user,
      session: { user: parsed.user },
      role: parsed.role,
      loading: false,
    };
  } catch {
    return {
      user: null,
      session: null,
      role: null,
      loading: false,
    };
  }
}

export function useAuth() {
  const [state, setState] = useState({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    const syncAuthState = () => {
      setState(buildAuthState());
    };

    syncAuthState();

    window.addEventListener("storage", syncAuthState);
    window.addEventListener(AUTH_STATE_EVENT, syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener(AUTH_STATE_EVENT, syncAuthState);
    };
  }, []);

  return state;
}

