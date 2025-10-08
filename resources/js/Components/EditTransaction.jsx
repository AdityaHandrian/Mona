import { useState, useEffect } from 'react';
import axios from 'axios';

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
    const [transactionType, setTransactionType] = useState('expense'); // Default to expense since most transactions are expenses
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: '' });
    const [showNotification, setShowNotification] = useState(false);
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
                amount: Math.abs(transaction.amount).toString(), // Always positive in form
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
        // Reset category selection when type changes (but keep it if it's valid for the new type)
        setFormData(prev => ({ ...prev, category: '' }));
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
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
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

            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
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
                                className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-colors ${
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
                                className={`flex-1 py-3 px-6 rounded-lg text-sm font-medium transition-colors ${
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
                                <input
                                    type="text"
                                    value={formatDateForDisplay(formData.date)}
                                    placeholder="DD/MM/YYYY"
                                    readOnly
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer focus:ring-2 focus:ring-[#058743] focus:border-transparent"
                                    onClick={() => document.getElementById('edit-transaction-date-picker').showPicker()}
                                />
                                <input
                                    id="edit-transaction-date-picker"
                                    type="date"
                                    value={formData.date}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                    className="absolute opacity-0 pointer-events-none"
                                    required
                                />
                                <div
                                    className="absolute inset-y-0 right-0 flex items-center px-4 cursor-pointer"
                                    onClick={() => document.getElementById('edit-transaction-date-picker').showPicker()}
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

                        {/* Action Buttons */}
                        <div className="flex gap-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                disabled={submitting}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className={`flex-1 px-6 py-3 rounded-lg font-medium transition-colors ${
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
        </div>
    );
}