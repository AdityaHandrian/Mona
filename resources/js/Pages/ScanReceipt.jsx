import { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';

export default function ScanReceipt({ auth }) {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isScanning, setIsScanning] = useState(false);
    const [ocrResults, setOcrResults] = useState(null);
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
                { id: 1, category_name: 'Food and Beverages' },
                { id: 2, category_name: 'Shopping' },
                { id: 3, category_name: 'Entertainment' },
                { id: 4, category_name: 'Bills and Utilities' },
                { id: 5, category_name: 'Other' }
            ]);
        } finally {
            setLoadingCategories(false);
        }
    };

    // Load categories when component mounts
    useEffect(() => {
        fetchCategories();
    }, []);

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
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
    };

    const handleScanReceipt = async () => {
        if (!selectedFile) return;
        
        setIsScanning(true);
        
        try {
            // Create FormData to send the file to your existing OCR endpoint
            const formData = new FormData();
            formData.append('image', selectedFile); // Using 'image' to match your existing endpoint
            
            // Send to your existing Laravel OCR endpoint
            const response = await fetch('/process-receipt', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content'),
                    'Accept': 'application/json',
                },
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('OCR processing failed');
            }
            
            const ocrData = await response.json();
            
            // Check if there's an error from the backend
            if (ocrData.error) {
                throw new Error(ocrData.error);
            }
            
            // Helper function to parse and validate date
            const parseReceiptDate = (dateString) => {
                if (!dateString) return new Date().toISOString().split('T')[0];
                
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
            
            // Process the OCR results from your Gemini AI service
            const mappedCategoryId = mapToValidCategory(ocrData.category, ocrData.description);
            const processedResults = {
                amount: ocrData.amount || '',
                category: mappedCategoryId || (categories.length > 0 ? categories[0].id : ''), // Smart mapping with fallback
                date: parseReceiptDate(ocrData.date), // Better date parsing
                description: ocrData.description || 'Receipt transaction'
            };
            
            setOcrResults(processedResults);
            setFormData(processedResults);
            
        } catch (error) {
            console.error('OCR Error:', error);
            
            // Show error to user
            alert('Failed to process receipt: ' + error.message);
            
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
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
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
            showMessage('error', 'Please fill in all required fields (Amount, Category, Date)');
            return;
        }

        setSubmitting(true);
        try {
            // Prepare data for API (same format as Transaction page)
            const transactionData = {
                category_id: parseInt(formData.category),
                amount: parseFloat(formData.amount),
                description: formData.description || 'Receipt transaction',
                transaction_date: formData.date
            };

            const response = await axios.post('/api/transactions', transactionData);

            if (response.data.status === 'success') {
                showMessage('success', 'Transaction added successfully from receipt!');
                
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
                // Handle validation errors
                const errors = Object.values(error.response.data.errors).flat();
                showMessage('error', errors.join(', '));
            } else if (error.response?.data?.message) {
                showMessage('error', error.response.data.message);
            } else {
                showMessage('error', 'Failed to add transaction. Please try again.');
            }
        } finally {
            setSubmitting(false);
        }
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
            {/* Page Content */}
            <div className="py-10">
                <div className="max-w-[1500px] mx-auto px-6">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">Scan Receipt</h1>
                        <p className="text-[#757575]">Scan receipts and automatically extract transaction data</p>
                        
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
                        <div className="bg-white rounded-lg border border-[#E0E0E0] p-6">
                            <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">Upload Receipt</h2>
                            <p className="text-[#757575] mb-6">Take a photo or upload an image of your receipt</p>

                            {/* Upload Area */}
                            <div 
                                className={`border-2 border-dashed rounded-lg p-4 text-center mb-6 min-h-[300px] flex flex-col justify-center transition-colors duration-200 ${
                                    isDragging 
                                        ? 'border-[#058743] bg-[#058743] bg-opacity-5' 
                                        : 'border-[#C8C0C0] hover:border-[#058743] hover:bg-gray-50'
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
                                                className="max-w-full max-h-[200px] mx-auto rounded border border-[#E0E0E0] shadow-sm"
                                            />
                                        </div>
                                        <h3 className="text-lg font-medium text-[#058743] mb-1">File Selected</h3>
                                        <p className="text-[#2C2C2C] font-medium mb-1 break-words" title={selectedFile.name}>
                                            {truncateFilename(selectedFile.name)}
                                        </p>
                                        <p className="text-[#757575] text-sm">
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
                                            isDragging ? 'text-[#058743]' : 'text-[#2C2C2C]'
                                        }`}>
                                            {isDragging ? 'Drop your receipt here' : 'Upload Photo'}
                                        </h3>
                                        <p className="text-[#757575] text-sm mb-3">
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
                                        className="flex-1 px-4 py-2 border border-[#757575] text-[#757575] rounded hover:bg-[#757575] hover:text-white transition-colors duration-200 flex items-center justify-center gap-2"
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
                        <div className="bg-white rounded-lg border border-[#E0E0E0] p-6">
                            <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">Extracted Data</h2>
                            <p className="text-[#757575] mb-6">Review the Scanned Information</p>

                            {isScanning ? (
                                /* Loading State */
                                <div className="text-center py-12">
                                    <div className="mb-4">
                                        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#058743] mx-auto"></div>
                                    </div>
                                    <p className="text-[#757575] mb-2">Processing receipt...</p>
                                    <p className="text-[#757575] text-sm">Please wait while we extract the data</p>
                                </div>
                            ) : ocrResults ? (
                                /* OCR Results Form */
                                <div className="space-y-4">
                                    {/* Amount Field */}
                                    <div>
                                        <label className="block text-[#2C2C2C] font-medium mb-2">
                                            Amount<span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.amount}
                                            onChange={(e) => handleInputChange('amount', e.target.value)}
                                            className="w-full px-3 py-2 border border-[#C8C0C0] rounded text-[#2C2C2C] bg-gray-100"
                                            placeholder="255.255.255"
                                        />
                                    </div>

                                    {/* Category Field */}
                                    <div>
                                        <label className="block text-[#2C2C2C] font-medium mb-2">
                                            Category<span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <select
                                                value={formData.category}
                                                onChange={(e) => handleInputChange('category', e.target.value)}
                                                onFocus={() => setIsDropdownOpen(true)}
                                                onBlur={() => setIsDropdownOpen(false)}
                                                className="w-full px-3 py-2 border border-[#C8C0C0] rounded text-[#2C2C2C] bg-gray-100 cursor-pointer pr-10"
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
                                        <label className="block text-[#2C2C2C] font-medium mb-2">
                                            Date<span className="text-red-500">*</span>
                                        </label>
                                        <div className="date-input-container relative">
                                            {/* Display input showing DD/MM/YYYY format */}
                                            <input
                                                type="text"
                                                value={formatDateForDisplay(formData.date)}
                                                placeholder="DD/MM/YYYY"
                                                readOnly
                                                className="w-full px-3 py-2 border border-[#C8C0C0] rounded text-[#2C2C2C] bg-gray-100 cursor-pointer"
                                                onClick={() => document.getElementById('hidden-date-picker').showPicker()}
                                            />
                                            {/* Hidden date picker */}
                                            <input
                                                id="hidden-date-picker"
                                                type="date"
                                                value={formData.date}
                                                onChange={(e) => handleInputChange('date', e.target.value)}
                                                className="absolute opacity-0 pointer-events-none"
                                            />
                                            {/* Calendar icon */}
                                            <div 
                                                className="absolute inset-y-0 right-0 flex items-center px-3 cursor-pointer"
                                                onClick={() => document.getElementById('hidden-date-picker').showPicker()}
                                            >
                                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Description Field */}
                                    <div>
                                        <label className="block text-[#2C2C2C] font-medium mb-2">
                                            Description
                                        </label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            className="w-full px-3 py-2 border border-[#C8C0C0] rounded text-[#2C2C2C] bg-gray-100 resize-none"
                                            rows="3"
                                            placeholder="Optional description..."
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
                                    <p className="text-[#757575]">Upload or scan a receipt to see the results</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* How OCR Works Section */}
                    <div className="bg-white rounded-lg border border-[#E0E0E0] p-8">
                        <h2 className="text-2xl font-semibold text-[#2C2C2C] mb-8 text-center">How OCR Works</h2>
                        
                        <div className="grid md:grid-cols-3 gap-8">
                            {/* Step 1: Upload */}
                            <div className="text-center">
                                <div className="mb-4">
                                    <img src="/images/icons/upload-icon.svg" alt="Upload Icon" className="w-16 h-16 mx-auto"/>
                                </div>
                                <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">1. Upload</h3>
                                <p className="text-[#757575] text-sm">Take a photo or upload an image of your receipt</p>
                            </div>

                            {/* Step 2: Scan */}
                            <div className="text-center">
                                <div className="mb-4">
                                    <img src="/images/icons/scan-gold-icon.svg" alt="Scan Icon" className="w-16 h-16 mx-auto"/>
                                </div>
                                <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">2. Scan</h3>
                                <p className="text-[#757575] text-sm">AI extracts text and identifies key information</p>
                            </div>

                            {/* Step 3: Save */}
                            <div className="text-center">
                                <div className="mb-4">
                                    <img src="/images/icons/checkmark-save-icon.svg" alt="Save Icon" className="w-16 h-16 mx-auto"/>
                                </div>
                                <h3 className="text-lg font-semibold text-[#2C2C2C] mb-2">3. Save</h3>
                                <p className="text-[#757575] text-sm">Review and automatically add to your transactions</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}