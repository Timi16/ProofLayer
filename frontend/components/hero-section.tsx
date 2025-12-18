"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, TrendingUp, Users } from "lucide-react"
import { useEffect, useState } from "react"

import { ShieldCheckIcon } from "./shield-check-icon"

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Animated background glow */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-glow" />
      <div
        className="absolute bottom-0 right-1/4 w-96 h-96 bg-chart-2/20 rounded-full blur-3xl animate-glow"
        style={{ animationDelay: "2s" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Hero content */}
            <div
              className={`space-y-8 transition-all duration-1000 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <Badge variant="outline" className="border-primary text-primary px-3 py-1">
                <span className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                  </span>
                  LIVE ON MAINNET
                </span>
              </Badge>

              <div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight text-balance">
                  Verifiable security contributions, <span className="text-primary">anchored on Sui.</span>
                </h1>
                <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
                  A decentralized coordination layer for security research. Incentivizing vulnerability discovery with
                  on-chain verification and automated payouts.
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Link href="/pools">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/25"
                  >
                    Launch App
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="font-semibold bg-transparent">
                  Read Whitepaper
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <TrendingUp className="h-4 w-4" />
                    <span className="text-sm">TVL</span>
                  </div>
                  <p className="text-2xl font-bold">$2.4M</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span className="text-sm">Active Pools</span>
                  </div>
                  <p className="text-2xl font-bold">50+</p>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="text-sm">Payouts</span>
                  </div>
                  <p className="text-2xl font-bold">$850K+</p>
                </div>
              </div>
            </div>

            {/* Right side - Featured pool card */}
            <div
              className={`transition-all duration-1000 delay-300 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <Card className="p-6 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary/20 to-chart-2/20 flex items-center justify-center">
                      <ShieldCheckIcon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">Sui Foundation Core</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <CheckCircle2 className="h-4 w-4 text-primary" />
                        <span className="text-sm text-muted-foreground">Verified • 2d ago</span>
                      </div>
                    </div>
                  </div>
                  <Badge className="bg-primary/10 text-primary border-primary/20">ACTIVE</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Scope</p>
                    <Badge variant="outline" className="text-xs">
                      <span className="mr-1">{"</>"}</span> Smart Contracts
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Bounty Pool</p>
                    <p className="text-lg font-bold">150,000 SUI</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Funded</span>
                    <span className="font-semibold text-primary">65%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-chart-2 rounded-full transition-all duration-1000"
                      style={{ width: mounted ? "65%" : "0%" }}
                    />
                  </div>
                </div>

                <Link href="/pools">
                  <Button className="w-full mt-6 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 font-semibold">
                    View Details →
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
