"use client"

import type React from "react"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Upload, FileText, Lock, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function SubmitPage() {
  const [files, setFiles] = useState<File[]>([])
  const [isEncrypting, setIsEncrypting] = useState(false)
  const [isEncrypted, setIsEncrypted] = useState(false)

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files))
      // Simulate encryption
      setIsEncrypting(true)
      setTimeout(() => {
        setIsEncrypting(false)
        setIsEncrypted(true)
      }, 2000)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        {/* Back Button */}
        <Link
          href="/pools"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pools
        </Link>

        {/* Page Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-5xl font-bold mb-4 text-balance">Submit Contribution</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Upload your security proofs anchored securely on the Sui network. Your work is encrypted and timestamped
            instantly.
          </p>
        </div>

        {/* Main Form */}
        <div className="space-y-6">
          {/* Pool Selection */}
          <div className="rounded-2xl border border-border bg-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
            <Label htmlFor="pool" className="text-base font-semibold">
              Select Pool *
            </Label>
            <select id="pool" className="mt-2 w-full h-12 px-3 rounded-lg border border-border bg-background">
              <option>Choose an active contribution pool</option>
              <option>DeepBook V3 Audit - 50,000 SUI</option>
              <option>Scallop Protocol - 80,000 SUI</option>
              <option>Aftermath Finance - 35,000 SUI</option>
              <option>Cetus AMM - 25,000 SUI</option>
              <option>Pyth Integrations - 10,000 SUI</option>
            </select>
          </div>

          {/* Submission Details */}
          <div className="rounded-2xl border border-border bg-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
            <h3 className="text-lg font-semibold mb-6">Submission Details</h3>

            <div className="space-y-6">
              <div>
                <Label htmlFor="title" className="text-base font-semibold">
                  Title *
                </Label>
                <Input id="title" placeholder="Brief description of your findings" className="mt-2 h-12" />
              </div>

              <div>
                <Label htmlFor="findings" className="text-base font-semibold">
                  Executive Summary *
                </Label>
                <Textarea
                  id="findings"
                  placeholder="Summarize your key findings and recommendations..."
                  className="mt-2 min-h-40"
                />
              </div>

              <div>
                <Label htmlFor="severity" className="text-base font-semibold">
                  Severity Level *
                </Label>
                <select id="severity" className="mt-2 w-full h-12 px-3 rounded-lg border border-border bg-background">
                  <option>Select severity</option>
                  <option>Critical</option>
                  <option>High</option>
                  <option>Medium</option>
                  <option>Low</option>
                  <option>Informational</option>
                </select>
              </div>
            </div>
          </div>

          {/* File Upload */}
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

            {/* Uploaded Files */}
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

            {/* Encryption Status */}
            {(isEncrypting || isEncrypted) && (
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

          {/* Submit Button */}
          <div className="flex justify-end gap-4 animate-in fade-in duration-1000 delay-400">
            <Link href="/pools">
              <Button variant="outline" size="lg">
                Cancel
              </Button>
            </Link>
            <Button
              size="lg"
              disabled={files.length === 0 || isEncrypting}
              className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
            >
              Submit Contribution
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
