import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getMyAppointmentsRequest } from "../services/appointmentApi";
import { getAuthSession } from "../services/authStorage";
import { getMessagesByAppointmentRequest } from "../services/chatApi";
import { createChatSocket } from "../services/chatSocket";

const formatDateTime = (value) => {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("en-CA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
};

const ChatPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const session = getAuthSession();
  const currentUserId = session?.user?._id;
  const currentRole = session?.user?.role;

  const [appointments, setAppointments] = useState([]);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(
    searchParams.get("appointmentId") || "",
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] = useState(false);

  const socketRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const socket = createChatSocket();
    socketRef.current = socket;

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onReceiveMessage = (payload) => {
      if (!payload?.appointmentId) {
        return;
      }

      if (payload.appointmentId !== selectedAppointmentId) {
        return;
      }

      setMessages((prev) => [...prev, payload]);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("receive_message", onReceiveMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("receive_message", onReceiveMessage);
      socket.disconnect();
    };
  }, [selectedAppointmentId]);

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoadingAppointments(true);
      setError("");

      try {
        const data = await getMyAppointmentsRequest();
        const confirmed = (data.items || []).filter(
          (item) => item.status === "confirmed",
        );
        setAppointments(confirmed);

        if (!selectedAppointmentId && confirmed.length > 0) {
          const firstId = String(confirmed[0]._id);
          setSelectedAppointmentId(firstId);
          setSearchParams({ appointmentId: firstId });
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load confirmed appointments.",
        );
      } finally {
        setIsLoadingAppointments(false);
      }
    };

    loadAppointments();
  }, []);

  useEffect(() => {
    if (!selectedAppointmentId) {
      setMessages([]);
      return;
    }

    const loadMessages = async () => {
      setIsLoadingMessages(true);
      setError("");

      try {
        const data = await getMessagesByAppointmentRequest(
          selectedAppointmentId,
        );
        setMessages(data.items || []);
      } catch (requestError) {
        setError(
          requestError.response?.data?.message || "Unable to load messages.",
        );
        setMessages([]);
      } finally {
        setIsLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedAppointmentId]);

  useEffect(() => {
    if (!listRef.current) {
      return;
    }

    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const selectedAppointment = useMemo(() => {
    return (
      appointments.find(
        (item) => String(item._id) === String(selectedAppointmentId),
      ) || null
    );
  }, [appointments, selectedAppointmentId]);

  const handleAppointmentChange = (event) => {
    const value = event.target.value;
    setSelectedAppointmentId(value);

    if (value) {
      setSearchParams({ appointmentId: value });
    } else {
      setSearchParams({});
    }
  };

  const handleSend = () => {
    const safeContent = input.trim();

    if (!safeContent || !selectedAppointmentId || !socketRef.current) {
      return;
    }

    socketRef.current.emit(
      "send_message",
      {
        appointmentId: selectedAppointmentId,
        content: safeContent,
      },
      (response) => {
        if (!response?.ok) {
          setError(response?.error || "Unable to send message.");
          return;
        }

        setInput("");
      },
    );
  };

  const getPeerName = (appointment) => {
    if (!appointment) {
      return "Conversation";
    }

    if (currentRole === "client") {
      return appointment.pswId?.name || "PSW";
    }

    return appointment.clientId?.name || "Client";
  };

  return (
    <main className="min-h-screen bg-[linear-gradient(145deg,#f8fafc_0%,#ecfeff_55%,#f0f9ff_100%)] px-4 py-8">
      <section className="mx-auto w-full max-w-6xl space-y-6">
        <header className="rounded-2xl border border-cyan-100 bg-white p-6 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-700">
                PSWCares Chat
              </p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                Messages
              </h1>
              <p className="mt-1 text-slate-600">
                WhatsApp-style real-time chat for confirmed appointments.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  socketConnected
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-amber-50 text-amber-700"
                }`}
              >
                {socketConnected ? "Live" : "Connecting..."}
              </span>
              <Link
                className="text-sm font-medium text-cyan-700 hover:text-cyan-900"
                to={
                  currentRole === "psw" ? "/psw/dashboard" : "/client/dashboard"
                }
              >
                Back to dashboard
              </Link>
            </div>
          </div>
        </header>

        <section className="grid min-h-[68vh] grid-cols-1 gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="rounded-2xl border border-cyan-100 bg-white p-4 shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Confirmed Appointments
            </h2>

            {isLoadingAppointments ? (
              <p className="mt-3 text-sm text-slate-600">Loading...</p>
            ) : null}

            {!isLoadingAppointments && appointments.length === 0 ? (
              <p className="mt-3 text-sm text-slate-600">
                No confirmed appointments found.
              </p>
            ) : null}

            <select
              className="mt-3 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm outline-none ring-cyan-200 transition focus:ring"
              onChange={handleAppointmentChange}
              value={selectedAppointmentId}
            >
              <option value="">Select appointment</option>
              {appointments.map((appointment) => {
                const datePart = new Date(
                  appointment.appointmentDate,
                ).toLocaleDateString();
                return (
                  <option key={appointment._id} value={appointment._id}>
                    {getPeerName(appointment)} - {datePart}{" "}
                    {appointment.appointmentTime}
                  </option>
                );
              })}
            </select>

            {selectedAppointment ? (
              <div className="mt-4 rounded-xl border border-cyan-100 bg-cyan-50 p-3 text-xs text-slate-700">
                <p className="font-semibold text-slate-900">
                  Chat with {getPeerName(selectedAppointment)}
                </p>
                <p className="mt-1">
                  Date:{" "}
                  {new Date(
                    selectedAppointment.appointmentDate,
                  ).toLocaleDateString()}
                </p>
                <p className="mt-1">
                  Time: {selectedAppointment.appointmentTime}
                </p>
              </div>
            ) : null}
          </aside>

          <section className="flex flex-col rounded-2xl border border-cyan-100 bg-white shadow-[0_20px_60px_-35px_rgba(6,182,212,0.45)]">
            <div className="border-b border-cyan-100 px-5 py-3">
              <p className="text-sm font-semibold text-slate-900">
                {selectedAppointment
                  ? getPeerName(selectedAppointment)
                  : "Select an appointment to start chat"}
              </p>
            </div>

            <div
              className="flex-1 space-y-2 overflow-y-auto bg-[linear-gradient(180deg,#f8fafc_0%,#ecfeff_100%)] p-4"
              ref={listRef}
            >
              {isLoadingMessages ? (
                <p className="text-sm text-slate-600">Loading messages...</p>
              ) : null}

              {!isLoadingMessages && messages.length === 0 ? (
                <p className="text-sm text-slate-600">
                  No messages yet. Start the conversation.
                </p>
              ) : null}

              {!isLoadingMessages
                ? messages.map((message) => {
                    const mine =
                      String(message.senderId) === String(currentUserId);

                    return (
                      <div
                        className={`flex ${mine ? "justify-end" : "justify-start"}`}
                        key={message._id}
                      >
                        <article
                          className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                            mine
                              ? "rounded-br-sm bg-cyan-600 text-white"
                              : "rounded-bl-sm border border-slate-200 bg-white text-slate-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={`mt-1 text-[11px] ${
                              mine ? "text-cyan-100" : "text-slate-400"
                            }`}
                          >
                            {formatDateTime(message.createdAt)}
                          </p>
                        </article>
                      </div>
                    );
                  })
                : null}
            </div>

            <div className="border-t border-cyan-100 p-3">
              {error ? (
                <p className="mb-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {error}
                </p>
              ) : null}

              <div className="flex items-center gap-2">
                <input
                  className="w-full rounded-full border border-slate-300 bg-white px-4 py-2 text-sm outline-none ring-cyan-200 transition focus:ring"
                  disabled={!selectedAppointmentId}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    selectedAppointmentId
                      ? "Type a message..."
                      : "Select appointment to start messaging"
                  }
                  value={input}
                />
                <button
                  className="rounded-full bg-cyan-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-cyan-700 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!selectedAppointmentId || !input.trim()}
                  onClick={handleSend}
                  type="button"
                >
                  Send
                </button>
              </div>
            </div>
          </section>
        </section>
      </section>
    </main>
  );
};

export default ChatPage;
