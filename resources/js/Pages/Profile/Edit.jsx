import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { UserIcon, KeyIcon } from '@heroicons/react/24/outline';
import { PencilIcon } from '@heroicons/react/24/solid';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import AppLayout from '@/Layouts/AppLayout';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const avatarUrl = user.profile_photo_path
        ? `/storage/${user.profile_photo_path}`
        : `https://ui-avatars.com/api/?name=${user.name}&size=256&background=EBF4FF&color=027A48`;

    // Form profile
    const { data: profileData, setData: setProfileData, patch: patchProfile, errors: profileErrors, processing: profileProcessing } = useForm({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        date_of_birth: user.date_of_birth || '',
        profile_photo: null,
    });

    const submitProfile = (e) => {
        e.preventDefault();
        patchProfile(route('profile.update'), {
            onSuccess: () => {
                // setelah update, balik ke halaman profile
                window.location.href = route('profile.show');
            }
        });
    };

    // Form password
    const { data: passwordData, setData: setPasswordData, put: putPassword, errors: passwordErrors, processing: passwordProcessing, reset: resetPassword } = useForm({
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
        <AppLayout
            title="Edit Profile"
            auth={auth}
        >
            <Head title="Edit Profile" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 space-y-8">

                    {/* Box Profile Information */}
                    <div className="p-8 bg-white shadow-md rounded-2xl relative">
                        <div className="flex items-start space-x-4 mb-6">
                            <UserIcon className="h-8 w-8 text-gray-500"/>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
                                <p className="mt-1 text-sm text-gray-600">Update your personal details and contact information.</p>
                            </div>
                        </div>

                        <form onSubmit={submitProfile} className="space-y-6">
                            {/* Avatar Upload */}
                            <div className="relative w-24 h-24">
                                <img
                                    src={profileData.profile_photo ? URL.createObjectURL(profileData.profile_photo) : avatarUrl}
                                    alt="Profile Avatar"
                                    className="h-24 w-24 rounded-full object-cover ring-4 ring-white shadow"
                                />
                                <label className="absolute bottom-0 right-0 bg-green-600 p-1 rounded-full cursor-pointer hover:bg-green-700 transition">
                                    <PencilIcon className="h-4 w-4 text-white"/>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => setProfileData('profile_photo', e.target.files[0])}
                                    />
                                </label>
                                <InputError className="mt-2" message={profileErrors.profile_photo} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <InputLabel htmlFor="name" value="Full Name" />
                                    <TextInput
                                        id="name"
                                        className="mt-1 block w-full"
                                        value={profileData.name}
                                        onChange={(e) => setProfileData('name', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={profileErrors.name} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="email" value="Email" />
                                    <TextInput
                                        id="email"
                                        type="email"
                                        className="mt-1 block w-full"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData('email', e.target.value)}
                                        required
                                    />
                                    <InputError className="mt-2" message={profileErrors.email} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="phone" value="Phone" />
                                    <TextInput
                                        id="phone"
                                        className="mt-1 block w-full"
                                        value={profileData.phone}
                                        onChange={(e) => setProfileData('phone', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={profileErrors.phone} />
                                </div>

                                <div>
                                    <InputLabel htmlFor="date_of_birth" value="Date of Birth" />
                                    <TextInput
                                        id="date_of_birth"
                                        type="date"
                                        className="mt-1 block w-full"
                                        value={profileData.date_of_birth}
                                        onChange={(e) => setProfileData('date_of_birth', e.target.value)}
                                    />
                                    <InputError className="mt-2" message={profileErrors.date_of_birth} />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3">
                                <Link
                                    href={route('profile.show')}
                                    className="px-5 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg shadow hover:bg-gray-300 transition-colors"
                                >
                                    Back to Profile
                                </Link>
                                <button
                                    type="submit"
                                    disabled={profileProcessing}
                                    className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Box Update Password */}
                    <div className="p-8 bg-white shadow-md rounded-2xl">
                        <div className="flex items-start space-x-4 mb-6">
                            <KeyIcon className="h-8 w-8 text-gray-500"/>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">Update Password</h2>
                                <p className="mt-1 text-sm text-gray-600">Ensure your account is using a strong, unique password.</p>
                            </div>
                        </div>

                        <form onSubmit={submitPassword} className="space-y-6">
                            <div>
                                <InputLabel htmlFor="current_password" value="Current Password" />
                                <TextInput
                                    id="current_password"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData('current_password', e.target.value)}
                                    required
                                />
                                <InputError className="mt-2" message={passwordErrors.current_password} />
                            </div>

                            <div>
                                <InputLabel htmlFor="password" value="New Password" />
                                <TextInput
                                    id="password"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                    required
                                />
                                <InputError className="mt-2" message={passwordErrors.password} />
                            </div>

                            <div>
                                <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                                <TextInput
                                    id="password_confirmation"
                                    type="password"
                                    className="mt-1 block w-full"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                    required
                                />
                                <InputError className="mt-2" message={passwordErrors.password_confirmation} />
                            </div>

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={passwordProcessing}
                                    className="px-5 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition-colors disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
