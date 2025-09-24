import { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';

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

    const categories = [
        'Food and Beverages',
        'Shopping',
        'Entertainment', 
        'Bills and Utilities',
        'Other'
    ];

    // Handle window resize for responsive filename truncation
    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

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

    // Helper function to map OCR category to our predefined categories (multilingual)
    const mapToValidCategory = (ocrCategory, description = '') => {
        if (!ocrCategory && !description) return 'Other';
        
        // Combine category and description for better matching
        const searchText = `${ocrCategory || ''} ${description || ''}`.toLowerCase();
        
        // Food & Beverages mapping (English + Indonesian)
        if (searchText.includes('food') || searchText.includes('restaurant') || 
            searchText.includes('cafe') || searchText.includes('grocery') || 
            searchText.includes('beverage') || searchText.includes('dining') ||
            searchText.includes('makanan') || searchText.includes('minuman') ||
            searchText.includes('restoran') || searchText.includes('warung') ||
            searchText.includes('kafe') || searchText.includes('supermarket') || 
            searchText.includes('pasar') || searchText.includes('indomaret') ||
            searchText.includes('alfamart') || searchText.includes('hypermart') ||
            searchText.includes('giant') || searchText.includes('carrefour') ||
            searchText.includes('hero') || searchText.includes('lottemart') ||
            searchText.includes('mcdonald') || searchText.includes('kfc') ||
            searchText.includes('pizza') || searchText.includes('bakery') ||
            searchText.includes('roti') || searchText.includes('bakso') ||
            searchText.includes('gado') || searchText.includes('nasi') ||
            searchText.includes('ayam') || searchText.includes('seafood') ||
            searchText.includes('kedai') || searchText.includes('rumah makan')) {
            return 'Food and Beverages';
        }
        
        // Shopping mapping (English + Indonesian + Electronics)
        if (searchText.includes('shop') || searchText.includes('retail') || 
            searchText.includes('store') || searchText.includes('clothing') || 
            searchText.includes('fashion') || searchText.includes('belanja') ||
            searchText.includes('mall') || searchText.includes('butik') ||
            searchText.includes('pakaian') || searchText.includes('sepatu') ||
            searchText.includes('tas') || searchText.includes('elektronik') ||
            searchText.includes('electronic') || searchText.includes('gadget') ||
            searchText.includes('handphone') || searchText.includes('laptop') ||
            searchText.includes('computer') || searchText.includes('hp') ||
            searchText.includes('smartphone') || searchText.includes('tablet') ||
            searchText.includes('accessories') || searchText.includes('aksesoris') ||
            searchText.includes('surya elektronik') || searchText.includes('erafone') ||
            searchText.includes('ibox') || searchText.includes('digimap') ||
            searchText.includes('best denki') || searchText.includes('electronic city') ||
            searchText.includes('ace hardware') || searchText.includes('informa') ||
            searchText.includes('ikea') || searchText.includes('courts')) {
            return 'Shopping';
        }
        
        // Entertainment mapping (English + Indonesian)
        if (searchText.includes('entertainment') || searchText.includes('movie') || 
            searchText.includes('game') || searchText.includes('cinema') || 
            searchText.includes('sports') || searchText.includes('hiburan') ||
            searchText.includes('bioskop') || searchText.includes('film') ||
            searchText.includes('olahraga') || searchText.includes('permainan') ||
            searchText.includes('karaoke') || searchText.includes('wisata') ||
            searchText.includes('cgv') || searchText.includes('xxi') ||
            searchText.includes('cineplex') || searchText.includes('fitness') ||
            searchText.includes('gym') || searchText.includes('spa') ||
            searchText.includes('salon') || searchText.includes('massage')) {
            return 'Entertainment';
        }
        
        // Bills & Utilities mapping (English + Indonesian)
        if (searchText.includes('utility') || searchText.includes('electric') || 
            searchText.includes('water') || searchText.includes('gas') || 
            searchText.includes('internet') || searchText.includes('phone') ||
            searchText.includes('listrik') || searchText.includes('air') ||
            searchText.includes('telepon') || searchText.includes('tagihan') ||
            searchText.includes('pln') || searchText.includes('pdam') ||
            searchText.includes('wifi') || searchText.includes('pulsa') ||
            searchText.includes('telkom') || searchText.includes('indihome') ||
            searchText.includes('byru') || searchText.includes('axis') ||
            searchText.includes('smartfren') || searchText.includes('three') ||
            searchText.includes('xl') || searchText.includes('indosat')) {
            return 'Bills and Utilities';
        }
        
        // Default to Other if no match found
        return 'Other';
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
            const processedResults = {
                amount: ocrData.amount || '',
                category: mapToValidCategory(ocrData.category, ocrData.description), // Smart mapping with description
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

    const handleAddTransaction = () => {
        console.log('Adding transaction:', formData);
        // Add transaction logic here
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

    return (
        <AppLayout 
            title="MONA - Scan Receipt" 
            auth={auth}
            navigation={null}
        >
            {/* Page Content */}
            <div className="py-10">
                <div className="max-w-[1500px] mx-auto px-6">
                    {/* Page Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-[#2C2C2C] mb-2">Scan Receipt</h1>
                        <p className="text-[#757575]">Scan receipts and automatically extract transaction data</p>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid lg:grid-cols-2 gap-8 mb-12">
                        {/* Upload Receipt Section */}
                        <div className="bg-white rounded-lg border border-[#E0E0E0] p-6">
                            <h2 className="text-xl font-semibold text-[#2C2C2C] mb-2">Upload Receipt</h2>
                            <p className="text-[#757575] mb-6">Take a photo or upload an image of your receipt</p>

                            {/* Upload Area */}
                            <div 
                                className="border-2 border-dashed border-[#C8C0C0] rounded-lg p-4 text-center mb-6 min-h-[300px] flex flex-col justify-center"
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
                                            <img src="/images/icons/upload-icon.svg" alt="Upload Icon" className="w-12 h-12 mx-auto"/>
                                        </div>
                                        <h3 className="text-lg font-medium text-[#2C2C2C] mb-2">Upload Photo</h3>
                                        <p className="text-[#757575] text-sm mb-3">PNG, JPG, or JPEG up to 10 MB</p>
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
                                        onClick={() => document.getElementById('camera-input').click()}
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
                                                style={{ 
                                                    WebkitAppearance: 'none', 
                                                    MozAppearance: 'none',
                                                    appearance: 'none',
                                                    backgroundImage: 'none'
                                                }}
                                            >
                                                {categories.map((category) => (
                                                    <option key={category} value={category}>
                                                        {category}
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
                                        className="w-full bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors duration-200 font-medium"
                                    >
                                        Add Transaction
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