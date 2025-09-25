import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <AppLayout>
            <Head title="Create Your Account" />
            
            {/* Full Page Layout */}
            <div className="min-h-screen bg-[#F8F7F0] flex flex-col">
                {/* Main Content Container */}
                <div className="flex-1 flex items-center justify-center px-4 py-8">
                    <div className="w-full max-w-lg">
                        {/* Register Card */}
                        <div className="bg-white rounded-2xl shadow-xl px-8 py-10 border border-[#E0E0E0]">
                            {/* Welcome Section */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-[#2C2C2C] mb-3">Create Your Account</h1>
                                <p className="text-[#757575] text-base font-medium">Join MONA for Free Today!</p>
                            </div>

                            {/* Register Form */}
                            <form onSubmit={submit} className="space-y-6">
                                {/* Name Fields */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label 
                                            htmlFor="first_name" 
                                            className="block text-sm font-semibold text-[#2C2C2C] mb-3"
                                        >
                                            First Name
                                        </label>
                                        <input
                                            id="first_name"
                                            name="first_name"
                                            value={data.first_name}
                                            className="w-full px-4 py-4 text-sm text-[#2C2C2C] bg-[#FFF] border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#058743] focus:border-transparent transition duration-200 ease-in-out placeholder-[#757575]"
                                            autoComplete="given-name"
                                            autoFocus={true}
                                            onChange={(e) => setData('first_name', e.target.value)}
                                            placeholder="First Name"
                                            required
                                        />
                                        {errors.first_name && (
                                            <div className="mt-2 text-sm text-[#D9534F] font-medium">
                                                {errors.first_name}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label 
                                            htmlFor="last_name" 
                                            className="block text-sm font-semibold text-[#2C2C2C] mb-3"
                                        >
                                            Last Name
                                        </label>
                                        <input
                                            id="last_name"
                                            name="last_name"
                                            value={data.last_name}
                                            className="w-full px-4 py-4 text-sm text-[#2C2C2C] bg-[#FFF] border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#058743] focus:border-transparent transition duration-200 ease-in-out placeholder-[#757575]"
                                            autoComplete="family-name"
                                            onChange={(e) => setData('last_name', e.target.value)}
                                            placeholder="Last Name"
                                            required
                                        />
                                        {errors.last_name && (
                                            <div className="mt-2 text-sm text-[#D9534F] font-medium">
                                                {errors.last_name}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Email Field */}
                                <div>
                                    <label 
                                        htmlFor="email" 
                                        className="block text-sm font-semibold text-[#2C2C2C] mb-3"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="w-full px-4 py-4 text-sm text-[#2C2C2C] bg-[#FFF] border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#058743] focus:border-transparent transition duration-200 ease-in-out placeholder-[#757575]"
                                        autoComplete="username"
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Email Address"
                                        required
                                    />
                                    {errors.email && (
                                        <div className="mt-2 text-sm text-[#D9534F] font-medium">
                                            {errors.email}
                                        </div>
                                    )}
                                </div>

                                {/* Password Field */}
                                <div>
                                    <label 
                                        htmlFor="password" 
                                        className="block text-sm font-semibold text-[#2C2C2C] mb-3"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={data.password}
                                            className="w-full px-4 py-4 pr-12 text-sm text-[#2C2C2C] bg-[#FFF] border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#058743] focus:border-transparent transition duration-200 ease-in-out placeholder-[#757575]"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center px-4 text-[#757575] hover:text-[#2C2C2C] transition-colors duration-200"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                </svg>
                                            )}
                                        </button>
                                    </div>
                                    {errors.password && (
                                        <div className="mt-2 text-sm text-[#D9534F] font-medium">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                {/* Confirm Password Field */}
                                <div>
                                    <label 
                                        htmlFor="password_confirmation" 
                                        className="block text-sm font-semibold text-[#2C2C2C] mb-3"
                                    >
                                        Confirm Password
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        type={showPassword ? "text" : "password"}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="w-full px-4 py-4 text-sm text-[#2C2C2C] bg-[#FFF] border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#058743] focus:border-transparent transition duration-200 ease-in-out placeholder-[#757575]"
                                        autoComplete="new-password"
                                        onChange={(e) => setData('password_confirmation', e.target.value)}
                                        placeholder="Confirm Password"
                                        required
                                    />
                                    {errors.password_confirmation && (
                                        <div className="mt-2 text-sm text-[#D9534F] font-medium">
                                            {errors.password_confirmation}
                                        </div>
                                    )}
                                </div>

                                {/* Terms Checkbox */}
                                <div className="flex items-center mt-6">
                                    <div className="flex items-center">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            checked={data.terms}
                                            onChange={(e) => setData('terms', e.target.checked)}
                                            className="h-4 w-4 text-[#058743] focus:ring-[#058743] border-[#E0E0E0] rounded transition duration-200"
                                            required
                                        />
                                        <label htmlFor="terms" className="ml-3 text-sm text-[#757575] font-medium cursor-pointer">
                                            I agree to the <a href="#" className="text-[#058743] hover:text-[#046837] underline">Terms of Service</a> and <a href="#" className="text-[#058743] hover:text-[#046837] underline">Privacy Policy</a>
                                        </label>
                                    </div>
                                </div>
                                {errors.terms && (
                                    <div className="mt-2 text-sm text-[#D9534F] font-medium">
                                        {errors.terms}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="mt-8">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-[#058743] hover:bg-[#046837] focus:bg-[#046837] active:bg-[#034a2a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#058743] focus:ring-offset-2 shadow-lg text-base"
                                    >
                                        {processing ? (
                                            <div className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Signing up...
                                            </div>
                                        ) : (
                                            'Sign Up'
                                        )}
                                    </button>
                                </div>

                                {/* Footer Links */}
                                <div className="mt-8 text-center">
                                    <div className="text-sm text-[#757575]">
                                        Already have an account? 
                                        <Link
                                            href={route('login')}
                                            className="text-[#058743] hover:text-[#046837] font-medium ml-1 transition duration-200 hover:underline"
                                        >
                                            Log In
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Optional: Additional Footer */}
                        <div className="text-center mt-8">
                            <p className="text-xs text-[#757575]">
                                © 2025 MONA. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
