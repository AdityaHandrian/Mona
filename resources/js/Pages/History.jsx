import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import EditTransaction from '@/Components/EditTransaction';

// --- DATA DUMMY ---
const transactionsData = []; // akan diganti hasil API

// Daftar Category
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
    // State filter
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('All');
    const [filterCategory, setFilterCategory] = useState('All');
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [meta, setMeta] = useState(null);
    const [deletingId, setDeletingId] = useState(null);
    const [message, setMessage] = useState({ type: '', text: '' });
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Category dropdown
    let availableCategories = [];
    if (filterType === 'Income') {
        availableCategories = incomeCategories;
    } else if (filterType === 'Expense') {
        availableCategories = expenseCategories;
    } else {
        availableCategories = [...new Set([...incomeCategories, ...expenseCategories])];
    }

    // ✅ Aman dari null values
    const filteredTransactions = transactions.filter((transaction) => {
        const typeMatch = filterType === 'All' || transaction.type === filterType;
        const categoryMatch = filterCategory === 'All' || (transaction.category ?? '') === filterCategory;

        const desc = (transaction.description ?? '').toLowerCase();
        const cat = (transaction.category ?? '').toLowerCase();
        const search = (searchTerm ?? '').toLowerCase();

        const searchMatch =
            !search || desc.includes(search) || cat.includes(search);

        return typeMatch && categoryMatch && searchMatch;
    });

    const searchRef = useRef(null);

    const fetchTransactions = async (page = 1) => {
        setLoading(true);
        setError(null);

        const paramsObj = {};
        if (filterType !== 'All') paramsObj.type = filterType.toLowerCase();
        if (filterCategory !== 'All' && categoryNameToIdMap[filterCategory]) {
            paramsObj.category_id = categoryNameToIdMap[filterCategory];
        } else if (filterCategory !== 'All') {
            paramsObj.search = filterCategory;
        }
        if (searchTerm) paramsObj.search = searchTerm;
        paramsObj.per_page = '100';
        paramsObj.page = String(page);

        try {
            await axios.get('/sanctum/csrf-cookie');
            const res = await axios.get('/api/transactions', {
                params: paramsObj,
                headers: { 'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
                withCredentials: true,
            });
            const body = res.data;
            setTransactions(body.data ?? []);
            setMeta(body.meta ?? null);
        } catch (err) {
            if (err?.response?.status === 401) {
                setError('Unauthorized — please log in.');
            } else {
                setError('Failed to fetch transactions.');
            }
        } finally {
            setLoading(false);
        }
    };

    const [categoryNameToIdMap, setCategoryNameToIdMap] = useState({});
    const fetchCategories = async () => {
        try {
            const res = await axios.get('/api/categories', { headers: { 'Accept': 'application/json' }, withCredentials: true });
            const list = res.data?.data ?? res.data ?? [];
            const map = {};
            list.forEach((c) => {
                if (c && c.category_name) map[c.category_name] = c.id ?? c.category_id ?? null;
            });
            setCategoryNameToIdMap(map);
        } catch (e) {
            console.warn('Could not fetch categories', e?.message ?? e);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        clearTimeout(searchRef.current);
        searchRef.current = setTimeout(() => fetchTransactions(1), 300);
        return () => clearTimeout(searchRef.current);
    }, [filterType, filterCategory, searchTerm]);

    const clearFilters = () => {
        setSearchTerm('');
        setFilterType('All');
        setFilterCategory('All');
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handleDelete = async (transactionId) => {
        if (!confirm('Are you sure you want to delete this transaction? This action cannot be undone.')) {
            return;
        }

        setDeletingId(transactionId);
        try {
            const response = await axios.delete(`/api/transactions/${transactionId}`, {
                headers: { 
                    'Accept': 'application/json', 
                    'X-Requested-With': 'XMLHttpRequest' 
                },
                withCredentials: true,
            });

            if (response.data.status === 'success') {
                showMessage('success', 'Transaction deleted successfully!');
                // Refresh the transactions list
                fetchTransactions(1);
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
            
            if (error.response?.status === 404) {
                showMessage('error', 'Transaction not found.');
            } else if (error.response?.status === 403) {
                showMessage('error', 'You are not authorized to delete this transaction.');
            } else {
                showMessage('error', 'Failed to delete transaction. Please try again.');
            }
        } finally {
            setDeletingId(null);
        }
    };

    const handleEdit = (transaction) => {
        // Convert the transaction data to the format expected by EditTransaction
        const editData = {
            id: transaction.id,
            type: transaction.type?.toLowerCase(), // Convert "Income"/"Expense" to "income"/"expense"
            amount: Math.abs(transaction.amount || 0), // Always positive for editing
            category_id: categoryNameToIdMap[transaction.category] || null,
            transaction_date: null, // Will be set from API if needed
            description: transaction.description || ''
        };

        // Try to find the exact date format - we might need to convert from display format
        if (transaction.date) {
            // Convert from "1/9/2025" format to "YYYY-MM-DD" format
            const dateParts = transaction.date.split('/');
            if (dateParts.length === 3) {
                const [day, month, year] = dateParts;
                editData.transaction_date = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
            }
        }

        setEditingTransaction(editData);
        setShowEditModal(true);
    };

    const handleEditClose = () => {
        setShowEditModal(false);
        setEditingTransaction(null);
    };

    const handleEditUpdate = () => {
        // Refresh transactions after successful update
        fetchTransactions(1);
        showMessage('success', 'Transaction updated successfully!');
    };

    const totalTransactions = filteredTransactions.length;
    const totalIncome = filteredTransactions.filter(t => t.type === 'Income').reduce((sum, t) => sum + (t.amount ?? 0), 0);
    const totalExpenses = filteredTransactions.filter(t => t.type === 'Expense').reduce((sum, t) => sum + (t.amount ?? 0), 0);

    return (
        <AppLayout title="MONA - History" auth={auth}>
            <Head title="History" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 md:py-8 bg-[F8F7F0]">

                    {/* Summary */}
                    <div className="mb-6 sm:mb-8">
                        <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-charcoal mb-2">Transaction History</h1>
                        <p className="text-xs sm:text-sm md:text-base lg:text-base xl:text-lg text-medium-gray">View and manage all your transactions</p>
                        
                        {/* Success/Error Message */}
                        {message.text && (
                            <div className={`mt-4 p-3 sm:p-4 rounded-lg text-sm sm:text-base ${
                                message.type === 'success' 
                                    ? 'bg-green-50 text-green-800 border border-green-200' 
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                                {message.text}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                            <h3 className="text-xs sm:text-sm text-gray-500">Total Transactions</h3>
                            <p className="text-lg sm:text-xl md:text-xl lg:text-xl xl:text-2xl font-bold text-gray-800">{totalTransactions}</p>
                        </div>
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                            <h3 className="text-xs sm:text-sm text-gray-500">Total Income</h3>
                            <p className="text-lg sm:text-xl md:text-xl lg:text-xl xl:text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</p>
                        </div>
                        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
                            <h3 className="text-xs sm:text-sm text-gray-500">Total Expenses</h3>
                            <p className="text-lg sm:text-xl md:text-xl lg:text-xl xl:text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</p>
                        </div>
                    </div>

                    {/* Filters */}
                    <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md mb-6 sm:mb-8 flex flex-col sm:flex-row items-center gap-3 sm:gap-4">
                        <input
                            type="text"
                            placeholder="Search Transaction..."
                            className="w-full text-sm sm:text-base border-gray-300 rounded-md px-3 sm:px-4 py-2 focus:ring-green-500 focus:border-green-500"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select
                            value={filterType}
                            onChange={(e) => { setFilterType(e.target.value); setFilterCategory('All'); }}
                            className="w-full sm:w-auto text-sm sm:text-base border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="All">All Types</option>
                            <option value="Income">Income</option>
                            <option value="Expense">Expense</option>
                        </select>
                        <select
                            value={filterCategory}
                            onChange={(e) => setFilterCategory(e.target.value)}
                            className="w-full sm:w-auto text-sm sm:text-base border-gray-300 rounded-md shadow-sm focus:ring-green-500 focus:border-green-500"
                        >
                            <option value="All">All Categories</option>
                            {availableCategories.map((category) => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <button onClick={clearFilters} className="w-full sm:w-auto text-sm sm:text-base text-gray-600 px-3 sm:px-4 py-2 rounded-md hover:bg-gray-100 transition flex-shrink-0">
                            Clear Filters
                        </button>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white overflow-hidden shadow-md rounded-lg">
                        <div className="p-4 sm:p-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-800">Transactions</h3>
                            <p className="text-xs sm:text-sm text-gray-500">Showing {filteredTransactions.length} transactions</p>
                        </div>
                        {loading && (
                            <div className="p-6 text-center text-gray-500">Loading...</div>
                        )}
                        {error && (
                            <div className="p-6 text-center text-red-600">{error}</div>
                        )}
                        
                        {/* Desktop Table View - Hidden on mobile and tablet */}
                        <div className="hidden lg:block overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredTransactions.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.date ?? '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                        transaction.type === 'Income'
                                                            ? 'bg-green-100 text-green-800'
                                                            : 'bg-red-100 text-red-800'
                                                    }`}
                                                >
                                                    {transaction.type ?? '-'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.category ?? '-'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.description ?? '-'}</td>
                                            <td
                                                className={`px-6 py-4 whitespace-nowrap text-sm font-medium ${
                                                    (transaction.amount ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}
                                            >
                                                {formatCurrency(transaction.amount ?? 0)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center gap-4">
                                                    <button 
                                                        onClick={() => handleEdit(transaction)}
                                                        className="text-blue-600 hover:text-blue-900 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                                        disabled={deletingId === transaction.id}
                                                    >
                                                        Edit
                                                    </button>
                                                    <button 
                                                        onClick={() => handleDelete(transaction.id)}
                                                        disabled={deletingId === transaction.id}
                                                        className="text-red-600 hover:text-red-900 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                                    >
                                                        {deletingId === transaction.id ? 'Deleting...' : 'Delete'}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Tablet & Mobile Card View - Shown below lg breakpoint */}
                        <div className="lg:hidden divide-y divide-gray-200">
                            {filteredTransactions.map((transaction) => (
                                <div key={transaction.id} className="p-4 sm:p-5 md:p-6 hover:bg-gray-50">
                                    {/* Header: Date and Type Badge */}
                                    <div className="flex justify-between items-start mb-3 md:mb-4">
                                        <span className="text-xs sm:text-sm md:text-base text-gray-500">{transaction.date ?? '-'}</span>
                                        <span
                                            className={`px-2 md:px-3 py-1 text-xs md:text-sm font-semibold rounded-full ${
                                                transaction.type === 'Income'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                            }`}
                                        >
                                            {transaction.type ?? '-'}
                                        </span>
                                    </div>

                                    {/* Category and Description */}
                                    <div className="mb-3 md:mb-4">
                                        <p className="text-sm md:text-base font-medium text-gray-900">{transaction.category ?? '-'}</p>
                                        <p className="text-xs md:text-sm text-gray-600 mt-1">{transaction.description ?? '-'}</p>
                                    </div>

                                    {/* Amount and Actions */}
                                    <div className="flex justify-between items-center">
                                        <span
                                            className={`text-base md:text-lg font-bold ${
                                                (transaction.amount ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'
                                            }`}
                                        >
                                            {formatCurrency(transaction.amount ?? 0)}
                                        </span>
                                        <div className="flex items-center gap-3 md:gap-4">
                                            <button 
                                                onClick={() => handleEdit(transaction)}
                                                className="text-sm md:text-base text-blue-600 hover:text-blue-900 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                                disabled={deletingId === transaction.id}
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(transaction.id)}
                                                disabled={deletingId === transaction.id}
                                                className="text-sm md:text-base text-red-600 hover:text-red-900 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                                            >
                                                {deletingId === transaction.id ? 'Deleting...' : 'Delete'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            {/* Edit Transaction Modal */}
            {showEditModal && editingTransaction && (
                <EditTransaction 
                    transaction={editingTransaction}
                    onClose={handleEditClose}
                    onUpdate={handleEditUpdate}
                />
            )}
        </AppLayout>
    );
}
