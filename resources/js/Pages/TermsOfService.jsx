import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link } from '@inertiajs/react';
import { DocumentTextIcon } from '@heroicons/react/24/outline';


export default function TermsOfService() {
    return (
        <AppLayout>
            <Head title="Terms of Service" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white rounded-2xl shadow-md p-8 sm:p-10 border border-gray-200">
                        
                        {/* Header */}
                        <div className="flex items-start space-x-4">
                            <DocumentTextIcon className="h-8 w-8 text-[#058743] flex-shrink-0 mt-1" />
                            <div>
                                <h1 className="text-2xl font-semibold text-gray-900">
                                    Terms of Service
                                </h1>
                            </div>
                        </div>

                        {/* Konten Terms of Service */}
                        <div className="mt-8 space-y-6">
                            
                            <p className="text-gray-700 leading-relaxed">
                                Welcome to MONA! These terms and conditions outline the rules and regulations for the use of MONA's Website, located at [mymona.tech].
                            </p>
                            <p className="text-gray-700 leading-relaxed">
                                By accessing this website we assume you accept these terms and conditions. Do not continue to use MONA if you do not agree to take all of the terms and conditions stated on this page.
                            </p>

                            {/* Bagian 1 */}
                            <section>
                                <h2 className="text-xl font-semibold text-[#058743] mb-3">
                                    1. Introduction
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    This is a placeholder for your introduction. You should explain the purpose of your service and who it is for.
                                </p>
                            </section>

                            {/* Bagian 2 */}
                            <section>
                                <h2 className="text-xl font-semibold text-[#058743] mb-3">
                                    2. User Accounts
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    When you create an account with us, you must provide us information that is accurate, complete, and current at all times. Failure to do so constitutes a breach of the Terms, which may result in immediate termination of your account on our Service.
                                </p>
                                <p className="text-gray-700 leading-relaxed mt-4">
                                    You are responsible for safeguarding the password that you use to access the Service and for any activities or actions under your password, whether your password is with our Service or a third-party service.
                                </p>
                            </section>

                            {/* Bagian 3 */}
                            <section>
                                <h2 className="text-xl font-semibold text-[#058743] mb-3">
                                    3. Intellectual Property
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    The Service and its original content, features and functionality are and will remain the exclusive property of MONA and its licensors.
                                </p>
                            </section>

                            {/* Bagian 4 */}
                            <section>
                                <h2 className="text-xl font-semibold text-[#058743] mb-3">
                                    4. Links To Other Web Sites
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    Our Service may contain links to third-party web sites or services that are not owned or controlled by MONA.
                                </p>
                                <p className="text-gray-700 leading-relaxed mt-4">
                                    MONA has no control over, and assumes no responsibility for, the content, privacy policies, or practices of any third party web sites or services. You further acknowledge and agree that MONA shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with use of or reliance on any such content, goods or services available on or through any such web sites or services.
                                </p>
                            </section>

                            {/* Bagian 5 */}
                            <section>
                                <h2 className="text-xl font-semibold text-[#058743] mb-3">
                                    5. Termination
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                                </p>
                            </section>

                            {/* Bagian 6 */}
                            <section>
                                <h2 className="text-xl font-semibold text-[#058743] mb-3">
                                    6. Limitation Of Liability
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    In no event shall MONA, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (i) your access to or use of or inability to access or use the Service; (ii) any conduct or content of any third party on the Service; (iii) any content obtained from the Service; and (iv) unauthorized access, use or alteration of your transmissions or content, whether based on warranty, contract, tort (including negligence) or any other legal theory, whether or not we have been informed of the possibility of such damage, and even if a remedy set forth herein is found to have failed of its essential purpose.
                                </p>
                            </section>

                            {/* Bagian 7 */}
                            <section>
                                <h2 className="text-xl font-semibold text-[#058743] mb-3">
                                    7. Changes to These Terms
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    We reserve the right, at our sole discretion, to modify or replace these Terms at any time. If a revision is material we will try to provide at least 30 days' notice prior to any new terms taking effect. What constitutes a material change will be determined at our sole discretion.
                                </p>
                            </section>

                            {/* Bagian 8 */}
                            <section>
                                <h2 className="text-xl font-semibold text-[#058743] mb-3">
                                    8. Contact Us
                                </h2>
                                <p className="text-gray-700 leading-relaxed">
                                    If you have any questions about these Terms, please contact us at: <a href="mailto:support@mona.app" className="text-[#058743] hover:text-[#046837] underline">support@mona.app</a>.
                                </p>
                            </section>
                        </div>

                    </div>

                    {/* Footer */}
                    <div className="text-center mt-6">
                        <Link
                            href={route('register')}
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

