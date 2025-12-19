module prooflayer::prooflayer {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use std::string::{Self, String};
    use std::option::{Self, Option};
    use prooflayer::contribution_pool::{Self, ContributionPool};
    use prooflayer::contributor_profile::{Self, ContributorProfile};

    // ======== Error Codes ========
    const E_NOT_POOL_OWNER: u64 = 0;
    const E_INVALID_STATUS_TRANSITION: u64 = 1;
    const E_CONTRIBUTION_ALREADY_PROCESSED: u64 = 2;
    const E_POOL_NOT_ACTIVE: u64 = 3;
    const E_NOT_PENDING_STATUS: u64 = 4;
    const E_POOL_MISMATCH: u64 = 5;

    // ======== Constants ========
    const STATUS_PENDING: u8 = 0;
    const STATUS_APPROVED: u8 = 1;
    const STATUS_REJECTED: u8 = 2;

    // ======== Structs ========

    /// Contribution represents a security/research contribution submission
    /// Non-transferable (no 'store' ability) to prevent secondary markets
    public struct Contribution has key {
        id: UID,
        contributor: address,
        pool_id: ID,
        metadata_url: String,         // Walrus blob ID with contribution metadata
        encrypted_data_url: String,   // Seal encrypted data URL
        status: u8,                   // 0=pending, 1=approved, 2=rejected
        reward_amount: u64,
        submitted_at: u64,
        approved_at: Option<u64>,
    }

    // ======== Events ========

    public struct ContributionSubmitted has copy, drop {
        contribution_id: ID,
        contributor: address,
        pool_id: ID,
        metadata_url: String,
        submitted_at: u64,
    }

    public struct ContributionApproved has copy, drop {
        contribution_id: ID,
        contributor: address,
        pool_id: ID,
        reward_amount: u64,
        approved_at: u64,
    }

    public struct ContributionRejected has copy, drop {
        contribution_id: ID,
        pool_id: ID,
        rejected_at: u64,
    }

    // ======== Public Entry Functions ========

    /// Submit a new contribution to a pool
    public entry fun submit_contribution(
        pool_id: ID,
        metadata_url: vector<u8>,
        encrypted_data_url: vector<u8>,
        profile: &mut ContributorProfile,
        ctx: &mut TxContext
    ) {
        let contributor = tx_context::sender(ctx);

        // Verify the profile belongs to the sender
        assert!(contributor_profile::get_owner(profile) == contributor, E_NOT_POOL_OWNER);

        let contribution = Contribution {
            id: object::new(ctx),
            contributor,
            pool_id,
            metadata_url: string::utf8(metadata_url),
            encrypted_data_url: string::utf8(encrypted_data_url),
            status: STATUS_PENDING,
            reward_amount: 0,
            submitted_at: tx_context::epoch(ctx),
            approved_at: option::none(),
        };

        let contribution_id = object::uid_to_inner(&contribution.id);

        sui::event::emit(ContributionSubmitted {
            contribution_id,
            contributor,
            pool_id,
            metadata_url: contribution.metadata_url,
            submitted_at: contribution.submitted_at,
        });

        // Transfer contribution to the contributor (they own it)
        transfer::transfer(contribution, contributor);
    }

    /// Approve a contribution and pay the reward (pool owner only)
    public entry fun approve_contribution(
        pool: &mut ContributionPool,
        contribution: &mut Contribution,
        reward_amount: u64,
        profile: &mut ContributorProfile,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Verify pool owner is calling this
        contribution_pool::assert_is_owner(pool, sender);

        // Verify pool is active
        assert!(contribution_pool::is_active(pool), E_POOL_NOT_ACTIVE);

        // Verify contribution belongs to this pool
        assert!(contribution.pool_id == contribution_pool::get_id(pool), E_POOL_MISMATCH);

        // Verify contribution is in pending status
        assert!(contribution.status == STATUS_PENDING, E_NOT_PENDING_STATUS);

        // Verify profile belongs to the contributor
        assert!(contributor_profile::get_owner(profile) == contribution.contributor, E_NOT_POOL_OWNER);

        // Update contribution status
        contribution.status = STATUS_APPROVED;
        contribution.reward_amount = reward_amount;
        contribution.approved_at = option::some(tx_context::epoch(ctx));

        let contribution_id = object::uid_to_inner(&contribution.id);

        // Pay reward from pool to contributor
        contribution_pool::pay_reward(
            pool,
            contribution_id,
            contribution.contributor,
            reward_amount,
            ctx
        );

        // Update contributor profile
        contributor_profile::add_contribution(profile, contribution_id, reward_amount);

        sui::event::emit(ContributionApproved {
            contribution_id,
            contributor: contribution.contributor,
            pool_id: contribution.pool_id,
            reward_amount,
            approved_at: *option::borrow(&contribution.approved_at),
        });
    }

    /// Reject a contribution (pool owner only)
    public entry fun reject_contribution(
        pool: &mut ContributionPool,
        contribution: &mut Contribution,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);

        // Verify pool owner is calling this
        contribution_pool::assert_is_owner(pool, sender);

        // Verify contribution belongs to this pool
        assert!(contribution.pool_id == contribution_pool::get_id(pool), E_POOL_MISMATCH);

        // Verify contribution is in pending status
        assert!(contribution.status == STATUS_PENDING, E_NOT_PENDING_STATUS);

        // Update contribution status
        contribution.status = STATUS_REJECTED;

        sui::event::emit(ContributionRejected {
            contribution_id: object::uid_to_inner(&contribution.id),
            pool_id: contribution.pool_id,
            rejected_at: tx_context::epoch(ctx),
        });
    }

    // ======== View Functions ========

    /// Get the contribution status
    public fun get_contribution_status(contribution: &Contribution): u8 {
        contribution.status
    }

    /// Get contribution metadata URL
    public fun get_metadata_url(contribution: &Contribution): String {
        contribution.metadata_url
    }

    /// Get contribution encrypted data URL
    public fun get_encrypted_data_url(contribution: &Contribution): String {
        contribution.encrypted_data_url
    }

    /// Get contribution reward amount
    public fun get_reward_amount(contribution: &Contribution): u64 {
        contribution.reward_amount
    }

    /// Get contributor address
    public fun get_contributor(contribution: &Contribution): address {
        contribution.contributor
    }

    /// Get pool ID
    public fun get_pool_id(contribution: &Contribution): ID {
        contribution.pool_id
    }

    /// Get submitted timestamp
    public fun get_submitted_at(contribution: &Contribution): u64 {
        contribution.submitted_at
    }

    /// Get approved timestamp (if approved)
    public fun get_approved_at(contribution: &Contribution): &Option<u64> {
        &contribution.approved_at
    }

    /// Check if contribution is pending
    public fun is_pending(contribution: &Contribution): bool {
        contribution.status == STATUS_PENDING
    }

    /// Check if contribution is approved
    public fun is_approved(contribution: &Contribution): bool {
        contribution.status == STATUS_APPROVED
    }

    /// Check if contribution is rejected
    public fun is_rejected(contribution: &Contribution): bool {
        contribution.status == STATUS_REJECTED
    }

    // ======== Test Only Functions ========

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        // Empty init for testing
    }

    #[test_only]
    public fun get_status_pending(): u8 { STATUS_PENDING }

    #[test_only]
    public fun get_status_approved(): u8 { STATUS_APPROVED }

    #[test_only]
    public fun get_status_rejected(): u8 { STATUS_REJECTED }
}
