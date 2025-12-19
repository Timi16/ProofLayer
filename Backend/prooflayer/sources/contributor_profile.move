module prooflayer::contributor_profile {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::vector;

    // ======== Error Codes ========
    const E_NOT_PROFILE_OWNER: u64 = 100;
    const E_INVALID_REPUTATION_CALCULATION: u64 = 101;

    // ======== Structs ========

    /// ContributorProfile tracks a user's contributions, rewards, and reputation
    public struct ContributorProfile has key {
        id: UID,
        owner: address,
        total_contributions: u64,
        total_rewards_earned: u64,
        reputation_score: u64,
        contribution_ids: vector<ID>,
    }

    // ======== Events ========

    public struct ProfileCreated has copy, drop {
        profile_id: ID,
        owner: address,
    }

    public struct ProfileUpdated has copy, drop {
        profile_id: ID,
        total_contributions: u64,
        total_rewards_earned: u64,
        reputation_score: u64,
    }

    // ======== Public Functions ========

    /// Create a new contributor profile
    public entry fun create_profile(ctx: &mut TxContext) {
        let profile = ContributorProfile {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            total_contributions: 0,
            total_rewards_earned: 0,
            reputation_score: 0,
            contribution_ids: vector::empty<ID>(),
        };

        let profile_id = object::uid_to_inner(&profile.id);

        sui::event::emit(ProfileCreated {
            profile_id,
            owner: tx_context::sender(ctx),
        });

        transfer::transfer(profile, tx_context::sender(ctx));
    }

    /// Add a contribution to the profile and update reputation
    public(package) fun add_contribution(
        profile: &mut ContributorProfile,
        contribution_id: ID,
        reward_amount: u64,
    ) {
        profile.total_contributions = profile.total_contributions + 1;
        profile.total_rewards_earned = profile.total_rewards_earned + reward_amount;
        vector::push_back(&mut profile.contribution_ids, contribution_id);

        // Calculate reputation: (total_rewards / 1_000_000) + (contributions * 10)
        profile.reputation_score = (profile.total_rewards_earned / 1_000_000) + (profile.total_contributions * 10);

        sui::event::emit(ProfileUpdated {
            profile_id: object::uid_to_inner(&profile.id),
            total_contributions: profile.total_contributions,
            total_rewards_earned: profile.total_rewards_earned,
            reputation_score: profile.reputation_score,
        });
    }

    // ======== View Functions ========

    /// Get the reputation score
    public fun get_reputation_score(profile: &ContributorProfile): u64 {
        profile.reputation_score
    }

    /// Get total contributions count
    public fun get_total_contributions(profile: &ContributorProfile): u64 {
        profile.total_contributions
    }

    /// Get total rewards earned
    public fun get_total_rewards_earned(profile: &ContributorProfile): u64 {
        profile.total_rewards_earned
    }

    /// Get profile owner
    public fun get_owner(profile: &ContributorProfile): address {
        profile.owner
    }

    /// Get all contribution IDs
    public fun get_contribution_ids(profile: &ContributorProfile): &vector<ID> {
        &profile.contribution_ids
    }

    // ======== Test Only Functions ========

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        // Empty init for testing
    }
}
