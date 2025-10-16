import React, { useMemo, useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, useForm, router, usePage } from '@inertiajs/react';

// ---------- Helper utils ----------
const formatIDR = (value) => {
  if (typeof value !== 'number') return value;
  return value.toLocaleString('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 });
};

const percent = (value, total) => {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
};

// Helper functions for number formatting
const formatNumberWithDots = (value) => {
  // Handle empty or undefined values
  if (!value) return '';
  // Remove all non-digits
  const digits = String(value).replace(/\D/g, '');
  
  // Add dots every 3 digits from right to left
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseFormattedNumber = (formattedValue) => {
  // Remove dots to get raw number
  return formattedValue.replace(/\./g, '');
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
export default function Budget() {
  // Get ALL props from Inertia page
  const { props } = usePage();
  const { 
    auth,
    budgets: initialBudgets = [], 
    categories = [], 
    selectedMonth, 
    selectedYear, 
    isCurrentMonth = true, 
    currentMonth, 
    currentYear,
    flash = {}
  } = props;

  const [budgets, setBudgets] = useState(initialBudgets);
  const [isModalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  
  // Debug - log everything we receive
  useEffect(() => {
    console.log('ALL PROPS from usePage:', props);
    console.log('Destructured values:', {
      budgets: initialBudgets,
      selectedMonth,
      selectedYear,
      isCurrentMonth,
      currentMonth,
      currentYear,
      categories
    });
  }, [props]);
  
  // Ensure we have valid default values
  const safeCurrentMonth = currentMonth || String(new Date().getMonth() + 1).padStart(2, '0');
  const safeCurrentYear = currentYear || new Date().getFullYear();
  
  const [viewMonth, setViewMonth] = useState(selectedMonth || safeCurrentMonth);
  const [viewYear, setViewYear] = useState(selectedYear || safeCurrentYear);

  const { data: form, setData: setForm, post, put, delete: destroy, processing, errors, reset } = useForm({
    category: '',
    budget: ''
  });

  // Update budgets when props change
  useEffect(() => {
    console.log('Budget props received:', {
      budgets: initialBudgets,
      selectedMonth,
      selectedYear,
      isCurrentMonth,
      currentMonth,
      currentYear
    });
    setBudgets(initialBudgets);
  }, [initialBudgets]);

  // Show toast notifications
  useEffect(() => {
    if (flash.success) {
      setToastMessage(flash.success);
      setToastType('success');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } else if (flash.error) {
      setToastMessage(flash.error);
      setToastType('error');
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  }, [flash]);

  // Expense categories from props or default
  const expenseCategories = Array.isArray(categories) && categories.length > 0 ? categories : [
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

  const years = Array.from({ length: 10 }, (_, i) => safeCurrentYear + i);

  // Validation function for date
  const isDateValid = (month, year) => {
    const selectedYear = parseInt(year);
    const selectedMonth = parseInt(month);
    const currentMonthNum = parseInt(safeCurrentMonth);
    
    if (!month || !year) return true;
    
    if (selectedYear < safeCurrentYear) return false;
    if (selectedYear === safeCurrentYear && selectedMonth < currentMonthNum) return false;
    
    return true;
  };

  const totals = useMemo(() => {
    const totalBudget = budgets.reduce((s, b) => s + b.budget, 0);
    const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
    const overCategories = budgets.filter((b) => b.spent > b.budget).length;
    return { totalBudget, totalSpent, overCategories };
  }, [budgets]);

  function handleMonthYearChange() {
    router.get(route('budget'), { month: viewMonth, year: viewYear }, {
      preserveState: true,
      preserveScroll: true,
    });
  }

  function openNew() {
    setEditing(null);
    reset();
    setForm({
      category: '',
      budget: ''
    });
    setModalOpen(true);
  }

  function openEdit(item) {
    setEditing(item);
    setForm({ 
      category: item.category || '', 
      budget: String(item.budget || '')
    });
    setModalOpen(true);
  }

  function save() {
    if (editing) {
      put(route('budgets.update', editing.id), {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        },
        preserveScroll: true,
      });
    } else {
      post(route('budgets.store'), {
        onSuccess: () => {
          setModalOpen(false);
          reset();
        },
        preserveScroll: true,
      });
    }
  }

  function remove(id) {
    if (!confirm('Delete this budget?')) return;
    destroy(route('budgets.destroy', id), {
      preserveScroll: true,
    });
  }

  return (
    <AppLayout title="MONA - Budget" auth={auth}>
      <Head title="Budget" />

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className={`rounded-lg shadow-lg p-4 flex items-center gap-3 ${
            toastType === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {toastType === 'success' ? (
              <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            <span className="font-medium">{toastMessage}</span>
            <button 
              onClick={() => setShowToast(false)}
              className="ml-2 text-gray-400 hover:text-gray-600"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8">
        <div className="bg-warm-ivory rounded-md">
            {/* Animation Styles */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                .delay-100 { animation-delay: 0.1s; opacity: 0; }
                .delay-200 { animation-delay: 0.2s; opacity: 0; }
                .delay-300 { animation-delay: 0.3s; opacity: 0; }
                .delay-400 { animation-delay: 0.4s; opacity: 0; }
                .delay-500 { animation-delay: 0.5s; opacity: 0; }
                .delay-600 { animation-delay: 0.6s; opacity: 0; }
                .delay-700 { animation-delay: 0.7s; opacity: 0; }
                .delay-800 { animation-delay: 0.8s; opacity: 0; }
                .delay-900 { animation-delay: 0.9s; opacity: 0; }
            `}</style>

            {/* Header */}
            <div className="animate-fade-in flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 sm:mb-8">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-charcoal mb-2">Budget Manager</h1>
                <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg text-medium-gray">Set and track your spending limits</p>
              </div>
              {isCurrentMonth && (
                <button
                  onClick={openNew}
                  className="inline-flex items-center gap-1 sm:gap-2 bg-black text-white rounded-full px-3 sm:px-4 md:px-5 py-1.5 md:py-2 lg:py-2.5 font-medium shadow-md transform transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-black text-sm sm:text-base"
                >
                  <Icon.Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="md:text-lg">New Budget</span>
                </button>
              )}
            </div>

            {/* Month/Year Selector */}
            <div className="animate-fade-in-up delay-100 bg-white rounded-xl p-3 sm:p-4 shadow-sm mb-6 sm:mb-8">
              <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-2 sm:gap-3">
                <label className="text-xs sm:text-sm font-medium text-gray-700">View Budget for:</label>
                <select
                  value={viewMonth}
                  onChange={(e) => setViewMonth(e.target.value)}
                  className="px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  {months.map((month) => (
                    <option key={month.value} value={month.value}>
                      {month.label}
                    </option>
                  ))}
                </select>
                <select
                  value={viewYear}
                  onChange={(e) => setViewYear(parseInt(e.target.value))}
                  className="px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent min-w-[100px]"
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleMonthYearChange}
                  className="px-3 sm:px-4 py-2 text-sm sm:text-base bg-black text-white rounded-lg hover:bg-gray-800 font-medium"
                >
                  View
                </button>
              </div>
            </div>

            {/* Error messages */}
            {errors && Object.keys(errors).length > 0 && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                {Object.values(errors).map((error, idx) => (
                  <p key={idx}>{error}</p>
                ))}
              </div>
            )}

            {/* top metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card className="animate-fade-in-up delay-200">
                <div className="text-base sm:text-lg font-semibold">Total Budget</div>
                <div className="text-xl sm:text-2xl text-green-700 font-semibold mt-3 sm:mt-4">{formatIDR(totals.totalBudget)}</div>
                <div className="text-gray-400 text-xs sm:text-sm mt-2 sm:mt-3">for this month</div>
              </Card>

              <Card className="animate-fade-in-up delay-300">
                <div className="text-base sm:text-lg font-semibold">Total Spent</div>
                <div className="text-xl sm:text-2xl text-red-600 font-semibold mt-3 sm:mt-4">{formatIDR(totals.totalSpent)}</div>
                <div className="text-gray-400 text-xs sm:text-sm mt-2 sm:mt-3">{percent(totals.totalSpent, totals.totalBudget)}% from this month budget</div>
              </Card>

              <Card className="animate-fade-in-up delay-400">
                <div className="text-base sm:text-lg font-semibold">Over Budget</div>
                <div className="text-xl sm:text-2xl text-orange-600 font-semibold mt-3 sm:mt-4">{totals.overCategories}</div>
                <div className="text-gray-400 text-xs sm:text-sm mt-2 sm:mt-3">Categories</div>
              </Card>
            </div>

            {/* budget cards grid */}
            {budgets.length === 0 ? (
              <div className="bg-white rounded-xl p-8 sm:p-12 text-center shadow-sm">
                <div className="text-gray-400 text-base sm:text-lg mb-4">No budgets set for this month</div>
                {isCurrentMonth && (
                  <button
                    onClick={openNew}
                    className="inline-flex items-center gap-2 bg-black text-white rounded-full px-4 sm:px-5 py-2 sm:py-2.5 font-medium shadow-md transform transition-transform duration-200 hover:scale-105 active:scale-95 text-sm sm:text-base"
                  >
                    <Icon.Plus className="w-4 h-4" />
                    <span>Create Your First Budget</span>
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 2xl:grid-cols-2 gap-4 sm:gap-6 pb-6 sm:pb-10">
                {budgets.map((b, index) => {
                  const pct = percent(b.spent, b.budget);
                  const isOver = b.spent > b.budget;
                  const remaining = b.budget - b.spent;
                  const statusColor = isOver ? 'text-red-600' : pct >= 80 ? 'text-orange-500' : 'text-green-600';
                  
                  // Calculate staggered delay for each card
                  const delayClass = `delay-${Math.min((index + 5) * 100, 900)}`;

                  return (
                    // group enables child elements to react to hover
                    <div key={b.id} className={`animate-fade-in-up ${delayClass} group bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm transform transition-all duration-200 hover:scale-[1.02] hover:-translate-y-1 hover:shadow-lg`}>
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg md:text-xl font-semibold truncate">{b.category || b.title}</h3>
                          <div className="text-gray-400 text-xs sm:text-sm mt-1">
                            {b.month && b.year ? `Ends in: ${months.find(m => m.value === b.month)?.label || 'Month'} ${b.year}` : 'Budget Period'}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 sm:gap-3 text-gray-600 ml-2">
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
                            {isOver ? <Icon.Warning className="w-3 h-3 sm:w-4 sm:h-4" /> : pct >= 80 ? <Icon.Warning className="w-3 h-3 sm:w-4 sm:h-4" /> : <Icon.Check className="w-3 h-3 sm:w-4 sm:h-4" />}
                          </div>

                          {isCurrentMonth && (
                            <div className="flex items-center gap-1 sm:gap-2 opacity-80 transition-all duration-200">
                              <button
                                onClick={() => openEdit(b)}
                                className="p-1 rounded-md hover:bg-gray-100 hover:text-black transform transition-transform duration-150 hover:-translate-y-0.5 focus:outline-none"
                                title="Edit"
                              >
                                <Icon.Edit className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>

                              <button
                                onClick={() => remove(b.id)}
                                className="p-1 rounded-md hover:bg-gray-100 hover:text-red-600 transform transition-transform duration-150 hover:-translate-y-0.5 focus:outline-none"
                                title="Delete"
                              >
                                <Icon.Trash className="w-3 h-3 sm:w-4 sm:h-4" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 sm:mt-6">
                        <div className="flex justify-between text-xs sm:text-sm text-gray-700 mb-2">
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

                        <div className="flex justify-between items-center mt-2 sm:mt-3 text-xs sm:text-sm">
                          <div className="text-gray-500">
                            {isOver ? `${formatIDR(Math.abs(remaining))} over budget` : `${formatIDR(Math.abs(remaining))} remaining`}
                          </div>
                          <div className={`${statusColor} font-semibold`}>{pct}%</div>
                        </div>

                        <div className="text-gray-300 text-xs mt-2 sm:mt-3">Budget: {formatIDR(b.budget)}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* modal */}
            {isModalOpen && (
              <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-black/30" onClick={() => setModalOpen(false)} />
                <div className="relative bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg shadow-lg max-h-[90vh] overflow-y-auto">
                  <h4 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6">{editing ? 'Edit Budget' : 'Create New Budget'}</h4>
                  <div className="space-y-3 sm:space-y-4">
                    {/* Category */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Category*</label>
                      <select
                        value={form.category}
                        onChange={(e) => setForm('category', e.target.value)}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        required
                      >
                        <option value="">Select a category</option>
                        {expenseCategories.map((category) => (
                          <option key={category.id || category} value={category.id || category}>
                            {category.category_name || category}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Budget Amount */}
                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">Budget Amount*</label>
                      <input 
                        value={formatNumberWithDots(form.budget)} 
                        onChange={(e) => {
                          const rawValue = parseFormattedNumber(e.target.value);
                          setForm('budget', rawValue);
                        }} 
                        type="text" 
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="0"
                        required
                      />
                    </div>

                    {/* Info alert - only show when creating new */}
                    {!editing && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 sm:p-3">
                        <div className="flex items-start gap-2">
                          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zm-4 4a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                          <div className="text-xs sm:text-sm text-blue-800">
                            <p className="font-medium mb-1">Budget Period: Current Month</p>
                            <p className="text-blue-700">
                              This budget will automatically cover from the 1st to the last day of {months.find(m => m.value === safeCurrentMonth)?.label} {safeCurrentYear}.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 sm:pt-6">
                      <button 
                        onClick={() => setModalOpen(false)} 
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium"
                        disabled={processing}
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={save} 
                        className="w-full sm:w-auto px-4 sm:px-6 py-2 text-sm sm:text-base rounded-lg bg-black text-white hover:bg-gray-800 font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                        disabled={processing || !form.category || !form.budget}
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
function Card({ children, className = '' }) {
  return <div className={`bg-white rounded-xl p-4 sm:p-5 md:p-6 shadow-sm ${className}`}>{children}</div>;
}