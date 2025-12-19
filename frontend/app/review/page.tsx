"use client"

import { useState, useEffect, Suspense } from 'react';
import { useCurrentAccount, useSuiClient } from '@mysten/dapp-kit';
import { useProofLayer } from '@/hooks/useProofLayer';
import { toast } from 'sonner';
import { ArrowLeft, CheckCircle, XCircle, Eye, FileText, DollarSign, Clock, User, Loader2 } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface ContributionMetadata {
  title: string;
  summary: string;
  severity: string;
  filename: string;
  fileSize: number;
  fileBlobId: string;
  fileBlobUrl: string;
  submittedAt: string;
  submittedBy: string;
}

interface Contribution {
  id: string;
  contributor: string;
  poolId: string;
  status: number; // 0=pending, 1=approved, 2=rejected
  metadataBlobId: string;
  fileBlobId: string;
  metadata?: ContributionMetadata;
  submittedAt: number;
}

function ReviewPage() {
  const searchParams = useSearchParams();
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { approveContribution, rejectContribution } = useProofLayer();

  const [poolId, setPoolId] = useState('');
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedContribution, setSelectedContribution] = useState<Contribution | null>(null);
  const [rewardAmount, setRewardAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [profileId, setProfileId] = useState('');

  useEffect(() => {
    const poolIdFromUrl = searchParams.get('poolId');
    if (poolIdFromUrl) {
      setPoolId(poolIdFromUrl);
      loadContributions(poolIdFromUrl);
    }
  }, [searchParams]);

  const loadContributions = async (id: string) => {
    setLoading(true);
    try {
      console.log('[Review] Loading contributions for pool:', id);

      // Query all Contribution objects owned by users
      // that reference this pool
      const objects = await suiClient.queryEvents({
        query: {
          MoveEventType: `${process.env.NEXT_PUBLIC_PROOFLAYER_PACKAGE_ID}::prooflayer::ContributionSubmitted`
        }
      });

      console.log('[Review] Found events:', objects);

      // Filter contributions for this pool
      const poolContributions = objects.data
        .filter((event: any) => event.parsedJson.pool_id === id)
        .map((event: any) => ({
          id: event.parsedJson.contribution_id,
          contributor: event.parsedJson.contributor,
          poolId: event.parsedJson.pool_id,
          metadataBlobId: event.parsedJson.metadata_url,
          submittedAt: event.timestampMs,
          status: 0, // We'll fetch actual status from object
        }));

      // Fetch metadata for each contribution
      const contributionsWithMetadata = await Promise.all(
        poolContributions.map(async (contrib: any) => {
          try {
            // Fetch metadata from Walrus
            const metadataUrl = `https://aggregator.walrus-testnet.walrus.space/v1/${contrib.metadataBlobId}`;
            const response = await fetch(metadataUrl);
            const metadata = await response.json();
            
            return {
              ...contrib,
              metadata,
              fileBlobId: metadata.fileBlobId,
            };
          } catch (error) {
            console.error('[Review] Failed to fetch metadata:', error);
            return contrib;
          }
        })
      );

      setContributions(contributionsWithMetadata);
      console.log('[Review] Loaded contributions:', contributionsWithMetadata);
    } catch (error) {
      console.error('[Review] Failed to load contributions:', error);
      toast.error('Failed to load contributions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (contribution: Contribution) => {
    if (!account) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!rewardAmount) {
      toast.error('Please enter reward amount');
      return;
    }

    if (!profileId) {
      toast.error('Please enter the contributor\'s Profile ID');
      return;
    }

    setProcessing(true);
    try {
      console.log('[Review] Approving contribution:', contribution.id);
      
      await approveContribution(
        poolId,
        contribution.id,
        parseFloat(rewardAmount),
        profileId
      );
      
      toast.success(`Contribution approved! ${rewardAmount} SUI sent to contributor.`);
      setSelectedContribution(null);
      setRewardAmount('');
      setProfileId('');
      loadContributions(poolId);
    } catch (error) {
      console.error('[Review] Approval failed:', error);
      toast.error('Failed to approve contribution');
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (contribution: Contribution) => {
    if (!account) {
      toast.error('Please connect your wallet');
      return;
    }

    if (!confirm('Are you sure you want to reject this contribution?')) {
      return;
    }

    setProcessing(true);
    try {
      console.log('[Review] Rejecting contribution:', contribution.id);
      
      await rejectContribution(poolId, contribution.id);
      
      toast.success('Contribution rejected.');
      setSelectedContribution(null);
      loadContributions(poolId);
    } catch (error) {
      console.error('[Review] Rejection failed:', error);
      toast.error('Failed to reject contribution');
    } finally {
      setProcessing(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadge = (status: number) => {
    switch (status) {
      case 0: return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded">Pending</span>;
      case 1: return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">Approved</span>;
      case 2: return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-semibold rounded">Rejected</span>;
      default: return null;
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      <div className="pt-24 pb-20 container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/pools"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Pools
          </Link>
          <h1 className="text-4xl font-bold mb-2">Review Contributions</h1>
          <p className="text-xl text-muted-foreground">
            Review and approve security research submissions
          </p>
        </div>

        {/* Pool ID Input */}
        <div className="rounded-2xl border border-border bg-card p-6 mb-6 shadow-sm">
          <Label htmlFor="poolId" className="text-base font-semibold mb-2">
            Pool ID
          </Label>
          <div className="flex gap-3 mt-2">
            <Input
              id="poolId"
              value={poolId}
              onChange={(e) => setPoolId(e.target.value)}
              placeholder="0x..."
              className="flex-1"
            />
            <Button
              onClick={() => loadContributions(poolId)}
              disabled={!poolId || loading}
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? 'Loading...' : 'Load'}
            </Button>
          </div>
        </div>

        {/* Contributions Grid */}
        {contributions.length > 0 && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {contributions.filter(c => c.status === 0).map((contribution) => (
              <div
                key={contribution.id}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  {contribution.metadata && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(contribution.metadata.severity)}`}>
                      {contribution.metadata.severity}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(contribution.submittedAt).toLocaleDateString()}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-lg mb-2 line-clamp-2">
                  {contribution.metadata?.title || 'Untitled Contribution'}
                </h3>

                {/* Summary */}
                <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                  {contribution.metadata?.summary || 'No summary available'}
                </p>

                {/* Contributor */}
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4 pb-4 border-b border-border">
                  <User className="w-3 h-3" />
                  <span className="font-mono truncate">{contribution.contributor}</span>
                </div>

                {/* Status and Action */}
                <div className="flex items-center justify-between">
                  {getStatusBadge(contribution.status)}
                  <Button
                    size="sm"
                    onClick={() => setSelectedContribution(contribution)}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Review
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && contributions.length === 0 && poolId && (
          <div className="rounded-2xl border border-border bg-card p-12 text-center">
            <FileText className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No Contributions Yet</h3>
            <p className="text-muted-foreground">
              There are no pending contributions for this pool.
            </p>
          </div>
        )}

        {/* Review Modal */}
        {selectedContribution && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border">
              {/* Modal Header */}
              <div className="sticky top-0 bg-background border-b border-border p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold mb-2">
                      {selectedContribution.metadata?.title || 'Untitled'}
                    </h2>
                    <div className="flex items-center gap-3 flex-wrap">
                      {selectedContribution.metadata && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getSeverityColor(selectedContribution.metadata.severity)}`}>
                          {selectedContribution.metadata.severity}
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground">
                        {new Date(selectedContribution.submittedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedContribution(null)}
                  >
                    <XCircle className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Contributor Info */}
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground mb-1">Contributor</div>
                  <div className="font-mono text-sm break-all">
                    {selectedContribution.contributor}
                  </div>
                </div>

                {/* Contribution ID */}
                <div className="rounded-lg border border-border bg-muted/50 p-4">
                  <div className="text-sm text-muted-foreground mb-1">Contribution ID</div>
                  <div className="font-mono text-sm break-all">
                    {selectedContribution.id}
                  </div>
                </div>

                {/* Summary */}
                {selectedContribution.metadata && (
                  <div>
                    <h3 className="font-semibold mb-2">Executive Summary</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedContribution.metadata.summary}
                    </p>
                  </div>
                )}

                {/* Files */}
                <div>
                  <h3 className="font-semibold mb-3">Research Files</h3>
                  <div className="space-y-2">
                    {selectedContribution.metadata && (
                      <a
                        href={selectedContribution.metadata.fileBlobUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors"
                      >
                        <FileText className="w-5 h-5 text-primary" />
                        <div className="flex-1">
                          <div className="font-medium">
                            {selectedContribution.metadata.filename}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            View Research Document
                          </div>
                        </div>
                      </a>
                    )}
                    <a
                      href={`https://aggregator.walrus-testnet.walrus.space/v1/${selectedContribution.metadataBlobId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">metadata.json</div>
                        <div className="text-xs text-muted-foreground">
                          View Metadata
                        </div>
                      </div>
                    </a>
                  </div>
                </div>

                {/* Profile ID Input */}
                <div>
                  <Label htmlFor="profileId" className="text-base font-semibold">
                    Contributor Profile ID *
                  </Label>
                  <Input
                    id="profileId"
                    value={profileId}
                    onChange={(e) => setProfileId(e.target.value)}
                    placeholder="0x..."
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    The contributor's profile ID is required to update their reputation
                  </p>
                </div>

                {/* Reward Input */}
                <div>
                  <Label htmlFor="rewardAmount" className="text-base font-semibold">
                    Reward Amount (SUI) *
                  </Label>
                  <div className="flex items-center gap-2 mt-2">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <Input
                      id="rewardAmount"
                      type="number"
                      value={rewardAmount}
                      onChange={(e) => setRewardAmount(e.target.value)}
                      placeholder="0.5"
                      step="0.1"
                      min="0"
                      className="flex-1"
                    />
                    <span className="text-muted-foreground font-semibold">SUI</span>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="sticky bottom-0 bg-muted/50 border-t border-border p-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => handleReject(selectedContribution)}
                  disabled={processing}
                  className="flex-1 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <XCircle className="mr-2 h-4 w-4" />}
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedContribution)}
                  disabled={processing || !rewardAmount || !profileId}
                  className="flex-1"
                >
                  {processing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                  {processing ? 'Processing...' : 'Approve & Pay'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </main>
  );
}

export default function ReviewPageWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReviewPage />
    </Suspense>
  );
}