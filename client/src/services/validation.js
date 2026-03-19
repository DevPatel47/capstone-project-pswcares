export const isValidEmail = (value) =>
  /^\S+@\S+\.\S+$/.test(String(value || ""));

export const hasMinLength = (value, minLength) =>
  String(value || "").trim().length >= Number(minLength);

export const isNonNegativeNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0;
};

export const isTimeHHMM = (value) =>
  /^([01]\d|2[0-3]):([0-5]\d)$/.test(String(value || ""));
