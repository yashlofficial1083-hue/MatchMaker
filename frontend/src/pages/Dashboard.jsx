import { useEffect, useMemo, useState } from "react";
import {
  addNote,
  fetchCustomerDetail,
  fetchCustomers,
  fetchMatches,
  fetchNotes,
  sendMatch,
} from "../services/api";
import { FaUserCircle } from "react-icons/fa";
 
function Dashboard() {
  const [auth, setAuth] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [activeCustomerId, setActiveCustomerId] = useState(null);
  const [activeCustomer, setActiveCustomer] = useState(null);
  const [matches, setMatches] = useState([]);
  const [notes, setNotes] = useState([]);
  const [noteInput, setNoteInput] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);
  const [status, setStatus] = useState({ loading: false, error: "" });
  const [toast, setToast] = useState("");
  const [view, setView] = useState("dashboard");
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [pageInfo, setPageInfo] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 1,
  });

  const customerCount = useMemo(() => pageInfo.total, [pageInfo.total]);

  useEffect(() => {
    const savedAuth = localStorage.getItem("auth");
    if (!savedAuth) {
      window.location.href = "/";
      return;
    }
    setAuth(JSON.parse(savedAuth));
  }, []);

  useEffect(() => {
    if (!auth) return;

    setStatus({ loading: true, error: "" });
    fetchCustomers(auth.id, pageInfo.page, pageInfo.limit)
      .then((data) => {
        setCustomers(data.data || []);
        setPageInfo((prev) => ({
          ...prev,
          page: data.page,
          limit: data.limit,
          total: data.total,
          totalPages: data.totalPages,
        }));
        setActiveCustomerId(null);
        setView("dashboard");
      })
      .catch((error) => {
        setStatus({ loading: false, error: error.message });
      })
      .finally(() => setStatus((prev) => ({ ...prev, loading: false })));
  }, [auth, pageInfo.page, pageInfo.limit]);

  useEffect(() => {
    if (!activeCustomerId) return;

    setStatus({ loading: true, error: "" });
    Promise.all([
      fetchCustomerDetail(activeCustomerId),
      fetchMatches(activeCustomerId),
      fetchNotes(activeCustomerId),
    ])
      .then(([detail, matchData, noteData]) => {
        setActiveCustomer(detail);
        setMatches(matchData);
        setNotes(noteData);
        setNoteInput("");
      })
      .catch((error) => {
        setStatus({ loading: false, error: error.message });
      })
      .finally(() => setStatus((prev) => ({ ...prev, loading: false })));
  }, [activeCustomerId]);

  const handleRowClick = (customerId) => {
    setActiveCustomerId(customerId);
    setView("detail");
  };

  const handlePageChange = (nextPage) => {
    setPageInfo((prev) => ({ ...prev, page: nextPage }));
  };

  const handleSendMatch = async (matchId) => {
    if (!activeCustomer) return;
    try {
      const response = await sendMatch(activeCustomer.id, matchId);
      setToast(`Match sent: ${response.subject}`);
      setTimeout(() => setToast(""), 3200);
    } catch (error) {
      setToast("Failed to send match");
      setTimeout(() => setToast(""), 3200);
    }
  };

  const handleAddNote = async () => {
    const trimmed = noteInput.trim();
    if (!trimmed || !activeCustomerId) return;

    setNotesLoading(true);
    try {
      const newNote = await addNote(activeCustomerId, trimmed);
      setNotes((prev) => [newNote, ...prev]);
      setNoteInput("");
      setToast("Note saved");
      setTimeout(() => setToast(""), 2200);
    } catch (error) {
      setToast("Failed to save note");
      setTimeout(() => setToast(""), 2200);
    } finally {
      setNotesLoading(false);
    }
  };

  const computeAge = (dateOfBirth) => {
    const dob = new Date(dateOfBirth);
    const diff = Date.now() - dob.getTime();
    const ageDate = new Date(diff);
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat("en-IN").format(value);
  };

  const formatDate = (value) => {
    const date = new Date(value);
    return new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (!auth) return null;

  return (
    <main className="mx-auto max-w-6xl px-6 pb-16 pt-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
            Matchmaker Dashboard
          </p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900">
            Client Overview
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <button
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="text-4xl text-blue-600 cursor-pointer transition hover:text-blue-800"
            >
              <FaUserCircle />
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 rounded-xl border border-slate-200 bg-white shadow-lg">
                <div className="border-b p-4">
                  <p className="font-semibold text-slate-800">{auth.name}</p>
                  <p className="text-sm text-slate-500">Matchmaker</p>
                </div>

                <button className="w-full px-4 py-3 text-left text-sm hover:bg-slate-100">
                  Profile
                </button>

                <button className="w-full px-4 py-3 text-left text-sm hover:bg-slate-100">
                  Settings
                </button>

                <button
                  onClick={() => {
                    localStorage.removeItem("auth");
                    window.location.href = "/";
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {view === "dashboard" && (
        <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Assigned clients
              </h2>
              <p className="text-sm text-slate-500">
                Click a row to open detailed matchmaking view.
              </p>
            </div>
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-900">
              {customerCount} profiles
            </span>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Age</th>
                  <th className="px-4 py-3">City</th>
                  <th className="px-4 py-3">Marital Status</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {status.loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-slate-400"
                    >
                      Loading clients...
                    </td>
                  </tr>
                )}

                {customers.length === 0 && !status.loading && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-10 text-center text-sm text-slate-400"
                    >
                      No clients found for this matchmaker.
                    </td>
                  </tr>
                )}

                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="cursor-pointer border-b border-slate-100 transition hover:bg-slate-50"
                    onClick={() => handleRowClick(customer.id)}
                  >
                    <td className="px-4 py-4 font-semibold text-slate-900">
                      {customer.firstName} {customer.lastName}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {computeAge(customer.dateOfBirth)}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {customer.city}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {customer.maritalStatus}
                    </td>
                    <td className="px-4 py-4">
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-xs font-semibold text-amber-900">
                        {customer.statusTag}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
            <p>
              Showing page {pageInfo.page} of {pageInfo.totalPages} ·{" "}
              {pageInfo.total} total
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(Math.max(pageInfo.page - 1, 1))}
                disabled={pageInfo.page <= 1}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() =>
                  handlePageChange(
                    Math.min(pageInfo.page + 1, pageInfo.totalPages),
                  )
                }
                disabled={pageInfo.page >= pageInfo.totalPages}
                className="rounded-full border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </section>
      )}

      {view === "detail" && activeCustomer && (
        <section className="mt-8 space-y-6">
          <button
            onClick={() => setView("dashboard")}
            className="text-sm font-semibold text-amber-700"
          >
            ← Back to client list
          </button>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-semibold text-slate-900">
                  {activeCustomer.firstName} {activeCustomer.lastName}
                </h2>
                <p className="text-sm text-slate-500">
                  {activeCustomer.designation} · {activeCustomer.currentCompany}
                </p>
              </div>
              <span className="rounded-full bg-amber-900 px-3 py-1 text-xs font-semibold text-white">
                {activeCustomer.statusTag}
              </span>
            </div>

            <div className="mt-6 grid gap-3 text-sm text-slate-700 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Age
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {computeAge(activeCustomer.dateOfBirth)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  City
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activeCustomer.city}, {activeCustomer.country}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Height
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activeCustomer.heightCm} cm
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Marital Status
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activeCustomer.maritalStatus}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Degree
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activeCustomer.degree} ·{" "}
                  {activeCustomer.undergraduateCollege}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Income
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  INR {formatNumber(activeCustomer.income)}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Languages
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activeCustomer.languagesKnown.join(", ")}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Caste/Religion
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activeCustomer.caste} · {activeCustomer.religion}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Kids
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activeCustomer.wantKids}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Relocate
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activeCustomer.openToRelocate}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Pets
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activeCustomer.openToPets}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.25em] text-slate-400">
                  Siblings
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-900">
                  {activeCustomer.siblings}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <h3 className="text-lg font-semibold text-slate-900">
                Suggested matches
              </h3>
              <p className="text-sm text-slate-500">
                Ranked by rule-based AI explanation.
              </p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">
                          {match.firstName} {match.lastName}
                        </p>
                        <p className="text-xs text-slate-500">
                          {match.city} · {computeAge(match.dateOfBirth)} yrs ·{" "}
                          {match.heightCm} cm
                        </p>
                      </div>
                      <span className="rounded-full bg-emerald-100 px-2 py-1 text-[11px] font-semibold text-emerald-800">
                        {match.score} pts
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">
                      {match.explanation}
                    </p>
                    <button
                      onClick={() => handleSendMatch(match.id)}
                      className="mt-4 w-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white"
                    >
                      Send match
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">
                  Quick notes
                </h3>
                {notesLoading && (
                  <span className="text-xs text-slate-400">Saving...</span>
                )}
              </div>

              <textarea
                rows={3}
                value={noteInput}
                onChange={(e) => setNoteInput(e.target.value)}
                placeholder="Add call notes or follow-up details"
                className="mt-3 w-full resize-none rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-amber-500 focus:outline-none"
              />

              <div className="mt-3 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {notes.length} notes saved
                </p>
                <button
                  onClick={handleAddNote}
                  className="rounded-xl bg-amber-900 px-4 py-2 text-xs font-semibold text-white"
                >
                  Save note
                </button>
              </div>

              <div className="mt-4 space-y-2">
                {notes.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    No notes yet. Add the first note for this client.
                  </p>
                ) : (
                  notes.slice(0, 6).map((note) => (
                    <div
                      key={note.id}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <p className="text-xs text-slate-700">{note.text}</p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        {formatDate(note.createdAt)}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>
      )}

      {toast && (
        <div className="fixed bottom-6 right-6 rounded-2xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl">
          {toast}
        </div>
      )}
    </main>
  );
}

export default Dashboard;
