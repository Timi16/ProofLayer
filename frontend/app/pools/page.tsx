"use client"

import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useSuiClient, useCurrentAccount } from "@mysten/dapp-kit"

const PACKAGE_ID = process.env.NEXT_PUBLIC_PROOFLAYER_PACKAGE_ID;

interface Pool {
  id: string;
  title: string;
  category: string;
  description: string;
  tags: string[];
  raised: string;
  goal: string;
  progress: number;
  status: string;
  objectId: string;
}

export default function PoolsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("All Pools")
  const [pools, setPools] = useState<Pool[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const suiClient = useSuiClient()
  const account = useCurrentAccount()

  // Fetch real pools from blockchain
  useEffect(() => {
    const fetchPools = async () => {
      if (!PACKAGE_ID) {
        console.error("Package ID not configured");
        setIsLoading(false);
        return;
      }

      try {
        console.log("[Pools] Fetching pools from blockchain...");
        console.log("[Pools] Package ID:", PACKAGE_ID);

        // Query PoolCreated events to get all pool IDs
        const poolEvents = await suiClient.queryEvents({
          query: {
            MoveEventType: `${PACKAGE_ID}::contribution_pool::PoolCreated`
          },
          limit: 50,
        });

        console.log("[Pools] Found pool events:", poolEvents);

        // Extract pool IDs from events
        const poolIds = poolEvents.data.map((event: any) => {
          console.log("[Pools] Event parsed JSON:", event.parsedJson);
          return event.parsedJson?.pool_id;
        }).filter(Boolean);

        console.log("[Pools] Pool IDs from events:", poolIds);

        if (poolIds.length === 0) {
          console.log("[Pools] No pools found");
          setPools([]);
          setIsLoading(false);
          return;
        }

        // Fetch full pool objects using multiGetObjects for efficiency
        const poolDataResults = await suiClient.multiGetObjects({
          ids: poolIds,
          options: {
            showContent: true,
            showType: true,
          }
        });

        console.log("[Pools] Pool data results:", poolDataResults);

        // Parse pools from the fetched objects
        const parsedPools: Pool[] = poolDataResults
          .filter((result: any) => result.data) // Only include successful fetches
          .map((result: any, index: number) => {
            const content = result.data?.content?.fields;

            // Try to parse description JSON
            let parsedDesc: any = {};
            try {
              if (content?.description) {
                parsedDesc = JSON.parse(content.description);
              }
            } catch (e) {
              parsedDesc = { description: content?.description || "No description" };
            }

            const balance = content?.balance || 0;
            const minReward = content?.min_reward_per_contribution || 1;

            return {
              id: result.data?.objectId || `pool-${index}`,
              objectId: result.data?.objectId || "",
              title: content?.title || `Pool ${index + 1}`,
              category: "USER CREATED",
              description: parsedDesc.description || content?.description || "No description",
              tags: parsedDesc.tags || ["Move", "Security"],
              raised: (Number(balance) / 1_000_000_000).toFixed(2),
              goal: ((Number(balance) / 1_000_000_000) * 1.2).toFixed(2), // Estimate
              progress: 80,
              status: "ACTIVE",
            };
          });

        console.log("[Pools] Parsed pools:", parsedPools);
        setPools(parsedPools);
        setIsLoading(false);
      } catch (error) {
        console.error("[Pools] Error fetching pools:", error);
        setIsLoading(false);
      }
    };

    fetchPools();
  }, [suiClient, PACKAGE_ID]);

  const filters = ["All Pools", "Active", "Auditing", "Completed"]

  const filteredPools = pools.filter((pool) => {
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

  const totalValueLocked = pools.reduce((sum, pool) => sum + parseFloat(pool.raised), 0).toFixed(2);
  const activeAudits = pools.filter(p => p.status === "ACTIVE").length.toString()

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

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-20">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
            <p className="mt-4 text-muted-foreground">Loading pools from blockchain...</p>
          </div>
        )}

        {/* Pools Grid */}
        {!isLoading && (
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
                    <span className="text-muted-foreground">Pool Balance</span>
                    <span className="text-muted-foreground">Object ID</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold mb-2">
                    <span>{pool.raised} SUI</span>
                    <span className="text-xs text-muted-foreground">{pool.objectId.slice(0, 6)}...{pool.objectId.slice(-4)}</span>
                  </div>
                  <div className="mt-3 p-2 bg-muted/50 rounded-md">
                    <div className="text-xs text-muted-foreground mb-1">Pool ID (for submissions):</div>
                    <code className="text-xs font-mono break-all">{pool.objectId}</code>
                  </div>
                </div>

                {/* Action Button */}
                <Link href={`/submit?poolId=${pool.objectId}`}>
                  <Button
                    className="w-full bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
                    variant="outline"
                  >
                    Submit Contribution
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
        )}

        {!isLoading && filteredPools.length === 0 && (
          <div className="text-center py-20">
            <p className="text-xl text-muted-foreground mb-4">No pools found.</p>
            <p className="text-sm text-muted-foreground mb-6">Create your first pool to get started!</p>
            <Link href="/pools/create">
              <Button size="lg" className="bg-primary text-primary-foreground">
                <Plus className="h-5 w-5 mr-2" />
                Create Pool
              </Button>
            </Link>
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
