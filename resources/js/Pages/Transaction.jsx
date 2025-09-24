import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Transaction({ auth }) {
    return (
        <AppLayout 
            title="MONA - Transaction"
            auth={auth}
        >
            <Head title="Transaction" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-4">Transaction</h2>
                            <p>Transaction management page - coming soon!</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}