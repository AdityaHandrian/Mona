<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard API Test</title>
    <script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            margin: 40px; 
            background-color: #f5f5f5;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .endpoint {
            margin-bottom: 30px;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            background-color: #f9f9f9;
        }
        .endpoint h3 {
            margin-top: 0;
            color: #333;
        }
        button {
            background-color: #007cba;
            color: white;
            padding: 10px 20px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            margin-right: 10px;
        }
        button:hover {
            background-color: #005a87;
        }
        pre {
            background-color: #f4f4f4;
            padding: 15px;
            border-radius: 4px;
            overflow-x: auto;
            max-height: 400px;
        }
        .loading {
            color: #666;
            font-style: italic;
        }
        .error {
            color: #d63384;
            background-color: #f8d7da;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #f5c6cb;
        }
        .success {
            color: #0f5132;
            background-color: #d1e7dd;
            padding: 10px;
            border-radius: 4px;
            border: 1px solid #badbcc;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Dashboard API Integration Test</h1>
        <p>Test the dashboard API endpoints to verify the integration is working correctly.</p>

        <div class="endpoint">
            <h3>1. Monthly Statistics</h3>
            <p>Get income and expense data for the last 6 months</p>
            <button onclick="testMonthlyStats()">Test Monthly Stats</button>
            <div id="monthly-result"></div>
        </div>

        <div class="endpoint">
            <h3>2. Financial Overview</h3>
            <p>Get total income, expenses, current balance, and budget progress</p>
            <button onclick="testFinancialOverview()">Test Financial Overview</button>
            <div id="financial-result"></div>
        </div>

        <div class="endpoint">
            <h3>3. Expense Categories</h3>
            <p>Get expense breakdown by categories for the current month</p>
            <button onclick="testExpenseCategories()">Test Expense Categories</button>
            <div id="categories-result"></div>
        </div>

        <div class="endpoint">
            <h3>4. Complete Dashboard Data</h3>
            <p>Get all dashboard data in a single request (recommended for production)</p>
            <button onclick="testCompleteData()">Test Complete Data</button>
            <div id="complete-result"></div>
        </div>
    </div>

    <script>
        // Set up axios defaults
        axios.defaults.baseURL = 'http://127.0.0.1:8000';
        axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
        
        // CSRF token setup (if needed)
        const token = document.querySelector('meta[name="csrf-token"]');
        if (token) {
            axios.defaults.headers.common['X-CSRF-TOKEN'] = token.getAttribute('content');
        }

        function showLoading(elementId) {
            document.getElementById(elementId).innerHTML = '<p class="loading">Loading...</p>';
        }

        function showResult(elementId, data, isError = false) {
            const resultDiv = document.getElementById(elementId);
            const className = isError ? 'error' : 'success';
            const status = isError ? 'ERROR' : 'SUCCESS';
            
            resultDiv.innerHTML = `
                <div class="${className}">
                    <strong>${status}</strong>
                </div>
                <pre>${JSON.stringify(data, null, 2)}</pre>
            `;
        }

        async function testMonthlyStats() {
            showLoading('monthly-result');
            try {
                const response = await axios.get('/api/dashboard/monthly-stats');
                showResult('monthly-result', response.data);
            } catch (error) {
                showResult('monthly-result', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                }, true);
            }
        }

        async function testFinancialOverview() {
            showLoading('financial-result');
            try {
                const response = await axios.get('/api/dashboard/financial-overview');
                showResult('financial-result', response.data);
            } catch (error) {
                showResult('financial-result', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                }, true);
            }
        }

        async function testExpenseCategories() {
            showLoading('categories-result');
            try {
                const response = await axios.get('/api/dashboard/expense-categories');
                showResult('categories-result', response.data);
            } catch (error) {
                showResult('categories-result', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                }, true);
            }
        }

        async function testCompleteData() {
            showLoading('complete-result');
            try {
                const response = await axios.get('/api/dashboard/complete');
                showResult('complete-result', response.data);
            } catch (error) {
                showResult('complete-result', {
                    message: error.message,
                    status: error.response?.status,
                    data: error.response?.data
                }, true);
            }
        }
    </script>
</body>
</html>