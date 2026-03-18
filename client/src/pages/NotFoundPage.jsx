import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <section className="rounded-xl bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-semibold text-slate-900">
          Page Not Found
        </h1>
        <p className="mt-2 text-slate-600">
          The page you requested does not exist.
        </p>
        <Link
          className="mt-4 inline-block text-blue-600 hover:underline"
          to="/"
        >
          Go to Home
        </Link>
      </section>
    </main>
  );
};

export default NotFoundPage;
