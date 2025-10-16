import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Landing({ auth }) {
    const landingNavigation = (
        <a
            href="/dashboard"
            className="bg-[#058743] text-white px-6 max-[425px]:px-4 py-3 max-[425px]:py-2 rounded-lg font-semibold max-[425px]:text-sm hover:bg-[#046635] transition-colors duration-200"
        >
            Get Started
        </a>
    );

    return (
        <AppLayout 
            title="MONA - Take Full Control of Your Financial Future" 
            auth={auth}
            navigation={landingNavigation}
        >
            {/* Animation Styles */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(50px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes scaleIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1);
                    }
                }
                .animate-fade-in-up {
                    animation: fadeInUp 1s ease-out forwards;
                }
                .animate-fade-in {
                    animation: fadeIn 1.2s ease-out forwards;
                }
                .animate-scale-in {
                    animation: scaleIn 0.8s ease-out forwards;
                }
                .card-hover {
                    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                }
                .card-hover:hover {
                    transform: translateY(-8px) scale(1.02);
                    box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15);
                }
                .delay-100 { animation-delay: 0.2s; opacity: 0; }
                .delay-200 { animation-delay: 0.4s; opacity: 0; }
                .delay-300 { animation-delay: 0.6s; opacity: 0; }
                .delay-400 { animation-delay: 0.8s; opacity: 0; }
                .delay-500 { animation-delay: 1s; opacity: 0; }
            `}</style>

            {/* Hero Section */}
            <section className="text-center py-20 max-[768px]:py-16 max-[425px]:py-12">
                <div className="max-w-[1500px] mx-auto px-6 max-[425px]:px-4">
                    <div className="max-w-6xl mx-auto">
                    <h1 className="animate-fade-in-up text-4xl md:text-5xl lg:text-6xl max-[425px]:text-2xl font-bold text-[#2C2C2C] leading-tight mb-6 max-[425px]:mb-4">
                        Take Full Control of Your{' '}
                        <span className="text-[#058743]">Financial Future</span>
                    </h1>
                    
                    <p className="animate-fade-in-up delay-100 text-xl lg:text-xl max-[768px]:text-lg max-[425px]:text-base text-[#2C2C2C] mb-8 max-[425px]:mb-6 max-w-2xl mx-auto leading-relaxed">
                        <span className="font-bold text-[#058743]">MONA</span> is the simplest way to manage your personal finances. Track spending, create budgets, and achieve your savings goals with ease.
                    </p>

                        <Link
                            href={route('register')}
                            className="animate-fade-in-up delay-200 inline-block bg-[#058743] text-white px-10 max-[425px]:px-6 py-4 max-[425px]:py-3 rounded-lg text-xl max-[425px]:text-lg font-semibold hover:bg-[#046635] transition-colors duration-200"
                        >
                            Sign Up For Free
                        </Link>
                        </div>
                    </div>
                </section>

            {/* Features Section */}
            <section className="py-20 max-[768px]:py-16 max-[425px]:py-12">
                <div className="max-w-[1500px] mx-auto px-6 max-[425px]:px-4">
                    <div className="text-center mb-16 max-[425px]:mb-12">
                        <h2 className="animate-fade-in-up delay-300 text-3xl md:text-4xl lg:text-5xl max-[425px]:text-2xl font-bold text-[#2C2C2C] mb-4 max-[425px]:mb-3">
                            Everything You Need in One Place
                        </h2>
                        <p className="animate-fade-in-up delay-300 text-lg lg:text-xl max-[425px]:text-base text-[#2C2C2C] max-w-2xl mx-auto">
                            Manage your money effortlessly with our powerful features.
                        </p>
                    </div>

                    {/* Feature Cards */}
                    <div className="grid md:grid-cols-3 gap-8 max-[768px]:gap-6 max-[425px]:gap-4">
                        {/* Financial Dashboard */}
                        <div className="card-hover animate-fade-in-up delay-400 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0] hover:shadow-lg transition-shadow duration-200">
                            <img src="/images/icons/dashboard-icon.svg" alt="Dashboard" className="max-h-15 max-[425px]:max-h-12 mb-5 max-[425px]:mb-3"/>
                            <h3 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3 max-[425px]:mb-2">
                                Financial Dashboard
                            </h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Get a clear overview of your income, expenses, and savings at a single glance.
                            </p>
                        </div>

                        {/* Smart Expense Tracking */}
                        <div className="card-hover animate-fade-in-up delay-400 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0] hover:shadow-lg transition-shadow duration-200">
                            <img src="/images/icons/expense-icon.svg" alt="Expense Tracking" className="max-h-15 max-[425px]:max-h-12 mb-5 max-[425px]:mb-3"/>
                            <h3 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3 max-[425px]:mb-2">
                                Smart Expense Tracking
                            </h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Automatically categorize your transactions and understand where your money is going.
                            </p>
                        </div>

                        {/* Flexible Budgeting */}
                        <div className="card-hover animate-fade-in-up delay-400 bg-white rounded-2xl p-8 max-[768px]:p-6 max-[425px]:p-4 border border-[#E0E0E0] hover:shadow-lg transition-shadow duration-200">
                            <img src="/images/icons/budgeting-icon.svg" alt="Budgeting" className="max-h-15 max-[425px]:max-h-12 mb-5 max-[425px]:mb-3"/>
                            <h3 className="text-xl max-[425px]:text-lg font-bold text-[#2C2C2C] mb-3 max-[425px]:mb-2">
                                Flexible Budgeting
                            </h3>
                            <p className="text-[#2C2C2C] max-[425px]:text-sm leading-relaxed">
                                Create monthly budgets that work for you and get notified when you're close to your limits.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-[#E0E0E0] bg-white">
                <div className="max-w-[1500px] mx-auto px-6 max-[425px]:px-4 py-4 text-center">
                    <p className="text-[#2C2C2C] text-sm max-[425px]:text-xs">
                    © 2025 MONA. All Rights Reserved. Built with{' '}
                        <span className="text-red-500">❤</span> for better financial habits.
                    </p>
                </div>
            </footer>
        </AppLayout>
    );
}