import { Head, useForm, usePage, Link, router } from '@inertiajs/react';
import { UserIcon, KeyIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { PencilIcon } from '@heroicons/react/24/solid';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import AppLayout from '@/Layouts/AppLayout';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { useState, useRef, useCallback } from 'react';

export default function Edit({ mustVerifyEmail, status }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const avatarUrl = user.profile_photo_path
        ? `/storage/${user.profile_photo_path}`
        : `https://ui-avatars.com/api/?name=${user.name}&size=256&background=EBF4FF&color=027A48`;

    // Crop modal state
    const [isCropModalOpen, setIsCropModalOpen] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);
    const [crop, setCrop] = useState({
        unit: '%',
        width: 50,
        height: 50,
        x: 25,
        y: 25,
        aspect: 1
    });
    const [completedCrop, setCompletedCrop] = useState(null);
    const [croppedImageUrl, setCroppedImageUrl] = useState(null);
    const imgRef = useRef(null);

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
        
        // Prepare form data ensuring all required fields are present
        const formData = {
            name: profileData.name,
            email: profileData.email,
            phone: profileData.phone || '',
            date_of_birth: profileData.date_of_birth || '',
            _method: 'PATCH'
        };
        
        // Only add profile_photo if it exists
        if (profileData.profile_photo) {
            formData.profile_photo = profileData.profile_photo;
        }
        
        // Use router.post for file uploads with multipart data
        router.post(route('profile.update'), formData, {
            onSuccess: () => {
                window.location.href = route('profile.show');
            },
            onError: (errors) => {
                console.log('Form errors:', errors);
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

    // Image cropping functions
    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                setSelectedImage(reader.result);
                // Reset crop to default when selecting new image
                setCrop({
                    unit: '%',
                    width: 80,
                    height: 80,
                    x: 10,
                    y: 10,
                    aspect: 1
                });
                setCompletedCrop(null);
                setIsCropModalOpen(true);
            };
            reader.readAsDataURL(file);
        }
    };    const getCroppedImg = useCallback((image, crop) => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        canvas.width = crop.width;
        canvas.height = crop.height;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
            image,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0,
            0,
            crop.width,
            crop.height,
        );

        return new Promise((resolve) => {
            canvas.toBlob(resolve, 'image/jpeg', 1);
        });
    }, []);

    const handleCropComplete = async () => {
        if (completedCrop && imgRef.current) {
            const croppedBlob = await getCroppedImg(imgRef.current, completedCrop);
            const croppedFile = new File([croppedBlob], 'cropped-avatar.jpg', { type: 'image/jpeg' });
            
            // Preserve existing form data when setting new profile photo
            setProfileData((prev) => ({
                ...prev,
                profile_photo: croppedFile
            }));
            const url = URL.createObjectURL(croppedBlob);
            setCroppedImageUrl(url);
            setIsCropModalOpen(false);
        }
    };

    const handleCropCancel = () => {
        setIsCropModalOpen(false);
        setSelectedImage(null);
        setCrop({
            unit: '%',
            width: 50,
            height: 50,
            x: 25,
            y: 25,
            aspect: 1
        });
        setCompletedCrop(null);
    };

    const handleRemovePhoto = () => {
        if (confirm('Are you sure you want to remove your profile picture?')) {
            setProfileData('profile_photo', null);
            setCroppedImageUrl(null);
            
            // If user has existing photo, send request to remove it
            if (user.profile_photo_path) {
                router.post(route('profile.remove-photo'), {
                    _method: 'DELETE'
                }, {
                    onSuccess: () => {
                        window.location.reload();
                    }
                });
            }
        }
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
                            <div className="relative w-24 h-24 group">
                                <img
                                    src={croppedImageUrl || (profileData.profile_photo ? URL.createObjectURL(profileData.profile_photo) : avatarUrl)}
                                    alt="Profile Avatar"
                                    className="h-24 w-24 rounded-full object-cover shadow transition-all duration-300 group-hover:brightness-75"
                                />
                                
                                {/* Hover Overlay - Different based on whether user has profile photo */}
                                {(user.profile_photo_path || croppedImageUrl) ? (
                                    /* Split overlay for users with profile photo */
                                    <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 overflow-hidden">
                                        {/* Edit Picture - Top half (Growth Green) */}
                                        <div 
                                            className="absolute top-0 left-0 right-0 bg-growth-green-500 bg-opacity-50 flex items-center justify-center cursor-pointer hover:bg-opacity-70 transition-all duration-200"
                                            style={{ height: 'calc(50% - 0.5px)' }}
                                            onClick={() => document.querySelector('input[type="file"]').click()}
                                        >
                                            <span className="text-white text-xs font-medium text-center px-1">Edit</span>
                                        </div>
                                        
                                        {/* Small gap between sections */}
                                        <div className="absolute left-0 right-0 h-px bg-white bg-opacity-30" style={{ top: 'calc(50% - 0.5px)' }}></div>
                                        
                                        {/* Delete Picture - Bottom half (Expense Red) */}
                                        <div 
                                            className="absolute bottom-0 left-0 right-0 bg-expense-red-500 bg-opacity-50 flex items-center justify-center cursor-pointer hover:bg-opacity-70 transition-all duration-200"
                                            style={{ height: 'calc(50% - 0.5px)' }}
                                            onClick={handleRemovePhoto}
                                        >
                                            <span className="text-white text-xs font-medium text-center px-1">Delete</span>
                                        </div>
                                    </div>
                                ) : (
                                    /* Single overlay for users without profile photo */
                                    <div className="absolute inset-0 bg-growth-green-500 bg-opacity-60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
                                         onClick={() => document.querySelector('input[type="file"]').click()}>
                                        <span className="text-white text-xs font-medium text-center px-2">Edit Picture</span>
                                    </div>
                                )}

                                {/* Hidden file input */}
                                <input
                                    type="file"
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageSelect}
                                />
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
                                    className="px-5 py-2 bg-growth-green-500 text-white font-medium rounded-lg shadow hover:bg-growth-green-600 transition-colors disabled:opacity-50"
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
                                    className="px-5 py-2 bg-growth-green-500 text-white font-medium rounded-lg shadow hover:bg-growth-green-600 transition-colors disabled:opacity-50"
                                >
                                    Save
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Image Crop Modal */}
            {isCropModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black bg-opacity-50" onClick={handleCropCancel} />
                    <div className="relative bg-white rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Crop Profile Image</h3>
                            <button
                                onClick={handleCropCancel}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <XMarkIcon className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="mb-6">
                            {selectedImage && (
                                <ReactCrop
                                    crop={crop}
                                    onChange={(newCrop) => setCrop(newCrop)}
                                    onComplete={(c) => setCompletedCrop(c)}
                                    aspect={1}
                                    circularCrop
                                    className="max-w-full"
                                    minWidth={100}
                                    minHeight={100}
                                    keepSelection
                                    onImageLoaded={(img) => {
                                        // Auto-set crop to fill smaller dimension when image loads
                                        const { naturalWidth, naturalHeight } = img;
                                        const size = Math.min(naturalWidth, naturalHeight);
                                        const centerX = (naturalWidth - size) / 2;
                                        const centerY = (naturalHeight - size) / 2;
                                        
                                        const newCrop = {
                                            unit: 'px',
                                            width: size,
                                            height: size,
                                            x: centerX,
                                            y: centerY,
                                            aspect: 1
                                        };
                                        setCrop(newCrop);
                                        setCompletedCrop(newCrop);
                                    }}
                                >
                                    <img
                                        ref={imgRef}
                                        src={selectedImage}
                                        alt="Crop preview"
                                        className="max-w-full h-auto"
                                    />
                                </ReactCrop>
                            )}
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={handleCropCancel}
                                className="px-4 py-2 bg-gray-200 text-gray-800 font-medium rounded-lg hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCropComplete}
                                className="px-4 py-2 bg-growth-green-500 text-white font-medium rounded-lg hover:bg-growth-green-600 transition-colors"
                                disabled={!completedCrop}
                            >
                                Apply Crop
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
