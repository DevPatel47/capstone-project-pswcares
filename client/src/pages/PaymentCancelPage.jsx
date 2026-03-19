import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { processPaymentCancelRequest } from "../services/paymentApi";

const PaymentCancelPage = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("Payment was cancelled.");

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setIsLoading(false);
      return;
    }

    const run = async () => {
      setIsLoading(true);

      try {
        await processPaymentCancelRequest(sessionId);
        setMessage("Your payment session was cancelled safely.");
      } catch (_error) {
        setMessage("Payment cancellation was received.");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [searchParams]);

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#ecfeff_55%,#f0f9ff_100%)] px-4 py-8">
      <section className="mx-auto w-full max-w-2xl rounded-2xl border border-cyan-100 bg-white p-8 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
          Payment
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">
          Checkout cancelled
        </h1>
        <p className="mt-4 text-sm text-slate-600">
          {isLoading ? "Processing cancellation..." : message}
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            to="/client/dashboard"
          >
            Return to dashboard
          </Link>
          <Link
            className="rounded-lg border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
            to="/client/psw-search"
          >
            Continue browsing PSWs
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PaymentCancelPage;
