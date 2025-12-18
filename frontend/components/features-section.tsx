"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Shield, CheckCircle2, Lock, Wallet, Eye, Users } from "lucide-react"
import { useEffect, useState } from "react"
import Link from "next/link"

export function FeaturesSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <section id="features" className="py-24 relative">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Contributors Card */}
            <Card
              className={`p-8 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-primary/50 transition-all duration-500 hover:shadow-xl hover:shadow-primary/10 group ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 border border-primary/20 group-hover:bg-primary/20 transition-colors">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <Badge variant="outline" className="border-primary text-primary">
                  FOR CONTRIBUTORS
                </Badge>
              </div>

              <h3 className="text-3xl font-bold mb-4">Build Reputation</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Prove your security skills on-chain. Get rewarded for findings with verifiable reputation and instant
                payouts.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Verifiable on-chain reputation</p>
                    <p className="text-sm text-muted-foreground">Build your security profile backed by real work</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                    <Lock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Encrypted report storage</p>
                    <p className="text-sm text-muted-foreground">Your work is secure until validation</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-primary/10 mt-0.5">
                    <Wallet className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Instant bounty payouts</p>
                    <p className="text-sm text-muted-foreground">Automated rewards upon acceptance</p>
                  </div>
                </div>
              </div>

              <Link href="/pools">
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors bg-transparent"
                >
                  Explore Pools →
                </Button>
              </Link>
            </Card>

            {/* For Organizations Card */}
            <Card
              className={`p-8 bg-gradient-to-br from-card to-card/50 border-border/50 hover:border-chart-2/50 transition-all duration-500 hover:shadow-xl hover:shadow-chart-2/10 group ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"} delay-150`}
            >
              <div className="flex items-center gap-2 mb-6">
                <div className="p-2 rounded-lg bg-chart-2/10 border border-chart-2/20 group-hover:bg-chart-2/20 transition-colors">
                  <Shield className="h-5 w-5 text-chart-2" />
                </div>
                <Badge variant="outline" className="border-chart-2 text-chart-2">
                  FOR ORGANIZATIONS
                </Badge>
              </div>

              <h3 className="text-3xl font-bold mb-4">Secure Protocols</h3>
              <p className="text-muted-foreground mb-8 leading-relaxed">
                Launch verifiable security pools. Access top-tier researchers and ensure transparent auditing for your
                users.
              </p>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-chart-2/10 mt-0.5">
                    <Wallet className="h-4 w-4 text-chart-2" />
                  </div>
                  <div>
                    <p className="font-medium">Dedicated funding pools</p>
                    <p className="text-sm text-muted-foreground">Allocate bounties for your protocol security</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-chart-2/10 mt-0.5">
                    <Eye className="h-4 w-4 text-chart-2" />
                  </div>
                  <div>
                    <p className="font-medium">Auditing transparency logs</p>
                    <p className="text-sm text-muted-foreground">All findings verified and recorded on-chain</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="p-1.5 rounded-full bg-chart-2/10 mt-0.5">
                    <Users className="h-4 w-4 text-chart-2" />
                  </div>
                  <div>
                    <p className="font-medium">Access top-tier talent</p>
                    <p className="text-sm text-muted-foreground">Connect with verified security researchers</p>
                  </div>
                </div>
              </div>

              <Link href="/pools/create">
                <Button
                  variant="outline"
                  className="w-full group-hover:bg-chart-2 group-hover:text-white transition-colors bg-transparent"
                >
                  Create Pool →
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
