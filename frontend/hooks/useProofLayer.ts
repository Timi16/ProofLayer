import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

// Retrieve the package ID from environment variables
const PACKAGE_ID = process.env.NEXT_PUBLIC_PROOFLAYER_PACKAGE_ID;
const MODULE_NAME = "prooflayer";

export function useProofLayer() {
    const suiClient = useSuiClient();
    const { mutateAsync: signAndExecuteAsync } = useSignAndExecuteTransaction();

    /**
     * Submit a contribution to a pool
     * Returns full transaction details including objectChanges
     */
    const submitContribution = async (
        poolId: string,
        metadataUrl: string,
        encryptedDataUrl: string,
        profileId: string
    ) => {
        if (!PACKAGE_ID) throw new Error("Package ID not configured");

        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::${MODULE_NAME}::submit_contribution`,
            arguments: [
                tx.object(poolId),
                tx.pure.string(metadataUrl),
                tx.pure.string(encryptedDataUrl),
                tx.object(profileId),
            ],
        });

        try {
            // Execute transaction
            const result = await signAndExecuteAsync({
                transaction: tx,
            });

            console.log("✅ Transaction executed, digest:", result.digest);

            // 🔥 Wait for transaction and get objectChanges
            const txDetails = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                    showObjectChanges: true,
                    showEffects: true,
                    showEvents: true,
                },
            });

            console.log("✅ Full transaction details with objectChanges:", txDetails);
            return txDetails;
        } catch (error) {
            console.error("❌ Transaction failed:", error);
            throw error;
        }
    };

    /**
     * Create a contributor profile
     * Returns full transaction details including objectChanges
     */
    const createProfile = async () => {
        if (!PACKAGE_ID) throw new Error("Package ID not configured");

        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::contributor_profile::create_profile`,
            arguments: [],
        });

        try {
            // Execute transaction
            const result = await signAndExecuteAsync({
                transaction: tx,
            });

            console.log("✅ Profile transaction executed, digest:", result.digest);

            // 🔥 Wait for transaction and get objectChanges
            const txDetails = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                    showObjectChanges: true,
                    showEffects: true,
                    showEvents: true,
                },
            });

            console.log("✅ Full profile details with objectChanges:", txDetails);
            return txDetails;
        } catch (error) {
            console.error("❌ Profile creation failed:", error);
            throw error;
        }
    };

    /**
     * Create a contribution pool
     * Returns full transaction details including objectChanges
     */
    const createPool = async (
        title: string,
        description: string,
        minReward: number,
        initialFundAmount: number
    ) => {
        if (!PACKAGE_ID) throw new Error("Package ID not configured");

        const tx = new Transaction();

        // Convert amounts to MIST (1 SUI = 1e9 MIST)
        const fundAmountMist = initialFundAmount * 1_000_000_000;
        const minRewardMist = minReward * 1_000_000_000;

        // Split gas coin to get initial funds
        const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(fundAmountMist)]);

        tx.moveCall({
            target: `${PACKAGE_ID}::contribution_pool::create_pool`,
            arguments: [
                tx.pure.string(title),
                tx.pure.string(description),
                tx.pure.u64(minRewardMist),
                coin,
            ],
        });

        try {
            // Execute transaction
            const result = await signAndExecuteAsync({
                transaction: tx,
            });

            console.log("✅ Pool transaction executed, digest:", result.digest);

            // 🔥 Wait for transaction and get objectChanges
            const txDetails = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                    showObjectChanges: true,
                    showEffects: true,
                    showEvents: true,
                },
            });

            console.log("✅ Full pool details with objectChanges:", txDetails);
            return txDetails;
        } catch (error) {
            console.error("❌ Pool creation failed:", error);
            throw error;
        }
    };

    /**
     * Approve a contribution and pay reward
     * Pool owner only
     */
    const approveContribution = async (
        poolId: string,
        contributionId: string,
        rewardAmount: number,
        profileId: string
    ) => {
        if (!PACKAGE_ID) throw new Error("Package ID not configured");

        const tx = new Transaction();

        // Convert reward to MIST (1 SUI = 1e9 MIST)
        const rewardAmountMist = Math.floor(rewardAmount * 1_000_000_000);

        tx.moveCall({
            target: `${PACKAGE_ID}::${MODULE_NAME}::approve_contribution`,
            arguments: [
                tx.object(poolId),
                tx.object(contributionId),
                tx.pure.u64(rewardAmountMist),
                tx.object(profileId),
            ],
        });

        try {
            const result = await signAndExecuteAsync({
                transaction: tx,
            });

            console.log("✅ Approval transaction executed, digest:", result.digest);

            const txDetails = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                    showObjectChanges: true,
                    showEffects: true,
                    showEvents: true,
                },
            });

            console.log("✅ Contribution approved:", txDetails);
            return txDetails;
        } catch (error) {
            console.error("❌ Approval failed:", error);
            throw error;
        }
    };

    /**
     * Reject a contribution
     * Pool owner only
     */
    const rejectContribution = async (
        poolId: string,
        contributionId: string
    ) => {
        if (!PACKAGE_ID) throw new Error("Package ID not configured");

        const tx = new Transaction();

        tx.moveCall({
            target: `${PACKAGE_ID}::${MODULE_NAME}::reject_contribution`,
            arguments: [
                tx.object(poolId),
                tx.object(contributionId),
            ],
        });

        try {
            const result = await signAndExecuteAsync({
                transaction: tx,
            });

            console.log("✅ Rejection transaction executed, digest:", result.digest);

            const txDetails = await suiClient.waitForTransaction({
                digest: result.digest,
                options: {
                    showObjectChanges: true,
                    showEffects: true,
                    showEvents: true,
                },
            });

            console.log("✅ Contribution rejected:", txDetails);
            return txDetails;
        } catch (error) {
            console.error("❌ Rejection failed:", error);
            throw error;
        }
    };

    return {
        submitContribution,
        createProfile,
        createPool,
        approveContribution,
        rejectContribution,
    };
}