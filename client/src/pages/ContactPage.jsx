import { useState } from "react";
import api from "../services/api";
import Navbar from "../components/landing/Navbar";
import Footer from "../components/landing/Footer";

const ContactPage = () => {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await api.post("/contact", form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      <main className="pt-24 pb-20">
        <div className="container-max section-padding !pt-8">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <p className="text-sm font-semibold text-brand-600 uppercase tracking-widest mb-3">Contact Us</p>
              <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-tight">
                Get in <span className="gradient-text">Touch</span>
              </h1>
              <p className="mt-4 text-lg text-slate-600">
                Have a question, suggestion, or need support? We&apos;d love to hear from you.
              </p>
            </div>

            {/* Contact info cards */}
            <div className="grid sm:grid-cols-2 gap-5 mb-14">
              {[
                {
                  title: "Email",
                  value: "dev080405.canada@gmail.com",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                    </svg>
                  ),
                },
                {
                  title: "Response Time",
                  value: "We'll reply within 1–2 business days",
                  icon: (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
              ].map((info) => (
                <div key={info.title} className="rounded-2xl border border-slate-100 bg-white p-5 shadow-card text-center">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center mx-auto mb-3 text-brand-600">
                    {info.icon}
                  </div>
                  <p className="text-sm font-bold text-slate-900">{info.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{info.value}</p>
                </div>
              ))}
            </div>

            {/* Form */}
            {submitted ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-10 text-center">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Message Sent!</h2>
                <p className="text-slate-600">Thank you for reaching out. We&apos;ll get back to you within 1–2 business days.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-8 md:p-10 shadow-card">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Send us a message</h2>
                {error && (
                  <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
                <div className="grid sm:grid-cols-2 gap-5 mb-5">
                  <div>
                    <label htmlFor="contact-name" className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      value={form.name}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-colors"
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      value={form.email}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-colors"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>
                <div className="mb-5">
                  <label htmlFor="contact-subject" className="block text-sm font-medium text-slate-700 mb-1.5">Subject</label>
                  <input
                    id="contact-subject"
                    name="subject"
                    type="text"
                    required
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-colors"
                    placeholder="How can we help?"
                  />
                </div>
                <div className="mb-6">
                  <label htmlFor="contact-message" className="block text-sm font-medium text-slate-700 mb-1.5">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows="5"
                    value={form.message}
                    onChange={handleChange}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition-colors resize-none"
                    placeholder="Tell us more..."
                  />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full sm:w-auto disabled:opacity-60 disabled:cursor-not-allowed">
                  {loading ? "Sending..." : "Send Message"}
                  {!loading && (
                    <svg className="ml-2 w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                    </svg>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ContactPage;
