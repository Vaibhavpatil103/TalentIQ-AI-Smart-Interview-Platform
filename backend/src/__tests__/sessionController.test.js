import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSession } from '../controllers/sessionController.js';
import Session from '../models/Session.js';

// Mock models and dependencies
vi.mock('../models/Session.js', () => ({
  default: {
    create: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('../models/User.js');

vi.mock('../lib/stream.js', () => ({
  streamClient: {
    video: {
      call: vi.fn().mockReturnValue({
        getOrCreate: vi.fn().mockResolvedValue({}),
      }),
    },
  },
  chatClient: {
    channel: vi.fn().mockReturnValue({
      create: vi.fn().mockResolvedValue({}),
    }),
  },
}));

vi.mock('../lib/inngestClient.js', () => ({
  inngest: {
    send: vi.fn(),
  },
}));

vi.mock('../lib/email.js', () => ({
  sendInterviewInvite: vi.fn(),
  sendSessionConfirmation: vi.fn(),
}));

describe('sessionController Unit Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should successfully create an active session', async () => {
      const mockSession = { _id: 'session123', status: 'active', callId: 'call123' };
      Session.create.mockResolvedValue(mockSession);

      const req = {
        body: { problem: 'Two Sum', difficulty: 'easy' },
        user: { _id: 'user123', clerkId: 'clerk123', name: 'Host' },
      };
      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      const res = { status: statusMock };

      await createSession(req, res);

      expect(Session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          host: 'user123',
          status: 'active',
          interviewerId: 'clerk123',
          problem: 'Two Sum',
        })
      );
      
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith(
        expect.objectContaining({
          session: mockSession,
          joinCode: expect.any(String),
          joinLink: expect.any(String),
        })
      );
    });

    it('should handle internal server errors correctly', async () => {
      Session.create.mockRejectedValue(new Error('DB Error'));

      const req = {
        body: { problem: 'Two Sum', difficulty: 'easy' },
        user: { _id: 'user123', clerkId: 'clerk123', name: 'Host' },
      };
      
      const jsonMock = vi.fn();
      const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
      const res = { status: statusMock };

      await createSession(req, res);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });
});
