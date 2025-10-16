import { useState, useMemo } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Dashboard({ auth }) {
    /* 
    ====================================================================
    📝 BACKEND API INTEGRATION NOTES:
    ====================================================================
    
    For backend team: This dashboard expects data from these API endpoints:
    
    1. 📊 Monthly Chart Data: GET /api/dashboard/monthly-stats
       - Should return last 6 months of income/expense data
       - Use the 'fullDate' field (YYYY-MM format) to query your database
       - Expected response format:
       {
         "monthlyData": [
           {
             "month": "May",
             "year": 2025, 
             "fullDate": "2025-05",
             "income": 5000000.00,
             "expenses": 3500000.00
           },
           // ... more months
         ]
       }

    2. 💰 Financial Overview: GET /api/dashboard/financial-overview  
       - Total income, expenses, current balance, budget progress
       - Expected response format:
       {
         "totalIncome": 92032000.00,
         "totalExpenses": 89234200.00, 
         "currentBalance": 19450000.00,
         "budgetProcess": 84
       }

    3. 🍕 Expense Categories: GET /api/dashboard/expense-categories
       - Pie chart data for current month's expense breakdown
       - Expected response format:
       {
         "expenseCategories": [
           { "name": "Food", "percentage": 18.47, "color": "#EF4444" },
           // ... more categories
         ]
       }

    The months are automatically generated based on current date (October 2025),
    so backend just needs to query database using the fullDate values.
    ====================================================================
    */

    // Generate last 6 months dynamically based on current date
    const generateLast6Months = useMemo(() => {
        const months = [];
        const currentDate = new Date();
        
        // Get month names in short format
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Generate last 6 months including current month
        for (let i = 5; i >= 0; i--) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
            const monthName = monthNames[date.getMonth()];
            const year = date.getFullYear();
            const fullDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            
            months.push({
                month: monthName,
                year: year,
                fullDate: fullDate, // Backend can use this for API queries (YYYY-MM format)
                displayName: `${monthName} ${year}`, // Full display name if needed
                // Sample data - backend will replace these with real values
                income: Math.floor(Math.random() * 5000) + 3000, // Random sample data
                expenses: Math.floor(Math.random() * 4000) + 2000
            });
        }
        
        return months;
    }, []); // Empty dependency array since we only want to calculate this once

    // Sample data - dalam implementasi nyata, data ini akan dari backend/API
    const [dashboardData] = useState({
        totalIncome: 92032000.00,
        totalExpenses: 89234200.00,
        currentBalance: 19450000.00,
        budgetProcess: 84,
        monthlyData: generateLast6Months, // Use dynamically generated months
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

    // Get time-based greeting
    const getGreeting = () => {
        const hour = new Date().getHours();
        
        if (hour >= 5 && hour < 12) {
            return 'Good morning';
        } else if (hour >= 12 && hour < 17) {
            return 'Good afternoon';
        } else if (hour >= 17 && hour < 21) {
            return 'Good evening';
        } else {
            return 'Good night';
        }
    };

    // Calculate max value for chart scaling
    const maxValue = Math.max(
        ...dashboardData.monthlyData.map(data => Math.max(data.income, data.expenses))
    );

    return (
        <AppLayout title="MONA - Dashboard" auth={auth}>
            <Head title="Dashboard" />
            
            {/* Animation Styles */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.8s ease-out forwards;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                .delay-100 { animation-delay: 0.1s; opacity: 0; }
                .delay-200 { animation-delay: 0.2s; opacity: 0; }
                .delay-300 { animation-delay: 0.3s; opacity: 0; }
                .delay-400 { animation-delay: 0.4s; opacity: 0; }
                .delay-500 { animation-delay: 0.5s; opacity: 0; }
                .delay-600 { animation-delay: 0.6s; opacity: 0; }
            `}</style>

            <div className="">
                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Welcome Message */}
                    <div className="mb-8 animate-fade-in">
                        <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-charcoal mb-2">
                            {getGreeting()}, {getUserName()}!
                        </h1>
                        <p className="text-sm sm:text-base md:text-base lg:text-base xl:text-lg text-medium-gray">
                            Here is the overview of your financial health
                        </p>
                    </div>

                    {/* Financial Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {/* Total Income */}
                        <div
                            onMouseEnter={() => setHoveredCard('income')}
                            onMouseLeave={() => setHoveredCard(null)}
                            className={`animate-fade-in-up delay-100 bg-white rounded-xl p-6 transition-all duration-200 border border-gray-200 ${
                                hoveredCard === 'income'
                                    ? 'shadow-lg ring-2 ring-green-100 -translate-y-1'
                                    : 'shadow-sm'
                            }`}
                            role="button"
                            tabIndex={0}
                        >
                            <h3 className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-sm xl:text-base font-medium mb-2">
                                Total Income
                            </h3>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl font-bold text-green-600">
                                {formatCurrency(dashboardData.totalIncome)}
                            </p>
                        </div>

                        {/* Total Expenses */}
                        <div
                            onMouseEnter={() => setHoveredCard('expenses')}
                            onMouseLeave={() => setHoveredCard(null)}
                            className={`animate-fade-in-up delay-200 bg-white rounded-xl p-6 transition-all duration-200 border border-gray-200 ${
                                hoveredCard === 'expenses'
                                    ? 'shadow-lg ring-2 ring-red-100 -translate-y-1'
                                    : 'shadow-sm'
                            }`}
                            role="button"
                            tabIndex={0}
                        >
                            <h3 className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-sm xl:text-base font-medium mb-2">
                                Total Expenses
                            </h3>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl font-bold text-red-500">
                                {formatCurrency(dashboardData.totalExpenses)}
                            </p>
                        </div>

                        {/* Current Balance */}
                        <div
                            onMouseEnter={() => setHoveredCard('balance')}
                            onMouseLeave={() => setHoveredCard(null)}
                            className={`animate-fade-in-up delay-300 bg-white rounded-xl p-6 transition-all duration-200 border border-gray-200 ${
                                hoveredCard === 'balance'
                                    ? 'shadow-lg ring-2 ring-gray-100 -translate-y-1'
                                    : 'shadow-sm'
                            }`}
                            role="button"
                            tabIndex={0}
                        >
                            <h3 className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-sm xl:text-base font-medium mb-2">
                                Current Balance
                            </h3>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl font-bold text-gray-900">
                                {formatCurrency(dashboardData.currentBalance)}
                            </p>
                        </div>

                        {/* Budget Process */}
                        <div
                            onMouseEnter={() => setHoveredCard('budget')}
                            onMouseLeave={() => setHoveredCard(null)}
                            className={`animate-fade-in-up delay-400 bg-white rounded-xl p-6 transition-all duration-200 border border-gray-200 ${
                                hoveredCard === 'budget'
                                    ? 'shadow-lg ring-2 ring-yellow-100 -translate-y-1'
                                    : 'shadow-sm'
                            }`}
                            role="button"
                            tabIndex={0}
                        >
                            <h3 className="text-gray-600 text-xs sm:text-sm md:text-base lg:text-sm xl:text-base font-medium mb-2">
                                Budget Process
                            </h3>
                            <p className="text-lg sm:text-xl md:text-2xl lg:text-xl xl:text-2xl font-bold text-yellow-500">
                                {dashboardData.budgetProcess}%
                            </p>
                        </div>
                    </div>

                    {/* Charts Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Income vs Expenses Chart */}
                        <div className="animate-fade-in-up delay-500 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="mb-6">
                                <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl font-semibold text-gray-900 mb-1">
                                    Income vs Expenses
                                </h3>
                                <p className="text-xs sm:text-sm md:text-base lg:text-sm xl:text-base text-gray-600">
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
                                                    title={`Income ${data.month} ${data.year}: ${formatCurrency(
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
                                                    title={`Expenses ${data.month} ${data.year}: ${formatCurrency(
                                                        data.expenses
                                                    )}`}
                                                ></div>
                                            </div>
                                                            {/* Month Label */}
                                            <span
                                                className={`text-xs sm:text-sm md:text-base lg:text-sm xl:text-sm font-medium ${
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
                                <div className="flex justify-center space-x-4 sm:space-x-6 mt-4">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-green-500 rounded"></div>
                                        <span className="text-xs sm:text-sm md:text-base lg:text-sm xl:text-sm text-gray-600">Income</span>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <div className="w-3 h-3 bg-red-400 rounded"></div>
                                        <span className="text-xs sm:text-sm md:text-base lg:text-sm xl:text-sm text-gray-600">Expenses</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Expense Categories Pie Chart */}
                        <div className="animate-fade-in-up delay-600 bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                            <div className="mb-6">
                                <h3 className="text-base sm:text-lg md:text-xl lg:text-lg xl:text-xl font-semibold text-gray-900 mb-1">
                                    Expense Categories
                                </h3>
                                <p className="text-xs sm:text-sm md:text-base lg:text-sm xl:text-base text-gray-600">
                                    Breakdown of this month's expenses
                                </p>
                            </div>

                            <div className="flex flex-col lg:flex-row items-center justify-center">
                                {/* Pie Chart SVG */}
                                <div className="relative w-40 h-40 sm:w-48 sm:h-48 md:w-56 md:h-56 lg:w-48 lg:h-48 xl:w-56 xl:h-56">
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
                                <div className="mt-6 lg:mt-0 lg:ml-6 xl:ml-8 space-y-2 sm:space-y-3 w-full lg:w-auto">
                                    {dashboardData.expenseCategories.map(
                                        (category, index) => (
                                            <div
                                                key={index}
                                                className={`flex items-center space-x-3 cursor-pointer transition-all duration-150 p-1 sm:p-2 rounded ${
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
                                                    className="w-3 h-3 sm:w-4 sm:h-4 rounded-full flex-shrink-0"
                                                    style={{
                                                        backgroundColor: category.color
                                                    }}
                                                ></div>
                                                <span
                                                    className={`text-xs sm:text-sm md:text-base lg:text-sm xl:text-base flex-1 ${
                                                        hoveredCategory === index
                                                            ? 'text-gray-900 font-medium'
                                                            : 'text-gray-700'
                                                    }`}
                                                >
                                                    {category.name}
                                                </span>
                                                <span
                                                    className={`text-xs sm:text-sm md:text-base lg:text-sm xl:text-base font-medium ${
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
            </div>
        </AppLayout>
    );
}
