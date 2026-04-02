import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import PageTransition from "../components/ui/PageTransition";
import EmptyState from "../components/ui/EmptyState";
import { getMyAppointmentsRequest } from "../services/appointmentApi";
import { clearAuthSession, getAuthSession } from "../services/authStorage";
import { getMessagesByAppointmentRequest } from "../services/chatApi";
import { createChatSocket } from "../services/chatSocket";

const formatDateTime = (value) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
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
    if (!session?.token) {
      setSocketConnected(false);
      return;
    }

    const socket = createChatSocket();
    socketRef.current = socket;

    const onConnect = () => setSocketConnected(true);
    const onDisconnect = () => setSocketConnected(false);
    const onConnectError = (socketError) => {
      const message = String(socketError?.message || "");
      if (!message.toLowerCase().includes("unauthorized")) {
        return;
      }

      clearAuthSession();
      socket.disconnect();
      window.location.replace("/login");
    };
    const onReceiveMessage = (payload) => {
      if (!payload?.appointmentId) return;
      if (payload.appointmentId !== selectedAppointmentId) return;
      setMessages((prev) => [...prev, payload]);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connect_error", onConnectError);
    socket.on("receive_message", onReceiveMessage);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connect_error", onConnectError);
      socket.off("receive_message", onReceiveMessage);
      socket.disconnect();
    };
  }, [selectedAppointmentId, session?.token]);

  useEffect(() => {
    const loadAppointments = async () => {
      setIsLoadingAppointments(true);
      setError("");
      try {
        const data = await getMyAppointmentsRequest();
        const chatEligible = (data.items || []).filter((item) =>
          ["confirmed", "completed"].includes(item.status),
        );
        setAppointments(chatEligible);

        const selectedIsEligible = chatEligible.some(
          (item) => String(item._id) === String(selectedAppointmentId),
        );

        if (selectedAppointmentId && !selectedIsEligible) {
          if (chatEligible.length > 0) {
            const firstId = String(chatEligible[0]._id);
            setSelectedAppointmentId(firstId);
            setSearchParams({ appointmentId: firstId });
          } else {
            setSelectedAppointmentId("");
            setSearchParams({});
          }
          return;
        }

        if (!selectedAppointmentId && chatEligible.length > 0) {
          const firstId = String(chatEligible[0]._id);
          setSelectedAppointmentId(firstId);
          setSearchParams({ appointmentId: firstId });
        }
      } catch (requestError) {
        setError(
          requestError.response?.data?.message ||
            "Unable to load chat appointments.",
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
    if (!listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages]);

  const selectedAppointment = useMemo(() => {
    return (
      appointments.find(
        (item) => String(item._id) === String(selectedAppointmentId),
      ) || null
    );
  }, [appointments, selectedAppointmentId]);

  const canSendForSelected = selectedAppointment?.status === "confirmed";

  const handleAppointmentSelect = (id) => {
    setSelectedAppointmentId(id);
    if (id) setSearchParams({ appointmentId: id });
    else setSearchParams({});
  };

  const handleSend = () => {
    const safeContent = input.trim();
    if (!safeContent || !selectedAppointmentId || !socketRef.current) return;

    socketRef.current.emit(
      "send_message",
      { appointmentId: selectedAppointmentId, content: safeContent },
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
    if (!appointment) return "Conversation";
    if (currentRole === "client") return appointment.pswId?.name || "PSW";
    return appointment.clientId?.name || "Client";
  };

  return (
    <main className="app-bg px-4 py-6">
      <PageTransition className="mx-auto w-full max-w-6xl space-y-5">
        {/* Header */}
        <header className="app-card !py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-accent-400 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900">Messages</h1>
                <p className="text-xs text-slate-500">
                  Real-time chat for confirmed appointments and history for
                  completed care
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={socketConnected ? "success" : "warning"}>
                {socketConnected ? "Live" : "Connecting..."}
              </Badge>
              <Link
                className="btn-outline btn-sm"
                to={
                  currentRole === "psw" ? "/psw/dashboard" : "/client/dashboard"
                }
              >
                ← Dashboard
              </Link>
            </div>
          </div>
        </header>

        {/* Chat layout */}
        <section className="grid min-h-[68vh] grid-cols-1 gap-4 lg:grid-cols-[300px_minmax(0,1fr)]">
          {/* Sidebar */}
          <aside className="app-card !p-3 flex flex-col gap-2 overflow-y-auto">
            <p className="px-2 text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
              Conversations
            </p>

            {isLoadingAppointments ? (
              <p className="px-2 text-sm text-slate-500">Loading...</p>
            ) : null}

            {!isLoadingAppointments && appointments.length === 0 ? (
              <p className="px-2 text-sm text-slate-500">
                No chat-eligible appointments found.
              </p>
            ) : null}

            {appointments.map((apt) => {
              const isActive =
                String(apt._id) === String(selectedAppointmentId);
              const peerName = getPeerName(apt);
              return (
                <button
                  key={apt._id}
                  type="button"
                  onClick={() => handleAppointmentSelect(apt._id)}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                    isActive
                      ? "bg-brand-600 text-white shadow-md shadow-brand-600/20"
                      : "text-slate-700 hover:bg-brand-50"
                  }`}
                >
                  <Avatar name={peerName} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-slate-900"}`}
                    >
                      {peerName}
                    </p>
                    <p
                      className={`text-xs truncate ${isActive ? "text-brand-100" : "text-slate-400"}`}
                    >
                      {new Date(apt.appointmentDate).toLocaleDateString()} ·{" "}
                      {apt.appointmentTime}
                    </p>
                  </div>
                </button>
              );
            })}
          </aside>

          {/* Messages */}
          <section className="flex flex-col app-card !p-0 overflow-hidden">
            {/* Chat header */}
            <div className="border-b border-brand-100/60 px-5 py-3 flex items-center gap-3">
              {selectedAppointment ? (
                <>
                  <Avatar name={getPeerName(selectedAppointment)} size="sm" />
                  <p className="text-sm font-semibold text-slate-900">
                    {getPeerName(selectedAppointment)}
                  </p>
                </>
              ) : (
                <p className="text-sm text-slate-500">
                  Select a conversation to start
                </p>
              )}
            </div>

            {/* Message list */}
            <div
              className="flex-1 space-y-2 overflow-y-auto bg-gradient-to-b from-white to-brand-50/30 p-4"
              ref={listRef}
            >
              {isLoadingMessages ? (
                <p className="text-sm text-slate-500">Loading messages...</p>
              ) : null}

              {!isLoadingMessages && messages.length === 0 ? (
                <EmptyState
                  title="No messages yet"
                  description="Start the conversation by sending a message below."
                />
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
                          className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                            mine
                              ? "rounded-br-md bg-brand-600 text-white"
                              : "rounded-bl-md border border-brand-100/60 bg-white text-slate-800"
                          }`}
                        >
                          <p className="whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                          <p
                            className={`mt-1 text-[11px] ${mine ? "text-brand-200" : "text-slate-400"}`}
                          >
                            {formatDateTime(message.createdAt)}
                          </p>
                        </article>
                      </div>
                    );
                  })
                : null}
            </div>

            {/* Input */}
            <div className="border-t border-brand-100/60 p-3">
              {error ? (
                <p className="mb-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {error}
                </p>
              ) : null}

              <div className="flex items-center gap-2">
                <input
                  className="app-input !rounded-full"
                  disabled={!selectedAppointmentId || !canSendForSelected}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  placeholder={
                    selectedAppointmentId
                      ? canSendForSelected
                        ? "Type a message..."
                        : "Completed appointments are read-only"
                      : "Select a conversation first"
                  }
                  value={input}
                />
                <button
                  className="btn-primary !rounded-full !px-5 !py-3"
                  disabled={
                    !selectedAppointmentId ||
                    !canSendForSelected ||
                    !input.trim()
                  }
                  onClick={handleSend}
                  type="button"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </section>
        </section>
      </PageTransition>
    </main>
  );
};

export default ChatPage;
