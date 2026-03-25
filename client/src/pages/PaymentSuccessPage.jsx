import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import LoadingState from "../components/LoadingState";
import ErrorBanner from "../components/ErrorBanner";
import PageTransition from "../components/ui/PageTransition";
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
        setError(requestError.response?.data?.message || "Unable to confirm payment.");
      } finally {
        setIsLoading(false);
      }
    };

    run();
  }, [searchParams]);

  return (
    <main className="app-bg flex items-center justify-center px-4 py-12">
      <PageTransition className="w-full max-w-xl">
        <section className="app-card !p-8 text-center">
          {/* Success icon */}
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50">
            <svg className="h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <p className="page-label">Payment</p>
          <h1 className="page-title !text-2xl !mt-1">Payment successful</h1>

          {isLoading ? <LoadingState label="Finalizing payment..." /> : null}

          {!isLoading && error ? <div className="mt-4"><ErrorBanner message={error} /></div> : null}

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

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link className="btn-primary" to="/client/dashboard">
              Go to dashboard
            </Link>
            <Link className="btn-secondary" to="/client/psw-search">
              Book another service
            </Link>
          </div>
        </section>
      </PageTransition>
    </main>
  );
};

export default PaymentSuccessPage;
