#[test_only]
module prooflayer::prooflayer_tests {
    use sui::test_scenario::{Self as ts, Scenario};
    use sui::coin::{Self, Coin};
    use sui::sui::SUI;
    use prooflayer::prooflayer::{Self, Contribution};
    use prooflayer::contribution_pool::{Self, ContributionPool};
    use prooflayer::contributor_profile::{Self, ContributorProfile};

    // Test addresses
    const POOL_OWNER: address = @0xA;
    const CONTRIBUTOR_1: address = @0xB;
    const CONTRIBUTOR_2: address = @0xC;

    // Test constants
    const INITIAL_POOL_BALANCE: u64 = 10_000_000_000; // 10 SUI
    const MIN_REWARD: u64 = 100_000_000; // 0.1 SUI
    const REWARD_AMOUNT: u64 = 500_000_000; // 0.5 SUI

    // ======== Helper Functions ========

    fun setup_test(): Scenario {
        let mut scenario = ts::begin(POOL_OWNER);
        scenario
    }

    fun create_test_pool(scenario: &mut Scenario) {
        ts::next_tx(scenario, POOL_OWNER);
        {
            let coin = coin::mint_for_testing<SUI>(INITIAL_POOL_BALANCE, ts::ctx(scenario));
            contribution_pool::create_pool(
                b"Bug Bounty Pool",
                b"Submit security vulnerabilities and get rewarded",
                MIN_REWARD,
                coin,
                ts::ctx(scenario)
            );
        };
    }

    fun create_test_profile(scenario: &mut Scenario, user: address) {
        ts::next_tx(scenario, user);
        {
            contributor_profile::create_profile(ts::ctx(scenario));
        };
    }

    // ======== Tests ========

    #[test]
    fun test_create_pool_success() {
        let mut scenario = setup_test();

        // Create pool
        create_test_pool(&mut scenario);

        // Verify pool was created
        ts::next_tx(&mut scenario, POOL_OWNER);
        {
            let pool = ts::take_shared<ContributionPool>(&scenario);

            assert!(contribution_pool::get_pool_balance(&pool) == INITIAL_POOL_BALANCE, 0);
            assert!(contribution_pool::get_owner(&pool) == POOL_OWNER, 1);
            assert!(contribution_pool::get_min_reward(&pool) == MIN_REWARD, 2);
            assert!(contribution_pool::get_is_active(&pool), 3);

            ts::return_shared(pool);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_fund_pool() {
        let mut scenario = setup_test();
        create_test_pool(&mut scenario);

        // Fund the pool with additional SUI
        ts::next_tx(&mut scenario, POOL_OWNER);
        {
            let mut pool = ts::take_shared<ContributionPool>(&scenario);
            let additional_funds = coin::mint_for_testing<SUI>(5_000_000_000, ts::ctx(&mut scenario));

            contribution_pool::fund_pool(&mut pool, additional_funds);

            assert!(contribution_pool::get_pool_balance(&pool) == INITIAL_POOL_BALANCE + 5_000_000_000, 0);

            ts::return_shared(pool);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_create_profile() {
        let mut scenario = setup_test();

        create_test_profile(&mut scenario, CONTRIBUTOR_1);

        // Verify profile was created
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        {
            let profile = ts::take_from_sender<ContributorProfile>(&scenario);

            assert!(contributor_profile::get_owner(&profile) == CONTRIBUTOR_1, 0);
            assert!(contributor_profile::get_total_contributions(&profile) == 0, 1);
            assert!(contributor_profile::get_total_rewards_earned(&profile) == 0, 2);
            assert!(contributor_profile::get_reputation_score(&profile) == 0, 3);

            ts::return_to_sender(&scenario, profile);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_submit_contribution() {
        let mut scenario = setup_test();
        create_test_pool(&mut scenario);
        create_test_profile(&mut scenario, CONTRIBUTOR_1);

        // Get pool ID
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        let pool_id = {
            let pool = ts::take_shared<ContributionPool>(&scenario);
            let id = contribution_pool::get_id(&pool);
            ts::return_shared(pool);
            id
        };

        // Submit contribution
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        {
            let mut profile = ts::take_from_sender<ContributorProfile>(&scenario);

            prooflayer::submit_contribution(
                pool_id,
                b"walrus://metadata-blob-id-123",
                b"https://seal.encrypted.data/abc123",
                &mut profile,
                ts::ctx(&mut scenario)
            );

            ts::return_to_sender(&scenario, profile);
        };

        // Verify contribution was created
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        {
            let contribution = ts::take_from_sender<Contribution>(&scenario);

            assert!(prooflayer::get_contributor(&contribution) == CONTRIBUTOR_1, 0);
            assert!(prooflayer::get_pool_id(&contribution) == pool_id, 1);
            assert!(prooflayer::get_contribution_status(&contribution) == prooflayer::get_status_pending(), 2);
            assert!(prooflayer::get_reward_amount(&contribution) == 0, 3);

            ts::return_to_sender(&scenario, contribution);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_approve_contribution_and_verify_reward() {
        let mut scenario = setup_test();
        create_test_pool(&mut scenario);
        create_test_profile(&mut scenario, CONTRIBUTOR_1);

        // Get pool ID
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        let pool_id = {
            let pool = ts::take_shared<ContributionPool>(&scenario);
            let id = contribution_pool::get_id(&pool);
            ts::return_shared(pool);
            id
        };

        // Submit contribution
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        {
            let mut profile = ts::take_from_sender<ContributorProfile>(&scenario);
            prooflayer::submit_contribution(
                pool_id,
                b"walrus://metadata-blob-id-123",
                b"https://seal.encrypted.data/abc123",
                &mut profile,
                ts::ctx(&mut scenario)
            );
            ts::return_to_sender(&scenario, profile);
        };

        // Pool owner approves the contribution
        ts::next_tx(&mut scenario, POOL_OWNER);
        {
            let mut pool = ts::take_shared<ContributionPool>(&scenario);
            let mut contribution = ts::take_from_address<Contribution>(&scenario, CONTRIBUTOR_1);
            let mut profile = ts::take_from_address<ContributorProfile>(&scenario, CONTRIBUTOR_1);

            let initial_balance = contribution_pool::get_pool_balance(&pool);

            prooflayer::approve_contribution(
                &mut pool,
                &mut contribution,
                REWARD_AMOUNT,
                &mut profile,
                ts::ctx(&mut scenario)
            );

            // Verify pool balance decreased
            assert!(contribution_pool::get_pool_balance(&pool) == initial_balance - REWARD_AMOUNT, 0);

            // Verify contribution was approved
            assert!(prooflayer::get_contribution_status(&contribution) == prooflayer::get_status_approved(), 1);
            assert!(prooflayer::get_reward_amount(&contribution) == REWARD_AMOUNT, 2);

            // Verify profile was updated
            assert!(contributor_profile::get_total_contributions(&profile) == 1, 3);
            assert!(contributor_profile::get_total_rewards_earned(&profile) == REWARD_AMOUNT, 4);

            // Verify reputation calculation: (500_000_000 / 1_000_000) + (1 * 10) = 500 + 10 = 510
            assert!(contributor_profile::get_reputation_score(&profile) == 510, 5);

            ts::return_shared(pool);
            ts::return_to_address(CONTRIBUTOR_1, contribution);
            ts::return_to_address(CONTRIBUTOR_1, profile);
        };

        // Verify contributor received the reward
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        {
            let reward_coin = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&reward_coin) == REWARD_AMOUNT, 6);
            ts::return_to_sender(&scenario, reward_coin);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_reject_contribution() {
        let mut scenario = setup_test();
        create_test_pool(&mut scenario);
        create_test_profile(&mut scenario, CONTRIBUTOR_1);

        // Get pool ID
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        let pool_id = {
            let pool = ts::take_shared<ContributionPool>(&scenario);
            let id = contribution_pool::get_id(&pool);
            ts::return_shared(pool);
            id
        };

        // Submit contribution
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        {
            let mut profile = ts::take_from_sender<ContributorProfile>(&scenario);
            prooflayer::submit_contribution(
                pool_id,
                b"walrus://metadata-blob-id-123",
                b"https://seal.encrypted.data/abc123",
                &mut profile,
                ts::ctx(&mut scenario)
            );
            ts::return_to_sender(&scenario, profile);
        };

        // Pool owner rejects the contribution
        ts::next_tx(&mut scenario, POOL_OWNER);
        {
            let mut pool = ts::take_shared<ContributionPool>(&scenario);
            let mut contribution = ts::take_from_address<Contribution>(&scenario, CONTRIBUTOR_1);

            let initial_balance = contribution_pool::get_pool_balance(&pool);

            prooflayer::reject_contribution(
                &mut pool,
                &mut contribution,
                ts::ctx(&mut scenario)
            );

            // Verify pool balance unchanged
            assert!(contribution_pool::get_pool_balance(&pool) == initial_balance, 0);

            // Verify contribution was rejected
            assert!(prooflayer::get_contribution_status(&contribution) == prooflayer::get_status_rejected(), 1);
            assert!(prooflayer::get_reward_amount(&contribution) == 0, 2);

            ts::return_shared(pool);
            ts::return_to_address(CONTRIBUTOR_1, contribution);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_multiple_contributions_reputation() {
        let mut scenario = setup_test();
        create_test_pool(&mut scenario);
        create_test_profile(&mut scenario, CONTRIBUTOR_1);

        // Get pool ID
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        let pool_id = {
            let pool = ts::take_shared<ContributionPool>(&scenario);
            let id = contribution_pool::get_id(&pool);
            ts::return_shared(pool);
            id
        };

        // Submit and approve first contribution
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        {
            let mut profile = ts::take_from_sender<ContributorProfile>(&scenario);
            prooflayer::submit_contribution(
                pool_id,
                b"walrus://contribution-1",
                b"https://seal.encrypted.data/1",
                &mut profile,
                ts::ctx(&mut scenario)
            );
            ts::return_to_sender(&scenario, profile);
        };

        ts::next_tx(&mut scenario, POOL_OWNER);
        {
            let mut pool = ts::take_shared<ContributionPool>(&scenario);
            let mut contribution = ts::take_from_address<Contribution>(&scenario, CONTRIBUTOR_1);
            let mut profile = ts::take_from_address<ContributorProfile>(&scenario, CONTRIBUTOR_1);

            prooflayer::approve_contribution(
                &mut pool,
                &mut contribution,
                REWARD_AMOUNT,
                &mut profile,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(pool);
            ts::return_to_address(CONTRIBUTOR_1, contribution);
            ts::return_to_address(CONTRIBUTOR_1, profile);
        };

        // Submit and approve second contribution
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        {
            let mut profile = ts::take_from_address<ContributorProfile>(&scenario, CONTRIBUTOR_1);
            prooflayer::submit_contribution(
                pool_id,
                b"walrus://contribution-2",
                b"https://seal.encrypted.data/2",
                &mut profile,
                ts::ctx(&mut scenario)
            );
            ts::return_to_address(CONTRIBUTOR_1, profile);
        };

        ts::next_tx(&mut scenario, POOL_OWNER);
        {
            let mut pool = ts::take_shared<ContributionPool>(&scenario);
            let mut contribution = ts::take_from_address<Contribution>(&scenario, CONTRIBUTOR_1);
            let mut profile = ts::take_from_address<ContributorProfile>(&scenario, CONTRIBUTOR_1);

            prooflayer::approve_contribution(
                &mut pool,
                &mut contribution,
                REWARD_AMOUNT,
                &mut profile,
                ts::ctx(&mut scenario)
            );

            // Verify profile stats after 2 contributions
            assert!(contributor_profile::get_total_contributions(&profile) == 2, 0);
            assert!(contributor_profile::get_total_rewards_earned(&profile) == REWARD_AMOUNT * 2, 1);

            // Reputation: (1_000_000_000 / 1_000_000) + (2 * 10) = 1000 + 20 = 1020
            assert!(contributor_profile::get_reputation_score(&profile) == 1020, 2);

            ts::return_shared(pool);
            ts::return_to_address(CONTRIBUTOR_1, contribution);
            ts::return_to_address(CONTRIBUTOR_1, profile);
        };

        ts::end(scenario);
    }

    #[test]
    fun test_close_pool() {
        let mut scenario = setup_test();
        create_test_pool(&mut scenario);

        // Close the pool
        ts::next_tx(&mut scenario, POOL_OWNER);
        {
            let mut pool = ts::take_shared<ContributionPool>(&scenario);

            contribution_pool::close_pool(&mut pool, ts::ctx(&mut scenario));

            assert!(!contribution_pool::get_is_active(&pool), 0);

            ts::return_shared(pool);
        };

        // Verify owner received remaining balance
        ts::next_tx(&mut scenario, POOL_OWNER);
        {
            let refund = ts::take_from_sender<Coin<SUI>>(&scenario);
            assert!(coin::value(&refund) == INITIAL_POOL_BALANCE, 1);
            ts::return_to_sender(&scenario, refund);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 202)]
    fun test_insufficient_balance_error() {
        let mut scenario = setup_test();
        create_test_pool(&mut scenario);
        create_test_profile(&mut scenario, CONTRIBUTOR_1);

        // Get pool ID
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        let pool_id = {
            let pool = ts::take_shared<ContributionPool>(&scenario);
            let id = contribution_pool::get_id(&pool);
            ts::return_shared(pool);
            id
        };

        // Submit contribution
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        {
            let mut profile = ts::take_from_sender<ContributorProfile>(&scenario);
            prooflayer::submit_contribution(
                pool_id,
                b"walrus://metadata",
                b"https://seal.encrypted.data",
                &mut profile,
                ts::ctx(&mut scenario)
            );
            ts::return_to_sender(&scenario, profile);
        };

        // Try to approve with reward higher than pool balance
        ts::next_tx(&mut scenario, POOL_OWNER);
        {
            let mut pool = ts::take_shared<ContributionPool>(&scenario);
            let mut contribution = ts::take_from_address<Contribution>(&scenario, CONTRIBUTOR_1);
            let mut profile = ts::take_from_address<ContributorProfile>(&scenario, CONTRIBUTOR_1);

            prooflayer::approve_contribution(
                &mut pool,
                &mut contribution,
                INITIAL_POOL_BALANCE + 1, // More than pool has
                &mut profile,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(pool);
            ts::return_to_address(CONTRIBUTOR_1, contribution);
            ts::return_to_address(CONTRIBUTOR_1, profile);
        };

        ts::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = 200)]
    fun test_non_owner_cannot_approve() {
        let mut scenario = setup_test();
        create_test_pool(&mut scenario);
        create_test_profile(&mut scenario, CONTRIBUTOR_1);

        // Get pool ID
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        let pool_id = {
            let pool = ts::take_shared<ContributionPool>(&scenario);
            let id = contribution_pool::get_id(&pool);
            ts::return_shared(pool);
            id
        };

        // Submit contribution
        ts::next_tx(&mut scenario, CONTRIBUTOR_1);
        {
            let mut profile = ts::take_from_sender<ContributorProfile>(&scenario);
            prooflayer::submit_contribution(
                pool_id,
                b"walrus://metadata",
                b"https://seal.encrypted.data",
                &mut profile,
                ts::ctx(&mut scenario)
            );
            ts::return_to_sender(&scenario, profile);
        };

        // Try to approve as non-owner (CONTRIBUTOR_2)
        ts::next_tx(&mut scenario, CONTRIBUTOR_2);
        {
            let mut pool = ts::take_shared<ContributionPool>(&scenario);
            let mut contribution = ts::take_from_address<Contribution>(&scenario, CONTRIBUTOR_1);
            let mut profile = ts::take_from_address<ContributorProfile>(&scenario, CONTRIBUTOR_1);

            prooflayer::approve_contribution(
                &mut pool,
                &mut contribution,
                REWARD_AMOUNT,
                &mut profile,
                ts::ctx(&mut scenario)
            );

            ts::return_shared(pool);
            ts::return_to_address(CONTRIBUTOR_1, contribution);
            ts::return_to_address(CONTRIBUTOR_1, profile);
        };

        ts::end(scenario);
    }
}
