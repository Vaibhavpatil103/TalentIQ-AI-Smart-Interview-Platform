import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getProfile,
  updateProfile,
  setRole,
  updateUserRole,
  getAllUsers,
  getInterviewHistory,
} from '../controllers/userController.js';

// ─── Mocks ───────────────────────────────────────────────────────
vi.mock('../models/User.js', () => ({
  default: {
    findOne: vi.fn(),
    findOneAndUpdate: vi.fn(),
    findByIdAndUpdate: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('../models/Session.js', () => ({
  default: {
    find: vi.fn(),
  },
}));

vi.mock('../models/Feedback.js', () => ({
  default: {
    find: vi.fn(),
  },
}));

import User from '../models/User.js';
import Session from '../models/Session.js';
import Feedback from '../models/Feedback.js';

// ─── Helpers ─────────────────────────────────────────────────────
function mockRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { status, json, _json: json };
}

function mockReq(overrides = {}) {
  return {
    user: { clerkId: 'clerk_abc', _id: 'user_abc', name: 'Test User', role: 'candidate' },
    body: {},
    params: {},
    query: {},
    ...overrides,
  };
}

// ─── Test Suites ─────────────────────────────────────────────────
describe('userController', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── getProfile ───────────────────────────────────────────────
  describe('getProfile', () => {
    it('should return user profile for a valid clerkId', async () => {
      const mockUser = { clerkId: 'clerk_abc', name: 'Test User', role: 'candidate' };
      User.findOne.mockResolvedValue(mockUser);

      const req = mockReq();
      const res = mockRes();

      await getProfile(req, res);

      expect(User.findOne).toHaveBeenCalledWith({ clerkId: 'clerk_abc' });
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res._json).toHaveBeenCalledWith({ user: mockUser });
    });

    it('should return 404 if user is not found', async () => {
      User.findOne.mockResolvedValue(null);

      const req = mockReq();
      const res = mockRes();

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res._json).toHaveBeenCalledWith({ message: 'User not found' });
    });

    it('should return 500 on internal error', async () => {
      User.findOne.mockRejectedValue(new Error('DB Failure'));

      const req = mockReq();
      const res = mockRes();

      await getProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res._json).toHaveBeenCalledWith({ message: 'Internal Server Error' });
    });
  });

  // ── updateProfile ────────────────────────────────────────────
  describe('updateProfile', () => {
    it('should update and return the user profile', async () => {
      const updatedUser = { clerkId: 'clerk_abc', company: 'Acme Corp' };
      User.findOneAndUpdate.mockResolvedValue(updatedUser);

      const req = mockReq({ body: { company: 'Acme Corp', resumeUrl: 'https://resume.pdf' } });
      const res = mockRes();

      await updateProfile(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { clerkId: 'clerk_abc' },
        expect.objectContaining({ company: 'Acme Corp', resumeUrl: 'https://resume.pdf' }),
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res._json).toHaveBeenCalledWith({ user: updatedUser });
    });

    it('should return 404 if user not found during update', async () => {
      User.findOneAndUpdate.mockResolvedValue(null);

      const req = mockReq({ body: { company: 'NotFound Corp' } });
      const res = mockRes();

      await updateProfile(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ── setRole ──────────────────────────────────────────────────
  describe('setRole', () => {
    it('should set a valid role (candidate)', async () => {
      const updatedUser = { clerkId: 'clerk_abc', role: 'candidate' };
      User.findOneAndUpdate.mockResolvedValue(updatedUser);

      const req = mockReq({ body: { role: 'candidate' } });
      const res = mockRes();

      await setRole(req, res);

      expect(User.findOneAndUpdate).toHaveBeenCalledWith(
        { clerkId: 'clerk_abc' },
        { role: 'candidate' },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res._json).toHaveBeenCalledWith(
        expect.objectContaining({ user: updatedUser, role: 'candidate' })
      );
    });

    it('should reject invalid roles (admin not allowed via setRole)', async () => {
      const req = mockReq({ body: { role: 'admin' } });
      const res = mockRes();

      await setRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res._json).toHaveBeenCalledWith({ message: 'Invalid role' });
      expect(User.findOneAndUpdate).not.toHaveBeenCalled();
    });
  });

  // ── updateUserRole ───────────────────────────────────────────
  describe('updateUserRole', () => {
    it('should update role for a valid user by ID', async () => {
      const updatedUser = { _id: 'user_xyz', role: 'admin' };
      User.findByIdAndUpdate.mockResolvedValue(updatedUser);

      const req = mockReq({ params: { id: 'user_xyz' }, body: { role: 'admin' } });
      const res = mockRes();

      await updateUserRole(req, res);

      expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
        'user_xyz',
        { role: 'admin' },
        { new: true, runValidators: true }
      );
      expect(res.status).toHaveBeenCalledWith(200);
    });

    it('should reject completely invalid roles', async () => {
      const req = mockReq({ params: { id: 'user_xyz' }, body: { role: 'superadmin' } });
      const res = mockRes();

      await updateUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res._json).toHaveBeenCalledWith({ message: 'Invalid role' });
    });

    it('should return 404 if user not found', async () => {
      User.findByIdAndUpdate.mockResolvedValue(null);

      const req = mockReq({ params: { id: 'nonexistent' }, body: { role: 'candidate' } });
      const res = mockRes();

      await updateUserRole(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ── getAllUsers ───────────────────────────────────────────────
  describe('getAllUsers', () => {
    it('should return all users sorted by creation date', async () => {
      const mockUsers = [
        { name: 'User A', createdAt: '2025-01-02' },
        { name: 'User B', createdAt: '2025-01-01' },
      ];
      User.find.mockReturnValue({ sort: vi.fn().mockResolvedValue(mockUsers) });

      const req = mockReq();
      const res = mockRes();

      await getAllUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res._json).toHaveBeenCalledWith({ users: mockUsers });
    });
  });
});
