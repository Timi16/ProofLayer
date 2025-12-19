"use client"

import { ConnectButton } from "@mysten/dapp-kit";

import { Button } from "@/components/ui/button"
import { ShieldCheck } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Header() {
  const pathname = usePathname()
  const isLandingPage = pathname === "/"

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <ShieldCheck className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">ProofLayer</span>
          </Link>

          {!isLandingPage && (
            <nav className="hidden md:flex items-center gap-8">
              <Link
                href="/pools"
                className={`text-sm transition-colors ${pathname === "/pools" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Pools
              </Link>
              <Link
                href="/submit"
                className={`text-sm transition-colors ${pathname === "/submit" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Research
              </Link>
              <Link
                href="/profile"
                className={`text-sm transition-colors ${pathname === "/profile" ? "text-primary font-semibold" : "text-muted-foreground hover:text-foreground"
                  }`}
              >
                Profile
              </Link>
              <a
                href="Review"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Review
              </a>
            </nav>
          )}

          {isLandingPage ? (
            <Link href="/pools">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-semibold">Launch App</Button>
            </Link>
          ) : (
            <ConnectButton />
          )}
        </div>
      </div>
    </header>
  )
}
