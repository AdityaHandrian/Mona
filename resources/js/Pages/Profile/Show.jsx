import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { UserIcon, AdjustmentsHorizontalIcon, PencilIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';
import { useState } from 'react';

export default function Show({ auth }) {
    const user = auth.user;

    const formattedDate = user.date_of_birth
        ? (user.date_of_birth.includes('/')   // dd/mm/yyyy dari accessor
            ? user.date_of_birth
            : new Date(user.date_of_birth).toLocaleDateString('en-GB', {
                day: '2-digit', month: '2-digit', year: 'numeric'
            }))
        : 'N/A';

    const avatarUrl = user.profile_photo_path 
        ? `/storage/${user.profile_photo_path}` 
        : null; // We'll use a custom div instead of ui-avatars

    // 🔸 State untuk modal konfirmasi logout
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    const handleLogoutConfirm = () => {
        router.post(route('logout'));
    };

    const handleModalClose = () => {
        setIsConfirmModalOpen(false);
    };

    return (
        <AppLayout
            title="MONA - History"
            auth={auth}
        >
            <Head title="Profile Settings" />

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
            `}</style>

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Box Personal Information */}
                    <div className="animate-fade-in-up delay-100 relative p-8 bg-white shadow-md rounded-2xl">
                        <Link 
                            href={route('profile.edit')}
                            className="absolute top-6 right-6 p-2 rounded-full text-gray-400 hover:bg-green-100 hover:text-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-150"
                            aria-label="Edit Profile"
                        >
                            <PencilIcon className="h-6 w-6" />
                        </Link>
                        
                        <div className="flex items-start space-x-4 mb-6">
                            <UserIcon className="h-8 w-8 text-gray-500"/>
                            <div>
                                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Personal Information</h2>
                                <p className="mt-1 text-xs md:text-sm text-gray-600">Your personal details and contact information.</p>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col md:flex-row md:items-start space-y-6 md:space-y-0 md:space-x-12">
                            {user.profile_photo_path ? (
                                <img className="h-32 w-32 rounded-full object-cover ring-4 ring-white" src={avatarUrl} alt={user.name} />
                            ) : (
                                <div className="h-32 w-32 rounded-full bg-[#058743] flex items-center justify-center text-white font-bold text-4xl ring-4 ring-white">
                                    {user.name ? user.name.split(' ').map(n => n.charAt(0)).join('').toUpperCase().slice(0, 2) : 'U'}
                                </div>
                            )}
                            
                            <div className="grow grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-base">
                                <div>
                                    <label className="text-sm text-gray-500">First Name</label>
                                    <p className="text-gray-900 font-medium">{user.name.split(' ')[0]}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Last Name</label>
                                    <p className="text-gray-900 font-medium">{user.name.split(' ').slice(1).join(' ') || ' '}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Email</label>
                                    <p className="text-gray-900 font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Phone</label>
                                    <p className="text-gray-900 font-medium">{user.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm text-gray-500">Date of Birth</label>
                                    <p className="text-gray-900 font-medium">{formattedDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Tombol Logout align kanan bawah */}
                    <div className="animate-fade-in-up delay-300 flex justify-end">
                        <button
                            onClick={() => setIsConfirmModalOpen(true)}
                            className="mt-4 px-5 py-2 bg-red-600 text-white font-medium rounded-lg shadow hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>

            {/* Konfirmasi Logout */}
            {isConfirmModalOpen && (
                <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleModalClose} />
                    
                    <div className="relative bg-white rounded-2xl p-6 md:p-8 w-full max-w-md shadow-xl transform transition-all animate-fade-in-up">
                        <div className="sm:flex sm:items-start">
                            <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                            </div>
                            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                                <h3 className="text-lg md:text-xl font-semibold text-gray-900 leading-6">
                                    Confirm Logout
                                </h3>
                                <div className="mt-2">
                                    <p className="text-sm text-gray-600">
                                        Are you sure you want to log out of your account?
                                    </p>
                                </div>
                            </div>
                        </div>
                        
  
                        <div className="mt-5 sm:mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleModalClose}
                                className="px-5 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg shadow hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleLogoutConfirm}
                                className="px-5 py-2 bg-red-600 text-white font-medium rounded-lg shadow hover:bg-red-700 transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
