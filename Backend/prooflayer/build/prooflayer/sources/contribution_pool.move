module prooflayer::contribution_pool {
    use sui::object::{Self, UID, ID};
    use sui::tx_context::{Self, TxContext};
    use sui::transfer;
    use sui::coin::{Self, Coin};
    use sui::balance::{Self, Balance};
    use sui::sui::SUI;
    use std::string::{Self, String};

    // ======== Error Codes ========
    const E_NOT_POOL_OWNER: u64 = 200;
    const E_POOL_NOT_ACTIVE: u64 = 201;
    const E_INSUFFICIENT_POOL_BALANCE: u64 = 202;
    const E_POOL_ALREADY_CLOSED: u64 = 203;
    const E_REWARD_BELOW_MINIMUM: u64 = 204;

    // ======== Structs ========

    /// ContributionPool manages a pool of funds for rewarding security contributions
    public struct ContributionPool has key, store {
        id: UID,
        owner: address,
        title: String,
        description: String,
        balance: Balance<SUI>,
        is_active: bool,
        min_reward: u64,
        created_at: u64,
    }

    // ======== Events ========

    public struct PoolCreated has copy, drop {
        pool_id: ID,
        owner: address,
        title: String,
        initial_balance: u64,
        min_reward: u64,
    }

    public struct PoolFunded has copy, drop {
        pool_id: ID,
        amount: u64,
        new_balance: u64,
    }

    public struct PoolClosed has copy, drop {
        pool_id: ID,
        final_balance: u64,
    }

    public struct RewardPaid has copy, drop {
        pool_id: ID,
        contribution_id: ID,
        recipient: address,
        amount: u64,
        remaining_balance: u64,
    }

    // ======== Public Functions ========

    /// Create a new contribution pool with initial funding
    public entry fun create_pool(
        title: vector<u8>,
        description: vector<u8>,
        min_reward: u64,
        initial_funds: Coin<SUI>,
        ctx: &mut TxContext
    ) {
        let initial_balance = coin::value(&initial_funds);

        let pool = ContributionPool {
            id: object::new(ctx),
            owner: tx_context::sender(ctx),
            title: string::utf8(title),
            description: string::utf8(description),
            balance: coin::into_balance(initial_funds),
            is_active: true,
            min_reward,
            created_at: tx_context::epoch(ctx),
        };

        let pool_id = object::uid_to_inner(&pool.id);

        sui::event::emit(PoolCreated {
            pool_id,
            owner: tx_context::sender(ctx),
            title: pool.title,
            initial_balance,
            min_reward,
        });

        transfer::share_object(pool);
    }

    /// Add funds to an existing pool
    public entry fun fund_pool(
        pool: &mut ContributionPool,
        funds: Coin<SUI>,
    ) {
        let amount = coin::value(&funds);
        balance::join(&mut pool.balance, coin::into_balance(funds));

        sui::event::emit(PoolFunded {
            pool_id: object::uid_to_inner(&pool.id),
            amount,
            new_balance: balance::value(&pool.balance),
        });
    }

    /// Close the pool and return remaining funds to owner
    public entry fun close_pool(
        pool: &mut ContributionPool,
        ctx: &mut TxContext
    ) {
        assert!(pool.owner == tx_context::sender(ctx), E_NOT_POOL_OWNER);
        assert!(pool.is_active, E_POOL_ALREADY_CLOSED);

        pool.is_active = false;

        let final_balance = balance::value(&pool.balance);

        sui::event::emit(PoolClosed {
            pool_id: object::uid_to_inner(&pool.id),
            final_balance,
        });

        // Transfer remaining balance to owner if any
        if (final_balance > 0) {
            let remaining = balance::withdraw_all(&mut pool.balance);
            transfer::public_transfer(coin::from_balance(remaining, ctx), pool.owner);
        };
    }

    // ======== Package-only Functions ========

    /// Pay reward to contributor (called from prooflayer module)
    public(package) fun pay_reward(
        pool: &mut ContributionPool,
        contribution_id: ID,
        recipient: address,
        amount: u64,
        ctx: &mut TxContext
    ) {
        assert!(pool.is_active, E_POOL_NOT_ACTIVE);
        assert!(amount >= pool.min_reward, E_REWARD_BELOW_MINIMUM);
        assert!(balance::value(&pool.balance) >= amount, E_INSUFFICIENT_POOL_BALANCE);

        let reward = balance::split(&mut pool.balance, amount);
        transfer::public_transfer(coin::from_balance(reward, ctx), recipient);

        sui::event::emit(RewardPaid {
            pool_id: object::uid_to_inner(&pool.id),
            contribution_id,
            recipient,
            amount,
            remaining_balance: balance::value(&pool.balance),
        });
    }

    /// Verify the caller is the pool owner
    public(package) fun assert_is_owner(pool: &ContributionPool, sender: address) {
        assert!(pool.owner == sender, E_NOT_POOL_OWNER);
    }

    /// Check if pool is active
    public(package) fun is_active(pool: &ContributionPool): bool {
        pool.is_active
    }

    /// Get pool ID from the pool object
    public(package) fun get_id(pool: &ContributionPool): ID {
        object::uid_to_inner(&pool.id)
    }

    // ======== View Functions ========

    /// Get the current balance of the pool
    public fun get_pool_balance(pool: &ContributionPool): u64 {
        balance::value(&pool.balance)
    }

    /// Get pool owner
    public fun get_owner(pool: &ContributionPool): address {
        pool.owner
    }

    /// Get minimum reward amount
    public fun get_min_reward(pool: &ContributionPool): u64 {
        pool.min_reward
    }

    /// Check if pool is accepting contributions
    public fun get_is_active(pool: &ContributionPool): bool {
        pool.is_active
    }

    /// Get pool title
    public fun get_title(pool: &ContributionPool): String {
        pool.title
    }

    /// Get pool description
    public fun get_description(pool: &ContributionPool): String {
        pool.description
    }

    // ======== Test Only Functions ========

    #[test_only]
    public fun init_for_testing(ctx: &mut TxContext) {
        // Empty init for testing
    }
}
