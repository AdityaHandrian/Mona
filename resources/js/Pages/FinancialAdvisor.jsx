import { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';

export default function FinancialAdvisor({ auth }) {
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [advice, setAdvice] = useState(null);
    const [error, setError] = useState(null);

    const handleAskQuestion = async () => {
        if (!question.trim()) return;

        setLoading(true);
        setError(null);
        setAdvice(null);

        try {
            const response = await axios.post('/api/rag/advice', {
                question: question,
                financial_data: {
                    // You can pass user's financial data here if needed
                }
            });

            if (response.data.success) {
                setAdvice(response.data);
            } else {
                setError(response.data.error || 'Failed to get advice');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to connect to RAG Engine');
        } finally {
            setLoading(false);
        }
    };

    return (
        <AppLayout title="Financial Advisor" auth={auth}>
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-charcoal mb-2">
                        AI Financial Advisor
                    </h1>
                    <p className="text-medium-gray">
                        Ask questions about personal finance, budgeting, and money management
                    </p>
                </div>

                <div className="bg-white rounded-lg border border-light-gray p-6 mb-6">
                    <label className="block text-charcoal font-medium mb-2">
                        What would you like to know?
                    </label>
                    <textarea
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="E.g., Why start to think about your finances now?"
                        className="w-full px-4 py-3 border border-light-gray rounded-lg focus:ring-2 focus:ring-[#058743] focus:border-transparent"
                        rows="4"
                    />
                    
                    <button
                        onClick={handleAskQuestion}
                        disabled={loading || !question.trim()}
                        className={`mt-4 w-full px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                            loading || !question.trim()
                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                : 'bg-[#058743] text-white hover:bg-[#046635]'
                        }`}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                Consulting AI Advisor...
                            </div>
                        ) : (
                            'Get Financial Advice'
                        )}
                    </button>
                </div>

                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {advice && advice.success && (
                    <div className="space-y-6">
                        {/* AI Generated Response */}
                        {advice.generated_response && (
                            <div className="bg-white rounded-lg border border-light-gray p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <h2 className="text-xl font-semibold text-charcoal">
                                        AI Response
                                    </h2>
                                    <span className="text-sm text-medium-gray bg-gray-100 px-3 py-1 rounded">
                                        {advice.processing_time_ms}ms
                                    </span>
                                </div>
                                
                                <div className="prose max-w-none">
                                    <div className="text-charcoal whitespace-pre-wrap leading-relaxed">
                                        {advice.generated_response}
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Knowledge Base Sources */}
                        {advice.contexts && advice.contexts.length > 0 && (
                            <div className="bg-white rounded-lg border border-light-gray p-6">
                                <h3 className="text-lg font-semibold text-charcoal mb-4">
                                    Knowledge Base Sources ({advice.contexts.length})
                                </h3>
                                
                                <div className="space-y-4">
                                    {advice.contexts.map((context, index) => (
                                        <div key={index} className="border-l-4 border-[#058743] pl-4 py-2">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="font-medium text-charcoal">
                                                    Source {index + 1}
                                                </span>
                                                <span className="text-sm text-medium-gray">
                                                    Relevance: {(context.relevance_score * 100).toFixed(1)}%
                                                </span>
                                            </div>
                                            <p className="text-gray-700 text-sm mb-2">
                                                {context.text.length > 200 
                                                    ? context.text.substring(0, 200) + '...'
                                                    : context.text
                                                }
                                            </p>
                                            {context.source_uri !== 'N/A' && (
                                                <a 
                                                    href={context.source_uri} 
                                                    target="_blank" 
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-[#058743] hover:underline"
                                                >
                                                    Source: {context.source_uri}
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </AppLayout>
    );
}
