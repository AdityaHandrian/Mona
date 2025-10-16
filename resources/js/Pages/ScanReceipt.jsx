import { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

// Helper functions for number formatting
const formatNumberWithDots = (value) => {
    // Handle empty or undefined values
    if (!value) return '';
    // Remove all non-digits
    const digits = String(value).replace(/\D/g, '');
    
    // Add dots every 3 digits from right to left
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseFormattedNumber = (formattedValue) => {
    // Remove dots to get raw number
    return formattedValue.replace(/\./g, '');
};

export default function ScanReceipt({ auth }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [ocrResults, setOcrResults] = useState(null);
    const [processingTime, setProcessingTime] = useState(null);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [formData, setFormData] = useState({
        amount: '',
        category: 'Other',
        date: '',
        description: ''
    });
    const [isDragging, setIsDragging] = useState(false);
    const [categories, setCategories] = useState([]);
    const [loadingCategories, setLoadingCategories] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Budget warning modal state
    const [budgetWarningModal, setBudgetWarningModal] = useState({
        show: false,
        pendingTransaction: null
    });

    // Modal notification state (SweetAlert2-style)
    const [modalNotification, setModalNotification] = useState({ 
        show: false, 
        type: '', // 'success' or 'error'
        title: '',
        message: '' 
    });

    // Handle window resize for responsive filename truncation
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Fetch categories from API (expense categories since receipts are usually expenses)
    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await axios.get('/api/categories?type=expense');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
            // Fallback categories if API fails
            setCategories([
                { id: 1, category_name: 'Food & Dining' },
                { id: 2, category_name: 'Shopping' },
                { id: 3, category_name: 'Entertainment' },
                { id: 4, category_name: 'Bills & Utilities' },
                { id: 5, category_name: 'Transportation' },
                { id: 6, category_name: 'Other Expense' }
            ]);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Load categories when component mounts
    useEffect(() => {
        fetchCategories();
    }, []);

    // Hide modal notification after 3 seconds
    useEffect(() => {
        if (modalNotification.show) {
            const timer = setTimeout(() => {
                setModalNotification({ show: false, type: '', title: '', message: '' });
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [modalNotification.show]);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const showModalNotification = (type, title, message) => {
        setModalNotification({ show: true, type, title, message });
    };

    // Image compression function to speed up camera photos
    const compressImage = (file, maxWidth = 1024, quality = 0.8) => {
        return new Promise((resolve) => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const img = new Image();
            
            img.onload = () => {
                // Calculate new dimensions while maintaining aspect ratio
                const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;
                
                // Draw and compress the image
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                
                // Convert to compressed blob
                canvas.toBlob((blob) => {
                    // Create a new File object with the same name
                    const compressedFile = new File([blob], file.name, {
                        type: 'image/jpeg',
                        lastModified: Date.now()
                    });
                    resolve(compressedFile);
                }, 'image/jpeg', quality);
            };
            
            img.src = URL.createObjectURL(file);
        });
    };

    // Helper function to map OCR category to our API categories (multilingual)
    const mapToValidCategory = (ocrCategory, description = '') => {
        if (categories.length === 0) return null; // Return null if categories not loaded yet
        
        // Combine category and description for better matching
        const searchText = `${ocrCategory || ''} ${description || ''}`.toLowerCase();
        
        // Find matching category by name
        const findCategoryByKeywords = (keywords) => {
            return categories.find(cat => 
                keywords.some(keyword => 
                    cat.category_name.toLowerCase().includes(keyword) ||
                    searchText.includes(keyword)
                )
            );
        };
        
        // Food & Beverages mapping (English + Indonesian)
        const foodCategory = findCategoryByKeywords([
            'food', 'beverage', 'restaurant', 'cafe', 'grocery', 'dining',
            'makanan', 'minuman', 'restoran', 'warung', 'kafe', 'supermarket',
            'pasar', 'indomaret', 'alfamart', 'hypermart', 'giant', 'carrefour',
            'hero', 'lottemart', 'mcdonald', 'kfc', 'pizza', 'bakery',
            'roti', 'bakso', 'gado', 'nasi', 'ayam', 'seafood', 'kedai'
        ]);
        if (foodCategory) return foodCategory.id;
        
        // Shopping mapping (English + Indonesian + Electronics)
        const shoppingCategory = findCategoryByKeywords([
            'shop', 'retail', 'store', 'clothing', 'fashion', 'belanja',
            'mall', 'butik', 'pakaian', 'sepatu', 'tas', 'elektronik',
            'electronic', 'gadget', 'handphone', 'laptop', 'computer', 'hp',
            'smartphone', 'tablet', 'accessories', 'aksesoris'
        ]);
        if (shoppingCategory) return shoppingCategory.id;
        
        // Entertainment mapping (English + Indonesian)
        const entertainmentCategory = findCategoryByKeywords([
            'entertainment', 'movie', 'game', 'cinema', 'sports', 'hiburan',
            'bioskop', 'film', 'olahraga', 'permainan', 'karaoke', 'wisata',
            'cgv', 'xxi', 'cineplex', 'fitness', 'gym', 'spa', 'salon'
        ]);
        if (entertainmentCategory) return entertainmentCategory.id;
        
        // Bills & Utilities mapping (English + Indonesian)
        const billsCategory = findCategoryByKeywords([
            'utility', 'electric', 'water', 'gas', 'internet', 'phone', 'bill',
            'listrik', 'air', 'telepon', 'tagihan', 'pln', 'pdam',
            'wifi', 'pulsa', 'telkom', 'indihome'
        ]);
        if (billsCategory) return billsCategory.id;
        
        // Default to first category (usually "Other") if no match found
        return categories.length > 0 ? categories[categories.length - 1].id : null;
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check if image needs compression (>1MB or from camera)
        const needsCompression = file.size > 1024 * 1024; // 1MB threshold
        
        if (needsCompression) {
            try {
                console.log(`Compressing image: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
                const compressedFile = await compressImage(file);
                console.log(`Compressed to: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                setSelectedFile(compressedFile);
            } catch (error) {
                console.error('Compression failed, using original:', error);
                setSelectedFile(file);
            }
        } else {
            setSelectedFile(file);
        }
        
        // Reset results when new file is selected
        setOcrResults(null);
        setProcessingTime(null);
    };

    const handleScanReceipt = async () => {
        if (!selectedFile) return;
        
        setIsScanning(true);
        
        try {
            // Get CSRF token
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page and try again.');
            }
            
            console.log('Starting OCR process with file:', {
                name: selectedFile.name,
                size: selectedFile.size,
                type: selectedFile.type
            });
            
            // Create FormData to send the file to your existing OCR endpoint
            const formData = new FormData();
            formData.append('image', selectedFile); // Using 'image' to match your existing endpoint
            
            // Send to your new Laravel Document AI endpoint
            const response = await fetch('/process-receipt-ai', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: formData
            });
            
            // Get response text for better error debugging
            const responseText = await response.text();
            console.log('Response status:', response.status);
            console.log('Response body:', responseText);
            
            if (!response.ok) {
                // Try to parse error message from response
                let errorMessage = 'OCR processing failed';
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.error || errorData.message || errorMessage;
                    if (errorData.details) {
                        errorMessage += ': ' + errorData.details;
                    }
                } catch (e) {
                    // If response is not JSON, use the text
                    errorMessage += ` (Status: ${response.status})`;
                    if (responseText && responseText.length < 200) {
                        errorMessage += ` - ${responseText}`;
                    }
                }
                throw new Error(errorMessage);
            }
            
            // Parse JSON response
            const ocrData = JSON.parse(responseText);
            
            // Check if there's an error from the backend
            if (ocrData.error) {
                throw new Error(ocrData.error);
            }

            // Store processing time if available
            if (ocrData.processing_stats?.processing_time_ms) {
                setProcessingTime(ocrData.processing_stats.processing_time_ms);
            }
            
            // Use the extracted data from Document AI
            const extractedData = ocrData.extracted || {};
            
            // Helper function to parse and validate date
            const parseReceiptDate = (dateString) => {
                if (!dateString) return new Date().toISOString().split('T')[0];
                
                // If date is already in YYYY-MM-DD format, return as is
                if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
                    return dateString;
                }
                
                // Try multiple date formats commonly found on Indonesian receipts
                const dateFormats = [
                    // DD/MM/YYYY or DD-MM-YYYY
                    /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{4})$/,
                    // DD/MM/YY or DD-MM-YY
                    /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2})$/,
                    // YYYY-MM-DD (ISO format)
                    /^(\d{4})-(\d{1,2})-(\d{1,2})$/,
                    // DD MMM YYYY (16 Nov 2019)
                    /^(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(\d{4})$/i
                ];
                
                const dateStr = dateString.trim();
                
                // Try DD/MM/YYYY or DD-MM-YYYY format first (most common in Indonesia)
                const ddmmyyyy = dateStr.match(dateFormats[0]);
                if (ddmmyyyy) {
                    const [, day, month, year] = ddmmyyyy;
                    const date = new Date(year, month - 1, day);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                }
                
                // Try DD/MM/YY format
                const ddmmyy = dateStr.match(dateFormats[1]);
                if (ddmmyy) {
                    const [, day, month, year] = ddmmyy;
                    const fullYear = parseInt(year) > 50 ? 1900 + parseInt(year) : 2000 + parseInt(year);
                    const date = new Date(fullYear, month - 1, day);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                }
                
                // Try ISO format
                const iso = dateStr.match(dateFormats[2]);
                if (iso) {
                    const date = new Date(dateStr);
                    if (!isNaN(date.getTime())) {
                        return date.toISOString().split('T')[0];
                    }
                }
                
                // Fallback to current date if parsing fails
                return new Date().toISOString().split('T')[0];
            };
            
            // Process the OCR results from Document AI service
            const processedResults = {
                amount: extractedData.amount || '',
                category: mapToValidCategory(extractedData.category, extractedData.description), // Smart mapping with description
                date: parseReceiptDate(extractedData.date), // Better date parsing
                description: extractedData.description || 'Receipt transaction'
            };
            
            setOcrResults(processedResults);
            setFormData(processedResults);
            
        } catch (error) {
            console.error('OCR Error Details:', {
                message: error.message,
                stack: error.stack,
                name: error.name
            });
            
            // Show detailed error to user
            showMessage('error', 'Failed to process receipt: ' + error.message);
            
            // Don't set any results - keep the empty state
            console.log('OCR failed, keeping extracted data section empty');
            
        } finally {
            setIsScanning(false);
        }
        
        // // Mock Scan (for testing)
        // setTimeout(() => {
        //     const mockResults = {
        //         amount: '255.255.255',
        //         category: 'Food and Beverages',
        //         date: '2025-09-17',
        //         description: 'Receipt transaction (Fake Scan)'
        //     };
        //     setOcrResults(mockResults);
        //     setFormData(mockResults);
        //     setIsScanning(false);
        // }, 3000);
    };

    const handleInputChange = (field, value) => {
        if (field === 'amount') {
            // Handle amount formatting
            const rawValue = parseFormattedNumber(value);
            setFormData(prev => ({
                ...prev,
                [field]: rawValue
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    // Helper function to format date as DD/MM/YYYY for display
    const formatDateForDisplay = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return dateString;
        
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        
        return `${day}/${month}/${year}`;
    };

    // Helper function to convert DD/MM/YYYY back to YYYY-MM-DD for input value
    const parseDateFromDisplay = (displayDate) => {
        if (!displayDate) return '';
        
        // If it's already in YYYY-MM-DD format, return as is
        if (displayDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
            return displayDate;
        }
        
        // Parse DD/MM/YYYY format
        const parts = displayDate.split('/');
        if (parts.length === 3) {
            const [day, month, year] = parts;
            return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        
        return displayDate;
    };

    // Helper function to truncate filename with responsive length based on screen size
    const truncateFilename = (filename) => {
        if (!filename) return '';
        
        // Dynamic max length based on current screen width
        const getMaxLength = () => {
            if (windowWidth >= 1536) return 50; // 2xl screens - show more
            if (windowWidth >= 1280) return 40; // xl screens  
            if (windowWidth >= 1024) return 35; // lg screens
            if (windowWidth >= 768) return 30;  // md screens
            if (windowWidth >= 640) return 25;  // sm screens
            return 20; // xs screens - very tight
        };
        
        const maxLength = getMaxLength();
        
        if (filename.length <= maxLength) return filename;
        
        // Find the last dot for extension
        const lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex === -1) {
            // No extension, just truncate
            return filename.substring(0, maxLength - 3) + '...';
        }
        
        const nameWithoutExt = filename.substring(0, lastDotIndex);
        const extension = filename.substring(lastDotIndex);
        
        // Calculate available space for name (total - extension - ellipsis)
        const availableSpace = maxLength - extension.length - 3;
        
        if (availableSpace <= 0) {
            // Extension is too long, just show extension
            return '...' + extension;
        }
        
        if (nameWithoutExt.length <= availableSpace) {
            return filename; // No truncation needed
        }
        
        // Truncate name and add ellipsis before extension
        return nameWithoutExt.substring(0, availableSpace) + '...' + extension;
    };

    const handleAddTransaction = async () => {
        if (!formData.amount || !formData.category || !formData.date) {
            showModalNotification('error', 'Validation Error', 'Please fill in all required fields (Amount, Category, Date)');
            return;
        }

        // Check if the selected category is an expense type
        const selectedCategory = categories.find(cat => cat.id === parseInt(formData.category));
        const isExpense = selectedCategory && selectedCategory.type === 'expense';

        // Prepare transaction data
        const transactionData = {
            category_id: parseInt(formData.category),
            amount: parseFloat(formData.amount),
            description: formData.description || 'Receipt transaction',
            transaction_date: formData.date
        };

        // Check budget only for expense transactions
        if (isExpense) {
            const hasBudget = await checkBudgetExists(transactionData.category_id, transactionData.transaction_date);
            
            if (!hasBudget) {
                // Show budget warning modal
                setBudgetWarningModal({
                    show: true,
                    pendingTransaction: transactionData
                });
                return;
            }
        }

        // If income or budget exists, save directly
        await saveTransaction(transactionData);
    };

    const checkBudgetExists = async (categoryId, date) => {
        try {
            const transactionDate = new Date(date);
            const month = transactionDate.getMonth() + 1; // getMonth() returns 0-11
            const year = transactionDate.getFullYear();
            
            const response = await axios.get('/api/budgets/check', {
                params: {
                    category_id: categoryId,
                    month: month,
                    year: year
                }
            });
            
            return response.data.has_budget;
        } catch (error) {
            console.error('Error checking budget:', error);
            return true; // If error, assume budget exists to avoid blocking
        }
    };

    const saveTransaction = async (transactionData) => {
        setSubmitting(true);
        try {
            const response = await axios.post('/api/transactions/quick-add', transactionData);

            if (response.data.status === 'success') {
                showModalNotification('success', 'Success', 'Transaction added successfully from receipt!');
                
                // Reset form and clear selected file
                setFormData({
                    amount: '',
                    category: categories.length > 0 ? categories[0].id : '',
                    date: '',
                    description: ''
                });
                setOcrResults(null);
                setSelectedFile(null);
                
                // Clear file input
                const fileInput = document.getElementById('receipt-file');
                const cameraInput = document.getElementById('camera-input');
                if (fileInput) fileInput.value = '';
                if (cameraInput) cameraInput.value = '';
            }
        } catch (error) {
            console.error('Error adding transaction:', error);
            
            if (error.response?.data?.errors) {
                const errors = Object.values(error.response.data.errors).flat();
                showModalNotification('error', 'Validation Error', errors.join(', '));
            } else if (error.response?.data?.message) {
                showModalNotification('error', 'Error', error.response.data.message);
            } else {
                showModalNotification('error', 'Error', 'Failed to add transaction. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
    };

    const handleContinueAnyway = async () => {
        setBudgetWarningModal({ show: false, pendingTransaction: null });
        await saveTransaction(budgetWarningModal.pendingTransaction);
    };

    const handleCancelTransaction = () => {
        setBudgetWarningModal({ show: false, pendingTransaction: null });
    };

    const openCameraOrFile = () => {
        // Check if device has camera capability
        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            // Show options for camera or file
            const choice = confirm("Choose an option:\nOK = Take Photo with Camera\nCancel = Select from Files");
            if (choice) {
                // Open camera
                document.getElementById('camera-input').click();
            } else {
                // Open file picker
                document.getElementById('receipt-file').click();
            }
        } else {
            // No camera available, just open file picker
            document.getElementById('receipt-file').click();
        }
    };

    const handleCameraClick = () => {
        // Force environment (back) camera by setting capture attribute dynamically
        const cameraInput = document.getElementById('camera-input');
        cameraInput.setAttribute('capture', 'environment');
        cameraInput.click();
    };

    // Drag and drop handlers
    const handleDragEnter = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only set dragging to false if we're leaving the drop zone entirely
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));
        
        if (imageFile) {
            // Use the same file processing logic as handleFileChange
            const needsCompression = imageFile.size > 1024 * 1024;
            
            if (needsCompression) {
                try {
                    console.log(`Compressing image: ${(imageFile.size / 1024 / 1024).toFixed(2)}MB`);
                    const compressedFile = await compressImage(imageFile);
                    console.log(`Compressed to: ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
                    setSelectedFile(compressedFile);
                } catch (error) {
                    console.error('Compression failed, using original:', error);
                    setSelectedFile(imageFile);
                }
            } else {
                setSelectedFile(imageFile);
            }
            
            // Reset results when new file is selected
            setOcrResults(null);
        } else {
            alert('Please drop an image file (PNG, JPG, or JPEG)');
        }
    };

    return (
        <AppLayout 
            title="MONA - Scan Receipt" 
            auth={auth}
        >
            {/* Modal Notification Overlay (SweetAlert2-style) */}
            {modalNotification.show && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-11/12 animate-scale-in">
                        {/* Icon */}
                        <div className="flex justify-center mb-6">
                            {modalNotification.type === 'success' ? (
                                <div className="w-20 h-20 rounded-full border-4 border-growth-green-500 flex items-center justify-center animate-check-icon">
                                    <svg className="w-12 h-12 text-growth-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                            ) : (
                                <div className="w-20 h-20 rounded-full border-4 border-expense-red-500 flex items-center justify-center animate-error-icon">
                                    <img 
                                        src="/images/icons/exclamation-warning-icon.svg" 
                                        alt="Error" 
                                        className="w-10 h-10"
                                    />
                                </div>
                            )}
                        </div>
                        
                        {/* Title */}
                        <h3 className={`text-2xl font-bold text-center mb-3 ${
                            modalNotification.type === 'success' ? 'text-growth-green-500' : 'text-expense-red-500'
                        }`}>
                            {modalNotification.title}
                        </h3>
                        
                        {/* Message */}
                        <p className="text-gray-600 text-center text-base">
                            {modalNotification.message}
                        </p>
                    </div>
                </div>
            )}

            {/* Budget Warning Modal */}
            {budgetWarningModal.show && (
                <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-50 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-11/12 animate-scale-in">
                        {/* Warning Icon */}
                        <div className="flex justify-center mb-6">
                            <div className="w-20 h-20 rounded-full border-4 border-yellow-500 flex items-center justify-center animate-warning-icon">
                                <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-2xl font-bold text-center mb-3 text-yellow-600">
                            No Budget Set
                        </h3>
                        
                        {/* Message */}
                        <p className="text-gray-600 text-center text-base mb-6">
                            You haven't set a budget for this expense category in the selected month. Do you want to continue anyway?
                        </p>
                        
                        {/* Action Buttons */}
                        <div className="flex flex-col gap-3">
                            <button
                                onClick={handleContinueAnyway}
                                className="w-full py-3 px-6 rounded-lg font-medium bg-growth-green-500 text-white hover:bg-growth-green-600 transition-colors"
                            >
                                Continue Anyway
                            </button>
                            <button
                                onClick={handleCancelTransaction}
                                className="w-full py-3 px-6 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                            >
                                Cancel Transaction
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyframes for animations */}
            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes scaleIn {
                    from { 
                        opacity: 0; 
                        transform: scale(0.5); 
                    }
                    to { 
                        opacity: 1; 
                        transform: scale(1); 
                    }
                }
                @keyframes checkIcon {
                    0% { 
                        transform: scale(0) rotate(0deg); 
                        opacity: 0; 
                    }
                    50% { 
                        transform: scale(1.2) rotate(180deg); 
                    }
                    100% { 
                        transform: scale(1) rotate(360deg); 
                        opacity: 1; 
                    }
                }
                @keyframes errorIcon {
                    0% { 
                        transform: scale(0); 
                        opacity: 0; 
                    }
                    50% { 
                        transform: scale(1.2); 
                    }
                    100% { 
                        transform: scale(1); 
                        opacity: 1; 
                    }
                }
                @keyframes warningIcon {
                    0% { 
                        transform: scale(0) rotate(-180deg); 
                        opacity: 0; 
                    }
                    50% { 
                        transform: scale(1.1) rotate(10deg); 
                    }
                    100% { 
                        transform: scale(1) rotate(0deg); 
                        opacity: 1; 
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.3s ease-out;
                }
                .animate-fade-in-up {
                    animation: fadeInUp 0.8s ease-out forwards;
                }
                .animate-scale-in {
                    animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                .animate-check-icon {
                    animation: checkIcon 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both;
                }
                .animate-error-icon {
                    animation: errorIcon 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both;
                }
                .animate-warning-icon {
                    animation: warningIcon 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.1s both;
                }
                .delay-100 { animation-delay: 0.1s; opacity: 0; }
                .delay-200 { animation-delay: 0.2s; opacity: 0; }
                .delay-300 { animation-delay: 0.3s; opacity: 0; }
            `}</style>

            {/* Page Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Header */}
                    <div className="mb-8 animate-fade-in">
                        <h1 className="text-2xl sm:text-3xl md:text-3xl lg:text-3xl xl:text-4xl font-bold text-charcoal mb-2">Scan Receipt</h1>
                        <p className="text-sm sm:text-base md:text-base lg:text-base xl:text-lg text-medium-gray">Scan receipts and automatically extract transaction data</p>
                        
                        {/* Success/Error Message */}
                        {message.text && (
                            <div className={`mt-4 p-4 rounded-lg ${
                                message.type === 'success' 
                                    ? 'bg-green-50 text-green-800 border border-green-200' 
                                    : 'bg-red-50 text-red-800 border border-red-200'
                            }`}>
                                {message.text}
                            </div>
                        )}
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-12">
                        {/* Upload Receipt Section */}
                        <div className="animate-fade-in-up delay-100 bg-white rounded-lg border border-light-gray p-6">
                            <h2 className="text-xl font-semibold text-charcoal mb-2">Upload Receipt</h2>
                            <p className="text-medium-gray mb-6">Take a photo or upload an image of your receipt</p>

                            {/* Upload Area */}
                            <div 
                                className={`border-2 border-dashed rounded-lg p-4 text-center mb-6 min-h-[300px] flex flex-col justify-center transition-colors duration-200 ${
                                    isDragging 
                                        ? 'border-[#058743] bg-[#058743] bg-opacity-5' 
                                        : 'border-light-gray hover:border-[#058743] hover:bg-gray-50'
                                }`}
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => document.getElementById('receipt-file').click()}
                                style={{ cursor: 'pointer' }}
                            >
                                {selectedFile ? (
                                    // Show selected file preview
                                    <div>
                                        <div className="mb-4">
                                            <img 
                                                src={URL.createObjectURL(selectedFile)} 
                                                alt="Receipt Preview" 
                                                className="max-w-full max-h-[200px] mx-auto rounded border border-light-gray shadow-sm"
                                            />
                                        </div>
                                        <h3 className="text-lg font-medium text-[#058743] mb-1">File Selected</h3>
                                        <p className="text-charcoal font-medium mb-1 break-words" title={selectedFile.name}>
                                            {truncateFilename(selectedFile.name)}
                                        </p>
                                        <p className="text-medium-gray text-sm">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                ) : (
                                    // Show upload prompt
                                    <div>
                                        <div className="mb-4">
                                            <img 
                                                src="/images/icons/upload-icon.svg" 
                                                alt="Upload Icon" 
                                                className={`w-12 h-12 mx-auto transition-opacity duration-200 ${
                                                    isDragging ? 'opacity-70' : 'opacity-100'
                                                }`}
                                            />
                                        </div>
                                        <h3 className={`text-lg font-medium mb-2 transition-colors duration-200 ${
                                            isDragging ? 'text-[#058743]' : 'text-charcoal'
                                        }`}>
                                            {isDragging ? 'Drop your receipt here' : 'Upload Photo'}
                                        </h3>
                                        <p className="text-medium-gray text-sm mb-3">
                                            {isDragging 
                                                ? 'Release to upload your receipt' 
                                                : 'Drag & drop or click to browse • PNG, JPG, or JPEG up to 10 MB'
                                            }
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* File Input Section */}
                            <div className="mb-2">
                                {/* Camera and Browse buttons side by side */}
                                <div className="flex gap-3 mb-4">
                                    {/* Hidden file inputs */}
                                    <input 
                                        type="file" 
                                        id="receipt-file"
                                        accept="image/png,image/jpeg,image/jpg"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    <input 
                                        type="file" 
                                        id="camera-input"
                                        accept="image/*"
                                        capture="environment"
                                        onChange={handleFileChange}
                                        className="hidden"
                                    />
                                    
                                    <button 
                                        type="button"
                                        onClick={handleCameraClick}
                                        className="flex-1 px-4 py-2 border border-[#058743] text-[#058743] rounded hover:bg-[#058743] hover:text-white transition-colors duration-200 flex items-center justify-center gap-2 group"
                                    >
                                        {/* Green camera icon (default) */}
                                        <img 
                                            src="/images/icons/green-camera-icon.svg" 
                                            alt="Camera Icon" 
                                            className="w-4 h-4 group-hover:hidden"
                                        />
                                        {/* White/original camera icon (hover) */}
                                        <img 
                                            src="/images/icons/camera-icon.svg" 
                                            alt="Camera Icon" 
                                            className="w-4 h-4 hidden group-hover:block"
                                        />
                                        Camera
                                    </button>
                                    
                                    <button 
                                        type="button"
                                        onClick={() => document.getElementById('receipt-file').click()}
                                        className="flex-1 px-4 py-2 border border-medium-gray text-medium-gray rounded hover:bg-medium-gray hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
                                    >
                                        Browse
                                    </button>
                                </div>
                                
                                {/* Scan Receipt button at the bottom */}
                                <button 
                                    type="button"
                                    onClick={handleScanReceipt}
                                    disabled={!selectedFile || isScanning}
                                    className={`w-full px-6 py-3 rounded transition-colors duration-200 flex items-center justify-center gap-2 font-medium ${
                                        selectedFile && !isScanning
                                            ? 'bg-[#058743] text-white hover:bg-[#046635] cursor-pointer' 
                                            : 'bg-black bg-opacity-20 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    {isScanning ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            Scanning...
                                        </>
                                    ) : (
                                        <>
                                            <img 
                                                src="/images/icons/scan-white-icon.svg" 
                                                alt="Scan Icon" 
                                                className={`w-5 h-5 ${!selectedFile ? 'opacity-50' : ''}`}
                                            />
                                            Scan Receipt
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

        {/* Extracted Data Section */}
        <div className="animate-fade-in-up delay-200 bg-white rounded-lg border border-[#E0E0E0] p-6">
            <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-[#2C2C2C]">Extracted Data</h2>
                {processingTime && (
                    <span className="text-sm text-[#757575] bg-gray-100 px-2 py-1 rounded">
                        Processed in {processingTime}ms
                    </span>
                )}
            </div>
            <p className="text-[#757575] mb-6">Review the Scanned Information</p>                            {isScanning ? (
                                /* Loading State */
                                <div className="text-center py-12">
                                    <div className="mb-4">
                                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#058743] mx-auto"></div>
                                    </div>
                                    <p className="text-medium-gray mb-2">Processing receipt...</p>
                                    <p className="text-medium-gray text-sm">Please wait while we extract the data</p>
                                </div>
                            ) : ocrResults ? (
                                /* OCR Results Form */
                                <div className="space-y-4">
                                    {/* Amount Field */}
                                    <div>
                                        <label className="block text-charcoal font-medium mb-2">
                                            Amount<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formatNumberWithDots(formData.amount)}
                                            onChange={(e) => handleInputChange('amount', e.target.value)}
                                            className="w-full px-3 py-2 border border-light-gray rounded text-charcoal bg-gray-100"
                                            placeholder="0"
                                        />
                                    </div>

                                    {/* Category Field */}
                                    <div>
                                        <label className="block text-charcoal font-medium mb-2">
                                            Category<span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.category}
                                                onChange={(e) => handleInputChange('category', e.target.value)}
                                                onFocus={() => setIsDropdownOpen(true)}
                                                onBlur={() => setIsDropdownOpen(false)}
                                                className="w-full px-3 py-2 border border-light-gray rounded text-charcoal bg-gray-100 cursor-pointer pr-10"
                                                disabled={loadingCategories}
                                                style={{ 
                                                    WebkitAppearance: 'none', 
                                                    MozAppearance: 'none',
                                                    appearance: 'none',
                                                    backgroundImage: 'none'
                                                }}
                                            >
                                                <option value="">
                                                    {loadingCategories ? 'Loading categories...' : 'Select a category'}
                                                </option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.category_name}
                                                    </option>
                                                ))}
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                                <img 
                                                    src={isDropdownOpen 
                                                        ? "/images/icons/dropdown-up-icon.svg" 
                                                        : "/images/icons/dropdown-down-icon.svg"
                                                    }
                                                    alt="Dropdown Icon" 
                                                    className="w-4 h-4"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Date Field */}
                                    <div>
                                        <label className="block text-charcoal font-medium mb-2">
                                            Date<span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <DatePicker
                                                selected={formData.date ? new Date(formData.date) : null}
                                                onChange={(date) => {
                                                    const formattedDate = date ? date.toISOString().split('T')[0] : '';
                                                    handleInputChange('date', formattedDate);
                                                }} 
                                                dateFormat="dd/MM/yyyy"
                                                className="w-full px-3 py-2 border border-light-gray rounded text-charcoal bg-gray-100 cursor-pointer focus:ring-2 focus:ring-[#058743] focus:border-transparent"
                                                calendarClassName="custom-calendar"
                                                wrapperClassName="w-full"
                                                placeholderText="DD/MM/YYYY"
                                                showPopperArrow={false}
                                                onKeyDown={(e) => {
                                                    // Prevent all keyboard input except Tab for accessibility
                                                    if (e.key !== 'Tab') {
                                                        e.preventDefault();
                                                    }
                                                }}
                                            />
                                            {/* Calendar icon */}
                                            <div className="absolute inset-y-0 right-0 flex items-center px-3 pointer-events-none">
                                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description Field */}
                                    <div>
                                        <label className="block text-charcoal font-medium mb-2">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            className="w-full px-3 py-2 border border-light-gray rounded text-charcoal bg-gray-100"
                                        />
                                    </div>

                                    {/* Add Transaction Button */}
                                    <button
                                        type="button"
                                        onClick={handleAddTransaction}
                                        disabled={submitting || loadingCategories}
                                        className={`w-full px-6 py-3 rounded transition-colors duration-200 font-medium flex items-center justify-center gap-2 ${
                                            submitting || loadingCategories
                                                ? 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                                : 'bg-black text-white hover:bg-gray-800'
                                        }`}
                                    >
                                        {submitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                                Adding Transaction...
                                            </>
                                        ) : (
                                            'Add Transaction'
                                        )}
                                    </button>
                                </div>
                            ) : (
                                /* Empty State */
                                <div className="text-center py-12">
                                    <div className="mb-4">
                                        <img src="/images/icons/document-scan-icon.svg" alt="Document Icon" className="w-16 h-16 mx-auto"/>
                                    </div>
                                    <p className="text-medium-gray">Upload or scan a receipt to see the results</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* How OCR Works Section */}
                    <div className="animate-fade-in-up delay-300 bg-white rounded-lg border border-light-gray p-8">
                        <h2 className="text-2xl font-semibold text-charcoal mb-8 text-center">How OCR Works</h2>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Step 1: Upload */}
                            <div className="text-center">
                                <div className="mb-4">
                                    <img src="/images/icons/upload-icon.svg" alt="Upload Icon" className="w-16 h-16 mx-auto"/>
                                </div>
                                <h3 className="text-lg font-semibold text-charcoal mb-2">1. Upload</h3>
                                <p className="text-medium-gray text-sm">Take a photo or upload an image of your receipt</p>
                            </div>

                            {/* Step 2: Scan */}
                            <div className="text-center">
                                <div className="mb-4">
                                    <img src="/images/icons/scan-gold-icon.svg" alt="Scan Icon" className="w-16 h-16 mx-auto"/>
                                </div>
                                <h3 className="text-lg font-semibold text-charcoal mb-2">2. Scan</h3>
                                <p className="text-medium-gray text-sm">AI extracts text and identifies key information</p>
                            </div>

                            {/* Step 3: Save */}
                            <div className="text-center">
                                <div className="mb-4">
                                    <img src="/images/icons/checkmark-save-icon.svg" alt="Save Icon" className="w-16 h-16 mx-auto"/>
                                </div>
                                <h3 className="text-lg font-semibold text-charcoal mb-2">3. Save</h3>
                                <p className="text-medium-gray text-sm">Review and automatically add to your transactions</p>
                            </div>
                        </div>
                    </div>

                    {/* Custom DatePicker Styles */}
                    <style>{`
                        /* Custom DatePicker Styles */
                        .react-datepicker-popper {
                            z-index: 9999 !important;
                        }

                        /* Mobile fullscreen */
                        @media (max-width: 640px) {
                            .react-datepicker-popper {
                                position: fixed !important;
                                top: 0 !important;
                                left: 0 !important;
                                transform: none !important;
                                width: 100vw !important;
                                height: 100vh !important;
                                max-width: none !important;
                                display: flex !important;
                                align-items: center !important;
                                justify-content: center !important;
                                background-color: rgba(0, 0, 0, 0.5) !important;
                                padding: 20px !important;
                            }

                            .react-datepicker {
                                width: 100% !important;
                                max-width: 380px !important;
                                margin: auto !important;
                            }
                        }

                        .react-datepicker {
                            font-family: inherit !important;
                            border: none !important;
                            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
                            border-radius: 16px !important;
                            padding: 16px !important;
                            background-color: white !important;
                        }

                        .react-datepicker__header {
                            background-color: white !important;
                            border-bottom: 1px solid #f0f0f0 !important;
                            padding: 16px 0 !important;
                            border-top-left-radius: 16px !important;
                            border-top-right-radius: 16px !important;
                        }

                        .react-datepicker__current-month {
                            font-size: 18px !important;
                            font-weight: 700 !important;
                            color: #1a1a1a !important;
                            margin-bottom: 12px !important;
                        }

                        .react-datepicker__day-names {
                            display: flex !important;
                            justify-content: space-between !important;
                            margin-top: 12px !important;
                        }

                        .react-datepicker__day-name {
                            color: #666 !important;
                            font-weight: 600 !important;
                            font-size: 13px !important;
                            width: 40px !important;
                            line-height: 40px !important;
                            margin: 0 !important;
                        }

                        .react-datepicker__month {
                            margin: 0 !important;
                            padding: 8px 0 !important;
                        }

                        .react-datepicker__week {
                            display: flex !important;
                            justify-content: space-between !important;
                        }

                        .react-datepicker__day {
                            width: 40px !important;
                            height: 40px !important;
                            line-height: 40px !important;
                            margin: 2px !important;
                            border-radius: 8px !important;
                            color: #1a1a1a !important;
                            font-weight: 500 !important;
                            transition: all 0.2s ease !important;
                        }

                        .react-datepicker__day:hover {
                            background-color: #f5f5f5 !important;
                            border-radius: 8px !important;
                        }

                        /* Selected date - Growth Green background with white text */
                        .react-datepicker__day--selected {
                            background-color: #058743 !important;
                            color: white !important;
                            font-weight: 600 !important;
                        }

                        .react-datepicker__day--selected:hover {
                            background-color: #046d36 !important;
                        }

                        /* Remove keyboard-selected state to avoid "half pressed" appearance */
                        .react-datepicker__day--keyboard-selected {
                            background-color: transparent !important;
                            color: inherit !important;
                        }

                        .react-datepicker__day--keyboard-selected:hover {
                            background-color: #f5f5f5 !important;
                        }

                        /* Today's date - Growth Green color with light background */
                        .react-datepicker__day--today {
                            font-weight: 600 !important;
                            color: #058743 !important;
                            background-color: #d4eadf !important;
                        }

                        .react-datepicker__day--today:hover {
                            background-color: #c0e0cb !important;
                        }

                        /* Selected date overrides today styling - solid growth green */
                        .react-datepicker__day--selected.react-datepicker__day--today {
                            background-color: #058743 !important;
                            color: white !important;
                            font-weight: 600 !important;
                        }

                        .react-datepicker__day--outside-month {
                            color: #d0d0d0 !important;
                        }

                        .react-datepicker__navigation {
                            top: 20px !important;
                        }

                        .react-datepicker__navigation-icon::before {
                            border-color: #666 !important;
                            border-width: 2px 2px 0 0 !important;
                        }

                        .react-datepicker__navigation:hover *::before {
                            border-color: #058743 !important;
                        }

                        /* Mobile adjustments */
                        @media (max-width: 640px) {
                            .react-datepicker {
                                padding: 24px !important;
                                max-width: none !important;
                                width: calc(100vw - 40px) !important;
                            }

                            .react-datepicker__header {
                                padding: 20px 0 16px 0 !important;
                            }

                            .react-datepicker__current-month {
                                font-size: 20px !important;
                                margin-bottom: 16px !important;
                            }

                            .react-datepicker__day {
                                width: calc((100vw - 120px) / 7) !important;
                                height: calc((100vw - 120px) / 7) !important;
                                line-height: calc((100vw - 120px) / 7) !important;
                                font-size: 16px !important;
                                margin: 3px !important;
                            }

                            .react-datepicker__day-name {
                                width: calc((100vw - 120px) / 7) !important;
                                line-height: calc((100vw - 120px) / 7) !important;
                                font-size: 14px !important;
                            }

                            .react-datepicker__navigation {
                                top: 24px !important;
                                width: 32px !important;
                                height: 32px !important;
                            }

                            .react-datepicker__navigation-icon::before {
                                border-width: 3px 3px 0 0 !important;
                                width: 10px !important;
                                height: 10px !important;
                            }
                        }
                    `}</style>
            </div>
        </AppLayout>
    );
}
