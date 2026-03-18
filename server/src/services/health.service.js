export const getHealthStatus = () => {
  return {
    status: "ok",
    service: "pswcares-api",
    timestamp: new Date().toISOString(),
  };
};
