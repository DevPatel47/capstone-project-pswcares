const AUTH_STORAGE_KEY = "pswcares_auth";

const resolveToken = (value) => {
  if (!value || typeof value !== "object") {
    return "";
  }

  const token = value.token || value.accessToken || value.jwt || "";
  return typeof token === "string" ? token.trim() : "";
};

export const setAuthSession = ({ token, user }) => {
  const resolvedToken = resolveToken({ token });
  localStorage.setItem(
    AUTH_STORAGE_KEY,
    JSON.stringify({ token: resolvedToken, user: user || null }),
  );
};

export const getAuthSession = () => {
  const value = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    const parsed = JSON.parse(value);
    const token = resolveToken(parsed);

    if (!token) {
      return null;
    }

    return {
      ...parsed,
      token,
    };
  } catch (_error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
};

export const getAuthToken = () => {
  const session = getAuthSession();
  return session?.token || "";
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_STORAGE_KEY);
};

export const getDashboardPathByRole = (role) => {
  if (role === "admin") {
    return "/admin/dashboard";
  }

  if (role === "psw") {
    return "/psw/dashboard";
  }

  return "/client/dashboard";
};
