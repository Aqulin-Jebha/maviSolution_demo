import { useState, useEffect, useRef } from "react";

// ─── Color palette & design tokens are via Tailwind ──────────────────────────

const ICONS = {
  cricket: "🏏",
  travel: "✈️",
  food: "🍕",
  shopping: "🛍️",
  party: "🎉",
  other: "💼",
};

const CATEGORY_COLORS = {
  cricket: { bg: "from-yellow-400 to-orange-500", badge: "bg-yellow-100 text-yellow-800", dot: "bg-orange-400" },
  travel: { bg: "from-sky-400 to-blue-600", badge: "bg-sky-100 text-sky-800", dot: "bg-sky-400" },
  food: { bg: "from-rose-400 to-pink-600", badge: "bg-rose-100 text-rose-800", dot: "bg-rose-400" },
  shopping: { bg: "from-purple-400 to-violet-600", badge: "bg-purple-100 text-purple-800", dot: "bg-purple-400" },
  party: { bg: "from-emerald-400 to-teal-600", badge: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-400" },
  other: { bg: "from-slate-400 to-gray-600", badge: "bg-slate-100 text-slate-800", dot: "bg-slate-400" },
};

const INITIAL_GROUPS = [
  { id: 1, name: "CSK Cricket Team", icon: "cricket", description: "Ticket fees & match expenses", color: CATEGORY_COLORS.cricket },
  { id: 2, name: "College Tour 2025", icon: "travel", description: "Travel & accommodation", color: CATEGORY_COLORS.travel },
  { id: 3, name: "Birthday Party 🎂", icon: "party", description: "Celebration & food expenses", color: CATEGORY_COLORS.party },
];

const INITIAL_EXPENSES = [
  { id: 1, groupId: 1, amount: 1200, description: "Match tickets - MI vs CSK", date: "2025-05-10", category: "cricket" },
  { id: 2, groupId: 1, amount: 340, description: "Snacks & beverages", date: "2025-05-10", category: "food" },
  { id: 3, groupId: 2, amount: 4500, description: "Bus hire - Ooty trip", date: "2025-05-14", category: "travel" },
  { id: 4, groupId: 2, amount: 1800, description: "Hotel stay (2 nights)", date: "2025-05-15", category: "travel" },
  { id: 5, groupId: 3, amount: 2200, description: "Cake & decorations", date: "2025-05-18", category: "party" },
  { id: 6, groupId: 3, amount: 960, description: "Gift for birthday person", date: "2025-05-18", category: "shopping" },
];

// ─── Utility ─────────────────────────────────────────────────────────────────
const fmt = (n) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
const fmtDate = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
let nextId = 100;

// ─── GroupCard ────────────────────────────────────────────────────────────────
function GroupCard({ group, expenses, isActive, onClick }) {
  const groupExpenses = expenses.filter((e) => e.groupId === group.id);
  const total = groupExpenses.reduce((s, e) => s + e.amount, 0);
  const count = groupExpenses.length;

  return (
    <button
      onClick={() => onClick(group.id)}
      className={`relative w-full text-left rounded-2xl overflow-hidden transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-400 ${
        isActive ? "ring-2 ring-offset-2 ring-indigo-500 scale-[1.02]" : ""
      }`}
    >
      {/* gradient header */}
      <div className={`bg-gradient-to-br ${group.color.bg} p-5 pb-8`}>
        <div className="flex items-start justify-between">
          <span className="text-4xl drop-shadow">{ICONS[group.icon]}</span>
          {isActive && (
            <span className="text-xs font-bold bg-white/30 text-white rounded-full px-2 py-0.5 backdrop-blur-sm">
              Active
            </span>
          )}
        </div>
        <h3 className="mt-3 text-white font-black text-lg leading-tight drop-shadow">{group.name}</h3>
        <p className="text-white/80 text-xs mt-0.5">{group.description}</p>
      </div>
      {/* stats strip */}
      <div className="bg-white -mt-4 mx-3 rounded-xl px-4 py-3 shadow-lg flex items-center justify-between">
        <div>
          <p className="text-2xl font-black text-slate-800">{fmt(total)}</p>
          <p className="text-xs text-slate-400 font-medium">{count} transaction{count !== 1 ? "s" : ""}</p>
        </div>
        <div className={`w-9 h-9 rounded-full ${group.color.dot} flex items-center justify-center text-white text-sm font-bold shadow`}>
          {count}
        </div>
      </div>
    </button>
  );
}

// ─── ExpenseRow ───────────────────────────────────────────────────────────────
function ExpenseRow({ expense, onDelete }) {
  const col = CATEGORY_COLORS[expense.category] || CATEGORY_COLORS.other;
  return (
    <div className="flex items-center gap-3 bg-white rounded-xl px-4 py-3 shadow-sm hover:shadow-md transition-shadow group">
      <span className="text-xl">{ICONS[expense.category] || ICONS.other}</span>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-slate-800 text-sm truncate">{expense.description}</p>
        <p className="text-xs text-slate-400">{fmtDate(expense.date)}</p>
      </div>
      <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${col.badge}`}>
        {expense.category}
      </span>
      <p className="font-black text-slate-800 text-sm whitespace-nowrap">{fmt(expense.amount)}</p>
      <button
        onClick={() => onDelete(expense.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-rose-400 ml-1"
        title="Delete"
      >
        ✕
      </button>
    </div>
  );
}

// ─── AddExpenseForm ───────────────────────────────────────────────────────────
function AddExpenseForm({ activeGroupId, groups, onAdd }) {
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [category, setCategory] = useState("food");
  const [groupId, setGroupId] = useState(activeGroupId || (groups[0]?.id ?? 1));
  const [shake, setShake] = useState(false);
  const [success, setSuccess] = useState(false);
  const amountRef = useRef();

  useEffect(() => {
    if (activeGroupId) setGroupId(activeGroupId);
  }, [activeGroupId]);

  const handleSubmit = () => {
    if (!amount || isNaN(amount) || Number(amount) <= 0 || !description.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      return;
    }
    onAdd({ groupId: Number(groupId), amount: Number(amount), description: description.trim(), date, category });
    setAmount("");
    setDescription("");
    setCategory("food");
    setSuccess(true);
    setTimeout(() => setSuccess(false), 1800);
    amountRef.current?.focus();
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 transition-transform ${shake ? "animate-[shake_0.4s_ease]" : ""}`}>
      <h2 className="font-black text-slate-800 text-lg mb-4 flex items-center gap-2">
        <span className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center text-white text-sm">+</span>
        Add Expense
      </h2>

      <div className="grid grid-cols-2 gap-3">
        {/* Group selector */}
        <div className="col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Group</label>
          <select
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-400 transition-colors"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>{ICONS[g.icon]} {g.name}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Amount (₹)</label>
          <input
            ref={amountRef}
            type="number"
            min="1"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-400 transition-colors placeholder:text-slate-300"
          />
        </div>

        {/* Date */}
        <div>
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-400 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 block">Description</label>
          <input
            type="text"
            placeholder="What was this expense for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            className="w-full border-2 border-slate-100 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 bg-slate-50 focus:outline-none focus:border-indigo-400 transition-colors placeholder:text-slate-300"
          />
        </div>

        {/* Category pills */}
        <div className="col-span-2">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2 block">Category</label>
          <div className="flex flex-wrap gap-2">
            {Object.keys(ICONS).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border-2 transition-all ${
                  category === cat
                    ? "bg-indigo-600 border-indigo-600 text-white shadow-md scale-105"
                    : "border-slate-200 text-slate-500 hover:border-indigo-300"
                }`}
              >
                {ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      <button
        onClick={handleSubmit}
        className={`mt-5 w-full py-3 rounded-xl font-black text-sm tracking-wide transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 ${
          success
            ? "bg-emerald-500 text-white"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        }`}
      >
        {success ? "✓ Expense Added!" : "Add Expense →"}
      </button>
    </div>
  );
}

// ─── SummaryModal ─────────────────────────────────────────────────────────────
function SummaryModal({ expenses, groups, onClose }) {
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const latest = [...expenses].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
  const byGroup = groups.map((g) => {
    const gExp = expenses.filter((e) => e.groupId === g.id);
    return { ...g, total: gExp.reduce((s, e) => s + e.amount, 0), count: gExp.length };
  }).sort((a, b) => b.total - a.total);

  const byCategory = Object.keys(ICONS).map((cat) => {
    const catExp = expenses.filter((e) => e.category === cat);
    return { cat, total: catExp.reduce((s, e) => s + e.amount, 0), count: catExp.length };
  }).filter((c) => c.count > 0).sort((a, b) => b.total - a.total);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease]">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-[slideUp_0.3s_ease]">
        {/* Header */}
        <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-t-3xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-indigo-200 text-xs font-bold uppercase tracking-widest">Expenses Summary</p>
              <p className="text-4xl font-black mt-1">{fmt(total)}</p>
              <p className="text-indigo-200 text-sm mt-0.5">{expenses.length} total transactions</p>
            </div>
            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white font-bold"
            >
              ✕
            </button>
          </div>

          {/* Quick stats */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {[
              { label: "Groups", value: groups.length },
              { label: "This Month", value: fmt(expenses.filter(e => e.date.startsWith("2025-05")).reduce((s,e)=>s+e.amount,0)) },
              { label: "Avg/Txn", value: fmt(total / (expenses.length || 1)) },
            ].map((s) => (
              <div key={s.label} className="bg-white/15 rounded-xl p-2.5 text-center">
                <p className="font-black text-white text-base">{s.value}</p>
                <p className="text-indigo-200 text-[10px] font-bold uppercase">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="p-5 space-y-5">
          {/* Latest expense */}
          {latest && (
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Latest Transaction</h3>
              <div className="bg-slate-50 rounded-xl p-3 flex items-center gap-3">
                <span className="text-2xl">{ICONS[latest.category] || "💼"}</span>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{latest.description}</p>
                  <p className="text-xs text-slate-400">{fmtDate(latest.date)}</p>
                </div>
                <p className="font-black text-slate-800">{fmt(latest.amount)}</p>
              </div>
            </div>
          )}

          {/* By group */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">By Group</h3>
            <div className="space-y-2">
              {byGroup.map((g) => (
                <div key={g.id} className="flex items-center gap-3">
                  <span className="text-lg">{ICONS[g.icon]}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm font-semibold text-slate-700">
                      <span>{g.name}</span>
                      <span>{fmt(g.total)}</span>
                    </div>
                    <div className="mt-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${g.color.bg} transition-all duration-700`}
                        style={{ width: `${total ? (g.total / total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* By category */}
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">By Category</h3>
            <div className="flex flex-wrap gap-2">
              {byCategory.map(({ cat, total: ct, count }) => {
                const col = CATEGORY_COLORS[cat] || CATEGORY_COLORS.other;
                return (
                  <div key={cat} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold ${col.badge}`}>
                    {ICONS[cat]} {cat} · {fmt(ct)} ({count})
                  </div>
                );
              })}
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm tracking-wide transition-colors shadow-md"
          >
            Close Summary
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [groups] = useState(INITIAL_GROUPS);
  const [expenses, setExpenses] = useState(INITIAL_EXPENSES);
  const [activeGroupId, setActiveGroupId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");

  const handleGroupClick = (id) => {
    setActiveGroupId((prev) => (prev === id ? null : id));
  };

  const handleAddExpense = (exp) => {
    setExpenses((prev) => [...prev, { ...exp, id: ++nextId }]);
  };

  const handleDelete = (id) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const visibleExpenses = expenses
    .filter((e) => (activeGroupId ? e.groupId === activeGroupId : true))
    .filter((e) =>
      search
        ? e.description.toLowerCase().includes(search.toLowerCase()) ||
          e.category.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date));

  const grandTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="min-h-screen bg-slate-100 font-sans">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800;900&display=swap');
        * { font-family: 'Sora', sans-serif; }
        @keyframes fadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes slideUp { from { transform:translateY(24px); opacity:0 } to { transform:translateY(0); opacity:1 } }
        @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-6px)} 40%,80%{transform:translateX(6px)} }
      `}</style>

      {/* Navbar */}
      <nav className="bg-white border-b border-slate-100 shadow-sm sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center text-white font-black text-sm shadow">
              💰
            </div>
            <span className="font-black text-slate-800 text-lg tracking-tight">SplitMate</span>
            <span className="hidden sm:block text-xs font-semibold bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-full">beta</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-slate-50 rounded-full px-3 py-1.5 gap-1 border border-slate-100">
              <span className="text-slate-400 text-sm">Total:</span>
              <span className="font-black text-slate-800 text-sm">{fmt(grandTotal)}</span>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs px-4 py-2 rounded-full transition-colors shadow-md hover:shadow-lg"
            >
              Expenses Summary
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Group cards */}
        <section>
          <h2 className="font-black text-slate-700 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
            <span className="h-px flex-1 bg-slate-200" />
            Your Groups
            <span className="h-px flex-1 bg-slate-200" />
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {groups.map((g) => (
              <GroupCard
                key={g.id}
                group={g}
                expenses={expenses}
                isActive={activeGroupId === g.id}
                onClick={handleGroupClick}
              />
            ))}
          </div>
          {activeGroupId && (
            <button
              onClick={() => setActiveGroupId(null)}
              className="mt-2 text-xs text-indigo-500 hover:text-indigo-700 font-semibold underline underline-offset-2"
            >
              ← Show all groups
            </button>
          )}
        </section>

        {/* Main two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 items-start">
          {/* Expense list */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="Search expenses…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-white border-2 border-slate-100 rounded-xl px-4 py-2.5 text-sm text-slate-700 font-semibold placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 transition-colors shadow-sm"
              />
              <span className="text-xs font-bold text-slate-400 whitespace-nowrap">
                {visibleExpenses.length} result{visibleExpenses.length !== 1 ? "s" : ""}
              </span>
            </div>

            {visibleExpenses.length === 0 ? (
              <div className="bg-white rounded-2xl p-10 text-center shadow-sm">
                <p className="text-4xl mb-2">🧾</p>
                <p className="font-bold text-slate-500">No expenses yet</p>
                <p className="text-sm text-slate-400 mt-1">Add your first expense using the form →</p>
              </div>
            ) : (
              <div className="space-y-2">
                {visibleExpenses.map((e) => (
                  <ExpenseRow key={e.id} expense={e} onDelete={handleDelete} />
                ))}
              </div>
            )}

            {/* Footer total */}
            {visibleExpenses.length > 0 && (
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg">
                <div>
                  <p className="text-indigo-200 text-xs font-bold uppercase tracking-wide">
                    {activeGroupId ? groups.find(g=>g.id===activeGroupId)?.name : "Grand Total"}
                  </p>
                  <p className="text-white font-black text-2xl">
                    {fmt(visibleExpenses.reduce((s, e) => s + e.amount, 0))}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-200 text-xs">{visibleExpenses.length} transactions</p>
                  <button
                    onClick={() => setShowModal(true)}
                    className="mt-1 text-xs font-bold text-white underline underline-offset-2 hover:text-indigo-200 transition-colors"
                  >
                    View Summary →
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Add form */}
          <aside className="lg:sticky lg:top-20">
            <AddExpenseForm
              activeGroupId={activeGroupId}
              groups={groups}
              onAdd={handleAddExpense}
            />
          </aside>
        </div>
      </main>

      {/* Modal */}
      {showModal && (
        <SummaryModal
          expenses={expenses}
          groups={groups}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
}
 