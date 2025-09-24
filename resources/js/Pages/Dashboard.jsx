import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    // Sample data - dalam implementasi nyata, data ini akan dari backend/API
    const [dashboardData] = useState({
        totalIncome: 92032000.00,
        totalExpenses: 89234200.00,
        currentBalance: 19450000.00,
        budgetProcess: 84,
        monthlyData: [
            { month: 'Mar', income: 5000, expenses: 4500 },
            { month: 'Apr', income: 6000, expenses: 5200 },
            { month: 'May', income: 5500, expenses: 4000 },
            { month: 'Jun', income: 7500, expenses: 6000 },
            { month: 'Jul', income: 9000, expenses: 7500 },
            { month: 'Aug', income: 10000, expenses: 7500 }
        ],
        expenseCategories: [
            { name: 'Others', percentage: 38.83, color: '#60A5FA' },
            { name: 'Utilities', percentage: 14.56, color: '#F59E0B' },
            { name: 'Food', percentage: 18.47, color: '#EF4444' },
            { name: 'Transport', percentage: 10.66, color: '#8B5CF6' },
            { name: 'Entertaiment', percentage: 17.48, color: '#3B82F6' }
        ]
    });

    // hover states
    const [hoveredCard, setHoveredCard] = useState(null); // 'income' | 'expenses' | 'balance' | 'budget'
    const [hoveredMonth, setHoveredMonth] = useState(null); // index of month
    const [hoveredCategory, setHoveredCategory] = useState(null); // index of expenseCategories

    // Format currency for Indonesian Rupiah
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(amount).replace('IDR', 'Rp');
    };

    // Get current user name
    const getUserName = () => {
        return auth?.user?.name || 'User';
    };

    // Calculate max value for chart scaling
    const maxValue = Math.max(
        ...dashboardData.monthlyData.map(data => Math.max(data.income, data.expenses))
    );

    return (
        <AppLayout title="MONA - Dashboard" auth={auth}>
            <Head title="Dashboard" />

            <div className="min-h-screen bg-[#F8F7F0]">
                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Message */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Good morning, {getUserName()}!
                        </h1>
                        <p className="text-gray-600">
                            Here is the overview of your financial health
                        </p>
                    </div>

                    {/* Financial Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Income */}
                        <div
                            onMouseEnter={() => setHoveredCard('income')}
                            onMouseLeave={() => setHoveredCard(null)}
                            className={`bg-white rounded-xl p-6 transition-all duration-200 border border-gray-200 ${
                                hoveredCard === 'income'
                                    ? 'shadow-lg ring-2 ring-green-100 -translate-y-1'
                                    : 'shadow-sm'
                            }`}
                            role="button"
                            tabIndex={0}
                        >
                            <h3 className="text-gray-600 text-sm font-medium mb-2">
                                Total Income
                            </h3>
                            <p className="text-2xl font-bold text-green-600">
                                {formatCurrency(dashboardData.totalIncome)}
                            </p>
                        </div>

                        {/* Total Expenses */}
                        <div
                            onMouseEnter={() => setHoveredCard('expenses')}
                            onMouseLeave={() => setHoveredCard(null)}
                            className={`bg-white rounded-xl p-6 transition-all duration-200 border border-gray-200 ${
                                hoveredCard === 'expenses'
                                    ? 'shadow-lg ring-2 ring-red-100 -translate-y-1'
                                    : 'shadow-sm'
                            }`}
                            role="button"
                            tabIndex={0}
                        >
                            <h3 className="text-gray-600 text-sm font-medium mb-2">
                                Total Expenses
                            </h3>
                            <p className="text-2xl font-bold text-red-500">
                                {formatCurrency(dashboardData.totalExpenses)}
                            </p>
                        </div>

                        {/* Current Balance */}
                        <div
                            onMouseEnter={() => setHoveredCard('balance')}
                            onMouseLeave={() => setHoveredCard(null)}
                            className={`bg-white rounded-xl p-6 transition-all duration-200 border border-gray-200 ${
                                hoveredCard === 'balance'
                                    ? 'shadow-lg ring-2 ring-gray-100 -translate-y-1'
                                    : 'shadow-sm'
                            }`}
                            role="button"
                            tabIndex={0}
                        >
                            <h3 className="text-gray-600 text-sm font-medium mb-2">
                                Current Balance
                            </h3>
                            <p className="text-2xl font-bold text-gray-900">
                                {formatCurrency(dashboardData.currentBalance)}
                            </p>
                        </div>

                        {/* Budget Process */}
                        <div
                            onMouseEnter={() => setHoveredCard('budget')}
                            onMouseLeave={() => setHoveredCard(null)}
                            className={`bg-white rounded-xl p-6 transition-all duration-200 border border-gray-200 ${
                                hoveredCard === 'budget'
                                    ? 'shadow-lg ring-2 ring-yellow-100 -translate-y-1'
                                    : 'shadow-sm'
                            }`}
                            role="button"
                            tabIndex={0}
                        >
                            <h3 className="text-gray-600 text-sm font-medium mb-2">
                                Budget Process
                            </h3>
                            <p className="text-2xl font-bold text-yellow-500">
                                {dashboardData.budgetProcess}%
                            </p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Income vs Expenses Chart */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    Income vs Expenses
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Monthly comparison over the last 6 months
                                </p>
                            </div>

                            <div className="relative">
                                {/* Chart Container */}
                                <div className="flex items-end justify-between h-64 space-x-2">
                                    {dashboardData.monthlyData.map((data, index) => (
                                        <div
                                            key={index}
                                            className="flex flex-col items-center space-y-2 flex-1"
                                            onMouseEnter={() => setHoveredMonth(index)}
                                            onMouseLeave={() => setHoveredMonth(null)}
                                        >
                                            {/* Bars */}
                                            <div className="flex items-end space-x-1 h-48">
                                                {/* Income Bar */}
                                                <div
                                                    className={`rounded-t w-4 origin-bottom transform transition-all duration-200 ${
                                                        hoveredMonth === index
                                                            ? 'scale-y-105 shadow-md'
                                                            : ''
                                                    }`}
                                                    style={{
                                                        height: `${
                                                            (data.income / maxValue) * 100
                                                        }%`,
                                                        backgroundColor: '#16a34a'
                                                    }}
                                                    title={`Income ${data.month}: ${formatCurrency(
                                                        data.income
                                                    )}`}
                                                ></div>
                                                {/* Expense Bar */}
                                                <div
                                                    className={`rounded-t w-4 origin-bottom transform transition-all duration-200 ${
                                                        hoveredMonth === index
                                                            ? 'scale-y-105 shadow-md'
                                                            : ''
                                                    }`}
                                                    style={{
                                                        height: `${
                                                            (data.expenses / maxValue) * 100
                                                        }%`,
                                                        backgroundColor: '#fb7185'
                                                    }}
                                                    title={`Expenses ${data.month}: ${formatCurrency(
                                                        data.expenses
                                                    )}`}
                                                ></div>
                                            </div>
                                            {/* Month Label */}
                                            <span
                                                className={`text-xs font-medium ${
                                                    hoveredMonth === index
                                                        ? 'text-gray-900'
                                                        : 'text-gray-600'
                                                }`}
                                            >
                                                {data.month}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                {/* Legend */}
                                <div className="flex justify-center space-x-6 mt-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                                        <span className="text-sm text-gray-600">Income</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-red-400 rounded"></div>
                                        <span className="text-sm text-gray-600">Expenses</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expense Categories Pie Chart */}
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                    Expense Categories
                                </h3>
                                <p className="text-sm text-gray-600">
                                    Breakdown of this month's expenses
                                </p>
                            </div>

                            <div className="flex items-center justify-center">
                                {/* Pie Chart SVG */}
                                <div className="relative w-48 h-48">
                                    <svg
                                        className="w-full h-full transform -rotate-90"
                                        viewBox="0 0 100 100"
                                        role="img"
                                        aria-label="Expense categories pie chart"
                                    >
                                        {(() => {
                                            let cumulativePercentage = 0;
                                            return dashboardData.expenseCategories.map(
                                                (category, index) => {
                                                    const startAngle =
                                                        cumulativePercentage * 3.6;
                                                    const endAngle =
                                                        (cumulativePercentage +
                                                            category.percentage) *
                                                        3.6;
                                                    cumulativePercentage +=
                                                        category.percentage;

                                                    // Calculate path for pie slice
                                                    const startAngleRad =
                                                        (startAngle * Math.PI) / 180;
                                                    const endAngleRad =
                                                        (endAngle * Math.PI) / 180;

                                                    const largeArcFlag =
                                                        category.percentage > 50 ? 1 : 0;

                                                    const x1 =
                                                        50 + 40 * Math.cos(startAngleRad);
                                                    const y1 =
                                                        50 + 40 * Math.sin(startAngleRad);
                                                    const x2 =
                                                        50 + 40 * Math.cos(endAngleRad);
                                                    const y2 =
                                                        50 + 40 * Math.sin(endAngleRad);

                                                    const pathData = [
                                                        `M 50 50`,
                                                        `L ${x1} ${y1}`,
                                                        `A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                                        'Z'
                                                    ].join(' ');

                                                    const isHovered =
                                                        hoveredCategory === index;
                                                    const transformStyle = isHovered
                                                        ? 'scale(1.06)'
                                                        : 'scale(1)';
                                                    const stroke = isHovered
                                                        ? '#111827'
                                                        : 'none';
                                                    const strokeWidth = isHovered ? 0.8 : 0;

                                                    return (
                                                        <path
                                                            key={index}
                                                            d={pathData}
                                                            fill={category.color}
                                                            className="transition-all cursor-pointer"
                                                            style={{
                                                                transformOrigin: '50% 50%',
                                                                transform: transformStyle,
                                                                transition:
                                                                    'transform 160ms ease'
                                                            }}
                                                            onMouseEnter={() =>
                                                                setHoveredCategory(index)
                                                            }
                                                            onMouseLeave={() =>
                                                                setHoveredCategory(null)
                                                            }
                                                            stroke={stroke}
                                                            strokeWidth={strokeWidth}
                                                        />
                                                    );
                                                }
                                            );
                                        })()}
                                    </svg>
                                </div>

                                {/* Legend */}
                                <div className="ml-8 space-y-3">
                                    {dashboardData.expenseCategories.map(
                                        (category, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center space-x-3 cursor-pointer transition-all duration-150 p-1 rounded ${
                                                    hoveredCategory === index
                                                        ? 'bg-gray-50 -translate-x-1'
                                                        : ''
                                                }`}
                                                onMouseEnter={() =>
                                                    setHoveredCategory(index)
                                                }
                                                onMouseLeave={() =>
                                                    setHoveredCategory(null)
                                                }
                                                role="button"
                                                tabIndex={0}
                                            >
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{
                                                        backgroundColor: category.color
                                                    }}
                                                ></div>
                                                <span
                                                    className={`text-sm ${
                                                        hoveredCategory === index
                                                            ? 'text-gray-900 font-medium'
                                                            : 'text-gray-700'
                                                    }`}
                                                >
                                                    {category.name}
                                                </span>
                                                <span
                                                    className={`text-sm ml-auto ${
                                                        hoveredCategory === index
                                                            ? 'text-gray-700'
                                                            : 'text-gray-500'
                                                    }`}
                                                >
                                                    {category.percentage}%
                                                </span>
                                            </div>
                                        )
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Floating Action Button */}
                <div className="fixed bottom-6 right-6">
                    <button className="w-14 h-14 bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center">
                        <svg
                            className="w-6 h-6"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4v16m8-8H4"
                            />
                        </svg>
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}
