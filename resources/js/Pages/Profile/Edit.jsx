import { Head, useForm, usePage } from '@inertiajs/react';
import { UserCircleIcon, KeyIcon } from '@heroicons/react/24/outline';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const { data: profileData, setData: setProfileData, patch: patchProfile, errors: profileErrors, processing: profileProcessing, recentlySuccessful: profileRecentlySuccessful } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
    });

    const submitProfile = (e) => {
        e.preventDefault();
        patchProfile(route('profile.update'));
    };
    
    const { data: passwordData, setData: setPasswordData, put: putPassword, errors: passwordErrors, processing: passwordProcessing, recentlySuccessful: passwordRecentlySuccessful, reset: resetPassword } = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const submitPassword = (e) => {
        e.preventDefault();
        putPassword(route('password.update'), {
            preserveScroll: true,
            onSuccess: () => resetPassword(),
        });
    };

    return (
        <AuthenticatedLayout
            user={auth.user}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Profile</h2>}
        >
            <Head title="Edit Profile" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 space-y-6">
                    
                    <div className="p-6 bg-white shadow-sm sm:rounded-lg">
                        <div className="flex items-start space-x-4 mb-6">
                            <UserCircleIcon className="h-7 w-7 text-gray-500"/>
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Profile Information</h2>
                                <p className="mt-1 text-sm text-gray-600">Update your account's profile information.</p>
                            </div>
                        </div>
                        <form onSubmit={submitProfile} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="name" value="Name" />
                                <TextInput id="name" className="mt-1 block w-full" value={profileData.name} onChange={(e) => setProfileData('name', e.target.value)} required isFocused autoComplete="name" />
                                <InputError className="mt-2" message={profileErrors.name} />
                            </div>
                            <div>
                                <InputLabel htmlFor="email" value="Email" />
                                <TextInput id="email" type="email" className="mt-1 block w-full" value={profileData.email} onChange={(e) => setProfileData('email', e.target.value)} required autoComplete="username" />
                                <InputError className="mt-2" message={profileErrors.email} />
                            </div>
                            <div>
                                <InputLabel htmlFor="phone" value="Phone" />
                                <TextInput id="phone" className="mt-1 block w-full" value={profileData.phone} onChange={(e) => setProfileData('phone', e.target.value)} autoComplete="tel" />
                                <InputError className="mt-2" message={profileErrors.phone} />
                            </div>
                            <div>
                                <InputLabel htmlFor="date_of_birth" value="Date of Birth" />
                                <TextInput id="date_of_birth" type="date" className="mt-1 block w-full" value={profileData.date_of_birth} onChange={(e) => setProfileData('date_of_birth', e.target.value)} />
                                <InputError className="mt-2" message={profileErrors.date_of_birth} />
                            </div>

                            <div className="flex items-center gap-4">
                                <PrimaryButton disabled={profileProcessing}>Save</PrimaryButton>
                                <Transition show={profileRecentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                    <p className="text-sm text-gray-600">Saved.</p>
                                </Transition>
                            </div>
                        </form>
                    </div>

                    <div className="p-6 bg-white shadow-sm sm:rounded-lg">
                         <div className="flex items-start space-x-4 mb-6">
                            <KeyIcon className="h-7 w-7 text-gray-500"/>
                            <div>
                                <h2 className="text-lg font-medium text-gray-900">Update Password</h2>
                                <p className="mt-1 text-sm text-gray-600">Ensure your account is using a long, random password.</p>
                            </div>
                        </div>
                        <form onSubmit={submitPassword} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="current_password" value="Current Password" />
                                <TextInput id="current_password" type="password" className="mt-1 block w-full" value={passwordData.current_password} onChange={(e) => setPasswordData('current_password', e.target.value)} required autoComplete="current-password" />
                                <InputError className="mt-2" message={passwordErrors.current_password} />
                            </div>
                             <div>
                                <InputLabel htmlFor="password" value="New Password" />
                                <TextInput id="password" type="password" className="mt-1 block w-full" value={passwordData.password} onChange={(e) => setPasswordData('password', e.target.value)} required autoComplete="new-password" />
                                <InputError className="mt-2" message={passwordErrors.password} />
                            </div>
                             <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                <TextInput id="password_confirmation" type="password" className="mt-1 block w-full" value={passwordData.password_confirmation} onChange={(e) => setPasswordData('password_confirmation', e.target.value)} required autoComplete="new-password" />
                                <InputError className="mt-2" message={passwordErrors.password_confirmation} />
                            </div>
                             <div className="flex items-center gap-4">
                                <PrimaryButton disabled={passwordProcessing}>Save</PrimaryButton>
                                <Transition show={passwordRecentlySuccessful} enter="transition ease-in-out" enterFrom="opacity-0" leave="transition ease-in-out" leaveTo="opacity-0">
                                    <p className="text-sm text-gray-600">Saved.</p>
                                </Transition>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}