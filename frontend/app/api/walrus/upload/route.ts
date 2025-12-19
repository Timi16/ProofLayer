import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Walrus testnet configuration
const WALRUS_AGGREGATOR_URL = 'https://aggregator.walrus-testnet.walrus.space';

/**
 * Walrus Upload Response Type
 */
interface WalrusUploadResponse {
  success: boolean;
  blobId?: string;
  blobUrl?: string;
  filename?: string;
  size?: number;
  error?: string;
  demoMode?: boolean;
}

/**
 * POST /api/walrus/upload
 *
 * Uploads a file to Walrus testnet storage
 *
 * NOTE: Currently using demo mode because Walrus publisher endpoint is not accessible.
 * In production, you would need to:
 * 1. Set up Walrus CLI with proper configuration
 * 2. Use curl command: curl -X PUT https://publisher.walrus-testnet.walrus.space/v1/store?epochs=200 --upload-file <file>
 * 3. Or use the Walrus SDK
 *
 * @param request - Multipart form data with file
 * @returns JSON response with blob ID and URL
 */
export async function POST(request: NextRequest) {
  try {
    // Parse the multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    console.log(`[Walrus Upload] Starting upload for: ${file.name} (${file.size} bytes)`);

    // Get file content
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate a deterministic blob ID based on file content (SHA-256 hash)
    // In real Walrus, this would come from the Walrus network
    const hash = crypto.createHash('sha256').update(buffer).digest();
    const blobId = hash.toString('base64url'); // URL-safe base64

    console.log('[Walrus Upload] Generated blob ID:', blobId);

    // Store the file in memory/cache for demo purposes
    // In production, this would be stored on Walrus network
    // For now, we'll just return the blob ID

    // Construct the blob URL for retrieval
    const blobUrl = `${WALRUS_AGGREGATOR_URL}/v1/${blobId}`;

    // Return success response
    const response: WalrusUploadResponse = {
      success: true,
      blobId,
      blobUrl,
      filename: file.name,
      size: file.size,
      demoMode: true // Indicates this is demo mode
    };

    console.log('[Walrus Upload] Success (Demo Mode):', response);
    console.warn('[Walrus Upload] ⚠️  DEMO MODE: File is NOT actually uploaded to Walrus');
    console.warn('[Walrus Upload] To enable real Walrus upload, configure Walrus CLI or use curl:');
    console.warn(`[Walrus Upload] curl -X PUT "https://publisher.walrus-testnet.walrus.space/v1/store?epochs=200" --upload-file <file>`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('[Walrus Upload] Error:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/walrus/upload
 *
 * Returns API information
 */
export async function GET() {
  return NextResponse.json({
    message: 'Walrus Upload API (Demo Mode)',
    endpoint: '/api/walrus/upload',
    method: 'POST',
    contentType: 'multipart/form-data',
    field: 'file',
    aggregator: WALRUS_AGGREGATOR_URL,
    note: 'Currently in demo mode - files are not actually uploaded to Walrus',
    realUploadInstructions: {
      curl: 'curl -X PUT "https://publisher.walrus-testnet.walrus.space/v1/store?epochs=200" --upload-file <file>',
      cli: 'walrus store <file> --epochs 200'
    }
  });
}
