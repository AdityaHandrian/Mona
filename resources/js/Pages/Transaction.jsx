import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });
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
            setLoadingCategories(true);
            console.log('Fetching categories for type:', type);
            const response = await axios.get(`/api/categories?type=${type}`);
            console.log('Categories received:', response.data);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            showModalNotification('error', 'Something went wrong', 'Failed to load categories');
            // Fallback categories
            setCategories([]);
        } finally {
            setLoadingCategories(false);
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
    }, [modalNotification.show]);

    const showModalNotification = (type, title, message) => {
        setModalNotification({ show: true, type, title, message });
    };

    const checkBudgetExists = async (categoryId, date) => {
        try {
            const transactionDate = new Date(date);
            const month = transactionDate.getMonth() + 1; // getMonth() returns 0-11
            const year = transactionDate.getFullYear();
            
            const response = await axios.get('/api/budgets/check', {
                params: {
                    category_id: categoryId,
                    month: month,
                    year: year
                }
            });
            
            return response.data.has_budget;
        } catch (error) {
            console.error('Error checking budget:', error);
            return true; // If error, assume budget exists to avoid blocking
        }
    };

    const saveTransaction = async (transactionData) => {
        try {
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

        const transactionData = {
            category_id: parseInt(formData.category),
            amount: parseFloat(formData.amount),
            description: formData.description || '',
            transaction_date: formData.date
        };

        // Check budget only for expense transactions
        if (transactionType === 'expense') {
            const hasBudget = await checkBudgetExists(transactionData.category_id, transactionData.transaction_date);
            
            if (!hasBudget) {
                // Show budget warning modal
                setBudgetWarningModal({
                    show: true,
                    pendingTransaction: transactionData
                });
                setSubmitting(false);
                return;
            }
        }

        // If income or budget exists, save directly
        await saveTransaction(transactionData);
    };

    const handleContinueAnyway = async () => {
        setBudgetWarningModal({ show: false, pendingTransaction: null });
        setSubmitting(true);
        await saveTransaction(budgetWarningModal.pendingTransaction);
    };

    const handleCancelTransaction = () => {
        setBudgetWarningModal({ show: false, pendingTransaction: null });
        setSubmitting(false);
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

            {/* Budget Warning Modal */}
            {budgetWarningModal.show && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-11/12 animate-scale-in">
                        {/* Warning Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full border-4 border-yellow-500 flex items-center justify-center animate-warning-icon">
                                <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-2xl font-bold text-center mb-3 text-yellow-600">
                            No Budget Set
                        </h3>
                        
                        {/* Message */}
                        <p className="text-gray-600 text-center text-base mb-6">
                            You haven't set a budget for this expense category in the selected month. Do you want to continue anyway?
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleContinueAnyway}
                                className="w-full py-3 px-6 rounded-lg font-medium bg-growth-green-500 text-white hover:bg-growth-green-600 transition-colors"
                            >
                                Continue Anyway
                            </button>
                            <button
                                onClick={handleCancelTransaction}
                                className="w-full py-3 px-6 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                            >
                                Cancel Transaction
                            </button>
                        </div>
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
                .animate-warning-icon {
                    animation: warningIcon 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both;
                }

                /* Custom DatePicker Styles */
                .react-datepicker-popper {
                    z-index: 9999 !important;
                }

                /* Mobile fullscreen */
                @media (max-width: 640px) {
                    .react-datepicker-popper {
                        position: fixed !important;
                        top: 0 !important;
                        left: 0 !important;
                        transform: none !important;
                        width: 100vw !important;
                        height: 100vh !important;
                        max-width: none !important;
                        display: flex !important;
                        align-items: center !important;
                        justify-content: center !important;
                        background-color: rgba(0, 0, 0, 0.5) !important;
                        padding: 20px !important;
                    }

                    .react-datepicker {
                        width: 100% !important;
                        max-width: 380px !important;
                        margin: auto !important;
                    }
                }

                .react-datepicker {
                    font-family: inherit !important;
                    border: none !important;
                    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
                    border-radius: 16px !important;
                    padding: 16px !important;
                    background-color: white !important;
                }

                .react-datepicker__header {
                    background-color: white !important;
                    border-bottom: 1px solid #f0f0f0 !important;
                    padding: 16px 0 !important;
                    border-top-left-radius: 16px !important;
                    border-top-right-radius: 16px !important;
                }

                .react-datepicker__current-month {
                    font-size: 18px !important;
                    font-weight: 700 !important;
                    color: #1a1a1a !important;
                    margin-bottom: 12px !important;
                }

                .react-datepicker__day-names {
                    display: flex !important;
                    justify-content: space-between !important;
                    margin-top: 12px !important;
                }

                .react-datepicker__day-name {
                    color: #666 !important;
                    font-weight: 600 !important;
                    font-size: 13px !important;
                    width: 40px !important;
                    line-height: 40px !important;
                    margin: 0 !important;
                }

                .react-datepicker__month {
                    margin: 0 !important;
                    padding: 8px 0 !important;
                }

                .react-datepicker__week {
                    display: flex !important;
                    justify-content: space-between !important;
                }

                .react-datepicker__day {
                    width: 40px !important;
                    height: 40px !important;
                    line-height: 40px !important;
                    margin: 2px !important;
                    border-radius: 8px !important;
                    color: #1a1a1a !important;
                    font-weight: 500 !important;
                    transition: all 0.2s ease !important;
                }

                .react-datepicker__day:hover {
                    background-color: #f5f5f5 !important;
                    border-radius: 8px !important;
                }

                /* Selected date - Growth Green background with white text */
                .react-datepicker__day--selected {
                    background-color: #058743 !important;
                    color: white !important;
                    font-weight: 600 !important;
                }

                .react-datepicker__day--selected:hover {
                    background-color: #046d36 !important;
                }

                /* Remove keyboard-selected state to avoid "half pressed" appearance */
                .react-datepicker__day--keyboard-selected {
                    background-color: transparent !important;
                    color: inherit !important;
                }

                .react-datepicker__day--keyboard-selected:hover {
                    background-color: #f5f5f5 !important;
                }

                /* Today's date - Growth Green color with light background */
                .react-datepicker__day--today {
                    font-weight: 600 !important;
                    color: #058743 !important;
                    background-color: #d4eadf !important;
                }

                .react-datepicker__day--today:hover {
                    background-color: #c0e0cb !important;
                }

                /* Selected date overrides today styling - solid growth green */
                .react-datepicker__day--selected.react-datepicker__day--today {
                    background-color: #058743 !important;
                    color: white !important;
                    font-weight: 600 !important;
                }

                .react-datepicker__day--outside-month {
                    color: #d0d0d0 !important;
                }

                .react-datepicker__navigation {
                    top: 20px !important;
                }

                .react-datepicker__navigation-icon::before {
                    border-color: #666 !important;
                    border-width: 2px 2px 0 0 !important;
                }

                .react-datepicker__navigation:hover *::before {
                    border-color: #058743 !important;
                }

                /* Mobile adjustments */
                @media (max-width: 640px) {
                    .react-datepicker {
                        padding: 24px !important;
                        max-width: none !important;
                        width: calc(100vw - 40px) !important;
                    }

                    .react-datepicker__header {
                        padding: 20px 0 16px 0 !important;
                    }

                    .react-datepicker__current-month {
                        font-size: 20px !important;
                        margin-bottom: 16px !important;
                    }

                    .react-datepicker__day {
                        width: calc((100vw - 120px) / 7) !important;
                        height: calc((100vw - 120px) / 7) !important;
                        line-height: calc((100vw - 120px) / 7) !important;
                        font-size: 16px !important;
                        margin: 3px !important;
                    }

                    .react-datepicker__day-name {
                        width: calc((100vw - 120px) / 7) !important;
                        line-height: calc((100vw - 120px) / 7) !important;
                        font-size: 14px !important;
                    }

                    .react-datepicker__navigation {
                        top: 24px !important;
                        width: 32px !important;
                        height: 32px !important;
                    }

                    .react-datepicker__navigation-icon::before {
                        border-width: 3px 3px 0 0 !important;
                        width: 10px !important;
                        height: 10px !important;
                    }
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

                            <form onSubmit={handleSubmit} className="space-y-6">
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
                                        required
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
                                        disabled={loadingCategories}
                                        required
                                    >
                                        <option value="">
                                            {loadingCategories ? 'Loading categories...' : 'Select a category'}
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
                                        <DatePicker
                                            selected={formData.date ? new Date(formData.date) : new Date()}
                                            onChange={(date) => {
                                                const formattedDate = date.toISOString().split('T')[0];
                                                setFormData({ ...formData, date: formattedDate });
                                            }} 
                                            dateFormat="dd/MM/yyyy"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg cursor-pointer focus:ring-2 focus:ring-[#058743] focus:border-transparent"
                                            calendarClassName="custom-calendar"
                                            wrapperClassName="w-full"
                                            placeholderText="DD/MM/YYYY"
                                            showPopperArrow={false}
                                        />
                                        {/* Calendar icon */}
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
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
                                        type="submit"
                                        disabled={submitting || loadingCategories}
                                        className={`w-full py-3 px-6 rounded-lg font-medium transition-colors ${
                                            submitting || loadingCategories
                                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                : 'bg-black text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        {submitting ? 'Adding...' : 'Add Transaction'}
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