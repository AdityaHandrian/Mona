import { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

// Helper functions for number formatting
const formatNumberWithDots = (value) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');
    
    // Add dots every 3 digits from right to left
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseFormattedNumber = (formattedValue) => {
    // Remove dots to get raw number
    return formattedValue.replace(/\./g, '');
};

// Helper function to format currency
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        maximumFractionDigits: 0
    }).format(amount);
};

export default function Transaction({ auth }) {
    const [transactionType, setTransactionType] = useState('income'); // 'income' or 'expense'
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        date: new Date().toISOString().split('T')[0], // Today's date
        description: ''
    });
    // Modal notification state
    const [modalNotification, setModalNotification] = useState({ 
        show: false, 
        type: '', // 'success' or 'error'
        title: '',
        message: '' 
    });
    
    // Quick Stats state
    const [stats, setStats] = useState({
        totalIncome: 0,
        totalExpenses: 0,
        netBalance: 0,
        loading: true
    });

    // Format date for display as DD/MM/YYYY
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Fetch categories from API based on transaction type
    const fetchCategories = async (type) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/categories?type=${type}`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            showModalNotification('error', 'Something went wrong', 'Failed to load categories');
            // Fallback categories
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    // Fetch monthly statistics
    const fetchMonthlyStats = async () => {
        try {
            setStats(prev => ({ ...prev, loading: true }));
            
            // Get current month and year
            const now = new Date();
            const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
            const currentYear = now.getFullYear();
            
            const response = await axios.get(`/api/transactions/monthly-stats`, {
                params: {
                    month: currentMonth,
                    year: currentYear
                }
            });
            
            const responseData = response.data.data; // API returns data in data property
            setStats({
                totalIncome: responseData.total_income || 0,
                totalExpenses: Math.abs(responseData.total_expenses || 0), // Make sure it's positive
                netBalance: responseData.net_balance || 0, // Use the calculated net_balance from API
                loading: false
            });
        } catch (error) {
            console.error('Error fetching monthly stats:', error);
            // Set default values on error
            setStats({
                totalIncome: 0,
                totalExpenses: 0,
                netBalance: 0,
                loading: false
            });
        }
    };

    // Load categories when component mounts or transaction type changes
    useEffect(() => {
        fetchCategories(transactionType);
        // Reset category selection when type changes
        setFormData(prev => ({ ...prev, category: '' }));
    }, [transactionType]);

    // Load monthly statistics when component mounts
    useEffect(() => {
        fetchMonthlyStats();
    }, []);

    // Hide modal notification after 3 seconds
    useEffect(() => {
        if (modalNotification.show) {
            const timer = setTimeout(() => {
                setModalNotification({ show: false, type: '', title: '', message: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [modalNotification.show]);    const showModalNotification = (type, title, message) => {
        setModalNotification({ show: true, type, title, message });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.amount || !formData.category || !formData.date) {
            showModalNotification('error', 'Something went wrong', 'Please fill in all required fields.');
            return;
        }

        const rawAmount = Number(formData.amount);
        if (Number.isNaN(rawAmount) || rawAmount <= 0) {
            showModalNotification('error', 'Something went wrong', 'Amount must be a valid positive number.');
            return;
        }

        setSubmitting(true);
        try {
            const transactionData = {
                category_id: parseInt(formData.category),
                amount: parseFloat(formData.amount),
                description: formData.description || '',
                transaction_date: formData.date
            };

            // Use /api/transactions/add to avoid conflict with History page
            await axios.post('/api/transactions/add', transactionData);
            showModalNotification('success', 'Success', 'Transaction added Successfully!');

            // Reset form
            setFormData({
                amount: '',
                category: '',
                date: new Date().toISOString().split('T')[0],
                description: '',
            });
            
            // Refresh monthly statistics after adding transaction
            fetchMonthlyStats();
        } catch (err) {
            showModalNotification('error', 'Something went wrong', 'Failed to create transaction!');
            console.error('Failed to create transaction:', err?.response?.data || err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this transaction?')) return;

        try {
            await axios.delete(`/api/transactions/${id}`);
            showModalNotification('success', 'Success', 'Transaction deleted successfully!');
            fetchMonthlyStats();
        } catch (error) {
            console.error('Error deleting transaction:', error);
            showModalNotification('error', 'Something went wrong', 'Failed to delete transaction');
        }
    };

    return (
        <AppLayout 
            title="MONA - Transaction"
            auth={auth}
        >
            <Head title="MONA - Transaction" />
            
            {/* Modal Notification Overlay (SweetAlert2-style) */}
            {modalNotification.show && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-11/12 animate-scale-in">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            {modalNotification.type === 'success' ? (
                                <div className="w-20 h-20 rounded-full border-4 border-growth-green-500 flex items-center justify-center animate-check-icon">
                                    <svg className="w-12 h-12 text-growth-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-full border-4 border-expense-red-500 flex items-center justify-center animate-error-icon">
                                    <img 
                                        src="/images/icons/exclamation-warning-icon.svg" 
                                        alt="Error" 
                                        className="w-10 h-10"
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* Title */}
                        <h3 className={`text-2xl font-bold text-center mb-3 ${
                            modalNotification.type === 'success' ? 'text-growth-green-500' : 'text-expense-red-500'
                        }`}>
                            {modalNotification.title}
                        </h3>
                        
                        {/* Message */}
                        <p className="text-gray-600 text-center text-base">
                            {modalNotification.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Keyframes for animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0; 
                        transform: scale(0.5); 
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1); 
                    }
                }
                @keyframes checkIcon {
                    0% { 
                        transform: scale(0) rotate(0deg); 
                        opacity: 0; 
                    }
                    50% { 
                        transform: scale(1.2) rotate(180deg); 
                    }
                    100% { 
                        transform: scale(1) rotate(360deg); 
                        opacity: 1; 
                    }
                }
                @keyframes errorIcon {
                    0% { 
                        transform: scale(0); 
                        opacity: 0; 
                    }
                    50% { 
                        transform: scale(1.2); 
                    }
                    100% { 
                        transform: scale(1); 
                        opacity: 1; 
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-scale-in {
                    animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .animate-check-icon {
                    animation: checkIcon 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both;
                }
                .animate-error-icon {
                    animation: errorIcon 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both;
                }
            `}</style>
            
            <div className="overflow-x-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-charcoal mb-2">Add Transaction</h1>
                        <p className="text-sm sm:text-base md:text-base lg:text-base xl:text-lg text-medium-gray">Record your income and expenses</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* New Transaction Form */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 relative z-50">
                            <h2 className="text-xl font-semibold mb-2">New Transaction</h2>
                            <p className="text-gray-600 mb-6">Enter the details of your transaction</p>

                            <form onSubmit={handleSubmit} noValidate className="space-y-6">
                            {/* Income/Expense Buttons */}
                            <div className="flex gap-4">
                                <button
                                type="button"
                                onClick={() => setTransactionType('income')}
                                className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-colors ${
                                    transactionType === 'income'
                                    ? 'bg-growth-green-500 text-white'
                                    : 'bg-[#D4EADF] text-growth-green-500 hover:bg-[#C0E0CB]'
                                }`}
                                >
                                + Income
                                </button>
                                <button
                                type="button"
                                onClick={() => setTransactionType('expense')}
                                className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-colors ${
                                    transactionType === 'expense'
                                    ? 'bg-expense-red-500 text-white'
                                    : 'bg-[#F9E4E3] text-expense-red-500 hover:bg-[#F5D2D0]'
                                }`}
                                >
                                - Expense
                                </button>
                            </div>

                            {/* Amount */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                Amount*
                                </label>
                                <input
                                type="text"
                                placeholder="0"
                                value={formatNumberWithDots(formData.amount)}
                                onChange={(e) => {
                                    const rawValue = parseFormattedNumber(e.target.value);
                                    setFormData({ ...formData, amount: rawValue });
                                }}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-growth-green-500 focus:border-transparent"
                                // required  <-- sudah di-bypass dengan noValidate pada <form>
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                Category*
                                </label>
                                <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#058743] focus:border-transparent"
                                disabled={loading}
                                >
                                <option value="">
                                    {loading ? 'Loading categories...' : 'Select a category'}
                                </option>
                                {categories.map((category) => (
                                    <option key={category.id} value={category.id}>
                                    {category.category_name}
                                    </option>
                                ))}
                                </select>
                            </div>

                            {/* Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                Date*
                                </label>
                                <div className="relative">
                                {/* Display input showing DD/MM/YYYY format */}
                                <input
                                    type="text"
                                    value={formatDateForDisplay(formData.date)}
                                    placeholder="DD/MM/YYYY"
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer focus:ring-2 focus:ring-[#058743] focus:border-transparent"
                                    onClick={() =>
                                    document.getElementById('transaction-date-picker').showPicker()
                                    }
                                />
                                {/* Hidden date picker */}
                                <input
                                    id="transaction-date-picker"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="absolute opacity-0 pointer-events-none"
                                />
                                {/* Calendar icon */}
                                <div
                                    className="absolute inset-y-0 right-0 flex items-center px-4 cursor-pointer"
                                    onClick={() =>
                                    document.getElementById('transaction-date-picker').showPicker()
                                    }
                                >
                                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                                        clipRule="evenodd"
                                    />
                                    </svg>
                                </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description
                                </label>
                                <textarea
                                placeholder="Optional description..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#058743] focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Submit Button */}
                            <div className="relative z-50">
                                <button
                                id="add-transaction-btn"
                                type="button"
                                onClick={(e) => {
                                    console.log('BTN CLICK');
                                    handleSubmit(e);
                                }}
                                className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors pointer-events-auto"
                                >
                                Add Transaction
                                </button>
                            </div>
                            </form>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h2 className="text-xl font-semibold mb-2">Quick Stats</h2>
                            <p className="text-gray-600 mb-6">This month's summary</p>

                            <div className="space-y-6">
                                {/* Total Income */}
                                <div className="bg-[#D4EADF] rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-xl text-[#058743] mb-2 font-medium">Total Income</p>
                                            <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-[#058743]">
                                                {stats.loading ? 'Loading...' : formatCurrency(stats.totalIncome)}
                                            </p>
                                        </div>
                                        <div className="text-[#058743] text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl">+</div>
                                    </div>
                                </div>

                                {/* Total Expenses */}
                                <div className="bg-[#F9E4E3] rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-xl text-[#DC3545] mb-2 font-medium">Total Expenses</p>
                                            <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold text-[#DC3545]">
                                                {stats.loading ? 'Loading...' : formatCurrency(stats.totalExpenses)}
                                            </p>
                                        </div>
                                        <div className="text-[#DC3545] text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl">-</div>
                                    </div>
                                </div>

                                {/* Net Balance */}
                                <div className="bg-[#F2F8FE] rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-base sm:text-lg md:text-xl lg:text-xl xl:text-xl text-[#5877D0] mb-2 font-medium">Net Balance</p>
                                            <p className={`text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl font-bold ${
                                                stats.netBalance >= 0 ? 'text-[#058743]' : 'text-[#DC3545]'
                                            }`}>
                                                {stats.loading ? 'Loading...' : formatCurrency(stats.netBalance)}
                                            </p>
                                        </div>
                                        <div className="text-[#5877D0] text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl">$</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
} 