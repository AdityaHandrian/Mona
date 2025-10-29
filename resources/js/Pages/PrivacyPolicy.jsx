import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

export default function PrivacyPolicy() {
    return (
        <AppLayout>
            <Head title="Privacy Policy" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-md p-8 sm:p-10 border border-gray-200">

                        {/* Header */}
                        <div className="flex items-start space-x-4">
                            <ShieldCheckIcon className="h-8 w-8 text-[#058743] flex-shrink-0 mt-1" /> 
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Privacy Policy
                                </h1>
                            </div>
                        </div>

                        {/* Konten Privacy Policy */}
                        <div className="mt-8 space-y-6">

                            <p className="text-gray-700 leading-relaxed">
                                Welcome to MONA's Privacy Policy. This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service and the choices you have associated with that data.
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                We use your data to provide and improve the Service. By using the Service, you agree to the collection and use of information in accordance with this policy. Unless otherwise defined in this Privacy Policy, terms used in this Privacy Policy have the same meanings as in our Terms of Service.
                            </p>

                            {/* Bagian 1 */}
                            <section>
                                <h2 className="text-xl font-semibold text-[#058743] mb-3">
                                    1. Information Collection and Use
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    We collect several different types of information for various purposes to provide and improve our Service to you.
                                </p>
                                <h3 className="text-lg font-semibold text-gray-800 mt-4 mb-2">Types of Data Collected</h3>
                                <h4 className="text-md font-semibold text-gray-700 mt-3 mb-1">Personal Data</h4>
                                <p className="text-gray-700 leading-relaxed">
                                    While using our Service, we may ask you to provide us with certain personally identifiable information that can be used to contact or identify you ("Personal Data"). Personally identifiable information may include, but is not limited to:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 leading-relaxed pl-4 space-y-1 mt-2">
                                    <li>Email address</li>
                                    <li>First name and last name</li>
                                    <li>Phone number</li>
                                    <li>Cookies and Usage Data</li>
                                </ul>
                                <h4 className="text-md font-semibold text-gray-700 mt-3 mb-1">Usage Data</h4>
                                 <p className="text-gray-700 leading-relaxed">
                                    We may also collect information how the Service is accessed and used ("Usage Data"). This Usage Data may include information such as your computer's Internet Protocol address (e.g. IP address), browser type, browser version, the pages of our Service that you visit, the time and date of your visit, the time spent on those pages, unique device identifiers and other diagnostic data.
                                </p>
                            </section>

                            {/* Bagian 2 */}
                            <section>
                                <h2 className="text-xl font-semibold text-[#058743] mb-3">
                                    2. Use of Data
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    MONA uses the collected data for various purposes:
                                </p>
                                <ul className="list-disc list-inside text-gray-700 leading-relaxed pl-4 space-y-1 mt-2">
                                   <li>To provide and maintain the Service</li>
                                   <li>To notify you about changes to our Service</li>
                                   <li>To allow you to participate in interactive features of our Service when you choose to do so</li>
                                   <li>To provide customer care and support</li>
                                   <li>To provide analysis or valuable information so that we can improve the Service</li>
                                   <li>To monitor the usage of the Service</li>
                                   <li>To detect, prevent and address technical issues</li>
                                </ul>
                            </section>

                            {/* Bagian 3 */}
                            <section>
                                <h2 className="text-xl font-semibold text-[#058743] mb-3">
                                    3. Transfer Of Data
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Your information, including Personal Data, may be transferred to — and maintained on — computers located outside of your state, province, country or other governmental jurisdiction where the data protection laws may differ than those from your jurisdiction.
                                </p>
                                 <p className="text-gray-700 leading-relaxed mt-4">
                                    If you are located outside Indonesia and choose to provide information to us, please note that we transfer the data, including Personal Data, to Indonesia and process it there.
                                </p>
                                 <p className="text-gray-700 leading-relaxed mt-4">
                                     Your consent to this Privacy Policy followed by your submission of such information represents your agreement to that transfer.
                                </p>
                            </section>

                             {/* Bagian Kontak */}
                            <section>
                                <h2 className="text-xl font-semibold text-[#058743] mb-3">
                                    Contact Us
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    If you have any questions about this Privacy Policy, please contact us:
                                </p>
                                 <ul className="list-disc list-inside text-gray-700 leading-relaxed pl-4 space-y-1 mt-2">
                                     <li>By email: <a href="mailto:privacy@mona.app" className="text-[#058743] hover:text-[#046837] underline">privacy@mona.app</a></li>
                                 </ul>
                            </section>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <Link
                            href={route('register')} // Kembali ke halaman register (menggunakan route asli)
                            className="text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            &larr; Back to Register
                        </Link>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

