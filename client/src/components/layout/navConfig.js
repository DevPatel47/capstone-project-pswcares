import { getDashboardPathByRole } from "../../services/authStorage";

export const PUBLIC_NAV_LINKS = [
  { label: "Home", to: "/" },
  { label: "Find a PSW", to: "/client/psw-search" },
];

const ICONS = {
  dashboard:
    "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0h4",
  bookings:
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  messages:
    "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z",
  profile:
    "M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z",
  settings:
    "M9.594 3.94c.09-.542.56-.94 1.11-.94h2.592c.55 0 1.02.398 1.11.94l.213 1.279a1.125 1.125 0 001.017.92 7.5 7.5 0 011.684.69 1.125 1.125 0 001.357-.19l.96-.96a1.125 1.125 0 011.591 0l1.832 1.832a1.125 1.125 0 010 1.59l-.96.962a1.125 1.125 0 00-.19 1.356c.296.53.528 1.09.69 1.684a1.125 1.125 0 00.92 1.018l1.279.213c.542.09.94.56.94 1.11v2.592c0 .55-.398 1.02-.94 1.11l-1.279.213a1.125 1.125 0 00-.92 1.017 7.5 7.5 0 01-.69 1.684 1.125 1.125 0 00.19 1.357l.96.96a1.125 1.125 0 010 1.591l-1.832 1.832a1.125 1.125 0 01-1.59 0l-.962-.96a1.125 1.125 0 00-1.356-.19 7.5 7.5 0 01-1.684.69 1.125 1.125 0 00-1.018.92l-.213 1.279c-.09.542-.56.94-1.11.94h-2.592c-.55 0-1.02-.398-1.11-.94l-.213-1.279a1.125 1.125 0 00-1.017-.92 7.5 7.5 0 01-1.684-.69 1.125 1.125 0 00-1.357.19l-.96.96a1.125 1.125 0 01-1.591 0L3.68 21.227a1.125 1.125 0 010-1.59l.96-.962a1.125 1.125 0 00.19-1.356 7.5 7.5 0 01-.69-1.684 1.125 1.125 0 00-.92-1.018l-1.279-.213A1.125 1.125 0 011 13.296v-2.592c0-.55.398-1.02.94-1.11l1.279-.213a1.125 1.125 0 00.92-1.017 7.5 7.5 0 01.69-1.684 1.125 1.125 0 00-.19-1.357l-.96-.96a1.125 1.125 0 010-1.591L5.512 1.94a1.125 1.125 0 011.59 0l.962.96a1.125 1.125 0 001.356.19c.53-.296 1.09-.528 1.684-.69a1.125 1.125 0 001.018-.92l.213-1.279zM12 15.75A3.75 3.75 0 1012 8.25a3.75 3.75 0 000 7.5z",
  users:
    "M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z",
  verify:
    "M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z",
  requests: "M3.75 5.25h16.5M3.75 12h16.5m-16.5 6.75h16.5",
  availability:
    "M6.75 3v2.25m10.5-2.25v2.25m-12.75 15h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15A2.25 2.25 0 002.25 6.75V18a2.25 2.25 0 002.25 2.25z",
};

const ROLE_NAV = {
  client: {
    navbar: [
      { label: "Dashboard", to: "/client/dashboard" },
      { label: "Bookings", to: "/client/booking" },
      { label: "Messages", to: "/client/chat" },
    ],
    sidebar: [
      { label: "Dashboard", to: "/client/dashboard", icon: ICONS.dashboard },
      { label: "Bookings", to: "/client/booking", icon: ICONS.bookings },
      { label: "Messages", to: "/client/chat", icon: ICONS.messages },
      { label: "Profile", to: "/client/dashboard", icon: ICONS.profile },
      { label: "Settings", to: "/client/dashboard", icon: ICONS.settings },
    ],
  },
  psw: {
    navbar: [
      { label: "Dashboard", to: "/psw/dashboard" },
      { label: "Requests", to: "/psw/dashboard", exact: false },
      { label: "Availability", to: "/psw/profile" },
      { label: "Messages", to: "/psw/chat" },
    ],
    sidebar: [
      { label: "Dashboard", to: "/psw/dashboard", icon: ICONS.dashboard },
      { label: "Requests", to: "/psw/dashboard", icon: ICONS.requests },
      { label: "Availability", to: "/psw/profile", icon: ICONS.availability },
      { label: "Messages", to: "/psw/chat", icon: ICONS.messages },
      { label: "Profile", to: "/psw/profile", icon: ICONS.profile },
      { label: "Settings", to: "/psw/profile", icon: ICONS.settings },
    ],
  },
  admin: {
    navbar: [
      { label: "Admin Dashboard", to: "/admin/dashboard" },
      { label: "Users", to: "/admin/users" },
      { label: "Verification", to: "/admin/verify" },
    ],
    sidebar: [
      {
        label: "Admin Dashboard",
        to: "/admin/dashboard",
        icon: ICONS.dashboard,
      },
      { label: "Users", to: "/admin/users", icon: ICONS.users },
      { label: "Verification", to: "/admin/verify", icon: ICONS.verify },
      { label: "Messages", to: "/admin/contacts", icon: ICONS.messages },
      { label: "Settings", to: "/admin/dashboard", icon: ICONS.settings },
    ],
  },
};

export const getRoleNavbarLinks = (role) => ROLE_NAV[role]?.navbar || [];

export const getRoleSidebarLinks = (role) => ROLE_NAV[role]?.sidebar || [];

export const getMessagesPathByRole = (role) => {
  if (role === "admin") return "/admin/contacts";
  if (role === "psw") return "/psw/chat";
  if (role === "client") return "/client/chat";
  return "/login";
};

export const getProfilePathByRole = (role) => {
  if (role === "psw") return "/psw/profile";
  return getDashboardPathByRole(role);
};

export const getQuickDashboardPath = (session) => {
  const role = session?.user?.role;
  if (!role) return "/login";
  return getDashboardPathByRole(role);
};
