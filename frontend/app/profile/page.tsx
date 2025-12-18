"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Award, TrendingUp, FileCheck, Wallet, ExternalLink } from "lucide-react"

const contributions = [
  {
    id: 1,
    pool: "DeepBook V3 Audit",
    title: "Critical Reentrancy Vulnerability in CLOB Engine",
    severity: "Critical",
    status: "Accepted",
    reward: "15,000 SUI",
    date: "Nov 28, 2024",
  },
  {
    id: 2,
    pool: "Scallop Protocol",
    title: "Integer Overflow in Lending Module",
    severity: "High",
    status: "Under Review",
    reward: "Pending",
    date: "Dec 5, 2024",
  },
  {
    id: 3,
    pool: "Cetus AMM",
    title: "Math Library Precision Issues",
    severity: "Medium",
    status: "Accepted",
    reward: "3,500 SUI",
    date: "Oct 15, 2024",
  },
]

export default function ProfilePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Profile Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-start gap-6 mb-8">
            <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center border-2 border-primary/20">
              <span className="text-3xl font-bold text-primary">JD</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-bold">Jane Doe</h1>
                <span className="px-3 py-1 rounded-full bg-primary/20 text-primary text-sm font-semibold">
                  Verified
                </span>
              </div>
              <p className="text-lg text-muted-foreground mb-4">Security Researcher • Move & Rust Specialist</p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4" />
                  <span className="font-mono">0x1a2b...9f8e</span>
                </div>
                <button className="flex items-center gap-1 hover:text-primary transition-colors">
                  View on Explorer
                  <ExternalLink className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Award className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">850</div>
                  <div className="text-sm text-muted-foreground">Reputation Score</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <FileCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">12</div>
                  <div className="text-sm text-muted-foreground">Accepted Audits</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-200">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-2xl font-bold">28,500</div>
                  <div className="text-sm text-muted-foreground">Total SUI Earned</div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-250">
              <div className="flex items-center gap-3 mb-2">
                <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <FileCheck className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Under Review</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contributions Section */}
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Recent Contributions</h2>
            <Button variant="outline">View All</Button>
          </div>

          <div className="space-y-4">
            {contributions.map((contribution, index) => (
              <div
                key={contribution.id}
                className="rounded-xl border border-border bg-card p-6 hover:border-primary/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
                style={{ animationDelay: `${(index + 4) * 100}ms`, animationFillMode: "backwards" }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                      <div className="h-1 w-1 rounded-full bg-primary" />
                      {contribution.pool}
                    </div>
                    <h3 className="text-lg font-bold mb-1">{contribution.title}</h3>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{contribution.date}</span>
                      <span>•</span>
                      <span
                        className={`font-semibold ${
                          contribution.severity === "Critical"
                            ? "text-red-500"
                            : contribution.severity === "High"
                              ? "text-orange-500"
                              : "text-yellow-500"
                        }`}
                      >
                        {contribution.severity}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                        contribution.status === "Accepted"
                          ? "bg-primary/20 text-primary"
                          : "bg-orange-500/20 text-orange-500"
                      }`}
                    >
                      {contribution.status}
                    </div>
                    <div className="text-lg font-bold text-primary">{contribution.reward}</div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  {contribution.status === "Accepted" && (
                    <Button variant="outline" size="sm">
                      View On-Chain Proof
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div className="mt-12 animate-in fade-in duration-1000 delay-700">
          <h2 className="text-2xl font-bold mb-6">Achievements</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { title: "First Contribution", icon: "🎯" },
              { title: "Critical Finder", icon: "🔥" },
              { title: "10 Accepted", icon: "⭐" },
              { title: "Top Contributor", icon: "🏆" },
            ].map((achievement, index) => (
              <div
                key={achievement.title}
                className="rounded-xl border border-border bg-card p-6 text-center hover:border-primary/50 transition-all"
              >
                <div className="text-4xl mb-2">{achievement.icon}</div>
                <div className="font-semibold">{achievement.title}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
