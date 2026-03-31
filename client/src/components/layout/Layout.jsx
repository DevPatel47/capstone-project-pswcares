import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { getAuthSession } from "../../services/authStorage";
import AppFooter from "./Footer";
import AppNavbar from "./Navbar";
import AppSidebar from "./Sidebar";

const Layout = ({ variant = "public" }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const session = getAuthSession();
  const role = session?.user?.role;
  const withSidebar = variant === "app";
  const simplified = variant === "auth";

  useEffect(() => {
    setSidebarOpen(false);
  }, [variant]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <AppNavbar
        simplified={simplified}
        withSidebar={withSidebar}
        onOpenSidebar={() => setSidebarOpen(true)}
      />

      <div className="flex-1 app-bg">
        {withSidebar ? (
          <section className="mx-auto grid w-full max-w-7xl grid-cols-1 gap-6 px-4 py-6 sm:px-6 md:grid-cols-[240px_minmax(0,1fr)] md:px-8">
            <div className="hidden md:block">
              <AppSidebar role={role} />
            </div>
            <main className="min-w-0">
              <Outlet />
            </main>
          </section>
        ) : (
          <main>
            <Outlet />
          </main>
        )}
      </div>

      <AppFooter />

      <AnimatePresence>
        {withSidebar && sidebarOpen ? (
          <>
            <motion.button
              type="button"
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-slate-900/30 md:hidden"
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              className="fixed left-0 top-[73px] z-50 h-[calc(100vh-73px)] w-72 overflow-y-auto px-3 py-4 md:hidden"
            >
              <AppSidebar
                role={role}
                mobile
                onClose={() => setSidebarOpen(false)}
              />
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export default Layout;
