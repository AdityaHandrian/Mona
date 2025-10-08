import React, { useMemo, useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

// ---------- Helper utils ----------
const formatIDR = (value) => {
  if (typeof value !== 'number') return value;
  return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
};

const percent = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// ---------- Icon set (improved SVGs) ----------
const Icon = {
  Plus: ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Edit: ({ className = 'w-4 h-4' }) => (
    // cleaner pencil
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 21l3-1 11-11 1-3-3 1L4 20z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 5l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Trash: ({ className = 'w-4 h-4' }) => (
    // more classic trash can
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M3 6h18" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 6V4a2 2 0 0 1 2-2h0a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Check: ({ className = 'w-4 h-4' }) => (
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Warning: ({ className = 'w-4 h-4' }) => (
    // sharper warning triangle with centered exclamation
    <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <path d="M10.29 3.86L1.82 18a1 1 0 0 0 .86 1.5h18.64a1 1 0 0 0 .86-1.5L13.71 3.86a1 1 0 0 0-1.42 0z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 16h.01" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
};

// ---------- Component ----------
export default function Budget({ auth }) {
  const currentDate = new Date();
  const currentMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
  const currentYear = currentDate.getFullYear();

  const [budgets, setBudgets] = useState([
    { id: 1, title: 'Food & Dining', category: 'Food & Dining', budget: 14200000, spent: 11700000, month: currentMonth, year: currentYear },
    { id: 2, title: 'Transportation', category: 'Transportation', budget: 5000000, spent: 7000000, month: currentMonth, year: currentYear },
    { id: 3, title: 'Entertainment', category: 'Entertainment', budget: 3300000, spent: 2000000, month: currentMonth, year: currentYear },
    { id: 4, title: 'Shopping', category: 'Shopping', budget: 8250000, spent: 6250000, month: currentMonth, year: currentYear },
  ]);

  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ category: '', budget: '', spent: '', month: '', year: '' });

  // Expense categories
  const expenseCategories = [
    'Food & Dining',
    'Transportation', 
    'Entertainment',
    'Shopping',
    'Bills & Utilities',
    'Healthcare',
    'Education',
    'Travel',
    'Groceries',
    'Personal Care',
    'Other'
  ];

  // Generate months and years for dropdowns
  const months = [
    { value: '01', label: 'January' },
    { value: '02', label: 'February' },
    { value: '03', label: 'March' },
    { value: '04', label: 'April' },
    { value: '05', label: 'May' },
    { value: '06', label: 'June' },
    { value: '07', label: 'July' },
    { value: '08', label: 'August' },
    { value: '09', label: 'September' },
    { value: '10', label: 'October' },
    { value: '11', label: 'November' },
    { value: '12', label: 'December' }
  ];

  const years = Array.from({ length: 10 }, (_, i) => currentYear + i);

  // Validation function for date
  const isDateValid = (month, year) => {
    const selectedYear = parseInt(year);
    const selectedMonth = parseInt(month);
    const currentMonthNum = parseInt(currentMonth);
    
    if (!month || !year) return true; // Don't show error if incomplete
    
    if (selectedYear < currentYear) return false;
    if (selectedYear === currentYear && selectedMonth < currentMonthNum) return false;
    
    return true;
  };

  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((s, b) => s + b.budget, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const overCategories = budgets.filter((b) => b.spent > b.budget).length;
    return { totalBudget, totalSpent, overCategories };
  }, [budgets]);

  function openNew() {
    setEditing(null);
    setForm({ category: '', budget: '', spent: '', month: '', year: '' });
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ 
      category: item.category || '', 
      budget: item.budget, 
      spent: item.spent,
      month: item.month || '',
      year: item.year || ''
    });
    setModalOpen(true);
  }

  function save() {
    const parsed = { 
      title: `${form.category}`, // Use category as title
      category: form.category,
      budget: Number(form.budget || 0), 
      spent: Number(form.spent || 0),
      month: form.month,
      year: form.year
    };
    if (editing) {
      setBudgets((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...parsed } : p)));
    } else {
      setBudgets((prev) => [...prev, { id: Date.now(), ...parsed }]);
    }
    setModalOpen(false);
  }

  function remove(id) {
    if (!confirm('Hapus budget ini?')) return;
    setBudgets((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <AppLayout title="MONA - Budget" auth={auth}>
      <Head title="Budget" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-warm-ivory rounded-md">
            {/* Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Budget Manager</h1>
                <p className="text-gray-600">Set and track your spending limits</p>
              </div>
              <button
                onClick={openNew}
                className="inline-flex items-center gap-2 bg-black text-white rounded-full px-5 py-2 font-medium shadow-md transform transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-black"
              >
                <Icon.Plus className="w-4 h-4" />
                New Budget
              </button>
            </div>

            {/* top metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card>
                <div className="text-lg font-semibold">Total Budget</div>
                <div className="text-2xl text-green-700 font-semibold mt-4">{formatIDR(totals.totalBudget)}</div>
                <div className="text-gray-400 mt-3">for this month</div>
              </Card>

              <Card>
                <div className="text-lg font-semibold">Total Spent</div>
                <div className="text-2xl text-red-600 font-semibold mt-4">{formatIDR(totals.totalSpent)}</div>
                <div className="text-gray-400 mt-3">{percent(totals.totalSpent, totals.totalBudget)}% from this month budget</div>
              </Card>

              <Card>
                <div className="text-lg font-semibold">Over Budget</div>
                <div className="text-2xl text-orange-600 font-semibold mt-4">{totals.overCategories}</div>
                <div className="text-gray-400 mt-3">Categories</div>
              </Card>
            </div>

            {/* budget cards grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-10">
              {budgets.map((b) => {
                const pct = percent(b.spent, b.budget);
                const isOver = b.spent > b.budget;
                const remaining = b.budget - b.spent;
                const statusColor = isOver ? 'text-red-600' : pct >= 80 ? 'text-orange-500' : 'text-green-600';

                return (
                  // group enables child elements to react to hover
                  <div key={b.id} className="group bg-white rounded-xl p-6 shadow-sm transform transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold">{b.category || b.title}</h3>
                        <div className="text-gray-400 text-sm">
                          {b.month && b.year ? `Ends in: ${months.find(m => m.value === b.month)?.label || 'Month'} ${b.year}` : 'Budget Period'}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-gray-600">
                        <div
                          className={`p-1 rounded-full border transition-colors duration-200 ${
                            isOver 
                              ? 'border-red-200 text-red-600 bg-red-50' 
                              : pct >= 80 
                                ? 'border-orange-200 text-orange-500 bg-orange-50' 
                                : 'border-green-200 text-green-600 bg-green-50'
                          }`}
                          title={isOver ? 'Over budget' : pct >= 80 ? 'Warning' : 'Healthy'}
                        >
                          {isOver ? <Icon.Warning /> : pct >= 80 ? <Icon.Warning /> : <Icon.Check />}
                        </div>

                        {/* action buttons: fade/slide-in on card hover */}
                        <div className="flex items-center gap-2 opacity-80 transition-all duration-200">
                          <button
                            onClick={() => openEdit(b)}
                            className="p-1 rounded-md hover:bg-gray-100 hover:text-black transform transition-transform duration-150 hover:-translate-y-0.5 focus:outline-none"
                            title="Edit"
                          >
                            <Icon.Edit />
                          </button>

                          <button
                            onClick={() => remove(b.id)}
                            className="p-1 rounded-md hover:bg-gray-100 hover:text-red-600 transform transition-transform duration-150 hover:-translate-y-0.5 focus:outline-none"
                            title="Delete"
                          >
                            <Icon.Trash />
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6">
                      <div className="flex justify-between text-sm text-gray-700 mb-2">
                        <span>Spent</span>
                        <span className="font-semibold">{formatIDR(b.spent)}</span>
                      </div>

                      <div className="bg-gray-100 rounded-full h-2 w-full overflow-hidden">
                        <div
                          className="h-2 rounded-full transition-all duration-700 ease-out"
                          style={{
                            width: `${Math.min(pct, 200)}%`,
                            background: isOver 
                              ? 'linear-gradient(90deg,#DC2626,#991B1B)' 
                              : pct >= 80 
                                ? 'linear-gradient(90deg,#F59E0B,#D97706)' 
                                : 'linear-gradient(90deg,#10B981,#047857)',
                          }}
                        />
                      </div>

                      <div className="flex justify-between items-center mt-3 text-sm">
                        <div className="text-gray-500">
                          {isOver ? `${formatIDR(Math.abs(remaining))} over budget` : `${formatIDR(Math.abs(remaining))} remaining`}
                        </div>
                        <div className={`${statusColor} font-semibold`}>{pct}%</div>
                      </div>

                      <div className="text-gray-300 text-xs mt-3">Budget: {formatIDR(b.budget)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* modal */}
            {isModalOpen && (
              <div className="fixed inset-0 z-40 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
                <div className="relative bg-white rounded-lg p-6 w-full max-w-lg shadow-lg">
                  <h4 className="text-xl font-semibold mb-6">{editing ? 'Edit Budget' : 'Create New Budget'}</h4>
                  <div className="space-y-4">
                    {/* Category */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Category*</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      >
                        <option value="">Select a category</option>
                        {expenseCategories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Budget Period */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Budget Period*</label>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Month Selector */}
                        <select
                          value={form.month}
                          onChange={(e) => setForm((s) => ({ ...s, month: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          required
                        >
                          <option value="">Select a Month</option>
                          {months.map((month) => (
                            <option key={month.value} value={month.value}>
                              {month.label}
                            </option>
                          ))}
                        </select>

                        {/* Year Input */}
                        <input
                          type="number"
                          value={form.year}
                          onChange={(e) => setForm((s) => ({ ...s, year: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="Enter year"
                          min={currentYear}
                          required
                        />
                      </div>
                      
                      {/* Date validation error */}
                      {form.month && form.year && !isDateValid(form.month, form.year) && (
                        <div className="mt-2 text-sm text-red-600 flex items-center gap-1">
                          <Icon.Warning className="w-4 h-4" />
                          Date invalid - Cannot select a past date
                        </div>
                      )}
                    </div>

                    {/* Budget Amount */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Budget Amount*</label>
                      <input 
                        value={form.budget} 
                        onChange={(e) => setForm((s) => ({ ...s, budget: e.target.value }))} 
                        type="number" 
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="0"
                        min="0"
                        required
                      />
                    </div>

                    {/* Current Spent (only show when editing) */}
                    {editing && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Current Spent</label>
                        <input 
                          value={form.spent} 
                          onChange={(e) => setForm((s) => ({ ...s, spent: e.target.value }))} 
                          type="number" 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                          placeholder="0"
                          min="0"
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-3 pt-6">
                      <button 
                        onClick={() => setModalOpen(false)} 
                        className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={save} 
                        className="px-6 py-2 rounded-lg bg-black text-white hover:bg-gray-800 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={!form.category || !form.budget || !form.month || !form.year || !isDateValid(form.month, form.year)}
                      >
                        {editing ? 'Update Budget' : 'Create Budget'}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    </AppLayout>
  );
}

// ---------- small presentational component ----------
function Card({ children }) {
  return <div className="bg-white rounded-xl p-6 shadow-sm">{children}</div>;
}