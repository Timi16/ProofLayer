"use client"

import type React from "react"
import { Suspense } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, FileText, Lock, CheckCircle2, UserPlus, Send } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useProofLayer } from "@/hooks/useProofLayer"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { toast } from "sonner"
import { useSearchParams } from "next/navigation"

// Separate component that uses useSearchParams
function SubmitForm() {
  const searchParams = useSearchParams()
  const [files, setFiles] = useState<File[]>([])
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [isEncrypted, setIsEncrypted] = useState(false)

  // Contract Interaction State
  const { submitContribution, createProfile } = useProofLayer()
  const account = useCurrentAccount()
  const [poolId, setPoolId] = useState("")
  const [profileId, setProfileId] = useState("")
  const [title, setTitle] = useState("")
  const [summary, setSummary] = useState("")
  const [severity, setSeverity] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isCreatingProfile, setIsCreatingProfile] = useState(false)

  // Walrus upload state
  const [uploadProgress, setUploadProgress] = useState<string>("")
  const [fileBlobId, setFileBlobId] = useState<string>("")
  const [fileBlobUrl, setFileBlobUrl] = useState<string>("")
  const [metadataBlobId, setMetadataBlobId] = useState<string>("")
  const [metadataBlobUrl, setMetadataBlobUrl] = useState<string>("")

  // Auto-fill Pool ID from URL params
  useEffect(() => {
    const poolIdFromUrl = searchParams.get('poolId');
    if (poolIdFromUrl) {
      setPoolId(poolIdFromUrl);
      console.log('[Submit] Pool ID from URL:', poolIdFromUrl);
    }
  }, [searchParams]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
      setIsEncrypted(false)
      setFileBlobId("")
      setFileBlobUrl("")
      setMetadataBlobId("")
      setMetadataBlobUrl("")
    }
  }

  const uploadToWalrus = async (file: File): Promise<{ blobId: string; blobUrl: string }> => {
    const formData = new FormData()
    formData.append("file", file)

    console.log(`[Upload] Uploading ${file.name} to Walrus...`)

    const response = await fetch("/api/walrus/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Failed to upload to Walrus")
    }

    const data = await response.json()

    if (!data.success) {
      throw new Error(data.error || "Upload failed")
    }

    console.log(`[Upload] Success! Blob ID: ${data.blobId}`)

    return {
      blobId: data.blobId,
      blobUrl: data.blobUrl,
    }
  }

  const handleCreateProfile = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }
    try {
      setIsCreatingProfile(true);
      const result: any = await createProfile();
      console.log("📦 Profile Result:", result);

      if (result?.objectChanges) {
        const createdProfile = result.objectChanges.find(
          (change: any) =>
            change.type === 'created' &&
            change.objectType?.includes('ContributorProfile')
        );

        if (createdProfile?.objectId) {
          const newProfileId = createdProfile.objectId;
          
          // 🔥 AUTO-FILL THE PROFILE ID
          setProfileId(newProfileId);
          
          console.log("✅ Profile ID extracted and auto-filled:", newProfileId);
          
          // Copy to clipboard
          navigator.clipboard.writeText(newProfileId);
          
          toast.success(`Profile created! ID auto-filled: ${newProfileId.slice(0, 10)}...`);
        } else {
          console.error("❌ Could not find Profile ID in objectChanges");
          toast.success("Profile created! Check console for details");
        }
      } else {
        console.error("❌ No objectChanges in result");
        toast.success("Profile created! Check console for details");
      }
    } catch (error) {
      console.error("❌ Profile creation error:", error);
      toast.error("Failed to create profile");
    } finally {
      setIsCreatingProfile(false);
    }
  }

  const handleSubmit = async () => {
    if (!account) {
      toast.error("Please connect your wallet first")
      return
    }

    if (!poolId || !profileId) {
      toast.error("Please enter Pool ID and Profile ID")
      return
    }

    if (!title || !summary) {
      toast.error("Please fill in title and summary")
      return
    }

    if (!severity) {
      toast.error("Please select severity level")
      return
    }

    if (files.length === 0) {
      toast.error("Please upload at least one file")
      return
    }

    try {
      setIsSubmitting(true)
      setIsEncrypting(true)

      setUploadProgress("Uploading research file to Walrus...")
      console.log("[Submit] Step 1: Uploading file to Walrus")

      const mainFile = files[0]
      const fileUploadResult = await uploadToWalrus(mainFile)

      setFileBlobId(fileUploadResult.blobId)
      setFileBlobUrl(fileUploadResult.blobUrl)

      console.log("[Submit] File uploaded:", fileUploadResult)

      setUploadProgress("Creating and uploading metadata to Walrus...")
      console.log("[Submit] Step 2: Creating metadata")

      const metadata = {
        title,
        summary,
        severity,
        filename: mainFile.name,
        fileSize: mainFile.size,
        fileBlobId: fileUploadResult.blobId,
        fileBlobUrl: fileUploadResult.blobUrl,
        submittedAt: new Date().toISOString(),
        submittedBy: account.address,
      }

      const metadataBlob = new Blob([JSON.stringify(metadata, null, 2)], {
        type: "application/json",
      })
      const metadataFile = new File([metadataBlob], "metadata.json", {
        type: "application/json",
      })

      const metadataUploadResult = await uploadToWalrus(metadataFile)

      setMetadataBlobId(metadataUploadResult.blobId)
      setMetadataBlobUrl(metadataUploadResult.blobUrl)

      console.log("[Submit] Metadata uploaded:", metadataUploadResult)

      setIsEncrypting(false)
      setIsEncrypted(true)

      setUploadProgress("Submitting to Sui blockchain...")
      console.log("[Submit] Step 3: Submitting to smart contract")

      // 🔥 CAPTURE THE RESULT
      const result: any = await submitContribution(
        poolId,
        metadataUploadResult.blobId,
        fileUploadResult.blobId,
        profileId
      )

      console.log("📦 Submission Result:", result)

      // 🔥 EXTRACT CONTRIBUTION ID
      if (result?.objectChanges) {
        const createdContribution = result.objectChanges.find(
          (change: any) =>
            change.type === 'created' &&
            change.objectType?.includes('Contribution')
        )

        if (createdContribution?.objectId) {
          const contributionId = createdContribution.objectId
          console.log("✅ Contribution ID extracted:", contributionId)
          
          // Copy to clipboard
          navigator.clipboard.writeText(contributionId)
          
          // Show success with the ID
          toast.success(
            `Contribution submitted! ID: ${contributionId.slice(0, 10)}... (copied to clipboard)`
          )
        } else {
          console.error("❌ Could not find Contribution ID in objectChanges")
          toast.success("Contribution submitted! Check console for details")
        }
      } else {
        console.error("❌ No objectChanges in result")
        toast.success("Contribution submitted! Check console for details")
      }

      setUploadProgress("")
      console.log("[Submit] ✅ Submission complete!")

    } catch (error) {
      console.error("[Submit] Error:", error)
      setIsEncrypting(false)
      setUploadProgress("")
      toast.error(error instanceof Error ? error.message : "Failed to submit contribution")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="pt-24 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
      <Link
        href="/pools"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Pools
      </Link>

      <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-5xl font-bold mb-4 text-balance">Submit Contribution</h1>
        <p className="text-xl text-muted-foreground text-pretty">
          Upload your security proofs anchored securely on the Sui network. Your work is encrypted and timestamped
          instantly.
        </p>
      </div>

      <div className="space-y-6">
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-primary">Pre-requisites (Dev Mode)</h3>
            {!account && <span className="text-sm font-medium text-destructive">Wallet Disconnected</span>}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="poolId">Pool ID</Label>
              <Input
                id="poolId"
                value={poolId}
                onChange={(e) => setPoolId(e.target.value)}
                placeholder="0x..."
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="profileId">Contributor Profile ID</Label>
              <div className="flex gap-2 mt-1.5">
                <Input
                  id="profileId"
                  value={profileId}
                  onChange={(e) => setProfileId(e.target.value)}
                  placeholder="0x..."
                />
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleCreateProfile}
                  disabled={isCreatingProfile || !account}
                  title="Create Profile"
                >
                  {isCreatingProfile ? (
                    <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <UserPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          <h3 className="text-lg font-semibold mb-6">Submission Details</h3>

          <div className="space-y-6">
            <div>
              <Label htmlFor="title" className="text-base font-semibold">
                Title *
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Brief description of your findings"
                className="mt-2 h-12"
              />
            </div>

            <div>
              <Label htmlFor="findings" className="text-base font-semibold">
                Executive Summary *
              </Label>
              <Textarea
                id="findings"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Summarize your key findings and recommendations..."
                className="mt-2 min-h-40"
              />
            </div>

            <div>
              <Label htmlFor="severity" className="text-base font-semibold">
                Severity Level *
              </Label>
              <select
                id="severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="mt-2 w-full h-12 px-3 rounded-lg border border-border bg-background"
              >
                <option value="">Select severity</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
                <option value="Informational">Informational</option>
              </select>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <h3 className="text-lg font-semibold mb-6">Upload Report</h3>

          <div className="border-2 border-dashed border-border rounded-xl p-12 text-center hover:border-primary/50 transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              onChange={handleFileUpload}
              multiple
              accept=".pdf,.doc,.docx,.md"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <div className="text-lg font-semibold mb-2">Drop your files here or click to browse</div>
              <div className="text-sm text-muted-foreground">Supports PDF, DOC, DOCX, MD (max 50MB)</div>
            </label>
          </div>

          {files.length > 0 && (
            <div className="mt-6 space-y-3">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-muted-foreground">{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                    </div>
                  </div>
                  {isEncrypted && <CheckCircle2 className="h-5 w-5 text-primary" />}
                </div>
              ))}
            </div>
          )}

          {uploadProgress && (
            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <div>
                  <div className="font-semibold text-primary mb-1">Processing...</div>
                  <div className="text-sm text-muted-foreground">{uploadProgress}</div>
                </div>
              </div>
            </div>
          )}

          {fileBlobId && metadataBlobId && !isSubmitting && (
            <div className="mt-6 rounded-lg border border-green-500/30 bg-green-500/5 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <div className="font-semibold text-green-500 mb-2">Files Uploaded to Walrus!</div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <div className="font-medium text-foreground">Research File:</div>
                      <a
                        href={fileBlobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {fileBlobUrl}
                      </a>
                      <div className="text-xs text-muted-foreground mt-1">Blob ID: {fileBlobId}</div>
                    </div>
                    <div>
                      <div className="font-medium text-foreground">Metadata:</div>
                      <a
                        href={metadataBlobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline break-all"
                      >
                        {metadataBlobUrl}
                      </a>
                      <div className="text-xs text-muted-foreground mt-1">Blob ID: {metadataBlobId}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {(isEncrypting || isEncrypted) && !fileBlobId && (
            <div className="mt-6 rounded-lg border border-primary/30 bg-primary/5 p-6">
              <div className="flex items-start gap-3">
                {isEncrypting ? (
                  <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Lock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <div className="font-semibold text-primary mb-1">
                    {isEncrypting ? "Encrypting your submission..." : "Encrypted & Secured"}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {isEncrypting
                      ? "Your work is being encrypted and timestamped on-chain"
                      : "Your report is encrypted and ready for submission. Only authorized reviewers can decrypt it."}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4 animate-in fade-in duration-1000 delay-400">
          <Link href="/pools">
            <Button variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            onClick={handleSubmit}
            disabled={isSubmitting || !account}
          >
            {isSubmitting ? (
              <>Processing...</>
            ) : (
              <>
                Submit Contribution
                <Send className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}

// Main component with Suspense wrapper
export default function SubmitPage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <Suspense fallback={
        <div className="pt-24 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded w-32 mb-8" />
            <div className="h-12 bg-muted rounded w-96 mb-4" />
            <div className="h-6 bg-muted rounded w-full mb-12" />
          </div>
        </div>
      }>
        <SubmitForm />
      </Suspense>
      <Footer />
    </main>
  )
}