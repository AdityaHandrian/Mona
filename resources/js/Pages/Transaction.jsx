import { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

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
            // Fallback to empty array if API fails
            setCategories([]);
        } finally {
            setLoading(false);
        }
    };

    // Load categories when component mounts or transaction type changes
    useEffect(() => {
        fetchCategories(transactionType);
        // Reset category selection when type changes
        setFormData(prev => ({ ...prev, category: '' }));
    }, [transactionType]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Submit transaction to backend
        console.log('Transaction submitted:', {
            type: transactionType,
            ...formData
        });
    };

    return (
        <AppLayout 
            title="MONA - Transaction"
            auth={auth}
        >
            <Head title="Transaction" />
            
            <div className="py-8">
                <div className="max-w-7xl mx-auto px-6">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Add Transaction</h1>
                        <p className="text-gray-600">Record your income and expenses</p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* New Transaction Form */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
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
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
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
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#058743] focus:border-transparent"
                                        required
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
                                            onClick={() => document.getElementById('transaction-date-picker').showPicker()}
                                        />
                                        {/* Hidden date picker */}
                                        <input
                                            id="transaction-date-picker"
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData({...formData, date: e.target.value})}
                                            className="absolute opacity-0 pointer-events-none"
                                            required
                                        />
                                        {/* Calendar icon */}
                                        <div 
                                            className="absolute inset-y-0 right-0 flex items-center px-4 cursor-pointer"
                                            onClick={() => document.getElementById('transaction-date-picker').showPicker()}
                                        >
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
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        rows={4}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#058743] focus:border-transparent resize-none"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 transition-colors"
                                >
                                    Add Transaction
                                </button>
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
                                            <p className="text-base text-[#058743] mb-2 font-medium">Total Income</p>
                                            <p className="text-3xl font-bold text-[#058743]">Rp0</p>
                                        </div>
                                        <div className="text-[#058743] text-3xl">+</div>
                                    </div>
                                </div>

                                {/* Total Expenses */}
                                <div className="bg-[#F9E4E3] rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-base text-[#DC3545] mb-2 font-medium">Total Expenses</p>
                                            <p className="text-3xl font-bold text-[#DC3545]">Rp0</p>
                                        </div>
                                        <div className="text-[#DC3545] text-3xl">-</div>
                                    </div>
                                </div>

                                {/* Net Balance */}
                                <div className="bg-[#F2F8FE] rounded-lg p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-base text-[#5877D0] mb-2 font-medium">Net Balance</p>
                                            <p className="text-3xl font-bold text-[#5877D0]">Rp0</p>
                                        </div>
                                        <div className="text-[#5877D0] text-3xl">$</div>
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