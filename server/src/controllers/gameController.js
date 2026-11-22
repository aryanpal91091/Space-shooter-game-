import { SessionService } from '../services/game/sessionService.js';
import GameSession from '../models/GameSession.js';
import PlayerInventory from '../models/PlayerInventory.js';
import { ALL_MISSIONS, SECTORS } from '../data/missionsData.js';

export const getMissions = async (req, res, next) => {
  try {
    res.status(200).json({ sectors: SECTORS, missions: ALL_MISSIONS });
  } catch (err) {
    next(err);
  }
};

export const getMissionById = async (req, res, next) => {
  try {
    const { missionId } = req.params;
    const mission = ALL_MISSIONS.find((m) => m.id === missionId);
    if (!mission) {
      return res.status(404).json({ message: `Mission ${missionId} not found in fleet records.` });
    }
    res.status(200).json(mission);
  } catch (err) {
    next(err);
  }
};

export const startGame = async (req, res, next) => {
  try {
    const { missionId, shipId = 'interceptor' } = req.body;
    if (!missionId) {
      return res.status(400).json({ message: 'missionId is required to initialize a game session.' });
    }

    const session = await SessionService.startSession(req.user._id, missionId, shipId);
    res.status(201).json({
      sessionId: session.sessionId,
      missionId: session.missionId,
      status: session.status,
      startTime: session.startTime,
    });
  } catch (err) {
    next(err);
  }
};

export const completeGame = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const telemetry = req.body;

    const result = await SessionService.completeSession(req.user._id, sessionId, telemetry);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const claimSessionReward = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const session = await GameSession.findOne({ user: req.user._id, sessionId });
    if (!session) {
      return res.status(404).json({ message: 'Session not found.' });
    }
    res.status(200).json({
      sessionId: session.sessionId,
      status: session.status,
      result: session.result,
      rewards: session.result?.rewardsGranted || {},
    });
  } catch (err) {
    next(err);
  }
};

export const usePowerupInSession = async (req, res, next) => {
  try {
    const { sessionId } = req.params;
    const { powerUpId } = req.body;

    let inventory = await PlayerInventory.findOne({ user: req.user._id });
    if (!inventory) {
      inventory = await PlayerInventory.create({ user: req.user._id });
    }

    const available = inventory.powerups[powerUpId] || 0;
    if (available <= 0) {
      return res.status(400).json({ message: `No charges remaining for ${powerUpId}.` });
    }

    inventory.powerups[powerUpId] = available - 1;
    await inventory.save();

    await GameSession.findOneAndUpdate(
      { user: req.user._id, sessionId },
      { $inc: { 'result.powerupsUsed': 1 } }
    );

    res.status(200).json({
      success: true,
      powerUpId,
      remainingCharges: inventory.powerups[powerUpId],
    });
  } catch (err) {
    next(err);
  }
};

export const getGameHistory = async (req, res, next) => {
  try {
    const sessions = await GameSession.find({ user: req.user._id })
      .sort({ startTime: -1 })
      .limit(25);
    res.status(200).json({ sessions });
  } catch (err) {
    next(err);
  }
};
