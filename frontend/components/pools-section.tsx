"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import { useState } from "react"

const pools = [
  {
    id: 1,
    name: "DeepBook V3 Audit",
    category: "DEFI PROTOCOL",
    description: "Comprehensive review of CLOB matching engine logic.",
    tags: ["Move", "Smart Contracts"],
    raised: 45000,
    goal: 50000,
    funded: 90,
    status: "ACTIVE",
    daysLeft: 2,
    image: "/images/image.png",
  },
  {
    id: 2,
    name: "Scallop Protocol",
    category: "LIQUID STAKING",
    description: "Lending protocol core contract audit focusing on reentrancy.",
    tags: ["Rust", "Formal Verification"],
    raised: 12500,
    goal: 80000,
    funded: 15,
    status: "ACTIVE",
    daysLeft: 14,
    image: "/images/image.png",
  },
  {
    id: 3,
    name: "Aftermath Finance",
    category: "INFRASTRUCTURE",
    description: "Aggregation router security assessment.",
    tags: ["TypeScript", "SDK"],
    raised: 20000,
    goal: 35000,
    funded: 57,
    status: "PAUSED",
    daysLeft: null,
    image: "/images/image.png",
  },
  {
    id: 4,
    name: "Cetus AMM",
    category: "DEX",
    description: "Concentrated liquidity pool math verification.",
    tags: ["Move", "Math Lib"],
    raised: 2100,
    goal: 25000,
    funded: 8,
    status: "ACTIVE",
    daysLeft: 21,
    image: "/images/image.png",
  },
  {
    id: 5,
    name: "Bucket Protocol",
    category: "GAMEFI",
    description: "In-game economy tokenomics verification.",
    tags: ["Economics"],
    raised: 15000,
    goal: 15000,
    funded: 100,
    status: "COMPLETED",
    daysLeft: null,
    image: "/images/image.png",
  },
  {
    id: 6,
    name: "Pyth Integrations",
    category: "ORACLE",
    description: "Verification of oracle data consumption patterns.",
    tags: ["Move", "Integration"],
    raised: 8450,
    goal: 10000,
    funded: 84,
    status: "ACTIVE",
    daysLeft: 5,
    image: "/images/image.png",
  },
]

export function PoolsSection() {
  const [activeFilter, setActiveFilter] = useState("All Pools")

  return (
    <section id="pools" className="py-24 bg-card/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h2 className="text-4xl font-bold mb-4">Contribution Pools</h2>
            <p className="text-muted-foreground text-lg">
              Secure the Sui ecosystem by funding verifiable audits. Crowdsource security for the next generation of
              DeFi protocols.
            </p>
          </div>

          {/* Stats and Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <div className="flex gap-8">
              <div>
                <p className="text-sm text-muted-foreground mb-1">TOTAL VALUE LOCKED</p>
                <p className="text-2xl font-bold">$4.2M</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">ACTIVE AUDITS</p>
                <p className="text-2xl font-bold">12</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search protocols, languages (e.g. Move, Rust)..."
                  className="pl-10 w-full sm:w-80 bg-background"
                />
              </div>
              <div className="flex gap-2">
                {["All Pools", "Active", "Auditing", "Completed"].map((filter) => (
                  <Button
                    key={filter}
                    variant={activeFilter === filter ? "default" : "outline"}
                    size="sm"
                    onClick={() => setActiveFilter(filter)}
                    className={activeFilter === filter ? "bg-primary text-primary-foreground" : ""}
                  >
                    {filter}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Pools Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pools.map((pool, index) => (
              <Card
                key={pool.id}
                className="group overflow-hidden bg-card border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-primary/5 to-chart-2/5">
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/50 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <Badge
                      className={
                        pool.status === "ACTIVE"
                          ? "bg-primary/10 text-primary border-primary/20"
                          : pool.status === "COMPLETED"
                            ? "bg-chart-1/10 text-chart-1 border-chart-1/20"
                            : "bg-muted/10 text-muted-foreground border-muted/20"
                      }
                    >
                      <span className="relative flex h-2 w-2 mr-1.5">
                        {pool.status === "ACTIVE" && (
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        )}
                        <span
                          className={`relative inline-flex rounded-full h-2 w-2 ${
                            pool.status === "ACTIVE"
                              ? "bg-primary"
                              : pool.status === "COMPLETED"
                                ? "bg-chart-1"
                                : "bg-muted-foreground"
                          }`}
                        ></span>
                      </span>
                      {pool.status}
                    </Badge>
                  </div>
                </div>

                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="outline" className="text-xs font-mono">
                      {pool.category}
                    </Badge>
                  </div>

                  <h3 className="text-xl font-bold mb-2 group-hover:text-primary transition-colors">{pool.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{pool.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {pool.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Raised</p>
                      <p className="font-bold">{pool.raised.toLocaleString()} SUI</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">Goal</p>
                      <p className="font-bold">{pool.goal.toLocaleString()} SUI</p>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">{pool.funded}% Funded</span>
                      {pool.daysLeft && <span className="text-muted-foreground">{pool.daysLeft} days left</span>}
                      {pool.status === "COMPLETED" && <span className="text-chart-1">Closed Nov 12</span>}
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          pool.status === "COMPLETED" ? "bg-chart-1" : "bg-gradient-to-r from-primary to-chart-2"
                        }`}
                        style={{ width: `${pool.funded}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="group bg-transparent">
              Show more pools
              <span className="ml-2 group-hover:translate-x-1 transition-transform">↓</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
