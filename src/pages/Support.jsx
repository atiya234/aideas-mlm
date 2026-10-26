
import { useEffect, useState } from "react";
import { apiFetch } from "../api/apiFetch";

function Support() {
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [tickets, setTickets] = useState([]);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // Fetch support tickets from Django
    const loadTickets = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await apiFetch("/api/support/tickets/");

            if (!response.ok) {
                throw new Error("Unable to load support tickets.");
            }

            const data = await response.json();

            setTickets(
                Array.isArray(data)
                    ? data
                    : Array.isArray(data.results)
                    ? data.results
                    : []
            );
        } catch (err) {
            console.error("Support tickets error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Load tickets when component mounts
    useEffect(() => {
        loadTickets();
    }, []);

    // Submit a new support ticket
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!subject.trim() || !message.trim()) {
            setError("Please fill in all details.");
            return;
        }

        if (submitting) return;

        try {
            setSubmitting(true);
            setError("");
            setSuccess("");

            const response = await apiFetch("/api/support/tickets/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    subject: subject.trim(),
                    message: message.trim(),
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.detail ||
                    data.subject?.[0] ||
                    data.message?.[0] ||
                    "Unable to submit ticket."
                );
            }

            setTickets((prev) => [data, ...prev]);

            setSubject("");
            setMessage("");

            setSuccess("Ticket submitted successfully!");
        } catch (err) {
            console.error("Support submission error:", err);
            setError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-4 md:p-8">
            <h1 className="text-2xl font-bold text-slate-800">
                Support Center
            </h1>

            <p className="mt-2 text-sm text-slate-500">
                Raise support requests and track their status.
            </p>

            {/* CREATE SUPPORT TICKET */}
            <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
                <h2 className="text-lg font-bold text-slate-800">
                    Create Support Ticket
                </h2>

                <input
                    type="text"
                    placeholder="Enter subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    maxLength={200}
                    required
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
                />

                <textarea
                    placeholder="Describe your issue"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    required
                    className="w-full rounded-xl border border-slate-200 p-3 outline-none focus:border-indigo-500"
                />

                {error && (
                    <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">
                        {error}
                    </p>
                )}

                {success && (
                    <p className="rounded-xl bg-green-50 p-3 text-sm text-green-700">
                        {success}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={submitting}
                    className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {submitting ? "Submitting..." : "Submit Ticket"}
                </button>
            </form>

            {/* SUPPORT TICKET HISTORY */}
            <section className="mt-8">
                <h2 className="text-lg font-bold text-slate-800">
                    My Support Tickets
                </h2>

                {loading ? (
                    <p className="mt-4 text-slate-500">
                        Loading tickets...
                    </p>
                ) : tickets.length === 0 ? (
                    <p className="mt-4 text-slate-500">
                        No tickets submitted yet.
                    </p>
                ) : (
                    <div className="mt-4 space-y-3">
                        {tickets.map((ticket) => (
                            <div
                                key={ticket.id}
                                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
                            >
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <h3 className="font-bold text-slate-800">
                                        {ticket.subject}
                                    </h3>

                                    <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                                        {ticket.status
                                            ?.replaceAll("_", " ")
                                            .toUpperCase()}
                                    </span>
                                </div>

                                <p className="mt-3 whitespace-pre-wrap text-sm text-slate-600">
                                    {ticket.message}
                                </p>

                                <p className="mt-3 text-xs text-slate-400">
                                    Submitted:{" "}
                                    {new Date(
                                        ticket.created_at
                                    ).toLocaleString()}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

export default Support;
