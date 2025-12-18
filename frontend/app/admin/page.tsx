"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, CheckCircle2, XCircle, ExternalLink } from "lucide-react"
import { useState } from "react"

const submissions = [
  {
    id: 1,
    contributor: "Jane Doe",
    address: "0x1a2b...9f8e",
    pool: "DeepBook V3 Audit",
    title: "Critical Reentrancy Vulnerability in CLOB Engine",
    severity: "Critical",
    submitted: "2 hours ago",
    status: "Pending Review",
  },
  {
    id: 2,
    contributor: "Alex Chen",
    address: "0x3c4d...7a6b",
    pool: "Scallop Protocol",
    title: "Integer Overflow in Lending Module",
    severity: "High",
    submitted: "5 hours ago",
    status: "Pending Review",
  },
  {
    id: 3,
    contributor: "Sarah Kim",
    address: "0x5e6f...2c3d",
    pool: "Cetus AMM",
    title: "Potential Front-Running Attack Vector",
    severity: "Medium",
    submitted: "1 day ago",
    status: "Under Review",
  },
]

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-20 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <h1 className="text-5xl font-bold mb-4 text-balance">Pool Review Dashboard</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Review submissions, validate findings, and distribute rewards to contributors.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground mb-1">PENDING REVIEW</div>
            <div className="text-3xl font-bold">8</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground mb-1">UNDER REVIEW</div>
            <div className="text-3xl font-bold text-orange-500">3</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground mb-1">ACCEPTED</div>
            <div className="text-3xl font-bold text-primary">24</div>
          </div>
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="text-sm text-muted-foreground mb-1">REWARDS PAID</div>
            <div className="text-3xl font-bold">156,000 SUI</div>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search by contributor, pool, or finding..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card border-border"
            />
          </div>
        </div>

        {/* Submissions List */}
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          {submissions.map((submission, index) => (
            <div
              key={submission.id}
              className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all duration-300"
              style={{ animationDelay: `${(index + 3) * 100}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-xs font-semibold text-primary flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      {submission.pool}
                    </div>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        submission.status === "Pending Review"
                          ? "bg-yellow-500/20 text-yellow-500"
                          : "bg-orange-500/20 text-orange-500"
                      }`}
                    >
                      {submission.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold mb-2">{submission.title}</h3>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      By <span className="font-semibold text-foreground">{submission.contributor}</span>
                    </span>
                    <span>•</span>
                    <span className="font-mono">{submission.address}</span>
                    <span>•</span>
                    <span>{submission.submitted}</span>
                    <span>•</span>
                    <span
                      className={`font-semibold ${
                        submission.severity === "Critical"
                          ? "text-red-500"
                          : submission.severity === "High"
                            ? "text-orange-500"
                            : "text-yellow-500"
                      }`}
                    >
                      {submission.severity}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button size="sm" variant="outline">
                  View Details
                </Button>
                <Button size="sm" variant="outline" className="gap-1.5 bg-transparent">
                  View Encrypted Report
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
                <div className="flex-1" />
                <Button
                  size="sm"
                  className="bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20"
                >
                  <XCircle className="h-4 w-4 mr-1.5" />
                  Reject
                </Button>
                <Button
                  size="sm"
                  className="bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground border border-primary/20"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1.5" />
                  Accept & Reward
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Footer />
    </main>
  )
}
