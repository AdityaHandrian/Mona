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
            <div className="flex flex-col">
                {/* Main Content Container */}
                <div className="flex-1 flex items-center justify-center px-4 max-[768px]:px-3 max-[375px]:px-2 py-8 max-[768px]:py-6 max-[425px]:py-4 max-[375px]:py-3 max-[320px]:py-2">
                    <div className="w-full max-w-lg max-[768px]:max-w-md max-[425px]:max-w-sm max-[375px]:max-w-[300px] max-[320px]:max-w-[280px]">
                        {/* Register Card */}
                        <div className="bg-white rounded-2xl max-[768px]:rounded-xl shadow-xl px-8 max-[768px]:px-6 max-[425px]:px-4 max-[375px]:px-3 max-[320px]:px-2 py-10 max-[768px]:py-8 max-[425px]:py-6 max-[375px]:py-5 max-[320px]:py-4 border border-[#E0E0E0]">
                            {/* Welcome Section */}
                            <div className="text-center mb-6 max-[768px]:mb-5 max-[425px]:mb-4 max-[375px]:mb-3 max-[320px]:mb-3">
                                <h1 className="text-3xl max-[768px]:text-2xl max-[425px]:text-lg max-[375px]:text-base max-[320px]:text-sm font-bold text-[#2C2C2C] mb-2 max-[768px]:mb-2 max-[425px]:mb-1.5 max-[375px]:mb-1 max-[320px]:mb-1">Create Your Account</h1>
                                <p className="text-[#757575] text-base max-[768px]:text-sm max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-medium">Join MONA for Free Today!</p>
                            </div>

                            {/* Register Form */}
                            <form onSubmit={submit} className="space-y-5 max-[768px]:space-y-4 max-[425px]:space-y-3 max-[375px]:space-y-2.5 max-[320px]:space-y-2">
                                {/* Name Fields */}
                                <div className="grid grid-cols-2 max-[425px]:grid-cols-1 gap-4 max-[768px]:gap-3 max-[425px]:gap-2.5 max-[375px]:gap-2 max-[320px]:gap-1.5">
                                    <div>
                                        <label 
                                            htmlFor="first_name" 
                                            className="block text-sm max-[768px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-semibold text-[#2C2C2C] mb-3 max-[768px]:mb-2 max-[425px]:mb-1.5 max-[375px]:mb-1 max-[320px]:mb-1"
                                        >
                                            First Name
                                        </label>
                                        <input
                                            id="first_name"
                                            name="first_name"
                                            value={data.first_name}
                                            className="w-full px-4 max-[768px]:px-3 max-[425px]:px-2.5 max-[375px]:px-2 max-[320px]:px-1.5 py-4 max-[768px]:py-3 max-[425px]:py-2.5 max-[375px]:py-2 max-[320px]:py-1.5 text-sm max-[768px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#2C2C2C] bg-[#FFF] border border-[#E0E0E0] rounded-xl max-[768px]:rounded-lg focus:outline-none focus:ring-2 focus:ring-[#058743] focus:border-transparent transition duration-200 ease-in-out placeholder-[#757575]"
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
                                            className="block text-sm max-[768px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-semibold text-[#2C2C2C] mb-3 max-[768px]:mb-2 max-[425px]:mb-1.5 max-[375px]:mb-1 max-[320px]:mb-1"
                                        >
                                            Last Name
                                        </label>
                                        <input
                                            id="last_name"
                                            name="last_name"
                                            value={data.last_name}
                                            className="w-full px-4 max-[768px]:px-3 max-[425px]:px-2.5 max-[375px]:px-2 max-[320px]:px-1.5 py-4 max-[768px]:py-3 max-[425px]:py-2.5 max-[375px]:py-2 max-[320px]:py-1.5 text-sm max-[768px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#2C2C2C] bg-[#FFF] border border-[#E0E0E0] rounded-xl max-[768px]:rounded-lg focus:outline-none focus:ring-2 focus:ring-[#058743] focus:border-transparent transition duration-200 ease-in-out placeholder-[#757575]"
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
                                        className="block text-sm max-[768px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-semibold text-[#2C2C2C] mb-3 max-[768px]:mb-2 max-[425px]:mb-1.5 max-[375px]:mb-1 max-[320px]:mb-1"
                                    >
                                        Email Address
                                    </label>
                                    <input
                                        id="email"
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        className="w-full px-4 max-[768px]:px-3 max-[425px]:px-2.5 max-[375px]:px-2 max-[320px]:px-1.5 py-4 max-[768px]:py-3 max-[425px]:py-2.5 max-[375px]:py-2 max-[320px]:py-1.5 text-sm max-[768px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#2C2C2C] bg-[#FFF] border border-[#E0E0E0] rounded-xl max-[768px]:rounded-lg focus:outline-none focus:ring-2 focus:ring-[#058743] focus:border-transparent transition duration-200 ease-in-out placeholder-[#757575]"
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
                                        className="block text-sm max-[768px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-semibold text-[#2C2C2C] mb-3 max-[768px]:mb-2 max-[425px]:mb-1.5 max-[375px]:mb-1 max-[320px]:mb-1"
                                    >
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="password"
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            value={data.password}
                                            className="w-full px-4 max-[768px]:px-3 max-[425px]:px-2.5 max-[375px]:px-2 max-[320px]:px-1.5 py-4 max-[768px]:py-3 max-[425px]:py-2.5 max-[375px]:py-2 max-[320px]:py-1.5 pr-12 max-[768px]:pr-10 max-[425px]:pr-9 max-[375px]:pr-8 max-[320px]:pr-7 text-sm max-[768px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#2C2C2C] bg-[#FFF] border border-[#E0E0E0] rounded-xl max-[768px]:rounded-lg focus:outline-none focus:ring-2 focus:ring-[#058743] focus:border-transparent transition duration-200 ease-in-out placeholder-[#757575]"
                                            autoComplete="new-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Password"
                                            required
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center px-3 max-[768px]:px-2.5 max-[425px]:px-2 max-[375px]:px-1.5 max-[320px]:px-1.5 text-[#757575] hover:text-[#2C2C2C] transition-colors duration-200"
                                            onClick={() => setShowPassword(!showPassword)}
                                        >
                                            {showPassword ? (
                                                <svg className="w-5 h-5 max-[768px]:w-4 max-[768px]:h-4 max-[425px]:w-3.5 max-[425px]:h-3.5 max-[375px]:w-3 max-[375px]:h-3 max-[320px]:w-2.5 max-[320px]:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 max-[768px]:w-4 max-[768px]:h-4 max-[425px]:w-3.5 max-[425px]:h-3.5 max-[375px]:w-3 max-[375px]:h-3 max-[320px]:w-2.5 max-[320px]:h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                                        className="block text-sm max-[768px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-semibold text-[#2C2C2C] mb-3 max-[768px]:mb-2 max-[425px]:mb-1.5 max-[375px]:mb-1 max-[320px]:mb-1"
                                    >
                                        Confirm Password
                                    </label>
                                    <input
                                        id="password_confirmation"
                                        type={showPassword ? "text" : "password"}
                                        name="password_confirmation"
                                        value={data.password_confirmation}
                                        className="w-full px-4 max-[768px]:px-3 max-[425px]:px-2.5 max-[375px]:px-2 max-[320px]:px-1.5 py-4 max-[768px]:py-3 max-[425px]:py-2.5 max-[375px]:py-2 max-[320px]:py-1.5 text-sm max-[768px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#2C2C2C] bg-[#FFF] border border-[#E0E0E0] rounded-xl max-[768px]:rounded-lg focus:outline-none focus:ring-2 focus:ring-[#058743] focus:border-transparent transition duration-200 ease-in-out placeholder-[#757575]"
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
                                <div className="flex items-center mt-5 max-[768px]:mt-4 max-[425px]:mt-3 max-[375px]:mt-2.5 max-[320px]:mt-2">
                                    <div className="flex items-start max-[375px]:items-center">
                                        <input
                                            id="terms"
                                            name="terms"
                                            type="checkbox"
                                            checked={data.terms}
                                            onChange={(e) => setData('terms', e.target.checked)}
                                            className="h-4 w-4 max-[768px]:h-3.5 max-[768px]:w-3.5 max-[425px]:h-3 max-[425px]:w-3 max-[375px]:h-2.5 max-[375px]:w-2.5 max-[320px]:h-2 max-[320px]:w-2 text-[#058743] focus:ring-[#058743] border-[#E0E0E0] rounded transition duration-200 mt-1 max-[375px]:mt-0"
                                            required
                                        />
                                        <label htmlFor="terms" className="ml-3 max-[768px]:ml-2 max-[425px]:ml-1.5 max-[375px]:ml-1 max-[320px]:ml-1 text-sm max-[768px]:text-xs max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#757575] font-medium cursor-pointer">
                                            I agree to the{' '}
                                            <Link // terms of service link
                                                href={route('terms.show')} 
                                                className="text-[#058743] hover:text-[#046837] underline"
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                Terms of Service
                                            </Link>{' '}
                                            and{' '} 
                                            <Link // privacy policy link
                                                href={route('policy.show')} 
                                                className="text-[#058743] hover:text-[#046837] underline"
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                            >
                                                Privacy Policy
                                            </Link>
                                        </label>
                                    </div>
                                </div>
                                
                                {errors.terms && (
                                    <div className="mt-2 text-sm text-[#D9534F] font-medium">
                                        {errors.terms}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <div className="mt-6 max-[768px]:mt-5 max-[425px]:mt-4 max-[375px]:mt-3 max-[320px]:mt-2.5">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-[#058743] hover:bg-[#046837] focus:bg-[#046837] active:bg-[#034a2a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 max-[768px]:py-2.5 max-[425px]:py-2 max-[375px]:py-1.5 max-[320px]:py-1.5 px-4 max-[768px]:px-3 max-[425px]:px-2.5 max-[375px]:px-2 max-[320px]:px-2 rounded-lg max-[768px]:rounded-md transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#058743] focus:ring-offset-2 shadow-lg text-base max-[768px]:text-sm max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs"
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
                                <div className="mt-5 max-[768px]:mt-4 max-[425px]:mt-3 max-[375px]:mt-2.5 max-[320px]:mt-2 text-center">
                                    <div className="text-sm max-[768px]:text-xs max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#757575]">
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
                        <div className="text-center mt-6 max-[768px]:mt-5 max-[425px]:mt-4 max-[375px]:mt-3 max-[320px]:mt-2.5">
                            <p className="text-xs max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#757575]">
                                © 2025 MONA. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
