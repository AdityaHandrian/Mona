import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Landing({ auth }) {
    const landingNavigation = (
        <div className="flex items-center gap-4">
            <a
                >
                
            </a>
            <a
                href="/dashboard"
                className="bg-growth-green-500 text-white px-6 max-[425px]:px-4 py-3 max-[425px]:py-2 rounded-lg font-semibold max-[425px]:text-sm hover:bg-growth-green-600 transition-colors duration-200"
            >
                Get Started
            </a>
        </div>
    );

    return (
        <AppLayout
            title="MONA - Take Full Control of Your Financial Future"
            auth={auth}
            navigation={landingNavigation}
        >
            <Head title="Landing" />

            {/* Animation Styles */}
            <style>{`
                @keyframes fadeInUp {
                    from { opacity: 0; transform: translateY(50px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                .animate-fade-in-up { animation: fadeInUp 1s ease-out forwards; }
                .card-hover { transition: all 0.4s cubic-bezier(0.4,0,0.2,1); }
                .card-hover:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 25px 60px rgba(0,0,0,0.15);
                }
                .delay-100 { animation-delay: 0.2s; opacity: 0; }
                .delay-200 { animation-delay: 0.4s; opacity: 0; }
                .delay-300 { animation-delay: 0.6s; opacity: 0; }
                .delay-400 { animation-delay: 0.8s; opacity: 0; }
            `}</style>

            {/* Hero Section */}
            <section className="text-center py-20 max-[768px]:py-16 max-[425px]:py-12">
                <div className="max-w-[1500px] mx-auto px-6 max-[425px]:px-4">
                    <div className="max-w-6xl mx-auto">
                        <h1 className="animate-fade-in-up text-4xl md:text-5xl lg:text-6xl max-[425px]:text-2xl font-bold text-[#2C2C2C] leading-tight mb-6 max-[425px]:mb-4">
                            Take Full Control of Your <span className="text-growth-green-500">Financial Future</span>
                        </h1>

                        <p className="animate-fade-in-up delay-100 text-xl lg:text-xl max-[768px]:text-lg max-[425px]:text-base text-[#2C2C2C] mb-8 max-[425px]:mb-6 max-w-2xl mx-auto leading-relaxed">
                            <span className="font-bold text-growth-green-500">MONA</span> is the simplest way to manage your personal finances. Track spending, create budgets, and achieve your savings goals with ease.
                        </p>

                        <div className="flex items-center justify-center gap-3 max-[425px]:gap-2">
                            <Link
                                href={route('register')}
                                className="animate-fade-in-up delay-200 inline-block bg-growth-green-500 text-white px-10 max-[425px]:px-6 py-4 max-[425px]:py-3 rounded-lg text-xl max-[425px]:text-lg font-semibold hover:bg-growth-green-600 transition-colors duration-200"
                            >
                                Sign Up For Free
                            </Link>
                            <a
                                href="#features"
                                onClick={(e) => {
                                    e.preventDefault();
                                    const el = document.getElementById('features');
                                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }}
                                className="animate-fade-in-up delay-300 inline-block border border-growth-green-200 text-[#2C2C2C] hover:text-growth-green-500 hover:border-growth-green-500 px-6 py-4 max-[425px]:py-3 rounded-lg text-lg max-[425px]:text-base font-medium transition-colors duration-200"
                            >
                                Learn More
                            </a>
                        </div>
                    </div>
                </div>
            </section>

            {/* ABOUT & MERGED FEATURES SECTION */}
            <section id="features" className="py-20 max-[768px]:py-16 max-[425px]:py-12" style={{backgroundColor: '#F8F7F0'}}>
                <div className="max-w-[1500px] mx-auto px-6 max-[425px]:px-4">
                    {/* Header About */}
                    <div className="text-center mb-16">
                        <h2 className="animate-fade-in-up text-3xl md:text-4xl max-[425px]:text-2xl font-bold text-[#2C2C2C] mb-6">
                            About <span className="text-growth-green-500">MONA</span>
                        </h2>
                        <p className="animate-fade-in-up delay-100 text-lg max-[425px]:text-base text-[#2C2C2C] max-w-3xl mx-auto leading-relaxed">
MONA (Money Assistant) is a personal financial assistant that helps you take control of your financial future with a smart dashboard, automated expense tracking, flexible budgeting, and insightful analytics.                        </p>
                    </div>

                    {/* AI-Powered Features Grid (7 cards in 2-3-2 layout) */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-[768px]:gap-6 max-[425px]:gap-4">
                        {/* Smart Dashboard */}
                        <div className="card-hover animate-fade-in-up delay-200 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0]">
                            <div className="w-12 h-12 bg-growth-green-500/10 rounded-lg flex items-center justify-center mb-6 max-[425px]:mb-4">
                                <svg className="w-6 h-6 text-growth-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">AI-Powered Smart Dashboard</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Real-time financial insights powered by advanced data analytics and machine learning algorithms. Get personalized spending recommendations and predictive budgeting suggestions.
                            </p>
                        </div>

                        {/* Smart Expense Tracking */}
                        <div className="card-hover animate-fade-in-up delay-200 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0]">
                            <div className="w-12 h-12 bg-growth-green-500/10 rounded-lg flex items-center justify-center mb-6 max-[425px]:mb-4">
                                <svg className="w-6 h-6 text-growth-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <h3 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">AI-Driven Expense Tracking</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Automatically categorize transactions using Natural Language Processing and machine learning. Smart detection of spending patterns and anomaly alerts for unusual expenses.
                            </p>
                        </div>

                        {/* Smart Budgeting */}
                        <div className="card-hover animate-fade-in-up delay-300 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0]">
                            <div className="w-12 h-12 bg-growth-green-500/10 rounded-lg flex items-center justify-center mb-6 max-[425px]:mb-4">
                                <svg className="w-6 h-6 text-growth-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">Smart Budgeting System</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Create adaptive budgets that learn from your spending habits. AI-powered notifications and recommendations help you stay on track with your financial goals.
                            </p>
                        </div>

                        {/* Advanced Receipt Scanner */}
                        <div className="card-hover animate-fade-in-up delay-300 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0]">
                            <div className="w-12 h-12 bg-growth-green-500/10 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-growth-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">AI Receipt Scanner</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Advanced Optical Character Recognition (OCR) technology with 99%+ accuracy. Instantly extracts merchant names, amounts, dates, and tax information from any receipt format or quality.
                            </p>
                        </div>

                        {/* Intelligent Transaction History */}
                        <div className="card-hover animate-fade-in-up delay-400 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0]">
                            <div className="w-12 h-12 bg-growth-green-500/10 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-growth-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">Smart Transaction History</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Intelligent search and filtering powered by natural language queries. Find transactions using descriptions like "coffee last week" or "groceries this month."
                            </p>
                        </div>

                        {/* Advanced Analytics */}
                        <div className="card-hover animate-fade-in-up delay-400 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0]">
                            <div className="w-12 h-12 bg-growth-green-500/10 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-growth-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">AI-Powered Analytics</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Generate actionable financial insights using advanced data science algorithms. Predictive modeling helps forecast future expenses and identify saving opportunities.
                            </p>
                        </div>

                        {/* AI Assistant - New Feature */}
                        <div className="card-hover animate-fade-in-up delay-400 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0] md:col-span-2 lg:col-span-1 lg:col-start-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-6">
                                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-[#2C2C2C] mb-3">AI Financial Assistant</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Your personal AI financial advisor that answers questions, provides spending insights, and offers personalized financial guidance through natural conversation.
                            </p>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mt-24">
                        <div className="text-center mb-12">
                            <h3 className="animate-fade-in-up text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-3">How MONA's AI Works</h3>
                            <p className="animate-fade-in-up delay-100 text-[#2C2C2C] max-w-2xl mx-auto text-lg">
                                Experience the future of financial management with AI-powered automation and intelligent insights.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-[768px]:gap-6 max-[425px]:gap-6">
                            {/* Step 1 */}
                            <div className="text-center animate-fade-in-up delay-200">
                                <div className="w-16 h-16 bg-growth-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-2xl font-bold text-white">1</span>
                                </div>
                                <h4 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">AI-Powered Setup</h4>
                                <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                    Create your account and let AI analyze your financial patterns to personalize your experience from day one.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="text-center animate-fade-in-up delay-300">
                                <div className="w-16 h-16 bg-growth-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-2xl font-bold text-white">2</span>
                                </div>
                                <h4 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">Smart Data Capture</h4>
                                <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                    Simply snap photos of receipts or enter transactions manually. AI instantly categorizes and processes everything automatically.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="text-center animate-fade-in-up delay-400">
                                <div className="w-16 h-16 bg-growth-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-2xl font-bold text-white">3</span>
                                </div>
                                <h4 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">Intelligent Optimization</h4>
                                <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                    Receive AI-powered insights, predictive budgets, and personalized recommendations to optimize your financial health.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-20">
                        <Link
                            href={route('register')}
                            className="inline-block bg-growth-green-500 text-white px-10 max-[425px]:px-6 py-4 max-[425px]:py-3 rounded-lg text-xl max-[425px]:text-lg font-semibold hover:bg-growth-green-600 transition-colors duration-200"
                        >
                            Experience AI-Powered Finance
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#E0E0E0] bg-white">
                <div className="max-w-[1500px] mx-auto px-6 max-[425px]:px-4 py-4 text-center">
                    <p className="text-[#2C2C2C] text-sm max-[425px]:text-xs">
                        © 2025 MONA. All Rights Reserved. Built with <span className="text-red-500">❤</span> for better financial habits.
                    </p>
                </div>
            </footer>
        </AppLayout>
    );
}
