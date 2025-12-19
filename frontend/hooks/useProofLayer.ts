import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit";
import { Transaction } from "@mysten/sui/transactions";

// Retrieve the package ID from environment variables
const PACKAGE_ID = process.env.NEXT_PUBLIC_PROOFLAYER_PACKAGE_ID;
const MODULE_NAME = "prooflayer";

export function useProofLayer() {
    const suiClient = useSuiClient();
    const { mutate: signAndExecute } = useSignAndExecuteTransaction();

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
                tx.pure.string(metadataUrl), // Note: contract expects vector<u8>, check if string works or needs conversion
                tx.pure.string(encryptedDataUrl),
                tx.object(profileId),
            ],
        });

        return new Promise((resolve, reject) => {
            signAndExecute(
                {
                    transaction: tx,
                },
                {
                    onSuccess: (result) => {
                        console.log("Transaction successful:", result);
                        resolve(result);
                    },
                    onError: (error) => {
                        console.error("Transaction failed:", error);
                        reject(error);
                    },
                }
            );
        });
    };

    return {
        submitContribution,
        createProfile: async () => {
            if (!PACKAGE_ID) throw new Error("Package ID not configured");

            const tx = new Transaction();

            tx.moveCall({
                target: `${PACKAGE_ID}::contributor_profile::create_profile`,
                arguments: [],
            });

            return new Promise((resolve, reject) => {
                signAndExecute(
                    {
                        transaction: tx,
                    },
                    {
                        onSuccess: (result) => {
                            console.log("Profile created:", result);
                            resolve(result);
                        },
                        onError: (error) => {
                            console.error("Profile creation failed:", error);
                            reject(error);
                        },
                    }
                );
            });
        },
        createPool: async (title: string, description: string, minReward: number, initialFundAmount: number) => {
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
                    coin
                ]
            });

            return new Promise((resolve, reject) => {
                signAndExecute(
                    {
                        transaction: tx,
                    },
                    {
                        onSuccess: (result) => {
                            console.log("Pool created:", result);
                            resolve(result);
                        },
                        onError: (error) => {
                            console.error("Pool creation failed:", error);
                            reject(error);
                        },
                    }
                );
            });
        }
    };
}
