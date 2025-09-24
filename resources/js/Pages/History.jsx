import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

// --- DATA DUMMY ---
const transactionsData = [
    { id: 1, date: '1/9/2025', type: 'Income', category: 'Salary', description: 'Monthly Salary - September', amount: 8500000 },
    { id: 2, date: '3/9/2025', type: 'Expense', category: 'Entertainment', description: 'Concert tickets - WaveFest', amount: -750000 },
    { id: 3, date: '4/9/2025', type: 'Expense', category: 'Food', description: 'Lunch with team', amount: -125000 },
    { id: 4, date: '5/9/2025', type: 'Expense', category: 'Utilities', description: 'Electricity bill', amount: -450000 },
    { id: 5, date: '7/9/2025', type: 'Expense', category: 'Transport', description: 'Go-Jek to office', amount: -22000 },
    { id: 6, date: '10/9/2025', type: 'Expense', category: 'Entertainment', description: 'Movie tickets - Cinepolis', amount: -100000 },
    { id: 7, date: '12/9/2025', type: 'Income', category: 'Freelance', description: 'Web design project', amount: 1500000 },
    { id: 8, date: '15/9/2025', type: 'Expense', category: 'Shopping', description: 'New keyboard', amount: -899000 },
    { id: 9, date: '18/9/2025', type: 'Expense', category: 'Food', description: 'Weekly groceries', amount: -350000 },
    { id: 10, date: '20/9/2025', type: 'Expense', category: 'Others', description: 'Book purchase', amount: -150000 },
];

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

    const totalTransactions = transactionsData.length;
    
    const totalIncome = 10000000;
    const totalExpenses = 7580500;
        
    return (
        <AppLayout 
            title="MONA - History"
            auth={auth}
        >
            <Head title="History" />
            
            <div className="py-12 px-4 sm:px-6 lg:px-8 bg-[#F8F9FA]">
                <div className="max-w-7xl mx-auto">
                    
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-800">Transaction History</h1>
                        <p className="text-gray-500 mt-1">View and manage all your transactions</p>
                    </div>

                    {/* Summary Cards */}
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
                        <div className="w-full sm:w-auto flex-grow">
                            <input 
                                type="text"
                                placeholder="Search Transaction..."
                                className="w-full border-gray-300 rounded-md px-4 py-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                        <button className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition">All Types</button>
                        <button className="w-full sm:w-auto bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition">All Categories</button>
                        <button className="w-full sm:w-auto text-gray-600 px-4 py-2 rounded-md hover:bg-gray-100 transition">Clear Filters</button>
                    </div>

                    {/* Transactions Table */}
                    <div className="bg-white overflow-hidden shadow-md rounded-lg">
                        <div className="p-6">
                            <h3 className="text-lg font-semibold text-gray-800">Transactions</h3>
                            <p className="text-sm text-gray-500">Showing transactions</p>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
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
                                    {transactionsData.map((transaction) => (
                                        <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{transaction.date}</td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    transaction.type === 'Income'
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
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