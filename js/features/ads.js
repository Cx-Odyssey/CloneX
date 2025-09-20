// Monetag Ads Integration Module for CX Odyssey
class AdsManager {
    constructor() {
        this.zoneId = GAME_CONFIG.MONETAG.ZONE_ID;
        this.sdkFunction = GAME_CONFIG.MONETAG.SDK_FUNCTION;
        this.isSDKLoaded = false;
        this.adCallbacks = new Map();
        this.cooldownTimers = new Map();
        this.adAttempts = new Map();
        this.maxAttempts = 3;
        
        this.checkSDKAvailability();
        this.setupInAppAds();
    }

    checkSDKAvailability() {
        // Check if Monetag SDK is loaded
        if (typeof window[this.sdkFunction] === 'function') {
            this.isSDKLoaded = true;
            console.log('Monetag SDK loaded successfully');
        } else {
            console.warn('Monetag SDK not loaded, ads will be simulated');
            this.isSDKLoaded = false;
        }
    }

    // Set up automatic in-app interstitial ads
    setupInAppAds() {
        if (!this.isSDKLoaded) return;

        try {
            const settings = GAME_CONFIG.MONETAG.IN_APP_SETTINGS;
            
            window[this.sdkFunction]({
                type: 'inApp',
                inAppSettings: {
                    frequency: settings.frequency,
                    capping: settings.capping,
                    interval: settings.interval,
                    timeout: settings.timeout,
                    everyPage: settings.everyPage
                }
            });
            
            console.log('In-app ads initialized with settings:', settings);
        } catch (error) {
            console.error('Failed to setup in-app ads:', error);
        }
    }

    // Show rewarded interstitial ad
    async showRewardedAd(rewardType, rewardAmount) {
        const adId = `reward_${rewardType}_${Date.now()}`;
        
        if (!this.canShowAd(rewardType)) {
            throw new Error('Ad on cooldown. Please wait before watching another ad.');
        }

        if (!this.isSDKLoaded) {
            return this.simulateAd(adId, rewardType, rewardAmount);
        }

        try {
            this.incrementAttempt(rewardType);
            
            // Track ad request
            if (window.apiManager) {
                await window.apiManager.trackEvent('ad_requested', {
                    rewardType,
                    rewardAmount,
                    adId
                });
            }

            // Show the rewarded interstitial ad
            await window[this.sdkFunction]();
            
            // If we reach here, the ad was completed successfully
            this.setCooldown(rewardType, 60000); // 1 minute cooldown
            this.resetAttempts(rewardType);
            
            // Track successful ad view
            if (window.apiManager) {
                await window.apiManager.trackEvent('ad_completed', {
                    rewardType,
                    rewardAmount,
                    adId
                });
            }

            return {
                success: true,
                adId,
                reward: {
                    type: rewardType,
                    amount: rewardAmount
                }
            };

        } catch (error) {
            console.error('Rewarded ad failed:', error);
            
            // Track ad failure
            if (window.apiManager) {
                await window.apiManager.trackEvent('ad_failed', {
                    rewardType,
                    rewardAmount,
                    adId,
                    error: error.message
                });
            }

            // Check if we should retry or give up
            if (this.getAttempts(rewardType) < this.maxAttempts) {
                throw new Error('Ad failed to load. Please try again.');
            } else {
                // Give reward anyway after max attempts (user-friendly approach)
                this.resetAttempts(rewardType);
                this.setCooldown(rewardType, 30000); // Shorter cooldown after failure
                
                return {
                    success: true,
                    adId,
                    reward: {
                        type: rewardType,
                        amount: rewardAmount
                    },
                    fallback: true
                };
            }
        }
    }

    // Show popup rewarded ad
    async showRewardedPopup(rewardType, rewardAmount) {
        const adId = `popup_${rewardType}_${Date.now()}`;
        
        if (!this.canShowAd(rewardType)) {
            throw new Error('Ad on cooldown. Please wait before watching another ad.');
        }

        if (!this.isSDKLoaded) {
            return this.simulateAd(adId, rewardType, rewardAmount);
        }

        try {
            this.incrementAttempt(rewardType);
            
            // Track ad request
            if (window.apiManager) {
                await window.apiManager.trackEvent('ad_popup_requested', {
                    rewardType,
                    rewardAmount,
                    adId
                });
            }

            // Show the rewarded popup ad
            await window[this.sdkFunction]('pop');
            
            // If we reach here, the ad was completed successfully
            this.setCooldown(rewardType, 60000); // 1 minute cooldown
            this.resetAttempts(rewardType);
            
            // Track successful ad view
            if (window.apiManager) {
                await window.apiManager.trackEvent('ad_popup_completed', {
                    rewardType,
                    rewardAmount,
                    adId
                });
            }

            return {
                success: true,
                adId,
                reward: {
                    type: rewardType,
                    amount: rewardAmount
                }
            };

        } catch (error) {
            console.error('Popup ad failed:', error);
            
            // Track ad failure
            if (window.apiManager) {
                await window.apiManager.trackEvent('ad_popup_failed', {
                    rewardType,
                    rewardAmount,
                    adId,
                    error: error.message
                });
            }

            if (this.getAttempts(rewardType) < this.maxAttempts) {
                throw new Error('Ad failed to load. Please try again.');
            } else {
                this.resetAttempts(rewardType);
                this.setCooldown(rewardType, 30000);
                
                return {
                    success: true,
                    adId,
                    reward: {
                        type: rewardType,
                        amount: rewardAmount
                    },
                    fallback: true
                };
            }
        }
    }

    // Simulate ad for testing/fallback
    async simulateAd(adId, rewardType, rewardAmount) {
        console.log('Simulating ad for testing:', { adId, rewardType, rewardAmount });
        
        // Show the built-in ad modal from the original game
        return new Promise((resolve) => {
            if (window.uiManager) {
                window.uiManager.showModal('adModal');
                window.uiManager.startAdTimer(() => {
                    window.uiManager.closeModal('adModal');
                    resolve({
                        success: true,
                        adId,
                        reward: {
                            type: rewardType,
                            amount: rewardAmount
                        },
                        simulated: true
                    });
                });
            } else {
                // Fallback without UI
                setTimeout(() => {
                    resolve({
                        success: true,
                        adId,
                        reward: {
                            type: rewardType,
                            amount: rewardAmount
                        },
                        simulated: true
                    });
                }, 3000);
            }
        });
    }

    // Energy reward ad
    async watchAdForEnergy() {
        try {
            const result = await this.showRewardedAd('energy', 50);
            
            if (result.success && window.gameManager) {
                window.gameManager.addEnergy(result.reward.amount);
                
                const message = result.fallback ? 
                    '⚡ +50 Energy! (Connection issue - reward given anyway)' :
                    '⚡ +50 Energy!';
                    
                if (window.uiManager) {
                    window.uiManager.showRewardModal(message, '⚡');
                    window.uiManager.showNotification('Energy recharged!');
                }
            }
            
            return result;
        } catch (error) {
            if (window.uiManager) {
                window.uiManager.showNotification(error.message);
            }
            throw error;
        }
    }

    // Damage boost reward ad
    async watchAdForDamage() {
        try {
            const result = await this.showRewardedAd('damage', 3);
            
            if (result.success && window.gameManager) {
                window.gameManager.setAdDamageBoost(result.reward.amount);
                
                const message = result.fallback ?
                    '⚔️ 2x Damage for next 3 attacks! (Connection issue - reward given anyway)' :
                    '⚔️ 2x Damage for next 3 attacks!';
                    
                if (window.uiManager) {
                    window.uiManager.showRewardModal(message, '⚔️');
                    window.uiManager.showNotification('Damage boost activated!');
                }
            }
            
            return result;
        } catch (error) {
            if (window.uiManager) {
                window.uiManager.showNotification(error.message);
            }
            throw error;
        }
    }

    // GP bonus reward ad
    async watchAdForGP(bonusAmount = 500) {
        try {
            const result = await this.showRewardedAd('gp', bonusAmount);
            
            if (result.success && window.gameManager) {
                window.gameManager.addGP(result.reward.amount);
                
                const message = result.fallback ?
                    `💰 +${bonusAmount} GP! (Connection issue - reward given anyway)` :
                    `💰 +${bonusAmount} GP!`;
                    
                if (window.uiManager) {
                    window.uiManager.showRewardModal(message, '💰');
                    window.uiManager.showNotification(`Bonus GP earned!`);
                }
            }
            
            return result;
        } catch (error) {
            if (window.uiManager) {
                window.uiManager.showNotification(error.message);
            }
            throw error;
        }
    }

    // Double rewards ad
    async watchAdForDoubleReward(originalReward) {
        try {
            const doubleAmount = originalReward * 2;
            const result = await this.showRewardedPopup('double', doubleAmount);
            
            if (result.success) {
                const message = result.fallback ?
                    `🎉 Reward Doubled! +${doubleAmount} total! (Connection issue - reward given anyway)` :
                    `🎉 Reward Doubled! +${doubleAmount} total!`;
                    
                if (window.uiManager) {
                    window.uiManager.showRewardModal(message, '🎉');
                }
                
                return doubleAmount;
            }
            
            return originalReward;
        } catch (error) {
            if (window.uiManager) {
                window.uiManager.showNotification(error.message);
            }
            return originalReward;
        }
    }

    // Cooldown management
    setCooldown(adType, duration) {
        const endTime = Date.now() + duration;
        this.cooldownTimers.set(adType, endTime);
    }

    canShowAd(adType) {
        const cooldownEnd = this.cooldownTimers.get(adType);
        return !cooldownEnd || Date.now() >= cooldownEnd;
    }

    getCooldownRemaining(adType) {
        const cooldownEnd = this.cooldownTimers.get(adType);
        if (!cooldownEnd || Date.now() >= cooldownEnd) return 0;
        return Math.ceil((cooldownEnd - Date.now()) / 1000);
    }

    // Attempt tracking
    incrementAttempt(adType) {
        const current = this.adAttempts.get(adType) || 0;
        this.adAttempts.set(adType, current + 1);
    }

    resetAttempts(adType) {
        this.adAttempts.set(adType, 0);
    }

    getAttempts(adType) {
        return this.adAttempts.get(adType) || 0;
    }

    // Get status for UI
    getAdStatus(adType) {
        const canShow = this.canShowAd(adType);
        const cooldownRemaining = this.getCooldownRemaining(adType);
        const attempts = this.getAttempts(adType);
        
        return {
            available: canShow,
            cooldownRemaining,
            attemptsLeft: this.maxAttempts - attempts,
            sdkLoaded: this.isSDKLoaded
        };
    }

    // Clear all cooldowns (for testing/admin)
    clearCooldowns() {
        this.cooldownTimers.clear();
        this.adAttempts.clear();
        console.log('All ad cooldowns cleared');
    }
}

// Create global ads manager instance
const adsManager = new AdsManager();
window.adsManager = adsManager;
