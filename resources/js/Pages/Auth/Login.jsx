import Checkbox from '@/Components/Checkbox';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

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
                <div className="flex-1 flex items-center justify-center px-4 py-8">
                    <div className="w-full max-w-md">
                        {/* Login Card */}
                        <div className="bg-white rounded-2xl shadow-xl px-8 py-10 border border-[#E0E0E0]">
                            {/* Welcome Section */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-[#2C2C2C] mb-3">Welcome Back!</h1>
                                <p className="text-[#757575] text-base font-medium">Log in to your account</p>
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
                            <form onSubmit={submit} className="space-y-6">
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
                                        className="block text-sm font-semibold text-[#2C2C2C] mb-3"
                                    >
                                        Password
                                    </label>
                                    <input
                                        id="password"
                                        type="password"
                                        name="password"
                                        value={data.password}
                                        className="w-full px-4 py-4 text-sm text-[#2C2C2C] bg-[#FFF] border border-[#E0E0E0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#058743] focus:border-transparent transition duration-200 ease-in-out placeholder-[#757575]"
                                        autoComplete="current-password"
                                        onChange={(e) => setData('password', e.target.value)}
                                        placeholder="Password"
                                    />
                                    {errors.password && (
                                        <div className="mt-2 text-sm text-[#D9534F] font-medium">
                                            {errors.password}
                                        </div>
                                    )}
                                </div>

                                {/* Remember Me Checkbox */}
                                <div className="flex items-center mt-6">
                                    <div className="flex items-center">
                                        <input
                                            id="remember"
                                            name="remember"
                                            type="checkbox"
                                            checked={data.remember}
                                            onChange={(e) => setData('remember', e.target.checked)}
                                            className="h-4 w-4 text-[#058743] focus:ring-[#058743] border-[#E0E0E0] rounded transition duration-200"
                                        />
                                        <label htmlFor="remember" className="ml-3 text-sm text-[#757575] font-medium cursor-pointer">
                                            Remember me
                                        </label>
                                    </div>
                                </div>

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
                                                Logging in...
                                            </div>
                                        ) : (
                                            'Log In'
                                        )}
                                    </button>
                                </div>

                                {/* Footer Links */}
                                <div className="mt-8 text-center space-y-4">
                                    {/* Forgot Password Link */}
                                    {canResetPassword && (
                                        <div>
                                            <Link
                                                href={route('password.request')}
                                                className="text-sm text-[#058743] hover:text-[#046837] font-medium transition duration-200 hover:underline"
                                            >
                                                Forgot your password?
                                            </Link>
                                        </div>
                                    )}
                                    
                                    {/* Sign Up Link */}
                                    <div className="text-sm text-[#757575]">
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
                        <div className="text-center mt-8">
                            <p className="text-xs text-[#757575]">
                                © 2024 MONA. All rights reserved.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
