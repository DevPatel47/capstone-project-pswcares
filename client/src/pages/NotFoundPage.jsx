import { Link } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";

const NotFoundPage = () => {
  return (
    <main className="app-bg flex items-center justify-center px-4 py-20">
      <PageTransition className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-brand-50">
          <span className="text-4xl font-extrabold gradient-text">404</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Page not found</h1>
        <p className="mt-2 text-sm text-slate-500">
          Sorry, the page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link to="/" className="btn-primary mt-8 inline-flex">
          Back to home
        </Link>
      </PageTransition>
    </main>
  );
};

export default NotFoundPage;
