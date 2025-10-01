import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { UserIcon, AdjustmentsHorizontalIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function Show({ auth }) {
    const user = auth.user;

    const formattedDate = user.date_of_birth
        ? new Date(user.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'N/A';
    
    const avatarUrl = user.profile_photo_path 
        ? `/storage/${user.profile_photo_path}` 
        : `https://ui-avatars.com/api/?name=${user.name}&size=256&background=EBF4FF&color=027A48`;


    return (
        <AuthenticatedLayout
            user={auth.user}
            header={
                <div className="flex justify-between items-center">
                    <h2 className="font-semibold text-xl text-gray-800 leading-tight">
                        Profile Settings
                    </h2>
                    <Link
                        href={route('dashboard')}
                        className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md font-semibold text-xs text-gray-700 uppercase tracking-widest shadow-sm hover:bg-gray-50 transition ease-in-out duration-150"
                    >
                        <ArrowLeftIcon className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Link>
                </div>
            }
        >
            <Head title="Profile Settings" />

            {/* Konten utama tidak lagi `min-h-screen` karena sudah ditangani layout */}
            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8">
                    
                    <div className="p-8 bg-white shadow-md rounded-2xl">
                        <div className="flex items-start space-x-4">
                            <UserIcon className="h-8 w-8 text-gray-500"/>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                                <p className="mt-1 text-sm text-gray-600">Your personal details and contact information.</p>
                            </div>
                        </div>
                        <div className="mt-8 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-12">
                            <img className="h-32 w-32 rounded-full object-cover ring-4 ring-white" src={avatarUrl} alt={user.name} />
                            
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

                    <div className="p-8 bg-white shadow-md rounded-2xl">
                        <div className="flex items-start space-x-4">
                            <AdjustmentsHorizontalIcon className="h-8 w-8 text-gray-500"/>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Preferences</h2>
                                <p className="mt-1 text-sm text-gray-600">Customize your app experience.</p>
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
                    {/* Tombol Edit Profile dikembalikan ke bawah */}
                    <div className="flex justify-end pt-4">
                        <Link 
                            href={route('profile.edit')} 
                            className="inline-flex items-center px-8 py-3 bg-green-600 border border-transparent rounded-full font-bold text-sm text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-800 transition ease-in-out duration-150 shadow-md hover:shadow-lg"
                        >
                            Edit Profile
                        </Link>
                    </div>
                    
                </div>
            </div>
        </AuthenticatedLayout>
    );
}