import InputError from '@/Components/InputError';
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
        <div className="min-h-screen bg-[#F8F7F0]">
            <Head title="Create Your Account" />

            <header className="bg-white shadow-sm">
                <div className="max-w-8xl mx-auto py-5 px-5 sm:px-7 lg:px-9">
                    <Link href="/">
                <div className="flex items-center space-x-2">
                    <img 
                    src="/images/logo.png"
                    alt="MONA Logo"
                    className="h-10 w-auto"
                    />
                        <h1 className="text-3xl font-bold text-green-600">
                            <span className="text-[#058743]"> </span> MONA
                        </h1>
                       </div>  
                    </Link>
                </div>
            </header>

            <main className="flex flex-col items-center pt-6 sm:pt-12">
                <div className="w-full sm:max-w-md px-8 py-8 bg-white shadow-md overflow-hidden sm:rounded-lg">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-800">Create Your Account</h2>
                        <p className="text-gray-500 mt-2">Join MONA for Free Today!</p>
                    </div>

                    <form onSubmit={submit}>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <TextInput
                                    id="first_name"
                                    name="first_name"
                                    value={data.first_name}
                                    className="mt-1 block w-full"
                                    autoComplete="given-name"
                                    isFocused={true}
                                    onChange={(e) => setData('first_name', e.target.value)}
                                    required
                                    placeholder="First Name"
                                />
                                <InputError message={errors.first_name} className="mt-2" />
                            </div>
                            <div>
                                <TextInput
                                    id="last_name"
                                    name="last_name"
                                    value={data.last_name}
                                    className="mt-1 block w-full"
                                    autoComplete="family-name"
                                    onChange={(e) => setData('last_name', e.target.value)}
                                    required
                                    placeholder="Last Name"
                                />
                                <InputError message={errors.last_name} className="mt-2" />
                            </div>
                        </div>
                    

                        <div className="mt-4">
                            <TextInput
                                id="email"
                                type="email"
                                name="email"
                                value={data.email}
                                className="mt-1 block w-full"
                                autoComplete="username"
                                onChange={(e) => setData('email', e.target.value)}
                                required
                                placeholder="Email Address"
                            />
                            <InputError message={errors.email} className="mt-2" />
                        </div>

                        <div className="mt-4">
                            <TextInput
                                id="password"
                                type="password"
                                name="password"
                                value={data.password}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                placeholder="Password"
                            />
                            <InputError message={errors.password} className="mt-2" />
                        </div>

                 <div className="mt-4">
                            <TextInput
                                id="password_confirmation"
                                type="password"
                                name="password_confirmation"
                                value={data.password_confirmation}
                                className="mt-1 block w-full"
                                autoComplete="new-password"
                                onChange={(e) => setData('password_confirmation', e.target.value)}
                                required
                                placeholder="Confirm Password"
                            />
                            <InputError message={errors.password_confirmation} className="mt-2" />
                        </div>        

                        <div className="block mt-4">
                            <label className="flex items-center">
                                <input
                                    type="checkbox"
                                    name="terms"
                                    className="rounded border-gray-300 text-green-600 shadow-sm focus:ring-green-500"
                                    checked={data.terms}
                                    onChange={(e) => setData('terms', e.target.checked)}
                                    required
                                />
                                <span className="ms-2 text-sm text-gray-600">
                                    I agree to the <a href="#" className="underline">Terms of Service</a> and <a href="#" className="underline">Privacy Policy</a>
                                </span>
                            </label>
                            <InputError message={errors.terms} className="mt-2" />
                        </div>

                        <div className="mt-6">
                            <PrimaryButton className="w-full justify-center py-3 bg-green-600 hover:bg-green-700 focus:bg-green-700 active:bg-green-800" disabled={processing}>
                                Sign Up
                            </PrimaryButton>
                        </div>

                        <div className="text-center mt-4">
                            <Link
                                href={route('login')}
                                className="text-sm text-[#] hover:text-green-800 underline"
                            >
                                Already have an account? Log In
                            </Link>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}