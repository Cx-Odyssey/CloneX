// premiumPrices.js - Premium Items with TON Prices

const PREMIUM_ITEMS = {
    starterBundle: {
        name: 'Starter Bundle',
        price: 0.5,
        icon: '🎁',
        description: '5000 GP + 1000 Shards + Upgrades',
        benefits: ['5,000 GP', '1,000 Shards', '+50 Max Energy', '+2 All Upgrades']
    },
    autoMiner: {
        name: 'Auto Miner',
        price: 1,
        icon: '🤖',
        description: 'Auto mine forever (persistent)',
        benefits: ['Mines automatically 24/7', 'Never expires', 'Passive income']
    },
    vipPass: {
        name: 'VIP Pass',
        price: 2,
        icon: '👑',
        description: '30 days +50% bonuses',
        benefits: ['+50% GP gains', '+50% Shard gains', '+50% XP gains', '30 days duration']
    },
    unlimitedEnergy: {
        name: 'Unlimited Energy',
        price: 1.5,
        icon: '⚡',
        description: '9999 energy (7 days)',
        benefits: ['9999 Max Energy', 'Mine unlimited', '7 days duration']
    },
    doubleXP: {
        name: 'Double XP Boost',
        price: 2,
        icon: '🔥',
        description: '2x XP forever',
        benefits: ['2x Experience Points', 'Level up faster', 'Permanent boost']
    },
    gpMegaPack: {
        name: 'GP Mega Pack',
        price: 3,
        icon: '💰',
        description: 'Instant 50,000 GP',
        benefits: ['50,000 GP instantly', 'Best value for GP', 'No waiting']
    },
    cosmicSkinPack: {
        name: 'Cosmic Skin Pack',
        price: 4,
        icon: '🎨',
        description: '10 exclusive skins',
        benefits: ['10 Unique Skins', 'Exclusive designs', 'Collector items']
    },
    legendaryShip: {
        name: 'Legendary Ship',
        price: 5,
        icon: '🛸',
        description: '+100% to all stats',
        benefits: ['Double mining speed', 'Double damage', 'Double rewards', 'Permanent']
    },
    ultimatePack: {
        name: 'Ultimate Pack',
        price: 10,
        icon: '🌟',
        description: 'Everything unlocked',
        benefits: ['All premium items', '100,000 GP', '10,000 Shards', 'Best deal']
    }
};

window.PREMIUM_ITEMS = PREMIUM_ITEMS;
