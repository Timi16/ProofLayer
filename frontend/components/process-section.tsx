"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Lock, FileCheck, Award } from "lucide-react"

export function ProcessSection() {
  return (
    <section id="process" className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="outline" className="border-primary text-primary mb-4">
              PROCESS
            </Badge>
            <h2 className="text-4xl lg:text-5xl font-bold mb-4 text-balance">
              Verifiable Security in <span className="text-primary">3 Steps</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Our process anchors security contributions directly on the Sui network, ensuring transparency and
              verifiable reputation for every audit.
            </p>
          </div>

          {/* Steps */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Step 1 */}
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4 group-hover:bg-primary/20 transition-colors">
                  <Lock className="h-8 w-8 text-primary" />
                </div>
                <Badge variant="outline" className="text-xs">
                  STEP 01
                </Badge>
              </div>

              <h3 className="text-2xl font-bold mb-3">Submit Contributions</h3>
              <p className="text-muted-foreground leading-relaxed">
                Upload your security proofs anchored securely on the Sui network. Your work is encrypted and timestamped
                instantly.
              </p>
            </Card>

            {/* Step 2 */}
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-chart-2/10 border border-chart-2/20 mb-4 group-hover:bg-chart-2/20 transition-colors">
                  <FileCheck className="h-8 w-8 text-chart-2" />
                </div>
                <Badge variant="outline" className="text-xs">
                  STEP 02
                </Badge>
              </div>

              <h3 className="text-2xl font-bold mb-3">Peer Validation</h3>
              <p className="text-muted-foreground leading-relaxed">
                Decentralized auditors verify the integrity of your submission. Consensus is reached through a
                transparent voting mechanism.
              </p>
            </Card>

            {/* Step 3 */}
            <Card className="p-8 bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10 group">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-chart-4/10 border border-chart-4/20 mb-4 group-hover:bg-chart-4/20 transition-colors">
                  <Award className="h-8 w-8 text-chart-4" />
                </div>
                <Badge variant="outline" className="text-xs">
                  STEP 03
                </Badge>
              </div>

              <h3 className="text-2xl font-bold mb-3">Earn Rewards</h3>
              <p className="text-muted-foreground leading-relaxed">
                Receive on-chain reputation and token incentives instantly upon validation. Build your portfolio as a
                verified security expert.
              </p>
            </Card>
          </div>

          {/* CTA */}
          <Card className="p-12 text-center bg-gradient-to-br from-card/80 to-primary/5 border-primary/20">
            <h3 className="text-3xl font-bold mb-4">Ready to secure the future?</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-8 leading-relaxed">
              Join the decentralized network of security professionals and start earning for your expertise today.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold shadow-lg shadow-primary/25"
              >
                Start Contributing →
              </Button>
              <Button size="lg" variant="outline" className="font-semibold bg-transparent">
                Read Documentation
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </section>
  )
}
