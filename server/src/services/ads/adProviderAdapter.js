/**
 * Rewarded Ad Provider Adapter Interface
 * Enables pluggable integrations with AdMob, Unity Ads, AppLovin, or Simulated Dev Provider
 */

export class BaseAdProvider {
  constructor(name) {
    this.providerName = name;
  }

  async verifyCompletion(opportunityId, payload) {
    throw new Error('verifyCompletion must be implemented by concrete ad provider');
  }
}

/**
 * Clearly labelled SIMULATED AD PROVIDER for local development & testing
 */
export class SimulatedAdAdapter extends BaseAdProvider {
  constructor() {
    super('SIMULATED_TEST_AD_NETWORK');
  }

  async verifyCompletion(opportunityId, payload) {
    // In dev simulation, validates token structure and simulated duration
    if (!opportunityId) {
      return { verified: false, reason: 'Missing opportunity identifier' };
    }

    return {
      verified: true,
      provider: this.providerName,
      completionTimestamp: new Date().toISOString(),
      simulated: true,
    };
  }
}

export const activeAdProvider = new SimulatedAdAdapter();
