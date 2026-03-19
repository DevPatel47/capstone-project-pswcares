import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { processPaymentSuccessRequest } from "../services/paymentApi";

const formatCurrency = (amountCents = 0, currency = "cad") => {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: String(currency || "cad").toUpperCase(),
  }).format(Number(amountCents) / 100);
};

const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [payment, setPayment] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      setError("Missing payment session reference.");
      setIsLoading(false);
      return;
    }

    const run = async () => {
      setIsLoading(true);
      setError("");

      try {
        const data = await processPaymentSuccessRequest(sessionId);
        setPayment(data.payment || null);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to confirm payment.",
        );
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
          Payment successful
        </h1>

        {isLoading ? (
          <p className="mt-4 text-sm text-slate-600">Finalizing payment...</p>
        ) : null}

        {!isLoading && error ? (
          <p className="mt-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </p>
        ) : null}

        {!isLoading && !error && payment ? (
          <div className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
            <p>
              Amount paid:{" "}
              <span className="font-semibold">
                {formatCurrency(payment.amount, payment.currency)}
              </span>
            </p>
            <p className="mt-1">Status: {payment.status}</p>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700"
            to="/client/dashboard"
          >
            Go to dashboard
          </Link>
          <Link
            className="rounded-lg border border-cyan-200 px-4 py-2 text-sm font-semibold text-cyan-800 transition hover:bg-cyan-50"
            to="/client/psw-search"
          >
            Book another service
          </Link>
        </div>
      </section>
    </main>
  );
};

export default PaymentSuccessPage;
