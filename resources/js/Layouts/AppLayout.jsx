import { Head, Link, usePage } from '@inertiajs/react';

export default function AppLayout({ children, title, auth, navigation }) {
    const { url } = usePage();
    
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
                    <div className="max-w-[1500px] mx-auto px-6 py-4 flex items-center justify-between">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <img src="/images/logo.png" alt="MONA Logo" className="max-h-14"/>
                            <span className="text-2xl font-bold text-[#058743] select-none cursor-default">MONA</span>
                        </div>

                        {/* Right Side - Navigation and Profile */}
                        {auth?.user ? (
                            <div className="flex items-center space-x-8">
                                {/* Navigation Items */}
                                <div className="flex space-x-8">
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
                                
                                {/* Profile Picture */}
                                <div className="relative">
                                    <Link
                                        href={route('profile.edit')}
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
                </header>

                {/* Page Content */}
                <main>
                    {children}
                </main>
            </div>
        </>
    );
}