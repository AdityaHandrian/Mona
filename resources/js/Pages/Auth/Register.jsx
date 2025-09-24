import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Register() {
    const { data, setData, post, processing, errors, reset } = useForm({
        first_name: '',
        last_name: '',
        email: '',
        password: '',
        password_confirmation: '',
        terms: false,
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('register'), {
            onFinish: () => reset('password', 'password_confirmation'),
        });
    };

    return (
        <>
            <Head title="Register" />
            
            <div className="flex flex-col items-center min-h-screen bg-[#F8F7F0] py-10">
                {/* Logo */}
                <div className="flex items-center mb-6">
                    <img src="images/logo.png" alt="Mona Logo" className="h-10 mr-2" />
                    <span className="text-green-700 font-bold text-xl">MONA</span>
                </div>

                {/* Card */}
                <div className="bg-white p-8 rounded-2xl shadow-md w-full max-w-md">
                    <h1 className="text-2xl font-bold text-center mb-2">
                        Create Your Account
                    </h1>
                    <p className="text-center text-gray-600 mb-6">
                        Join <span className="text-green-700 font-semibold">MONA</span> for Free Today!
                    </p>

                    <form onSubmit={submit} className="space-y-4">
                        <div>
                            <InputLabel htmlFor="first_name" value="First Name" />
                            <TextInput
                                id="first_name"
                                name="first_name"
                                value={data.first_name}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('first_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.first_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="last_name" value="Last Name" />
                            <TextInput
                                id="last_name"
                                name="last_name"
                                value={data.last_name}
                                className="mt-1 block w-full"
                                onChange={(e) => setData('last_name', e.target.value)}
                                required
                            />
                            <InputError message={errors.last_name} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="email" value="Email Address" />
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password" value="Password" />
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                        <div>
                            <InputLabel htmlFor="password_confirmation" value="Confirm Password" />
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>

                        {/* Checkbox Terms */}
                        <label className="flex items-center text-sm text-gray-600">
                            <input
                                type="checkbox"
                                checked={data.terms}
                                onChange={(e) => setData('terms', e.target.checked)}
                                className="mr-2"
                                required
                            />
                            I agree to the{" "}
                            <a href="#" className="text-green-700 ml-1 hover:underline">
                                Terms of Service
                            </a>{" "}
                            and{" "}
                            <a href="#" className="text-green-700 ml-1 hover:underline">
                                Privacy Policy
                            </a>
                        </label>

                        <PrimaryButton
                            className="w-full justify-center bg-green-700 hover:bg-green-800"
                            disabled={processing}
                        >
                            Sign Up
                        </PrimaryButton>
                    </form>

                    <p className="text-center text-sm text-gray-600 mt-4">
                        Already have an account?{" "}
                        <Link href={route('login')} className="text-green-700 hover:underline">
                            Log In
                        </Link>
                    </p>
                </div>
            </div>
        </>
    );
}
