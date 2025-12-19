# ProofLayer Testing Guide

## Complete Testing Flow for Research Contribution Submission

This guide will walk you through testing the entire ProofLayer workflow from creating a pool to submitting contributions with Walrus storage.

---

## Prerequisites

1. **Wallet Setup**:
   - Install Sui Wallet browser extension
   - Switch to **Testnet** network
   - Get testnet SUI tokens from faucet: https://faucet.sui.io/

2. **Start the Frontend**:
   ```bash
   cd /Users/ik/Documents/ProofLayer/frontend
   npm run dev
   ```
   - Open browser to: http://localhost:3000

3. **Connect Wallet**:
   - Click "Connect Wallet" button in the header
   - Approve the connection

---

## Step 1: Create a Contributor Profile

**Why?** Every contributor needs a profile to submit contributions.

1. Go to: http://localhost:3000/submit
2. Scroll to **Pre-requisites (Dev Mode)** section
3. Click the **user plus icon (➕)** button next to "Contributor Profile ID"
4. Approve the transaction in your wallet
5. Wait for transaction to complete
6. **Copy the Profile Object ID** from the transaction result:
   - Option A: Check browser console logs for "Profile created:"
   - Option B: Go to Sui Explorer: https://suiscan.xyz/testnet/account/YOUR_WALLET_ADDRESS
   - Look for newly created object of type `ContributorProfile`
   - Copy the Object ID (starts with `0x...`)

**Save this Profile ID** - you'll need it for submissions!

---

## Step 2: Create a Contribution Pool

**Why?** Pools are where contributors submit their research.

1. Go to: http://localhost:3000/pools/create

2. **Step 1 - Pool Details**:
   - Pool Name: `Test Research Pool`
   - Category: `DeFi Protocol`
   - Description: `Testing pool for research contributions`
   - Tags: `Move`, `Security`, `Testing` (press Enter after each)
   - Click **Continue**

3. **Step 2 - Scope & Requirements**:
   - Audit Scope: `Test scope for research contributions`
   - Requirements: `Submit security findings with detailed proof`
   - Timeline: `30` (days)
   - Click **Continue**

4. **Step 3 - Funding & Rewards**:
   - Total Bounty Pool: `10` (SUI tokens)
   - Click **Create Pool & Fund**
   - Approve the transaction in your wallet (this will cost ~10.5 SUI)
   - Wait for transaction to complete

5. **Copy the Pool Object ID**:
   - Check browser console for "Pool created:"
   - OR go to Sui Explorer: https://suiscan.xyz/testnet/account/YOUR_WALLET_ADDRESS
   - Look for newly created object of type `ContributionPool`
   - Copy the Object ID (starts with `0x...`)

**Save this Pool ID** - you'll need it for submissions!

---

## Step 3: Submit a Research Contribution

**Why?** This tests the complete Walrus integration!

1. Go to: http://localhost:3000/submit

2. **Pre-requisites (Dev Mode)**:
   - Pool ID: Paste the Pool ID from Step 2
   - Contributor Profile ID: Paste the Profile ID from Step 1

3. **Submission Details**:
   - Title: `Critical Bug in Smart Contract`
   - Executive Summary: `Found a reentrancy vulnerability that could drain pool funds. Detailed proof attached.`
   - Severity Level: `Critical`

4. **Upload Report**:
   - Click the upload area
   - Select a PDF, document, or any file (max 50MB)
   - Example: Create a simple test file:
     ```bash
     echo "This is a test research document with security findings." > test-research.pdf
     ```
   - Upload this file

5. **Submit**:
   - Click **Submit Contribution** button
   - **Watch the progress**:
     - "Uploading research file to Walrus..."
     - "Creating and uploading metadata to Walrus..."
     - "Submitting to Sui blockchain..."
   - Approve the transaction in your wallet
   - Wait for success message!

6. **Verify Success**:
   - You should see a green success box with:
     - **Research File URL**: Click to view your uploaded file
     - **Metadata URL**: Click to view the metadata JSON
   - Check browser console for detailed logs:
     - `[Submit] ✅ Submission complete!`
     - File Blob URL
     - Metadata Blob URL

---

## What Happens Behind the Scenes

### 1. File Upload to Walrus:
```
File → API Route → Walrus Publisher → Blob ID
https://publisher.walrus-testnet.walrus.space/v1/store?epochs=200
```

### 2. Metadata Creation:
```json
{
  "title": "Critical Bug in Smart Contract",
  "summary": "Found a reentrancy vulnerability...",
  "severity": "Critical",
  "filename": "test-research.pdf",
  "fileSize": 12345,
  "fileBlobId": "blob_id_here",
  "fileBlobUrl": "https://aggregator.walrus-testnet.walrus.space/v1/blob_id",
  "submittedAt": "2025-12-19T...",
  "submittedBy": "0x..."
}
```

### 3. Smart Contract Call:
```move
prooflayer::submit_contribution(
  pool_id: Pool Object ID,
  metadata_url: Metadata Blob ID,
  encrypted_data_url: File Blob ID,
  profile: Contributor Profile Object
)
```

---

## Troubleshooting

### Error: "Please connect your wallet first"
- Click "Connect Wallet" in the header
- Approve the connection in Sui Wallet

### Error: "Please enter Pool ID and Profile ID"
- Make sure you created a profile (Step 1)
- Make sure you created a pool (Step 2)
- Copy the Object IDs from Sui Explorer

### Error: "Failed to upload to Walrus"
- Check your internet connection
- Walrus testnet might be down - check status
- Try a smaller file (< 10MB for testing)

### Error: "Transaction failed"
- Make sure you have enough SUI tokens for gas
- Check if Pool ID and Profile ID are correct
- Check browser console for detailed error messages

### How to get Object IDs from Sui Explorer:
1. Go to: https://suiscan.xyz/testnet
2. Search for your wallet address
3. Click on "Objects" tab
4. Find objects of type:
   - `ContributorProfile` → This is your Profile ID
   - `ContributionPool` → This is your Pool ID
5. Click on the object to see full details
6. Copy the Object ID

---

## Verifying on Walrus

After successful submission, you can verify your files are stored on Walrus:

1. **File Blob URL**:
   ```
   https://aggregator.walrus-testnet.walrus.space/v1/{blob_id}
   ```
   - Open this URL in your browser
   - You should see/download your uploaded file

2. **Metadata Blob URL**:
   ```
   https://aggregator.walrus-testnet.walrus.space/v1/{blob_id}
   ```
   - Open this URL in your browser
   - You should see the JSON metadata

---

## Console Logs Reference

Look for these logs in your browser console (F12):

### During Upload:
```
[Upload] Uploading test-research.pdf to Walrus...
[Upload] Success! Blob ID: abc123...
```

### During Submission:
```
[Submit] Step 1: Uploading file to Walrus
[Submit] File uploaded: {blobId: "...", blobUrl: "..."}
[Submit] Step 2: Creating metadata
[Submit] Metadata uploaded: {blobId: "...", blobUrl: "..."}
[Submit] Step 3: Submitting to smart contract
[Submit] Package ID: 0x4b8be87726a90695109542699847ea3f830c706ba6cfd46f1e9c607f76f3c600
[Submit] Pool ID: 0x...
[Submit] Profile ID: 0x...
[Submit] Metadata Blob ID: blob_id_1
[Submit] File Blob ID: blob_id_2
[Submit] ✅ Submission complete!
[Submit] File Blob URL: https://aggregator.walrus-testnet.walrus.space/v1/...
[Submit] Metadata Blob URL: https://aggregator.walrus-testnet.walrus.space/v1/...
```

---

## Quick Test Summary

**TL;DR - Fast Testing Steps**:

1. **Get testnet SUI tokens** from faucet
2. **Create Profile**: `/submit` → Click user+ button → Copy Object ID
3. **Create Pool**: `/pools/create` → Fill form → Submit → Copy Object ID
4. **Submit Contribution**: `/submit` → Enter IDs → Fill form → Upload file → Submit
5. **Verify**: Check success message, click Walrus URLs, verify files are accessible

---

## Need Help?

- Check browser console (F12) for detailed error messages
- All functions have extensive logging with `[Upload]` and `[Submit]` prefixes
- Verify transaction on Sui Explorer: https://suiscan.xyz/testnet
- Check Walrus status: https://docs.walrus.xyz

Happy Testing! 🚀
