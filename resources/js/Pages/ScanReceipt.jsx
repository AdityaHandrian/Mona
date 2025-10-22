import { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';

const formatNumberWithDots = (value) => {
    if (!value) return '';
    const digits = String(value).replace(/\D/g, '');
    
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

const parseFormattedNumber = (formattedValue) => {
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

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const fetchCategories = async () => {
        try {
            setLoadingCategories(true);
            const response = await axios.get('/api/categories?type=expense');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
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
        setProcessingTime(null);
    };

    const handleScanReceipt = async () => {
        if (!selectedFile) return;
        
        setIsScanning(true);
        setOcrResults(null);
        
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
            
            const startTime = Date.now();
            
            // Create FormData to send the file to OCR endpoint
            const formData = new FormData();
            formData.append('image', selectedFile);
            
            // Send to /process-receipt endpoint (Gemini AI)
            const response = await fetch('/process-receipt', {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': csrfToken,
                    'X-Requested-With': 'XMLHttpRequest',
                    'Accept': 'application/json'
                },
                body: formData,
                credentials: 'same-origin'
            });
            
            const endTime = Date.now();
            const processingTime = endTime - startTime;
            setProcessingTime(processingTime);
            
            // Get response
            const responseText = await response.text();
            console.log('Response status:', response.status);
            console.log('Response body:', responseText);
            
            if (!response.ok) {
                let errorMessage = 'OCR processing failed';
                try {
                    const errorData = JSON.parse(responseText);
                    errorMessage = errorData.error || errorData.message || errorMessage;
                } catch (e) {
                    errorMessage += ` (Status: ${response.status})`;
                }
                throw new Error(errorMessage);
            }
            
            // Parse JSON response
            const ocrData = JSON.parse(responseText);
            
            // Check if there's an error from the backend
            if (ocrData.error || !ocrData.success) {
                throw new Error(ocrData.error || 'Failed to process receipt');
            }

            console.log('OCR Data received:', ocrData);
            
            // Store the complete OCR results for display
            setOcrResults(ocrData);
            
            // Populate formData for editing
            setFormData({
                amount: ocrData.amount?.toString() || '',
                category: ocrData.category_id || '',
                date: ocrData.date || new Date().toISOString().split('T')[0],
                description: ocrData.description || 'Receipt transaction'
            });
            
            // Show success message
            const itemCount = ocrData.items?.length || 0;
            const successMsg = itemCount > 0 
                ? `Receipt scanned successfully! Found ${itemCount} item${itemCount > 1 ? 's' : ''}. Review and edit before adding.`
                : 'Receipt scanned successfully! Review and edit before adding.';
            showMessage('success', successMsg);
            
        } catch (error) {
            console.error('OCR error:', error);
            showMessage('error', error.message || 'Failed to process receipt');
            setOcrResults(null);
        } finally {
            setIsScanning(false);
        }
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
            showMessage('error', 'Please fill in all required fields (Amount, Category, Date)');
            return;
        }

        setSubmitting(true);
        try {
            // Prepare data for API
            const transactionData = {
                category_id: parseInt(formData.category),
                amount: parseFloat(formData.amount),
                description: formData.description || 'Receipt transaction',
                transaction_date: formData.date
            };

            // Add transaction details (items) if they exist from OCR
            if (ocrResults?.items && ocrResults.items.length > 0) {
                transactionData.transaction_details = ocrResults.items.map(item => ({
                    item_name: item.item_name,
                    quantity: parseInt(item.quantity) || 1,
                    item_price: parseFloat(item.item_price),
                    category_id: parseInt(formData.category) // Use selected category
                }));
            }

            const response = await axios.post('/api/transactions/add', transactionData);

            if (response.data.status === 'success') {
                const itemCount = ocrResults?.items?.length || 0;
                const successMsg = itemCount > 0 
                    ? `Transaction with ${itemCount} item${itemCount > 1 ? 's' : ''} added successfully!`
                    : 'Transaction added successfully from receipt!';
                showMessage('success', successMsg);
                
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
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Header */}
                    <div className="mb-8">
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
                        <div className="bg-white rounded-lg border border-light-gray p-6">
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
        <div className="bg-white rounded-lg border border-[#E0E0E0] p-6">
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
                                /* OCR Results Form - Editable */
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
                                            className="w-full px-3 py-2 border border-light-gray rounded text-charcoal focus:ring-2 focus:ring-growth-green-500 focus:border-transparent"
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
                                                className="w-full px-3 py-2 border border-light-gray rounded text-charcoal cursor-pointer pr-10 focus:ring-2 focus:ring-growth-green-500 focus:border-transparent"
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
                                        <div className="date-input-container relative">
                                            {/* Display input showing DD/MM/YYYY format */}
                                            <input
                                                type="text"
                                                value={formatDateForDisplay(formData.date)}
                                                placeholder="DD/MM/YYYY"
                                                readOnly
                                                className="w-full px-3 py-2 border border-light-gray rounded text-charcoal cursor-pointer focus:ring-2 focus:ring-growth-green-500 focus:border-transparent"
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
                                        <label className="block text-charcoal font-medium mb-2">
                                            Description
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.description}
                                            onChange={(e) => handleInputChange('description', e.target.value)}
                                            className="w-full px-3 py-2 border border-light-gray rounded text-charcoal focus:ring-2 focus:ring-growth-green-500 focus:border-transparent"
                                        />
                                    </div>

                                    {/* Itemized Details (Read-only display) */}
                                    {ocrResults.items && ocrResults.items.length > 0 && (
                                        <div className="border-t border-gray-200 pt-4 mt-4">
                                            <label className="block text-charcoal font-medium mb-3">
                                                Itemized Details ({ocrResults.items.length} items)
                                            </label>
                                            <p className="text-xs text-gray-500 mb-3">Extracted from receipt - these items were already saved</p>
                                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                                {ocrResults.items.map((item, index) => (
                                                    <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <span className="font-medium text-sm text-gray-800">
                                                                {item.item_name}
                                                            </span>
                                                            <span className="text-sm font-semibold text-growth-green-500">
                                                                {formatNumberWithDots(item.subtotal?.toString() || ((item.quantity || 1) * (item.item_price || 0)).toString())}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center text-xs text-gray-600">
                                                            <span>Qty: {item.quantity || 1}</span>
                                                            <span>@ {formatNumberWithDots(item.item_price?.toString() || '0')}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between items-center font-semibold text-gray-800">
                                                <span>Items Total:</span>
                                                <span className="text-lg text-growth-green-500">
                                                    {formatNumberWithDots(ocrResults.amount?.toString() || '')}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Info Message */}
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                        <div className="flex items-start gap-2 text-blue-700">
                                            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                            </svg>
                                            <div className="flex-1">
                                                <span className="font-medium">Review and edit the extracted data</span>
                                                <p className="text-sm text-blue-600 mt-1">
                                                    You can modify the amount, category, date, or description before adding the transaction.
                                                </p>
                                            </div>
                                        </div>
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

                                    {/* Scan Another Receipt Button */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedFile(null);
                                            setOcrResults(null);
                                            setProcessingTime(null);
                                            setFormData({
                                                amount: '',
                                                category: 'Other',
                                                date: '',
                                                description: ''
                                            });
                                        }}
                                        className="w-full px-6 py-3 rounded transition-colors duration-200 font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
                                    >
                                        Scan Another Receipt
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
                    <div className="bg-white rounded-lg border border-light-gray p-8">
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
            </div>
        </AppLayout>
    );
}
