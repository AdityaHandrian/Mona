import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Transaction({ auth }) {
    const [transactionType, setTransactionType] = useState('income'); // 'income' or 'expense'
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

    const incomeCategories = [
        'Salary',
        'Freelance', 
        'Business',
        'Investment',
        'Gift',
        'Other'
    ];

    const expenseCategories = [
        'Food and Beverages',
        'Shopping',
        'Entertainment', 
        'Bills and Utilities',
        'Other'
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        // TODO: Submit transaction to backend
        console.log('Transaction submitted:', {
            type: transactionType,
            ...formData
        });
    };

    const currentCategories = transactionType === 'income' ? incomeCategories : expenseCategories;

    return (
        <AppLayout 
            title="MONA - Transaction"
            auth={auth}
        >
            <Head title="Transaction" />
            
            <div className="py-4 max-[768px]:py-3 max-[425px]:py-2 max-[375px]:py-1.5 max-[320px]:py-1 pb-8 max-[768px]:pb-6 max-[425px]:pb-4 max-[375px]:pb-3 max-[320px]:pb-2">
                <div className="max-w-7xl mx-auto px-6 max-[768px]:px-4 max-[425px]:px-3 max-[375px]:px-2 max-[320px]:px-1.5">
                    {/* Header */}
                    <div className="mb-8 max-[768px]:mb-6 max-[425px]:mb-4 max-[375px]:mb-3 max-[320px]:mb-2">
                        <h1 className="text-3xl max-[768px]:text-2xl max-[425px]:text-xl max-[375px]:text-lg max-[320px]:text-base font-bold text-gray-900 mb-2 max-[425px]:mb-1 max-[375px]:mb-0.5 max-[320px]:mb-0.5">Add Transaction</h1>
                        <p className="text-gray-600 max-[768px]:text-sm max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs">Record your income and expenses</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-[768px]:gap-6 max-[425px]:gap-4 max-[375px]:gap-3 max-[320px]:gap-2 max-[768px]:grid-cols-1">
                        {/* New Transaction Form */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-[768px]:p-4 max-[425px]:p-3 max-[375px]:p-2.5 max-[320px]:p-2 max-[768px]:order-1">
                            <h2 className="text-xl max-[768px]:text-lg max-[425px]:text-base max-[375px]:text-sm max-[320px]:text-sm font-semibold mb-2 max-[425px]:mb-1 max-[375px]:mb-1 max-[320px]:mb-0.5">New Transaction</h2>
                            <p className="text-gray-600 max-[768px]:text-sm max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs mb-6 max-[768px]:mb-4 max-[425px]:mb-3 max-[375px]:mb-2 max-[320px]:mb-1.5">Enter the details of your transaction</p>

                            <form onSubmit={handleSubmit} className="space-y-6 max-[768px]:space-y-4 max-[425px]:space-y-3 max-[375px]:space-y-2.5 max-[320px]:space-y-2">
                                {/* Income/Expense Buttons */}
                                <div className="flex gap-4 max-[768px]:gap-3 max-[425px]:gap-2 max-[375px]:gap-1.5 max-[320px]:gap-1">
                                    <button
                                        type="button"
                                        onClick={() => setTransactionType('income')}
                                        className={`flex-1 py-3 max-[768px]:py-2 max-[425px]:py-2 max-[375px]:py-1.5 max-[320px]:py-1.5 px-6 max-[768px]:px-4 max-[425px]:px-3 max-[375px]:px-2 max-[320px]:px-1.5 rounded-lg text-sm max-[768px]:text-xs max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-medium transition-colors ${
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
                                        className={`flex-1 py-3 max-[768px]:py-2 max-[425px]:py-2 max-[375px]:py-1.5 max-[320px]:py-1.5 px-6 max-[768px]:px-4 max-[425px]:px-3 max-[375px]:px-2 max-[320px]:px-1.5 rounded-lg text-sm max-[768px]:text-xs max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-medium transition-colors ${
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
                                    <label className="block text-sm max-[768px]:text-xs max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-medium text-gray-700 mb-2 max-[425px]:mb-1 max-[375px]:mb-0.5 max-[320px]:mb-0.5">
                                        Amount*
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        placeholder="0.00"
                                        value={formData.amount}
                                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                                        className="w-full px-4 max-[768px]:px-3 max-[425px]:px-3 max-[375px]:px-2.5 max-[320px]:px-2 py-3 max-[768px]:py-2 max-[425px]:py-2 max-[375px]:py-1.5 max-[320px]:py-1.5 border border-gray-300 rounded-lg text-sm max-[768px]:text-sm max-[425px]:text-sm max-[375px]:text-xs max-[320px]:text-xs focus:ring-2 focus:ring-[#058743] focus:border-transparent"
                                        required
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label className="block text-sm max-[768px]:text-xs max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-medium text-gray-700 mb-2 max-[425px]:mb-1 max-[375px]:mb-0.5 max-[320px]:mb-0.5">
                                        Category*
                                    </label>
                                    <select
                                        value={formData.category}
                                        onChange={(e) => setFormData({...formData, category: e.target.value})}
                                        className="w-full px-4 max-[768px]:px-3 max-[425px]:px-3 max-[375px]:px-2.5 max-[320px]:px-2 py-3 max-[768px]:py-2 max-[425px]:py-2 max-[375px]:py-1.5 max-[320px]:py-1.5 border border-gray-300 rounded-lg text-sm max-[768px]:text-sm max-[425px]:text-sm max-[375px]:text-xs max-[320px]:text-xs focus:ring-2 focus:ring-[#058743] focus:border-transparent"
                                        required
                                    >
                                        <option value="">Select a category</option>
                                        {currentCategories.map((category) => (
                                            <option key={category} value={category}>
                                                {category}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm max-[768px]:text-xs max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-medium text-gray-700 mb-2 max-[425px]:mb-1 max-[375px]:mb-0.5 max-[320px]:mb-0.5">
                                        Date*
                                    </label>
                                    <div className="relative">
                                        {/* Display input showing DD/MM/YYYY format */}
                                        <input
                                            type="text"
                                            value={formatDateForDisplay(formData.date)}
                                            placeholder="DD/MM/YYYY"
                                            readOnly
                                            className="w-full px-4 max-[768px]:px-3 max-[425px]:px-3 max-[375px]:px-2.5 max-[320px]:px-2 py-3 max-[768px]:py-2 max-[425px]:py-2 max-[375px]:py-1.5 max-[320px]:py-1.5 border border-gray-300 rounded-lg bg-gray-50 cursor-pointer text-sm max-[768px]:text-sm max-[425px]:text-sm max-[375px]:text-xs max-[320px]:text-xs focus:ring-2 focus:ring-[#058743] focus:border-transparent"
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
                                    <label className="block text-sm max-[768px]:text-xs max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-medium text-gray-700 mb-2 max-[425px]:mb-1 max-[375px]:mb-0.5 max-[320px]:mb-0.5">
                                        Description
                                    </label>
                                    <textarea
                                        placeholder="Optional description..."
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        rows={4}
                                        className="w-full px-4 max-[768px]:px-3 max-[425px]:px-3 max-[375px]:px-2.5 max-[320px]:px-2 py-3 max-[768px]:py-2 max-[425px]:py-2 max-[375px]:py-1.5 max-[320px]:py-1.5 border border-gray-300 rounded-lg text-sm max-[768px]:text-sm max-[425px]:text-sm max-[375px]:text-xs max-[320px]:text-xs focus:ring-2 focus:ring-[#058743] focus:border-transparent resize-none"
                                    />
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    className="w-full bg-black text-white py-3 max-[768px]:py-2 max-[425px]:py-2 max-[375px]:py-1.5 max-[320px]:py-1.5 px-6 max-[768px]:px-4 max-[425px]:px-3 max-[375px]:px-2 max-[320px]:px-1.5 rounded-lg font-medium text-sm max-[768px]:text-sm max-[425px]:text-sm max-[375px]:text-xs max-[320px]:text-xs hover:bg-gray-800 transition-colors"
                                >
                                    Add Transaction
                                </button>
                            </form>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 max-[768px]:p-4 max-[425px]:p-3 max-[375px]:p-2.5 max-[320px]:p-2 max-[768px]:order-2 w-full">
                            <h2 className="text-xl max-[768px]:text-lg max-[425px]:text-base max-[375px]:text-sm max-[320px]:text-sm font-semibold mb-2 max-[425px]:mb-1 max-[375px]:mb-1 max-[320px]:mb-0.5">Quick Stats</h2>
                            <p className="text-gray-600 max-[768px]:text-sm max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs mb-6 max-[768px]:mb-4 max-[425px]:mb-3 max-[375px]:mb-2 max-[320px]:mb-1.5">This month's summary</p>

                            <div className="space-y-6 max-[768px]:space-y-4 max-[425px]:space-y-3 max-[375px]:space-y-2.5 max-[320px]:space-y-2 max-[768px]:min-h-0">
                                {/* Total Income */}
                                <div className="bg-[#D4EADF] rounded-lg p-6 max-[768px]:p-4 max-[425px]:p-3 max-[375px]:p-2.5 max-[320px]:p-2 w-full">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-base max-[768px]:text-sm max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#058743] mb-2 max-[425px]:mb-1 max-[375px]:mb-0.5 max-[320px]:mb-0.5 font-medium">Total Income</p>
                                            <p className="text-3xl max-[768px]:text-2xl max-[425px]:text-xl max-[375px]:text-lg max-[320px]:text-base font-bold text-[#058743]">Rp0</p>
                                        </div>
                                        <div className="text-[#058743] text-3xl max-[768px]:text-2xl max-[425px]:text-xl max-[375px]:text-lg max-[320px]:text-base">+</div>
                                    </div>
                                </div>

                                {/* Total Expenses */}
                                <div className="bg-[#F9E4E3] rounded-lg p-6 max-[768px]:p-4 max-[425px]:p-3 max-[375px]:p-2.5 max-[320px]:p-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-base max-[768px]:text-sm max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#DC3545] mb-2 max-[425px]:mb-1 max-[375px]:mb-0.5 max-[320px]:mb-0.5 font-medium">Total Expenses</p>
                                            <p className="text-3xl max-[768px]:text-2xl max-[425px]:text-xl max-[375px]:text-lg max-[320px]:text-base font-bold text-[#DC3545]">Rp0</p>
                                        </div>
                                        <div className="text-[#DC3545] text-3xl max-[768px]:text-2xl max-[425px]:text-xl max-[375px]:text-lg max-[320px]:text-base">-</div>
                                    </div>
                                </div>

                                {/* Net Balance */}
                                <div className="bg-[#F2F8FE] rounded-lg p-6 max-[768px]:p-4 max-[425px]:p-3 max-[375px]:p-2.5 max-[320px]:p-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-base max-[768px]:text-sm max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#5877D0] mb-2 max-[425px]:mb-1 max-[375px]:mb-0.5 max-[320px]:mb-0.5 font-medium">Net Balance</p>
                                            <p className="text-3xl max-[768px]:text-2xl max-[425px]:text-xl max-[375px]:text-lg max-[320px]:text-base font-bold text-[#5877D0]">Rp0</p>
                                        </div>
                                        <div className="text-[#5877D0] text-3xl max-[768px]:text-2xl max-[425px]:text-xl max-[375px]:text-lg max-[320px]:text-base">$</div>
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