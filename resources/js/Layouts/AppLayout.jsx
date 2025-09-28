import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import FloatingChatbot from '@/Components/FloatingChatbot';

export default function AppLayout({ children, title, auth, navigation }) {
    const { url } = usePage();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    
    const navItems = [
        { name: 'Dashboard', route: 'dashboard' },
        { name: 'Transaction', route: 'transaction' }, 
        { name: 'Scan Receipt', route: 'scan-receipt' },
        { name: 'Budget', route: 'budget' },
        { name: 'History', route: 'history' }
    ];

    const isActive = (routeName) => {
        return url.includes(routeName) || 
               (routeName === 'scan-receipt' && url.includes('scan')) ||
               (routeName === 'dashboard' && (url === '/' || url === '/dashboard'));
    };

    return (
        <>
            <Head title={title} />
            <div className="min-h-screen bg-[#F8F7F0] font-sans">
                {/* Integrated Header with Navigation */}
                <header className="border-b border-[#E0E0E0] bg-white">
                    <div className="max-w-[1500px] mx-auto px-4 max-[425px]:px-3 py-3 max-[425px]:py-2 flex items-center justify-between">
                        {/* Logo */}
                        <Link href="/" className="flex items-center space-x-2 max-[425px]:space-x-1.5">
                            <img src="/images/logo.png" alt="MONA Logo" className="max-h-16 max-[425px]:max-h-12"/>
                            <span className="text-2xl max-[425px]:text-xl font-bold text-[#058743] select-none">MONA</span>
                        </Link>

                        {/* Right Side - Navigation and Profile */}
                        {auth?.user ? (
                            <div className="flex items-center space-x-6 max-[425px]:space-x-3">
                                {/* Desktop Navigation Items */}
                                <div className="hidden min-[1024px]:flex space-x-8">
                                    {navItems.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={route(item.route)}
                                            className={`
                                                relative py-2 px-1 text-gray-700 text-lg transition-all duration-200
                                                hover:text-[#058743]
                                                ${isActive(item.route) 
                                                    ? 'text-[#058743] font-bold' 
                                                    : 'font-normal'
                                                }
                                            `}
                                        >
                                            {item.name}
                                            
                                            {/* Active indicator - growth green line at bottom */}
                                            {isActive(item.route) && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#058743]"></div>
                                            )}
                                            
                                            {/* Hover indicator - softer green line */}
                                            {!isActive(item.route) && (
                                                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#6FB386] opacity-0 hover:opacity-100 transition-opacity duration-200"></div>
                                            )}
                                        </Link>
                                    ))}
                                </div>
                                
                                {/* Mobile Menu Button */}
                                <button
                                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                    className="max-[1023px]:flex hidden flex-col justify-center items-center w-8 h-8 max-[425px]:w-7 max-[425px]:h-7 space-y-1.5 max-[425px]:space-y-1 hover:bg-gray-100 rounded p-1 transition-colors duration-200"
                                    aria-label="Toggle mobile menu"
                                >
                                    <div className={`w-6 max-[425px]:w-5 h-0.5 bg-gray-700 transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-45 translate-y-2 max-[425px]:translate-y-1.5' : ''}`}></div>
                                    <div className={`w-6 max-[425px]:w-5 h-0.5 bg-gray-700 transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-0' : ''}`}></div>
                                    <div className={`w-6 max-[425px]:w-5 h-0.5 bg-gray-700 transition-transform duration-300 ${isMobileMenuOpen ? '-rotate-45 -translate-y-2 max-[425px]:-translate-y-1.5' : ''}`}></div>
                                </button>
                                
                                {/* Desktop Profile Picture */}
                                <div className="relative hidden min-[1024px]:block">
                                    <Link
                                        href={route('profile.show')}
                                        className="block relative group"
                                    >
                                        {auth.user.profile_photo ? (
                                            <img
                                                src={auth.user.profile_photo}
                                                alt="Profile"
                                                className="w-10 h-10 rounded-full object-cover transition-all duration-200 group-hover:ring-2 group-hover:ring-[#6FB386] group-hover:ring-offset-1"
                                            />
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-[#058743] flex items-center justify-center text-white font-semibold transition-all duration-200 group-hover:ring-2 group-hover:ring-[#6FB386] group-hover:ring-offset-1">
                                                {auth.user.name?.charAt(0)?.toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            /* Guest Navigation - only shows if explicitly provided */
                            navigation
                        )}
                    </div>

                    {/* Mobile Navigation Dropdown */}
                    {auth?.user && isMobileMenuOpen && (
                        <div className="max-[1023px]:block hidden border-t border-[#E0E0E0] bg-white">
                            <div className="max-w-[1500px] mx-auto px-4 max-[425px]:px-3 py-4 max-[425px]:py-3 space-y-2">
                                {/* Mobile Profile Section */}
                                <Link
                                    href={route('profile.show')}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="flex items-center space-x-3 max-[425px]:space-x-2.5 py-3 max-[425px]:py-2.5 px-4 max-[425px]:px-3 rounded-lg hover:bg-gray-50 transition-colors duration-200 border-b border-gray-100 mb-3"
                                >
                                    {auth.user.profile_photo ? (
                                        <img
                                            src={auth.user.profile_photo}
                                            alt="Profile"
                                            className="w-12 h-12 max-[425px]:w-10 max-[425px]:h-10 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-12 h-12 max-[425px]:w-10 max-[425px]:h-10 rounded-full bg-[#058743] flex items-center justify-center text-white font-semibold max-[425px]:text-sm">
                                            {auth.user.name?.charAt(0)?.toUpperCase() || 'U'}
                                        </div>
                                    )}
                                    <div className="flex-1">
                                        <div className="text-lg max-[425px]:text-base font-semibold text-gray-900">{auth.user.name}</div>
                                        <div className="text-sm max-[425px]:text-xs text-gray-500">View Profile</div>
                                    </div>
                                </Link>

                                {/* Navigation Items */}
                                {navItems.map((item) => (
                                    <Link
                                        key={item.name}
                                        href={route(item.route)}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`
                                            block py-3 max-[425px]:py-2.5 px-4 max-[425px]:px-3 rounded-lg text-lg max-[425px]:text-base transition-all duration-200
                                            hover:bg-gray-50 hover:text-[#058743]
                                            ${isActive(item.route) 
                                                ? 'text-[#058743] font-bold bg-green-50' 
                                                : 'text-gray-700 font-normal'
                                            }
                                        `}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </header>

                {/* Page Content */}
                <main>
                    {children}
                </main>

                {/* Floating Chatbot - only show when user is authenticated */}
                {auth?.user && <FloatingChatbot />}
            </div>
        </>
    );
}