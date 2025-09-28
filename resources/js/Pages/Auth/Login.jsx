import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [showPassword, setShowPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AppLayout>
            <Head title="Log in" />
            
            {/* Full Page Layout */}
            <div className="min-h-screen bg-[#F8F7F0] flex flex-col">
                {/* Header dengan Logo */}
                {/* <div className="w-full px-8 py-6 bg-white shadow-sm">
                    <div className="flex items-center">
                        <div className="flex items-center">
                            Logo MONA */}
                            {/* <div className="relative">
                                <img 
                                    src="/images/logo.png" 
                                    alt="MONA Logo"
                                    className="h-14 w-auto"
                                />
                            </div>
                            <span className="ml-3 text-3xl font-bold text-[#058743] tracking-wide">MONA</span>
                        </div>
                    </div>
                </div> */}

                {/* Main Content Container */}
                <div className="flex-1 flex items-center justify-center px-4 max-[768px]:px-3 max-[375px]:px-2 py-8 max-[768px]:py-6 max-[425px]:py-4 max-[375px]:py-3 max-[320px]:py-2">
                    <div className="w-full max-w-md max-[768px]:max-w-sm max-[425px]:max-w-xs max-[375px]:max-w-[280px] max-[320px]:max-w-[260px]">
                        {/* Login Card */}
                        <div className="bg-white rounded-2xl max-[768px]:rounded-xl shadow-xl px-8 max-[768px]:px-6 max-[425px]:px-4 max-[375px]:px-3 max-[320px]:px-2 py-10 max-[768px]:py-8 max-[425px]:py-6 max-[375px]:py-4 max-[320px]:py-3 border border-[#E0E0E0]">
                            {/* Welcome Section */}
                            <div className="text-center mb-8 max-[768px]:mb-6 max-[425px]:mb-4 max-[375px]:mb-3 max-[320px]:mb-2">
                                <h1 className="text-3xl max-[768px]:text-2xl max-[425px]:text-xl max-[375px]:text-lg max-[320px]:text-base font-bold text-[#2C2C2C] mb-3 max-[768px]:mb-2 max-[425px]:mb-1.5 max-[375px]:mb-1 max-[320px]:mb-1">Welcome Back!</h1>
                                <p className="text-[#757575] text-base max-[768px]:text-sm max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs font-medium">Log in to your account</p>
                            </div>

                            {/* Status Message */}
                            {status && (
                                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="text-sm font-medium text-green-600">
                                        {status}
                                    </div>
                                </div>
                            )}

                            {/* Login Form */}
                            <form onSubmit={submit} className="space-y-6 max-[768px]:space-y-4 max-[425px]:space-y-3 max-[375px]:space-y-2 max-[320px]:space-y-1.5">
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
                                        autoFocus={true}
                                        onChange={(e) => setData('email', e.target.value)}
                                        placeholder="Email Address"
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
                                            autoComplete="current-password"
                                            onChange={(e) => setData('password', e.target.value)}
                                            placeholder="Password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute inset-y-0 right-0 flex items-center px-4 max-[768px]:px-3 max-[425px]:px-2.5 max-[375px]:px-2 max-[320px]:px-1.5 text-[#757575] hover:text-[#2C2C2C] transition-colors duration-200"
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

                                {/* Remember Me Checkbox */}
                                <div className="flex items-center mt-6 max-[768px]:mt-4 max-[425px]:mt-3 max-[375px]:mt-2 max-[320px]:mt-1.5">
                                    <div className="flex items-center">
                                        <input
                                            id="remember"
                                            name="remember"
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="h-4 w-4 max-[768px]:h-3.5 max-[768px]:w-3.5 max-[425px]:h-3 max-[425px]:w-3 max-[375px]:h-2.5 max-[375px]:w-2.5 max-[320px]:h-2 max-[320px]:w-2 text-[#058743] focus:ring-[#058743] border-[#E0E0E0] rounded transition duration-200"
                                        />
                                        <label htmlFor="remember" className="ml-3 max-[768px]:ml-2 max-[425px]:ml-1.5 max-[375px]:ml-1 max-[320px]:ml-1 text-sm max-[768px]:text-xs max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#757575] font-medium cursor-pointer">
                                            Remember me
                                        </label>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="mt-8 max-[768px]:mt-6 max-[425px]:mt-4 max-[375px]:mt-3 max-[320px]:mt-2">
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-[#058743] hover:bg-[#046837] focus:bg-[#046837] active:bg-[#034a2a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-4 max-[768px]:py-3 max-[425px]:py-2.5 max-[375px]:py-2 max-[320px]:py-1.5 px-6 max-[768px]:px-4 max-[425px]:px-3 max-[375px]:px-2 max-[320px]:px-2 rounded-xl max-[768px]:rounded-lg transition duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#058743] focus:ring-offset-2 shadow-lg text-base max-[768px]:text-sm max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs"
                                    >
                                        {processing ? (
                                            <div className="flex items-center justify-center">
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Logging in...
                                            </div>
                                        ) : (
                                            'Log In'
                                        )}
                                    </button>
                                </div>

                                {/* Footer Links */}
                                <div className="mt-8 max-[768px]:mt-6 max-[425px]:mt-4 max-[375px]:mt-3 max-[320px]:mt-2 text-center space-y-4 max-[768px]:space-y-3 max-[425px]:space-y-2 max-[375px]:space-y-1.5 max-[320px]:space-y-1">
                                    {/* Forgot Password Link */}
                                    {canResetPassword && (
                                        <div>
                                            <Link
                                                href={route('password.request')}
                                                className="text-sm max-[768px]:text-xs max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#058743] hover:text-[#046837] font-medium transition duration-200 hover:underline"
                                            >
                                                Forgot your password?
                                            </Link>
                                        </div>
                                    )}
                                    
                                    {/* Sign Up Link */}
                                    <div className="text-sm max-[768px]:text-xs max-[425px]:text-xs max-[375px]:text-xs max-[320px]:text-xs text-[#757575]">
                                        Don't have an account? 
                                        <Link
                                            href={route('register')}
                                            className="text-[#058743] hover:text-[#046837] font-medium ml-1 transition duration-200 hover:underline"
                                        >
                                            Sign Up
                                        </Link>
                                    </div>
                                </div>
                            </form>
                        </div>

                        {/* Optional: Additional Footer */}
                        <div className="text-center mt-8 max-[768px]:mt-6 max-[425px]:mt-4 max-[375px]:mt-3 max-[320px]:mt-2">
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
