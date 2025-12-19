"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Plus, X } from "lucide-react"
import Link from "next/link"
import { useState } from "react"
import { useProofLayer } from "@/hooks/useProofLayer"
import { useCurrentAccount } from "@mysten/dapp-kit"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function CreatePoolPage() {
  const router = useRouter()
  const { createPool } = useProofLayer()
  const account = useCurrentAccount()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Form State
  const [poolName, setPoolName] = useState("")
  const [description, setDescription] = useState("")
  const [scope, setScope] = useState("")
  const [requirements, setRequirements] = useState("")
  const [timeline, setTimeline] = useState("")
  const [bounty, setBounty] = useState("")

  const [tags, setTags] = useState<string[]>([])
  const [tagInput, setTagInput] = useState("")

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()])
      setTagInput("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleCreatePool = async () => {
    if (!account) {
      toast.error("Please connect your wallet first");
      return;
    }

    const bountyAmount = parseFloat(bounty);
    if (isNaN(bountyAmount) || bountyAmount <= 0) {
      toast.error("Please enter a valid bounty amount");
      return;
    }

    try {
      setIsSubmitting(true);
      // Combine fields into description for strict contract matching, or use metadata service in prod
      const fullDescription = JSON.stringify({
        description,
        scope,
        requirements,
        timeline,
        tags
      });

      // Assuming minReward is 10% of total bounty for this simple implementation
      const minReward = bountyAmount * 0.1;

      await createPool(poolName, fullDescription, minReward, bountyAmount);
      toast.success("Pool created successfully!");
      router.push("/pools");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create pool");
    } finally {
      setIsSubmitting(false);
    }
  }

  const steps = [
    { number: 1, title: "Pool Details", description: "Basic information about your audit pool" },
    { number: 2, title: "Scope & Requirements", description: "Define what needs to be audited" },
    { number: 3, title: "Funding & Rewards", description: "Set budget and reward distribution" },
  ]

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
          <h1 className="text-5xl font-bold mb-4 text-balance">Create Contribution Pool</h1>
          <p className="text-xl text-muted-foreground text-pretty">
            Launch a verifiable security pool. Access top-tier researchers and ensure transparent auditing for your
            users.
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150">
          <div className="flex items-center justify-between relative">
            {/* Progress Line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-border -z-10">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
              />
            </div>

            {steps.map((step) => (
              <div key={step.number} className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${currentStep >= step.number
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground"
                    }`}
                >
                  {step.number}
                </div>
                <div className="mt-3 text-center max-w-[150px]">
                  <div className="text-sm font-semibold">{step.title}</div>
                  <div className="text-xs text-muted-foreground mt-1 hidden sm:block">{step.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        <div className="rounded-2xl border border-border bg-card p-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="poolName" className="text-base font-semibold">
                  Pool Name *
                </Label>
                <Input
                  id="poolName"
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                  placeholder="e.g., DeepBook V3 Security Audit"
                  className="mt-2 h-12"
                />
              </div>

              <div>
                <Label htmlFor="category" className="text-base font-semibold">
                  Category *
                </Label>
                <select id="category" className="mt-2 w-full h-12 px-3 rounded-lg border border-border bg-background">
                  <option>Select a category</option>
                  <option>DeFi Protocol</option>
                  <option>Liquid Staking</option>
                  <option>Infrastructure</option>
                  <option>DEX</option>
                  <option>GameFi</option>
                  <option>Oracle</option>
                  <option>Other</option>
                </select>
              </div>

              <div>
                <Label htmlFor="description" className="text-base font-semibold">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what needs to be audited and any specific concerns..."
                  className="mt-2 min-h-32"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Tags</Label>
                <div className="mt-2 flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())}
                    placeholder="Add tags (e.g., Move, Rust, Smart Contracts)"
                    className="h-12"
                  />
                  <Button type="button" onClick={addTag} size="lg">
                    <Plus className="h-5 w-5" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium bg-primary/10 text-primary"
                      >
                        {tag}
                        <button onClick={() => removeTag(tag)}>
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="scope" className="text-base font-semibold">
                  Audit Scope *
                </Label>
                <Textarea
                  id="scope"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="Define what should be covered in the audit: specific contracts, functions, attack vectors..."
                  className="mt-2 min-h-40"
                />
              </div>

              <div>
                <Label htmlFor="requirements" className="text-base font-semibold">
                  Requirements *
                </Label>
                <Textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  placeholder="List specific requirements: tools to use, reporting format, experience level..."
                  className="mt-2 min-h-32"
                />
              </div>

              <div>
                <Label htmlFor="timeline" className="text-base font-semibold">
                  Timeline *
                </Label>
                <Input
                  id="timeline"
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value)}
                  type="number"
                  placeholder="Number of days"
                  className="mt-2 h-12"
                />
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="bounty" className="text-base font-semibold">
                  Total Bounty Pool *
                </Label>
                <div className="mt-2 relative">
                  <Input
                    id="bounty"
                    value={bounty}
                    onChange={(e) => setBounty(e.target.value)}
                    type="number"
                    placeholder="0"
                    className="h-12 pr-16"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium">
                    SUI
                  </span>
                </div>
              </div>

              <div>
                <Label htmlFor="distribution" className="text-base font-semibold">
                  Reward Distribution
                </Label>
                <Textarea
                  id="distribution"
                  placeholder="How should rewards be distributed? (e.g., 60% for critical findings, 30% for high, 10% for medium)"
                  className="mt-2 min-h-32"
                />
              </div>

              <div className="rounded-lg border border-border bg-muted/30 p-6">
                <h4 className="font-semibold mb-2">Summary</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Platform Fee (5%)</span>
                    <span className="font-medium text-foreground">{(parseFloat(bounty || "0") * 0.05).toFixed(2)} SUI</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Contributor Rewards</span>
                    <span className="font-medium text-foreground">{bounty || "0"} SUI</span>
                  </div>
                  <div className="h-px bg-border my-3" />
                  <div className="flex justify-between text-base">
                    <span className="font-semibold text-foreground">Total Required</span>
                    <span className="font-bold text-primary">{(parseFloat(bounty || "0") * 1.05).toFixed(2)} SUI</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-border">
            <Button
              variant="outline"
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
            >
              Previous
            </Button>
            {currentStep < 3 ? (
              <Button onClick={() => setCurrentStep(Math.min(3, currentStep + 1))}>Continue</Button>
            ) : (
              <Button
                onClick={handleCreatePool}
                disabled={isSubmitting || !account}
                className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              >
                {isSubmitting ? "Creating Pool..." : "Create Pool & Fund"}
              </Button>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
