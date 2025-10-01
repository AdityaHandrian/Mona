<!DOCTYPE html>
<html lang="en" class="">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MONAs - Your Personal Money Manager</title>
    
    <!-- 1. Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    
    <!-- 2. Konfigurasi Tailwind (BAGIAN KRITIS YANG HILANG) -->
    <script>
        tailwind.config = {
            darkMode: 'class', // Memberitahu Tailwind untuk mencari class "dark" di HTML
            theme: {
                extend: {
                    // Di sini Anda bisa menambahkan kustomisasi jika perlu
                }
            }
        }
    </script>
    
    <!-- Google Fonts (Poppins) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    
    <!-- 3. Skrip Awal untuk Mencegah "Flash" -->
    <script>
        // Logika ini benar dan tetap dipertahankan dari versi sebelumnya
        if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    </script>

    <style>
        body {
            font-family: 'Poppins', sans-serif;
        }
        .hero-gradient-light {
            background: linear-gradient(145deg, rgba(22, 163, 74, 0.05) 0%, rgba(249, 250, 251, 0) 40%);
        }
        .hero-gradient-dark {
            background: linear-gradient(145deg, rgba(22, 163, 74, 0.15) 0%, rgba(17, 24, 39, 0) 40%);
        }
    </style>
</head>
<body class="bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white transition-colors duration-300">

    <!-- ===== Header & Navigation ===== -->
    <header class="container mx-auto px-6 py-4">
        <nav class="flex items-center justify-between">
            <!-- Logo -->
            <a href="#" class="flex items-center space-x-2">
                <div class="bg-green-500 p-2 rounded-full">
                    <svg xmlns="http://www.w.org/2000/svg" class="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" />
                    </svg>
                </div>
                <span class="text-2xl font-bold text-gray-900 dark:text-white">MONA</span>
            </a>
            <div class="flex items-center space-x-4">
                <!-- Tombol Tema -->
                <button id="theme-toggle" type="button" class="text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none rounded-lg text-sm p-2.5">
                    <svg id="theme-toggle-dark-icon" class="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path></svg>
                    <svg id="theme-toggle-light-icon" class="hidden w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path></svg>
                </button>
                <!-- Tombol CTA -->
                <a href="{{ route('scan-receipt') }}" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300">
                    Get Started
                </a>
            </div>
        </nav>
    </header>

    <main>
        <!-- Konten Halaman (Hero, Features, dll) -->
        <section class="relative py-20 md:py-32 hero-gradient-light dark:hero-gradient-dark">
            <div class="container mx-auto px-6 text-center">
                <h1 class="text-4xl md:text-6xl font-extrabold leading-tight mb-4">
                    Take Full Control of Your <span class="text-green-500 dark:text-green-400">Financial Future</span>
                </h1>
                <p class="text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                    MONA is the simplest way to manage your personal finances. Track spending, create budgets, and achieve your savings goals with ease.
                </p>
                <a href="#" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                    Sign Up for Free
                </a>
                <div class="mt-16 max-w-4xl mx-auto p-4 md:p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl border border-gray-200 dark:border-gray-700/50 shadow-2xl backdrop-blur-sm">
                    <img src="" alt="MONA Application Dashboard" class="rounded-lg shadow-lg">
                </div>
            </div>
        </section>

        <section class="py-20 bg-gray-100 dark:bg-gray-900">
            <div class="container mx-auto px-6">
                <div class="text-center mb-12">
                    <h2 class="text-3xl md:text-4xl font-bold">Everything You Need in One Place</h2>
                    <p class="text-gray-500 dark:text-gray-400 mt-2">Manage your money effortlessly with our powerful features.</p>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <div class="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                        <div class="bg-green-100 dark:bg-green-500/20 text-green-600 dark:text-green-400 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                             <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V7a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                        </div>
                        <h3 class="text-xl font-bold mb-2">Financial Dashboard</h3>
                        <p class="text-gray-500 dark:text-gray-400">Get a clear overview of your income, expenses, and savings at a single glance.</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                        <div class="bg-blue-100 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H7a3 3 0 00-3 3v8a3 3 0 003 3z"></path></svg>
                        </div>
                        <h3 class="text-xl font-bold mb-2">Smart Expense Tracking</h3>
                        <p class="text-gray-500 dark:text-gray-400">Automatically categorize your transactions and understand where your money is going.</p>
                    </div>
                    <div class="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 transform hover:scale-105 transition-transform duration-300">
                        <div class="bg-purple-100 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 rounded-lg w-12 h-12 flex items-center justify-center mb-4">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M12 6V3m0 18v-3m5.636-5.636l1.414 1.414m-10.05 10.05l1.414 1.414m10.05-10.05l-1.414 1.414m-10.05 10.05l-1.414 1.414"></path></svg>
                        </div>
                        <h3 class="text-xl font-bold mb-2">Flexible Budgeting</h3>
                        <p class="text-gray-500 dark:text-gray-400">Create monthly budgets that work for you and get notified when you're close to your limits.</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="py-20">
            <div class="container mx-auto px-6 text-center">
                 <h2 class="text-3xl md:text-4xl font-bold mb-4">
                    Ready to Build a Better Financial Future?
                </h2>
                <p class="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-8">
                    Join thousands of users who trust MONA to simplify their financial lives.
                    It's free to get started!
                </p>
                <a href="#" class="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-8 rounded-lg text-lg transition duration-300">
                    Start Managing Your Money
                </a>
            </div>
        </section>
    </main>
    
    <!-- ===== Footer ===== -->
    <footer class="bg-white dark:bg-gray-800/50 border-t border-gray-200 dark:border-gray-700/50">
        <div class="container mx-auto px-6 py-6 text-center text-gray-500 dark:text-gray-400">
            <p>&copy; 2025 MONA. All Rights Reserved. Built with ❤️ for better financial habits.</p>
        </div>
    </footer>

    <!-- 4. Skrip untuk Fungsionalitas Tombol -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const themeToggleBtn = document.getElementById('theme-toggle');
            const darkIcon = document.getElementById('theme-toggle-dark-icon');
            const lightIcon = document.getElementById('theme-toggle-light-icon');

            // Fungsi untuk menampilkan ikon yang sesuai
            function toggleIcons() {
                if (document.documentElement.classList.contains('dark')) {
                    lightIcon.classList.remove('hidden');
                    darkIcon.classList.add('hidden');
                } else {
                    lightIcon.classList.add('hidden');
                    darkIcon.classList.remove('hidden');
                }
            }

            // Panggil fungsi saat halaman pertama kali dimuat
            toggleIcons();

            // Tambahkan event listener ke tombol
            themeToggleBtn.addEventListener('click', function() {
                // Toggle kelas 'dark'
                document.documentElement.classList.toggle('dark');
                
                // Simpan pilihan ke localStorage
                const isDarkMode = document.documentElement.classList.contains('dark');
                localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');

                // Perbarui ikon
                toggleIcons();
            });
        });
    </script>
</body>
</html>

