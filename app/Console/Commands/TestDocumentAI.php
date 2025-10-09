<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Google\Cloud\DocumentAI\V1\Client\DocumentProcessorServiceClient;

class TestDocumentAI extends Command
{
    protected $signature = 'test:document-ai';
    protected $description = 'Test Google Cloud Document AI configuration and connectivity';

    public function handle()
    {
        $this->info('Testing Google Cloud Document AI Configuration...');
        $this->newLine();

        // Check environment variables
        $this->info('1. Checking environment variables:');
        
        $projectId = env('GOOGLE_CLOUD_PROJECT_ID');
        $location = env('DOCUMENT_AI_LOCATION');
        $processorId = env('DOCUMENT_AI_PROCESSOR_ID');
        $credentials = env('GOOGLE_APPLICATION_CREDENTIALS');

        $this->line('   GOOGLE_CLOUD_PROJECT_ID: ' . ($projectId ? '✓ Set' : '✗ Missing'));
        $this->line('   DOCUMENT_AI_LOCATION: ' . ($location ? '✓ Set (' . $location . ')' : '✗ Missing'));
        $this->line('   DOCUMENT_AI_PROCESSOR_ID: ' . ($processorId ? '✓ Set' : '✗ Missing'));
        $this->line('   GOOGLE_APPLICATION_CREDENTIALS: ' . ($credentials ? '✓ Set (' . $credentials . ')' : '✗ Missing'));
        
        $this->newLine();

        // Check if credentials file exists
        if ($credentials) {
            $this->info('2. Checking credentials file:');
            if (file_exists($credentials)) {
                $this->line('   Credentials file exists: ✓');
                $this->line('   File size: ' . filesize($credentials) . ' bytes');
            } else {
                $this->error('   Credentials file does not exist: ✗');
                return 1;
            }
        } else {
            $this->error('2. GOOGLE_APPLICATION_CREDENTIALS not set');
        }

        $this->newLine();

        // Test Google Cloud client initialization
        $this->info('3. Testing Document AI client initialization:');
        try {
            $client = new DocumentProcessorServiceClient();
            $this->line('   Document AI client created: ✓');
            $client->close();
        } catch (\Exception $e) {
            $this->error('   Failed to create Document AI client: ✗');
            $this->error('   Error: ' . $e->getMessage());
            return 1;
        }

        $this->newLine();

        // Test processor name construction
        if ($projectId && $location && $processorId) {
            $this->info('4. Testing processor name construction:');
            try {
                $client = new DocumentProcessorServiceClient();
                $processorName = $client->processorName($projectId, $location, $processorId);
                $this->line('   Processor name: ' . $processorName);
                $this->line('   Processor name construction: ✓');
                $client->close();
            } catch (\Exception $e) {
                $this->error('   Failed to construct processor name: ✗');
                $this->error('   Error: ' . $e->getMessage());
                return 1;
            }
        } else {
            $this->error('4. Cannot test processor name - missing required environment variables');
        }

        $this->newLine();
        $this->info('Configuration test completed!');
        
        if ($projectId && $location && $processorId && $credentials && file_exists($credentials)) {
            $this->info('All checks passed ✓ - Your Document AI configuration appears to be correct.');
        } else {
            $this->error('Some configuration issues found ✗ - Please fix the above issues.');
            return 1;
        }

        return 0;
    }
}