const AUTH_STORAGE_KEY = "pswcares_auth";

export const setAuthSession = ({ token, user }) => {
  localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ token, user }));
};

export const getAuthSession = () => {
  const value = localStorage.getItem(AUTH_STORAGE_KEY);

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (_error) {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    return null;
  }
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
