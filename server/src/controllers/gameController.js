import { SessionService } from '../services/game/sessionService.js';
import GameSession from '../models/GameSession.js';

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
