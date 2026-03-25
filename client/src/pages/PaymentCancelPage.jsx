import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import PageTransition from "../components/ui/PageTransition";
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
    <main className="app-bg flex items-center justify-center px-4 py-12">
      <PageTransition className="w-full max-w-xl">
        <section className="app-card !p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50">
            <svg className="h-8 w-8 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>

          <p className="page-label">Payment</p>
          <h1 className="page-title !text-2xl !mt-1">Checkout cancelled</h1>
          <p className="mt-3 text-sm text-slate-500">
            {isLoading ? "Processing cancellation..." : message}
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link className="btn-primary" to="/client/dashboard">
              Return to dashboard
            </Link>
            <Link className="btn-secondary" to="/client/psw-search">
              Continue browsing
            </Link>
          </div>
        </section>
      </PageTransition>
    </main>
  );
};

export default PaymentCancelPage;
