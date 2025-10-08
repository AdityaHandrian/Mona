import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { UserIcon, AdjustmentsHorizontalIcon, PencilIcon } from '@heroicons/react/24/outline';
import AppLayout from '@/Layouts/AppLayout';

export default function Show({ auth }) {
    const user = auth.user;

    const formattedDate = user.date_of_birth
        ? new Date(user.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'N/A';
    
    const avatarUrl = user.profile_photo_path 
        ? `/storage/${user.profile_photo_path}` 
        : null; // We'll use a custom div instead of ui-avatars

    return (
        <AppLayout
            title="MONA - History"
            auth={auth}
        >
            <Head title="Profile Settings" />

            <div className="py-8">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
                    
                    {/* Box Personal Information */}
                    <div className="relative p-8 bg-white shadow-md rounded-2xl">
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

                    {/* Box Preferences */}
                    <div className="p-8 bg-white shadow-md rounded-2xl">
                        <div className="flex items-start space-x-4">
                            <AdjustmentsHorizontalIcon className="h-8 w-8 text-gray-500"/>
                            <div>
                                <h2 className="text-lg md:text-xl font-semibold text-gray-900">Preferences</h2>
                                <p className="mt-1 text-xs md:text-sm text-gray-600">Customize your app experience.</p>
                            </div>
                        </div>
                        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 text-base">
                            <div>
                                <label className="text-sm text-gray-500">Default Currency</label>
                                <p className="text-gray-900 font-medium">IDR</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500">Timezone</label>
                                <p className="text-gray-900 font-medium">Indonesia/Jakarta</p>
                            </div>
                        </div>
                    </div>

                    {/* 🔹 Tombol Logout align kanan bawah */}
                    <div className="flex justify-end">
                        <Link
                            href={route('logout')}
                            method="post"
                            as="button"
                            className="mt-4 px-5 py-2 bg-red-600 text-white font-medium rounded-lg shadow hover:bg-red-700 transition-colors"
                        >
                            Logout
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
