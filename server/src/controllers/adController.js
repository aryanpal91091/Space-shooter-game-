import { RewardedAdService } from '../services/ads/rewardedAdService.js';

export const createAdOpportunity = async (req, res, next) => {
  try {
    const { placement, sessionId } = req.body;
    if (!placement) {
      return res.status(400).json({ message: 'placement is required.' });
    }

    const opportunity = await RewardedAdService.createOpportunity(req.user._id, placement, sessionId);
    res.status(201).json({
      opportunityId: opportunity.opportunityId,
      placement: opportunity.placement,
      status: opportunity.status,
      expiresAt: opportunity.expiresAt,
    });
  } catch (err) {
    next(err);
  }
};

export const verifyAdEvent = async (req, res, next) => {
  try {
    const { opportunityId, payload } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ message: 'opportunityId is required.' });
    }

    const result = await RewardedAdService.verifyAdEvent(req.user._id, opportunityId, payload);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const claimAdReward = async (req, res, next) => {
  try {
    const { opportunityId, sessionId } = req.body;
    if (!opportunityId) {
      return res.status(400).json({ message: 'opportunityId is required.' });
    }

    const result = await RewardedAdService.claimReward(req.user._id, opportunityId, sessionId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

// Revive endpoint shortcuts
export const requestRevive = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const opp = await RewardedAdService.createOpportunity(req.user._id, 'REVIVE', sessionId);
    res.status(201).json(opp);
  } catch (err) {
    next(err);
  }
};

export const verifyRevive = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { opportunityId } = req.body;
    await RewardedAdService.verifyAdEvent(req.user._id, opportunityId);
    const claimRes = await RewardedAdService.claimReward(req.user._id, opportunityId, sessionId);
    res.status(200).json(claimRes);
  } catch (err) {
    next(err);
  }
};

// Double Score shortcuts
export const requestDoubleScore = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const opp = await RewardedAdService.createOpportunity(req.user._id, 'DOUBLE_SCORE', sessionId);
    res.status(201).json(opp);
  } catch (err) {
    next(err);
  }
};

export const verifyDoubleScore = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { opportunityId } = req.body;
    await RewardedAdService.verifyAdEvent(req.user._id, opportunityId);
    const claimRes = await RewardedAdService.claimReward(req.user._id, opportunityId, sessionId);
    res.status(200).json(claimRes);
  } catch (err) {
    next(err);
  }
};

// Double Credits shortcuts
export const requestDoubleCredits = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const opp = await RewardedAdService.createOpportunity(req.user._id, 'DOUBLE_CREDITS', sessionId);
    res.status(201).json(opp);
  } catch (err) {
    next(err);
  }
};

export const verifyDoubleCredits = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { opportunityId } = req.body;
    await RewardedAdService.verifyAdEvent(req.user._id, opportunityId);
    const claimRes = await RewardedAdService.claimReward(req.user._id, opportunityId, sessionId);
    res.status(200).json(claimRes);
  } catch (err) {
    next(err);
  }
};
