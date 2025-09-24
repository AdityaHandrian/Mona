import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';
import { UserCircleIcon, Cog6ToothIcon, ChatBubbleBottomCenterTextIcon } from '@heroicons/react/24/outline';

export default function Show({ auth, mustVerifyEmail, status }) {
    const user = auth.user;

    const formattedDate = user.date_of_birth
        ? new Date(user.date_of_birth).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })
        : 'N/A';

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Profile</h2>}
        >
            <Head title="Profile Settings" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    <div className="p-6 bg-white shadow-sm sm:rounded-lg">
                        <div className="flex items-start space-x-4">
                            <UserCircleIcon className="h-7 w-7 text-gray-500"/>
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Profile Settings</h2>
                                <p className="mt-1 text-sm text-gray-600">Update your personal details and contact information.</p>
                            </div>
                        </div>
                        <div className="mt-6 flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10">
                            <img className="h-28 w-28 rounded-full object-cover" src={`https://ui-avatars.com/api/?name=${user.name}&size=128`} alt={user.name} />
                            <div className="grow grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                                <div>
                                    <label className="text-gray-500">First Name</label>
                                    <p className="text-gray-900 font-medium">{user.name.split(' ')[0]}</p>
                                </div>
                                <div>
                                    <label className="text-gray-500">Last Name</label>
                                    <p className="text-gray-900 font-medium">{user.name.split(' ').slice(1).join(' ') || ' '}</p>
                                </div>
                                <div>
                                    <label className="text-gray-500">Email</label>
                                    <p className="text-gray-900 font-medium">{user.email}</p>
                                </div>
                                <div>
                                    <label className="text-gray-500">Phone</label>
                                    <p className="text-gray-900 font-medium">{user.phone || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-gray-500">Date of Birth</label>
                                    <p className="text-gray-900 font-medium">{formattedDate}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-white shadow-sm sm:rounded-lg">
                        <div className="flex items-start space-x-4">
                            <Cog6ToothIcon className="h-7 w-7 text-gray-500"/>
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Preferences</h2>
                                <p className="mt-1 text-sm text-gray-600">Customize your app experience.</p>
                            </div>
                        </div>
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                             <div>
                                <label className="text-gray-500">Default Currency</label>
                                <p className="text-gray-900 font-medium">IDR</p>
                            </div>
                            <div>
                                <label className="text-gray-500">Timezone</label>
                                <p className="text-gray-900 font-medium">Indonesia/Jakarta</p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                         <Link href={route('profile.edit')} className="inline-flex items-center px-6 py-2 bg-green-600 border border-transparent rounded-full font-semibold text-xs text-white uppercase tracking-widest hover:bg-green-700 focus:bg-green-700 active:bg-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition ease-in-out duration-150">
                            Edit Profile
                        </Link>
                    </div>
                </div>
            </div>

            <div className="fixed bottom-8 right-8">
                <button className="p-4 bg-green-600 rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                    <ChatBubbleBottomCenterTextIcon className="h-7 w-7 text-white"/>
                </button>
            </div>
        </AuthenticatedLayout>
    );
}