import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createFeedback,
  getFeedbackBySession,
  getFeedbackByCandidate,
} from '../controllers/feedbackController.js';

// ─── Mocks ───────────────────────────────────────────────────────
vi.mock('../models/Feedback.js', () => ({
  default: {
    create: vi.fn(),
    findOne: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('../models/Session.js', () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('../models/Message.js', () => ({
  default: {
    create: vi.fn(),
  },
}));

import Feedback from '../models/Feedback.js';
import Session from '../models/Session.js';
import Message from '../models/Message.js';

// ─── Helpers ─────────────────────────────────────────────────────
function mockRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { status, json, _json: json };
}

function mockReq(overrides = {}) {
  return {
    user: { clerkId: 'clerk_interviewer', _id: 'user_int', name: 'Interviewer', role: 'interviewer' },
    body: {},
    params: {},
    app: { get: vi.fn().mockReturnValue(null) }, // no Socket.io by default
    ...overrides,
  };
}

// ─── Test Suites ─────────────────────────────────────────────────
describe('feedbackController', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── createFeedback ───────────────────────────────────────────
  describe('createFeedback', () => {
    it('should create feedback for a valid session by the host', async () => {
      const mockSession = {
        _id: 'session_1',
        problem: 'Two Sum',
        host: { clerkId: 'clerk_interviewer' },
        participant: { clerkId: 'clerk_candidate' },
        interviewerId: 'clerk_interviewer',
        candidateId: 'clerk_candidate',
      };
      Session.findById.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          mockResolvedValue: undefined,
          then: (cb) => cb(mockSession),
          // Handle chained .populate()
        }),
      });
      // Simpler approach: mock findById to return a thenable with populate
      Session.findById.mockImplementation(() => ({
        populate: vi.fn().mockImplementation(() => ({
          populate: vi.fn().mockResolvedValue(mockSession),
          then: (cb) => Promise.resolve(mockSession).then(cb),
        })),
      }));

      // Actually, since the controller does Session.findById(sessionId).populate("host participant"),
      // let's simplify:
      Session.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockSession),
      });

      Feedback.findOne.mockResolvedValue(null); // No existing feedback
      Feedback.create.mockResolvedValue({
        _id: 'fb_1',
        sessionId: 'session_1',
        interviewerId: 'clerk_interviewer',
        candidateId: 'clerk_candidate',
        codeQuality: 4,
      });
      Session.findByIdAndUpdate.mockResolvedValue({});
      Message.create.mockResolvedValue({ toObject: () => ({ _id: 'msg_1' }) });

      const req = mockReq({
        body: {
          sessionId: 'session_1',
          codeQuality: 4,
          problemSolving: 5,
          communication: 4,
          decision: 'hire',
          notes: 'Strong candidate',
        },
      });
      const res = mockRes();

      await createFeedback(req, res);

      expect(Feedback.create).toHaveBeenCalledWith(
        expect.objectContaining({
          sessionId: 'session_1',
          interviewerId: 'clerk_interviewer',
          candidateId: 'clerk_candidate',
          codeQuality: 4,
          decision: 'hire',
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 404 if session does not exist', async () => {
      Session.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      });

      const req = mockReq({ body: { sessionId: 'nonexistent' } });
      const res = mockRes();

      await createFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res._json).toHaveBeenCalledWith({ message: 'Session not found' });
    });

    it('should return 409 if feedback already submitted', async () => {
      const mockSession = {
        _id: 'session_1',
        host: { clerkId: 'clerk_interviewer' },
        interviewerId: 'clerk_interviewer',
        candidateId: 'clerk_candidate',
      };
      Session.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockSession),
      });
      Feedback.findOne.mockResolvedValue({ _id: 'existing_fb' }); // Already exists

      const req = mockReq({
        body: {
          sessionId: 'session_1',
          codeQuality: 3,
          problemSolving: 3,
          communication: 3,
          decision: 'maybe',
        },
      });
      const res = mockRes();

      await createFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res._json).toHaveBeenCalledWith({ message: 'Feedback already submitted for this session' });
    });

    it('should return 403 if non-host/non-privileged user tries to submit', async () => {
      const mockSession = {
        _id: 'session_1',
        host: { clerkId: 'someone_else' },
        interviewerId: 'someone_else',
        candidateId: 'clerk_candidate',
      };
      Session.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockSession),
      });

      const req = mockReq({
        user: { clerkId: 'clerk_nobody', role: 'candidate', name: 'Nobody' },
        body: { sessionId: 'session_1', codeQuality: 5, problemSolving: 5, communication: 5, decision: 'hire' },
      });
      const res = mockRes();

      await createFeedback(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  // ── getFeedbackBySession ─────────────────────────────────────
  describe('getFeedbackBySession', () => {
    it('should return all feedback for a session', async () => {
      const mockFeedback = [{ _id: 'fb_1' }, { _id: 'fb_2' }];
      Feedback.find.mockResolvedValue(mockFeedback);

      const req = mockReq({ params: { sessionId: 'session_1' } });
      const res = mockRes();

      await getFeedbackBySession(req, res);

      expect(Feedback.find).toHaveBeenCalledWith({ sessionId: 'session_1' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res._json).toHaveBeenCalledWith({ feedback: mockFeedback });
    });
  });

  // ── getFeedbackByCandidate ───────────────────────────────────
  describe('getFeedbackByCandidate', () => {
    it('should return feedback for a candidate sorted by date', async () => {
      const mockFeedback = [{ _id: 'fb_1', candidateId: 'clerk_c' }];
      Feedback.find.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockResolvedValue(mockFeedback),
        }),
      });

      const req = mockReq({ params: { candidateId: 'clerk_c' } });
      const res = mockRes();

      await getFeedbackByCandidate(req, res);

      expect(Feedback.find).toHaveBeenCalledWith({ candidateId: 'clerk_c' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res._json).toHaveBeenCalledWith({ feedback: mockFeedback });
    });
  });
});
