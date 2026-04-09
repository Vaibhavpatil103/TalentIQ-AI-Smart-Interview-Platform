import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  createJob,
  getMyJobs,
  getAllPublishedJobs,
  getJobById,
  updateJob,
  deleteJob,
  publishJob,
  closeJob,
  getJobStats,
} from '../controllers/jobController.js';

// ─── Mocks ───────────────────────────────────────────────────────
vi.mock('../models/Job.js', () => {
  const chainable = {
    sort: vi.fn().mockReturnThis(),
    skip: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    populate: vi.fn().mockReturnThis(),
    // final resolution — overridden per test via mockResolvedValue on the last in chain
  };
  return {
    default: {
      create: vi.fn(),
      find: vi.fn().mockReturnValue(chainable),
      findById: vi.fn(),
      findByIdAndDelete: vi.fn(),
      countDocuments: vi.fn(),
      _chain: chainable,
    },
  };
});

vi.mock('../models/Application.js', () => ({
  default: {
    deleteMany: vi.fn(),
    countDocuments: vi.fn(),
  },
}));

vi.mock('../models/User.js', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

import Job from '../models/Job.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

// ─── Helpers ─────────────────────────────────────────────────────
function mockRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { status, json, _json: json };
}

function mockReq(overrides = {}) {
  return {
    user: { clerkId: 'clerk_recruiter', _id: 'recruiter_id', name: 'Recruiter', role: 'recruiter' },
    body: {},
    params: {},
    query: {},
    ...overrides,
  };
}

// ─── Test Suites ─────────────────────────────────────────────────
describe('jobController', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── createJob ────────────────────────────────────────────────
  describe('createJob', () => {
    it('should create a new draft job', async () => {
      User.findOne.mockResolvedValue({ company: 'Acme Corp' });
      const mockJob = { _id: 'job_1', title: 'SDE 1', status: 'draft' };
      Job.create.mockResolvedValue(mockJob);

      const req = mockReq({
        body: {
          title: 'SDE 1',
          description: 'Build stuff',
          location: 'Remote',
          jobType: 'Full-time',
        },
      });
      const res = mockRes();

      await createJob(req, res);

      expect(Job.create).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'SDE 1',
          company: 'Acme Corp',
          companyId: 'clerk_recruiter',
          status: 'draft',
        })
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res._json).toHaveBeenCalledWith({ job: mockJob });
    });

    it('should return 500 on internal error', async () => {
      User.findOne.mockRejectedValue(new Error('DB Error'));

      const req = mockReq({ body: { title: 'Fail Job' } });
      const res = mockRes();

      await createJob(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  // ── getJobById ───────────────────────────────────────────────
  describe('getJobById', () => {
    it('should return job with populated creator', async () => {
      const mockJob = { _id: 'job_1', title: 'SDE 1' };
      Job.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(mockJob),
      });

      const req = mockReq({ params: { id: 'job_1' } });
      const res = mockRes();

      await getJobById(req, res);

      expect(res.json).toHaveBeenCalledWith({ job: mockJob });
    });

    it('should return 404 if job not found', async () => {
      Job.findById.mockReturnValue({
        populate: vi.fn().mockResolvedValue(null),
      });

      const req = mockReq({ params: { id: 'nonexistent' } });
      const res = mockRes();

      await getJobById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res._json).toHaveBeenCalledWith({ message: 'Job not found' });
    });
  });

  // ── updateJob ────────────────────────────────────────────────
  describe('updateJob', () => {
    it('should update allowed fields for the job owner', async () => {
      const mockJob = {
        _id: 'job_1',
        companyId: 'clerk_recruiter',
        title: 'Old Title',
        save: vi.fn().mockResolvedValue(true),
      };
      Job.findById.mockResolvedValue(mockJob);

      const req = mockReq({
        params: { id: 'job_1' },
        body: { title: 'New Title', status: 'published' },
      });
      const res = mockRes();

      await updateJob(req, res);

      expect(mockJob.title).toBe('New Title');
      expect(mockJob.status).toBe('published');
      expect(mockJob.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ job: mockJob });
    });

    it('should return 403 if non-owner tries to update', async () => {
      const mockJob = { _id: 'job_1', companyId: 'someone_else' };
      Job.findById.mockResolvedValue(mockJob);

      const req = mockReq({ params: { id: 'job_1' }, body: { title: 'Hax' } });
      const res = mockRes();

      await updateJob(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res._json).toHaveBeenCalledWith({ message: 'Not authorized to update this job' });
    });

    it('should return 404 for nonexistent job', async () => {
      Job.findById.mockResolvedValue(null);

      const req = mockReq({ params: { id: 'ghost' }, body: {} });
      const res = mockRes();

      await updateJob(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  // ── deleteJob ────────────────────────────────────────────────
  describe('deleteJob', () => {
    it('should delete job and cascade-delete applications', async () => {
      const mockJob = { _id: 'job_1', companyId: 'clerk_recruiter' };
      Job.findById.mockResolvedValue(mockJob);
      Application.deleteMany.mockResolvedValue({});
      Job.findByIdAndDelete.mockResolvedValue({});

      const req = mockReq({ params: { id: 'job_1' } });
      const res = mockRes();

      await deleteJob(req, res);

      expect(Application.deleteMany).toHaveBeenCalledWith({ jobId: 'job_1' });
      expect(Job.findByIdAndDelete).toHaveBeenCalledWith('job_1');
      expect(res.json).toHaveBeenCalledWith({ message: 'Job deleted' });
    });

    it('should return 403 for non-owner', async () => {
      Job.findById.mockResolvedValue({ _id: 'job_1', companyId: 'other_clerk' });

      const req = mockReq({ params: { id: 'job_1' } });
      const res = mockRes();

      await deleteJob(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(Application.deleteMany).not.toHaveBeenCalled();
    });
  });

  // ── publishJob ───────────────────────────────────────────────
  describe('publishJob', () => {
    it('should publish job for owner', async () => {
      const mockJob = {
        _id: 'job_1',
        companyId: 'clerk_recruiter',
        status: 'draft',
        save: vi.fn().mockResolvedValue(true),
      };
      Job.findById.mockResolvedValue(mockJob);

      const req = mockReq({ params: { id: 'job_1' } });
      const res = mockRes();

      await publishJob(req, res);

      expect(mockJob.status).toBe('published');
      expect(mockJob.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ job: mockJob });
    });

    it('should reject unauthorized publish', async () => {
      Job.findById.mockResolvedValue({ companyId: 'other_clerk' });

      const req = mockReq({ params: { id: 'job_1' } });
      const res = mockRes();

      await publishJob(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  // ── closeJob ─────────────────────────────────────────────────
  describe('closeJob', () => {
    it('should close a job for the owner', async () => {
      const mockJob = {
        _id: 'job_1',
        companyId: 'clerk_recruiter',
        status: 'published',
        save: vi.fn().mockResolvedValue(true),
      };
      Job.findById.mockResolvedValue(mockJob);

      const req = mockReq({ params: { id: 'job_1' } });
      const res = mockRes();

      await closeJob(req, res);

      expect(mockJob.status).toBe('closed');
      expect(mockJob.save).toHaveBeenCalled();
    });
  });

  // ── getJobStats ──────────────────────────────────────────────
  describe('getJobStats', () => {
    it('should return aggregated job statistics', async () => {
      Job.find.mockReturnValue(
        // find({ companyId }, "_id status") returns array directly (no chainable)
        Promise.resolve([{ _id: 'j1', status: 'published' }, { _id: 'j2', status: 'draft' }])
      );

      Job.countDocuments
        .mockResolvedValueOnce(5)   // totalJobs
        .mockResolvedValueOnce(3);  // publishedJobs

      Application.countDocuments
        .mockResolvedValueOnce(20)  // totalApplications
        .mockResolvedValueOnce(5)   // shortlisted
        .mockResolvedValueOnce(3)   // interviewed
        .mockResolvedValueOnce(1)   // hired
        .mockResolvedValueOnce(11); // pendingReview

      const req = mockReq();
      const res = mockRes();

      await getJobStats(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          totalJobs: 5,
          publishedJobs: 3,
          totalApplications: 20,
          shortlisted: 5,
          hired: 1,
        })
      );
    });
  });
});
