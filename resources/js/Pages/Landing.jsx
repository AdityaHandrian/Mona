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
                                className="bg-white animate-fade-in-up delay-300 inline-block border border-growth-green-200 text-[#2C2C2C] hover:text-growth-green-500 hover:border-growth-green-500 px-6 py-4 max-[425px]:py-3 rounded-lg text-lg max-[425px]:text-base font-medium transition-colors duration-200"
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
                            MONA (Money Assistant) is your intelligent personal finance companion designed to help you take complete control of your financial future. Built with modern technology and user-centric design, MONA makes managing money simple, secure, and insightful.
                        </p>
                    </div>

                    {/* Features Grid (6 cards) */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-[768px]:gap-6 max-[425px]:gap-4">
                        {/* Transaction Tracking */}
                        <div className="card-hover animate-fade-in-up delay-200 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0]">
                            <div className="w-12 h-12 bg-[#058743]/10 rounded-lg flex items-center justify-center mb-6 max-[425px]:mb-4">
                                <svg className="w-6 h-6 text-[#058743]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                </svg>
                            </div>
                            <h3 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">Money Tracking</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Monitor all your incomes and expenses in one place. Get a complete overview of your financial transactions with detailed categorization and real-time balance updates.
                            </p>
                        </div>

                        {/* Adding Transaction */}
                        <div className="card-hover animate-fade-in-up delay-200 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0]">
                            <div className="w-12 h-12 bg-[#058743]/10 rounded-lg flex items-center justify-center mb-6 max-[425px]:mb-4">
                                <svg className="w-6 h-6 text-[#058743]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                            </div>
                            <h3 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">Easy Transaction Entry</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Quickly add new transactions with an intuitive interface. Categorize expenses and income effortlessly with smart suggestions and custom categories.
                            </p>
                        </div>

                        {/* AI OCR Receipt Scanner */}
                        <div className="card-hover animate-fade-in-up delay-300 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0]">
                            <div className="w-12 h-12 bg-[#058743]/10 rounded-lg flex items-center justify-center mb-6 max-[425px]:mb-4">
                                <svg className="w-6 h-6 text-[#058743]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">AI Receipt Scanner</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Scan and digitize your receipts instantly using AI-powered OCR technology. Automatically extract transaction details, amounts, and merchant information from photos.
                            </p>
                        </div>

                        {/* Budgeting */}
                        <div className="card-hover animate-fade-in-up delay-300 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0]">
                            <div className="w-12 h-12 bg-[#058743]/10 rounded-lg flex items-center justify-center mb-6 max-[425px]:mb-4">
                                <svg className="w-6 h-6 text-[#058743]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">Smart Budgeting</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Set monthly budgets for different categories and track your progress. Receive alerts when you're approaching or exceeding your budget limits.
                            </p>
                        </div>

                        {/* Transaction History & Management */}
                        <div className="card-hover animate-fade-in-up delay-400 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0]">
                            <div className="w-12 h-12 bg-[#058743]/10 rounded-lg flex items-center justify-center mb-6 max-[425px]:mb-4">
                                <svg className="w-6 h-6 text-[#058743]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <h3 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">Transaction History</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                View your complete transaction history with powerful search and filtering. Edit or delete transactions anytime, and update receipt details to keep your records accurate.
                            </p>
                        </div>

                        {/* AI Assistant */}
                        <div className="card-hover animate-fade-in-up delay-400 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0]">
                            <div className="w-12 h-12 bg-[#058743]/10 rounded-lg flex items-center justify-center mb-6 max-[425px]:mb-4">
                                <svg className="w-6 h-6 text-[#058743]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                </svg>
                            </div>
                            <h3 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">AI Financial Assistant</h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Chat with your personal AI assistant for financial insights and advice. Ask questions about your spending patterns, get budget recommendations, and receive personalized financial guidance.
                            </p>
                        </div>
                    </div>

                    {/* How It Works */}
                    <div className="mt-24">
                        <div className="text-center mb-12">
                            <h3 className="animate-fade-in-up text-2xl md:text-3xl font-bold text-[#2C2C2C] mb-3">How MONA Works</h3>
                            <p className="animate-fade-in-up delay-100 text-[#2C2C2C] max-w-2xl mx-auto text-lg">
                                Getting started with MONA is simple and straightforward.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8 max-[768px]:gap-6 max-[425px]:gap-6">
                            {/* Step 1 */}
                            <div className="text-center animate-fade-in-up delay-200">
                                <div className="w-16 h-16 bg-growth-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-2xl font-bold text-white">1</span>
                                </div>
                                <h4 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">Sign Up & Setup</h4>
                                <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                    Create your free account and connect your financial accounts securely to get started with automatic transaction importing.
                                </p>
                            </div>

                            {/* Step 2 */}
                            <div className="text-center animate-fade-in-up delay-300">
                                <div className="w-16 h-16 bg-growth-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-2xl font-bold text-white">2</span>
                                </div>
                                <h4 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">Track & Categorize</h4>
                                <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                    Use our receipt scanner or manual entry to track expenses. MONA automatically categorizes transactions using AI.
                                </p>
                            </div>

                            {/* Step 3 */}
                            <div className="text-center animate-fade-in-up delay-400">
                                <div className="w-16 h-16 bg-growth-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <span className="text-2xl font-bold text-white">3</span>
                                </div>
                                <h4 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3">Analyze & Optimize</h4>
                                <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                    View detailed insights, set budgets, and receive personalized recommendations to improve your financial health.
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
                            Start Managing Your Finances
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
