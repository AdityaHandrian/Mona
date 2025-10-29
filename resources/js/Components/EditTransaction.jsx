import { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

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

export default function EditTransaction({ transaction, onClose, onUpdate }) {
    // Initialize with the transaction's type if available, otherwise default to 'expense'
    const [transactionType, setTransactionType] = useState(
        transaction?.type ? transaction.type.toLowerCase() : 'expense'
    );
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [showNotification, setShowNotification] = useState(false);
    const [showDateWarning, setShowDateWarning] = useState(false);
    const [formData, setFormData] = useState({
        amount: '',
        category: '',
        date: '',
        description: ''
    });

    // Format date for display as DD/MM/YYYY
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '';
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Initialize form data when transaction prop changes
    useEffect(() => {
        if (transaction) {
            // Determine transaction type based on amount or type field
            const type = transaction.type ? transaction.type.toLowerCase() : 
                        (transaction.amount < 0 ? 'expense' : 'income');
            
            setTransactionType(type);
            setFormData({
                amount: Math.abs(transaction.amount || 0).toString(), // Always positive in form
                category: transaction.category_id || '',
                date: transaction.transaction_date ? transaction.transaction_date.split('T')[0] : '',
                description: transaction.description || ''
            });
        }
    }, [transaction]);

    // Fetch categories from API based on transaction type
    const fetchCategories = async (type) => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/categories?type=${type}`);
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    // Load categories when component mounts or transaction type changes
    useEffect(() => {
        fetchCategories(transactionType);
        // Only reset category if user manually changes the type (not on initial load)
        // We keep the category from formData during initial population
    }, [transactionType]);

    // Hide notification after 3 seconds
    useEffect(() => {
        if (notification.message) {
            setShowNotification(true);
            const timer = setTimeout(() => setShowNotification(false), 2700);
            const timer2 = setTimeout(() => setNotification({ message: '', type: '' }), 3000);
            return () => { clearTimeout(timer); clearTimeout(timer2); };
        }
    }, [notification]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const rawAmount = Number(formData.amount);
        if (Number.isNaN(rawAmount) || rawAmount <= 0) {
            setNotification({ message: 'Amount must be a valid positive number.', type: 'error' });
            return;
        }

        if (!formData.category) {
            setNotification({ message: 'Please select a category.', type: 'error' });
            return;
        }

        if (!formData.date) {
            setNotification({ message: 'Please select a date.', type: 'error' });
            return;
        }

        setSubmitting(true);
        try {
            // Use PUT method for updating
            const response = await axios.put(
                `/api/transactions/${transaction.id}`,
                {
                    category_id: Number(formData.category),
                    amount: formData.amount,
                    description: formData.description || null,
                    transaction_date: formData.date,
                },
                {
                    headers: { 
                        'Content-Type': 'application/json', 
                        'X-Requested-With': 'XMLHttpRequest' 
                    },
                    withCredentials: true,
                }
            );

            console.log('Transaction updated:', response.data);
            setNotification({ message: 'Transaction successfully updated!', type: 'success' });
            
            // Call onUpdate callback to refresh the parent component
            if (onUpdate) {
                onUpdate();
            }
            
            // Close modal after a short delay to show success message
            setTimeout(() => {
                onClose();
            }, 1500);
            
        } catch (err) {
            setNotification({ message: 'Failed to update transaction.', type: 'error' });
            console.error('Failed to update transaction:', err?.response?.data || err.message);
        } finally {
            setSubmitting(false);
        }
    };

    // Handle backdrop click to close modal
    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!transaction) return null;

    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden"
            onClick={handleBackdropClick}
        >
            {/* Floating Notification (bottom left, animated) */}
            {notification.message && (
                <div
                    className={`fixed bottom-8 left-8 z-[9999] px-6 py-3 rounded-lg shadow-lg transition-all duration-300
                        ${notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}
                        ${showNotification ? 'animate-fade-in' : 'animate-fade-out'}`}
                    style={{ pointerEvents: 'none' }}
                >
                    <style>{`
                        @keyframes fadeInNotif { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                        @keyframes fadeOutNotif { from { opacity: 1; transform: translateY(0) scale(1); } to { opacity: 0; transform: translateY(20px) scale(0.95); } }
                        .animate-fade-in { animation: fadeInNotif 0.3s ease-out; }
                        .animate-fade-out { animation: fadeOutNotif 0.3s ease-in; }
                    `}</style>
                    {notification.message}
                </div>
            )}

            {/* Floating Date Warning Notification (top right) */}
            {showDateWarning && (
                <div className="fixed top-4 right-4 z-[9999] animate-slide-in-right">
                    <div className="bg-white rounded-lg shadow-lg border-l-4 border-red-500 p-4 max-w-sm">
                        <div className="flex items-start gap-3">
                            <div className="flex-shrink-0">
                                <svg className="w-6 h-6 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="flex-1">
                                <h4 className="text-sm font-semibold text-gray-900 mb-1">Can't Select Future Date</h4>
                                <p className="text-sm text-gray-600">Please select today or a past date.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto overflow-x-hidden">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900">Edit Transaction</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Income/Expense Buttons */}
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setTransactionType('income')}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                                    transactionType === 'income'
                                        ? 'bg-[#058743] text-white'
                                        : 'bg-[#D4EADF] text-[#058743] hover:bg-[#C0E0CB]'
                                }`}
                            >
                                + Income
                            </button>
                            <button
                                type="button"
                                onClick={() => setTransactionType('expense')}
                                className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-colors ${
                                    transactionType === 'expense'
                                        ? 'bg-[#DC3545] text-white'
                                        : 'bg-[#F9E4E3] text-[#DC3545] hover:bg-[#F5D2D0]'
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
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#058743] focus:border-transparent"
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
                                disabled={loading}
                                required
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
                                <DatePicker
                                    selected={formData.date ? new Date(formData.date) : null}
                                    onChange={(date) => {
                                        const today = new Date();
                                        today.setHours(0, 0, 0, 0);
                                        const selectedDate = new Date(date);
                                        selectedDate.setHours(0, 0, 0, 0);
                                        
                                        if (selectedDate > today) {
                                            // Show warning for future dates
                                            setShowDateWarning(true);
                                            setTimeout(() => setShowDateWarning(false), 3000);
                                        } else {
                                            const year = date.getFullYear();
                                            const month = String(date.getMonth() + 1).padStart(2, '0');
                                            const day = String(date.getDate()).padStart(2, '0');
                                            setFormData({ ...formData, date: `${year}-${month}-${day}` });
                                        }
                                    }}
                                    dateFormat="dd/MM/yyyy"
                                    placeholderText="DD/MM/YYYY"
                                    className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#058743] focus:border-transparent cursor-pointer"
                                    calendarClassName="custom-calendar"
                                    wrapperClassName="w-full"
                                    showPopperArrow={false}
                                    required
                                    onChangeRaw={(e) => e.preventDefault()}
                                    onKeyDown={(e) => {
                                        // Prevent all keyboard input except Tab for accessibility
                                        if (e.key !== 'Tab') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                {/* Calendar icon */}
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
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

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                                    submitting
                                        ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                        : 'bg-[#058743] text-white hover:bg-[#046635]'
                                }`}
                            >
                                {submitting ? 'Updating...' : 'Update Transaction'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            
            {/* DatePicker Custom Styles */}
            <style>{`
                @keyframes slideInRight {
                    from {
                        opacity: 0;
                        transform: translateX(100%);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0);
                    }
                }
                .animate-slide-in-right {
                    animation: slideInRight 0.3s ease-out;
                }
                
                /* Base DatePicker Styles */
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
                    .react-datepicker-popper {
                        transform: translateX(-50%) !important;
                        left: 50% !important;
                    }
                    
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

                @media (max-width: 480px) {
                    .react-datepicker {
                        width: 70% !important;
                        max-width: 240px !important;
                        padding: 8px !important;
                    }

                    .react-datepicker__current-month {
                        font-size: 13px !important;
                    }

                    .react-datepicker__day-name,
                    .react-datepicker__day {
                        width: 28px !important;
                        height: 28px !important;
                        line-height: 28px !important;
                        font-size: 11px !important;
                    }

                    .react-datepicker__header {
                        padding: 10px 0 !important;
                    }

                    .react-datepicker__month {
                        padding: 6px 0 !important;
                    }
                }
            `}</style>
        </div>
    );
}