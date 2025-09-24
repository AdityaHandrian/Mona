import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';

export default function Budget({ auth }) {
    return (
        <AppLayout 
            title="MONA - Budget"
            auth={auth}
        >
            <Head title="Budget" />
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h2 className="text-2xl font-bold mb-4">Budget</h2>
                            <p>Budget planning page - coming soon!</p>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}