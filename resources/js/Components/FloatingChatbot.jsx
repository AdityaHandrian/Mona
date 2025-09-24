import { useState, useRef, useEffect } from 'react';

export default function FloatingChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            type: 'bot',
            content: 'Hello! How can I help you today?'
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const chatboxRef = useRef(null);

    const quickQuestions = [
        "How can I reduce my monthly expenses?",
        "Should I invest or pay off debt first?",
        "How much should I budget for entertainment?"
    ];

    // Close chatbox when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (chatboxRef.current && !chatboxRef.current.contains(event.target) && isOpen && !isClosing) {
                handleClose();
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, isClosing]);

    const handleClose = () => {
        if (isClosing) return; // Prevent multiple close triggers
        setIsClosing(true);
        setTimeout(() => {
            setIsOpen(false);
            setIsClosing(false);
        }, 290); // Match the longest animation duration
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // Add user message
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: inputMessage
        };

        // Add bot response (placeholder)
        const botResponse = {
            id: Date.now() + 1,
            type: 'bot',
            content: "I'm here to help with your questions! [This feature is coming soon with AI-powered responses.]"
        };

        setMessages(prev => [...prev, userMessage, botResponse]);
        setInputMessage('');
    };

    const handleQuickQuestion = (question) => {
        const userMessage = {
            id: Date.now(),
            type: 'user',
            content: question
        };

        const botResponse = {
            id: Date.now() + 1,
            type: 'bot',
            content: "That's a great question! [This feature is coming soon with AI-powered responses.]"
        };

        setMessages(prev => [...prev, userMessage, botResponse]);
    };

    return (
        <>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideUpFade {
                    from { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.95);
                    }
                    to { 
                        opacity: 1; 
                        transform: translateY(0) scale(1);
                    }
                }
                @keyframes fadeOut {
                    from { opacity: 1; }
                    to { opacity: 0; }
                }
                @keyframes slideDownFade {
                    from { 
                        opacity: 1; 
                        transform: translateY(0) scale(1);
                    }
                    to { 
                        opacity: 0; 
                        transform: translateY(20px) scale(0.95);
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-slide-up-fade {
                    animation: slideUpFade 0.3s ease-out;
                }
                .animate-fade-out {
                    animation: fadeOut 0.3s ease-in;
                }
                .animate-slide-down-fade {
                    animation: slideDownFade 0.3s ease-in;
                }
            `}</style>
            {/* Dark Overlay */}
            {(isOpen || isClosing) && (
                <div className={`fixed inset-0 bg-black bg-opacity-30 z-40 ${isClosing ? 'animate-fade-out' : 'animate-fade-in'}`}></div>
            )}

            {/* Chat Window */}
            {(isOpen || isClosing) && (
                <div 
                    ref={chatboxRef}
                    className={`fixed bottom-4 right-4 w-[500px] h-[700px] bg-white rounded-2xl shadow-2xl border border-gray-200 z-50 flex flex-col ${isClosing ? 'animate-slide-down-fade' : 'animate-slide-up-fade'}`}
                >
                    {/* Header */}
                    <div className="bg-[#058743] text-white px-6 py-4 rounded-t-2xl">
                        <div className="flex items-center justify-between">
                            <h3 className="font-bold text-xl">AI Assistant</h3>
                            <button
                                onClick={handleClose}
                                className="text-white hover:text-gray-200 text-4xl font-bold w-6 h-6 flex items-center justify-center"
                            >
                                ×
                            </button>
                        </div>
                    </div>

                    <div className="flex flex-1 overflow-hidden">
                        {/* Left Sidebar - Tips and Quick Questions */}
                        <div className="w-48 p-4 border-r border-gray-200 flex flex-col">
                            {/* Tips Section */}
                            <div className="space-y-3 mb-6">
                                {/* Tip Card */}
                                <div className="bg-[#D4EADF] rounded-xl p-3">
                                    <div className="flex items-center mb-2">
                                        <svg className="w-4 h-4 text-[#058743] mr-2" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                                        </svg>
                                        <span className="text-[#058743] font-bold text-sm">Tip</span>
                                    </div>
                                    <p className="text-[#058743] text-xs font-medium">Automate your Savings</p>
                                </div>

                                {/* Smart Card */}
                                <div className="bg-[#FCF0C8] rounded-xl p-3">
                                    <div className="flex items-center mb-2">
                                        <span className="text-[#EFBF04] font-bold text-sm mr-1">$</span>
                                        <span className="text-[#EFBF04] font-bold text-sm">Smart</span>
                                    </div>
                                    <p className="text-[#EFBF04] text-xs font-medium">24 Hour Rule for big purchase</p>
                                </div>
                            </div>

                            {/* Quick Questions */}
                            <div className="flex-1">
                                <p className="text-gray-900 font-semibold mb-3 text-sm">Quick Questions</p>
                                <div className="space-y-2">
                                    {quickQuestions.map((question, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleQuickQuestion(question)}
                                            className="w-full text-left text-xs text-gray-600 hover:text-[#058743] transition-colors py-1 rounded hover:bg-gray-50"
                                        >
                                            {question}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Messages */}
                        <div className="flex-1 flex flex-col">

                            {/* Messages */}
                            <div className="flex-1 overflow-y-auto p-4">
                                <div className="flex items-start mb-4">
                                    <div className="w-8 h-8 rounded-full bg-[#058743] flex items-center justify-center mr-3 flex-shrink-0">
                                        <img 
                                            src="/images/icons/ai_chatbot_profile.svg" 
                                            alt="AI Assistant" 
                                            className="w-5 h-5"
                                        />
                                    </div>
                                    <div className="bg-[#E5E7EB] rounded-2xl rounded-tl-md px-3 py-2 max-w-xs">
                                        <p className="text-gray-700 text-sm">Hello! How can I help you today?</p>
                                    </div>
                                </div>
                                
                                {/* Additional messages */}
                                {messages.slice(1).map((message) => (
                                    <div key={message.id} className={`flex mb-3 ${message.type === 'user' ? 'justify-end' : 'items-start'}`}>
                                        {message.type === 'bot' && (
                                            <div className="w-8 h-8 rounded-full bg-[#058743] flex items-center justify-center mr-3 flex-shrink-0">
                                                <img 
                                                    src="/images/icons/ai_chatbot_profile.svg" 
                                                    alt="AI Assistant" 
                                                    className="w-5 h-5"
                                                />
                                            </div>
                                        )}
                                        <div className={`px-3 py-2 rounded-2xl max-w-xs ${
                                            message.type === 'user' 
                                                ? 'bg-[#058743] text-white rounded-tr-md' 
                                                : 'bg-[#E5E7EB] text-gray-700 rounded-tl-md'
                                        }`}>
                                            <p className="text-sm">{message.content}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Sticky Input at Bottom */}
                            <div className="border-t border-gray-200 p-4">
                                <form onSubmit={handleSendMessage} className="flex space-x-3">
                                    <input
                                        type="text"
                                        value={inputMessage}
                                        onChange={(e) => setInputMessage(e.target.value)}
                                        placeholder="Ask me about your finance"
                                        className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#058743] focus:border-transparent"
                                    />
                                    <button
                                        type="submit"
                                        className="bg-[#058743] text-white p-3 rounded-xl hover:bg-[#046635] transition-colors flex items-center justify-center"
                                    >
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M2 10l7-7 1.414 1.414L5.828 9H18v2H5.828l4.586 4.586L9 17l-7-7z" transform="rotate(180 10 10)"/>
                                        </svg>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Floating Button - Hidden when chat is open */}
            {!isOpen && (
                <button
                    onClick={() => setIsOpen(true)}
                    className="fixed bottom-6 right-6 w-20 h-20 bg-[#058743] hover:bg-[#046635] rounded-full shadow-lg flex items-center justify-center transition-all duration-200 z-50 group"
                >
                    {/* AI Bot Icon */}
                    <img 
                        src="/images/icons/ai_chatbot_logo.svg" 
                        alt="AI Chatbot" 
                        className="w-10 h-10"
                    />
                </button>
            )}
        </>
    );
}