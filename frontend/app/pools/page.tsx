"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

const poolsData = [
  {
    id: 1,
    title: "DeepBook V3 Audit",
    category: "DEFI PROTOCOL",
    description: "Comprehensive review of CLOB matching engine logic.",
    tags: ["Move", "Smart Contracts"],
    raised: "45,000",
    goal: "50,000",
    progress: 90,
    daysLeft: 2,
    status: "ACTIVE",
    image: "/images/image.png",
  },
  {
    id: 2,
    title: "Scallop Protocol",
    category: "LIQUID STAKING",
    description: "Lending protocol core contract audit focusing on reentrancy.",
    tags: ["Rust", "Formal Verification"],
    raised: "12,500",
    goal: "80,000",
    progress: 15,
    daysLeft: 14,
    status: "ACTIVE",
    image: "/images/image.png",
  },
  {
    id: 3,
    title: "Aftermath Finance",
    category: "INFRASTRUCTURE",
    description: "Aggregation router security assessment.",
    tags: ["TypeScript", "SDK"],
    raised: "20,000",
    goal: "35,000",
    progress: 57,
    daysLeft: 0,
    status: "PAUSED",
    image: "/images/image.png",
  },
  {
    id: 4,
    title: "Cetus AMM",
    category: "DEX",
    description: "Concentrated liquidity pool math verification.",
    tags: ["Move", "Math Lib"],
    raised: "2,100",
    goal: "25,000",
    progress: 8,
    daysLeft: 21,
    status: "ACTIVE",
    image: "/images/image.png",
  },
  {
    id: 5,
    title: "Bucket Protocol",
    category: "GAMEFI",
    description: "In-game economy tokenomics verification.",
    tags: ["Economics"],
    raised: "15,000",
    goal: "15,000",
    progress: 100,
    daysLeft: 0,
    status: "COMPLETED",
    image: "/images/image.png",
  },
  {
    id: 6,
    title: "Pyth Integrations",
    category: "ORACLE",
    description: "Verification of oracle data consumption patterns.",
    tags: ["Move", "Integration"],
    raised: "8,450",
    goal: "10,000",
    progress: 84,
    daysLeft: 5,
    status: "ACTIVE",
    image: "/images/image.png",
  },
]

export default function PoolsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Pools")

  const filters = ["All Pools", "Active", "Auditing", "Completed"]

  const filteredPools = poolsData.filter((pool) => {
    const matchesSearch =
      pool.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pool.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesFilter =
      activeFilter === "All Pools" ||
      (activeFilter === "Active" && pool.status === "ACTIVE") ||
      (activeFilter === "Auditing" && pool.status === "AUDITING") ||
      (activeFilter === "Completed" && pool.status === "COMPLETED")

    return matchesSearch && matchesFilter
  })

  const totalValueLocked = "$4.2M"
  const activeAudits = "12"

  return (
    <main className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-20 container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-5xl font-bold mb-4 text-balance">Contribution Pools</h1>
              <p className="text-xl text-muted-foreground max-w-3xl text-pretty">
                Secure the Sui ecosystem by funding verifiable audits. Crowdsource security for the next generation of
                DeFi protocols.
              </p>
            </div>
            <Link href="/pools/create">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold gap-2">
                <Plus className="h-5 w-5" />
                Create Pool
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mt-8">
            <div>
              <div className="text-sm text-muted-foreground mb-1">TOTAL VALUE LOCKED</div>
              <div className="text-3xl font-bold">{totalValueLocked}</div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">ACTIVE AUDITS</div>
              <div className="text-3xl font-bold text-primary">{activeAudits}</div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search protocols, languages (e.g. Move, Rust)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-card border-border"
              />
            </div>
          </div>

          <div className="flex gap-3">
            {filters.map((filter) => (
              <Button
                key={filter}
                variant={activeFilter === filter ? "default" : "outline"}
                onClick={() => setActiveFilter(filter)}
                className={`${
                  activeFilter === filter
                    ? "bg-primary text-primary-foreground"
                    : "bg-card border-border hover:bg-accent"
                }`}
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Pools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPools.map((pool, index) => (
            <div
              key={pool.id}
              className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:border-primary/50 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms`, animationFillMode: "backwards" }}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                    pool.status === "ACTIVE"
                      ? "bg-primary/20 text-primary"
                      : pool.status === "PAUSED"
                        ? "bg-orange-500/20 text-orange-500"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      pool.status === "ACTIVE"
                        ? "bg-primary animate-pulse"
                        : pool.status === "PAUSED"
                          ? "bg-orange-500"
                          : "bg-muted-foreground"
                    }`}
                  />
                  {pool.status}
                </span>
              </div>

              {/* Visual Background */}
              <div className="h-32 bg-gradient-to-br from-primary/5 via-primary/10 to-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(0,255,0,0.1),transparent)]" />
              </div>

              <div className="p-6">
                {/* Category */}
                <div className="text-xs font-semibold text-primary mb-2 flex items-center gap-1.5">
                  <div className="h-1 w-1 rounded-full bg-primary" />
                  {pool.category}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{pool.title}</h3>

                {/* Description */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{pool.description}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {pool.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Funding Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Raised</span>
                    <span className="text-muted-foreground">Goal</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>{pool.raised} SUI</span>
                    <span>{pool.goal} SUI</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-500 ease-out"
                      style={{ width: `${pool.progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-xs font-semibold text-primary">{pool.progress}% Funded</span>
                    {pool.daysLeft > 0 && (
                      <span className="text-xs text-muted-foreground">{pool.daysLeft} days left</span>
                    )}
                    {pool.status === "PAUSED" && <span className="text-xs text-orange-500">Pending update</span>}
                    {pool.status === "COMPLETED" && (
                      <span className="text-xs text-muted-foreground">Closed Nov 12</span>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                  variant="outline"
                >
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredPools.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground">No pools found matching your criteria.</p>
          </div>
        )}

        {/* Show More Button */}
        {filteredPools.length > 0 && (
          <div className="mt-12 text-center animate-in fade-in duration-1000 delay-500">
            <Button variant="outline" size="lg" className="border-border hover:border-primary bg-transparent">
              Show more pools
            </Button>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
