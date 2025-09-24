import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { useState } from 'react';

// --- DATA DUMMY ---
const transactionsData = [
    { id: 1, date: '1/9/2025', type: 'Income', category: 'Salary', description: 'Monthly Salary - September', amount: 8500000 },
    { id: 2, date: '3/9/2025', type: 'Expense', category: 'Entertainment', description: 'Concert tickets - WaveFest', amount: -750000 },
    { id: 3, date: '4/9/2025', type: 'Expense', category: 'Food and Beverages', description: 'Lunch with team', amount: -125000 },
    { id: 4, date: '5/9/2025', type: 'Expense', category: 'Bills and Utilities', description: 'Electricity bill', amount: -450000 },
    { id: 5, date: '7/9/2025', type: 'Expense', category: 'Shopping', description: 'New shoes', amount: -650000 },
    { id: 6, date: '10/9/2025', type: 'Expense', category: 'Entertainment', description: 'Movie tickets - Cinepolis', amount: -100000 },
    { id: 7, date: '12/9/2025', type: 'Income', category: 'Freelance', description: 'Web design project', amount: 1500000 },
    { id: 8, date: '15/9/2025', type: 'Expense', category: 'Shopping', description: 'New keyboard', amount: -899000 },
    { id: 9, date: '18/9/2025', type: 'Expense', category: 'Food and Beverages', description: 'Weekly groceries', amount: -350000 },
    { id: 10, date: '20/9/2025', type: 'Expense', category: 'Other', description: 'Book purchase', amount: -150000 },
];

// Daftar Categoryyy
const incomeCategories = ['Salary', 'Freelance', 'Business', 'Investment', 'Gift', 'Other'];
const expenseCategories = ['Food and Beverages', 'Shopping', 'Entertainment', 'Bills and Utilities', 'Transport', 'Other'];

// Helper function Rupiah
const formatCurrency = (value) => {
    const number = Math.abs(value);
    const formatted = new Intl.NumberFormat('id-ID', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
    return `${value < 0 ? '-' : ''}Rp${formatted}`;
};

export default function History({ auth }) {
    // State untuk filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');

    // Category di Dropdown
    let availableCategories = [];
    if (filterType === 'Income') {
        availableCategories = incomeCategories;
    } else if (filterType === 'Expense') {
        availableCategories = expenseCategories;
    } else {
        availableCategories = [...new Set([...incomeCategories, ...expenseCategories])];
    }
    
    // Filter
    const filteredTransactions = transactionsData.filter(transaction => {
        const typeMatch = filterType === 'All' || transaction.type === filterType;
        const categoryMatch = filterCategory === 'All' || transaction.category === filterCategory;
        const searchMatch = !searchTerm || 
                            transaction.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            transaction.category.toLowerCase().includes(searchTerm.toLowerCase());
        
        return typeMatch && categoryMatch && searchMatch;
    });

    // Fungsi untuk reset filter
    const clearFilters = () => {
        setSearchTerm('');
        setFilterType('All');
        setFilterCategory('All');
    };

    // Kalkulasi summary berdasarkan data yang sudah difilter
    const totalTransactions = filteredTransactions.length;
    const totalIncome = filteredTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = filteredTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + t.amount, 0);

    return (
        <AppLayout
            title="MONA - History"
            auth={auth}
        >
            <Head title="History" />
            
            <div className="py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
                <div className="max-w-7xl mx-auto">
                    
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Transaction History</h1>
                        <p className="text-gray-500 mt-1">View and manage all your transactions</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-gray-500">Total Transactions</h3>
                            <p className="text-2xl font-bold text-gray-800">{totalTransactions}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-gray-500">Total Income</h3>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow-md">
                            <h3 className="text-gray-500">Total Expenses</h3>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                        </div>
                    </div>

                    {/* Filter Section */}
                    <div className="bg-white p-4 rounded-lg shadow-md mb-8 flex flex-col sm:flex-row items-center gap-4">
                        <input 
                            type="text"
                            placeholder="Search Transaction..."
                            className="w-full border-gray-300 rounded-md px-4 py-2 focus:ring-green-500 focus:border-green-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {/* Filter Tipe */}
                        <select
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value); setFilterCategory('All'); }} // Reset kategori saat tipe berubah
                            className="w-full sm:w-auto border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="All">All Types</option>
                            <option value="Income">Income</option>
                            <option value="Expense">Expense</option>
                        </select>
                        {/* Filter Kategori */}
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full sm:w-auto border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="All">All Categories</option>
                            {availableCategories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <button onClick={clearFilters} className="w-full sm:w-auto text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100 transition flex-shrink-0">
                            Clear Filters
                        </button>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white overflow-hidden shadow-md rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800">Transactions</h3>
                            <p className="text-sm text-gray-500">Showing {filteredTransactions.length} transactions</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    {/* ... table headers ... */}
                                    <tr>
                                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                       <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                   </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${transaction.type === 'Income' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                                    {transaction.type}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.category}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.description}</td>
                                            <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                {formatCurrency(transaction.amount)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-4">
                                                    <button className="text-blue-600 hover:text-blue-900 font-medium">Edit</button>
                                                    <button className="text-red-600 hover:text-red-900 font-medium">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}