import { useEffect, useState } from "react";

const STORAGE_KEY = "mock_auth_user";

export function useAuth() {
  const [state, setState] = useState({
    user: null,
    session: null,
    role: null,
    loading: true,
  });

  useEffect(() => {
    // Check for stored mock auth data
    const stored = localStorage.getItem(STORAGE_KEY);
    
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setState({
          user: parsed.user,
          session: { user: parsed.user },
          role: parsed.role,
          loading: false,
        });
      } catch {
        setState({
          user: null,
          session: null,
          role: null,
          loading: false,
        });
      }
    } else {
      setState({
        user: null,
        session: null,
        role: null,
        loading: false,
      });
    }
  }, []);

  return state;
}

