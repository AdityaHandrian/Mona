<<<<<<< Updated upstream
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Profile
                </h2>
            }
        >
            <Head title="Profile" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateProfileInformationForm
                            mustVerifyEmail={mustVerifyEmail}
                            status={status}
                            className="max-w-xl"
                        />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdatePasswordForm className="max-w-xl" />
                    </div>

                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <DeleteUserForm className="max-w-xl" />
=======
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';

export default function Edit({ auth }) {
    return (
        <AppLayout 
            title="MONA - Profile"
            auth={auth}
        >
            <Head title="Profile" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-4">Profile Settings</h2>
                            <p className="mb-6">Profile management page - coming soon!</p>
                            
                            {/* Logout Button */}
                            <div className="border-t border-gray-200 pt-6">
                                <Link
                                    href={route('logout')}
                                    method="post"
                                    as="button"
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition-colors duration-200"
                                >
                                    Log Out
                                </Link>
                            </div>
                        </div>
>>>>>>> Stashed changes
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
