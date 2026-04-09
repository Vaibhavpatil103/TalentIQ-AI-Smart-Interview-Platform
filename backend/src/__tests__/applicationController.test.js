import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  applyToJob,
  getApplicationsForJob,
  getMyApplications,
  updateApplicationStatus,
  sendOffer,
  respondToOffer,
  getApplicationById,
} from '../controllers/applicationController.js';

// ─── Mocks ───────────────────────────────────────────────────────
vi.mock('../models/Application.js', () => ({
  default: {
    create: vi.fn(),
    findOne: vi.fn(),
    findById: vi.fn(),
    find: vi.fn(),
  },
}));

vi.mock('../models/Job.js', () => ({
  default: {
    findById: vi.fn(),
    findByIdAndUpdate: vi.fn(),
  },
}));

vi.mock('../models/User.js', () => ({
  default: {
    findOne: vi.fn(),
  },
}));

vi.mock('../lib/email.js', () => ({
  sendInterviewInvite: vi.fn(),
}));

vi.mock('../lib/groq.js', () => ({
  callGroq: vi.fn(),
}));

import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';

// ─── Helpers ─────────────────────────────────────────────────────
function mockRes() {
  const json = vi.fn();
  const status = vi.fn().mockReturnValue({ json });
  return { status, json, _json: json };
}

function mockReq(overrides = {}) {
  return {
    user: { clerkId: 'clerk_candidate', _id: 'user_c', name: 'Candidate', role: 'candidate' },
    body: {},
    params: {},
    query: {},
    ...overrides,
  };
}

// ─── Test Suites ─────────────────────────────────────────────────
describe('applicationController', () => {
  beforeEach(() => vi.clearAllMocks());

  // ── applyToJob ───────────────────────────────────────────────
  describe('applyToJob', () => {
    it('should create application for a published job', async () => {
      Job.findById.mockResolvedValue({ _id: 'job_1', status: 'published', companyId: 'clerk_rec' });
      Application.findOne.mockResolvedValue(null); // No duplicate
      User.findOne.mockResolvedValue({ resumeUrl: 'https://resume.pdf' });

      const mockApp = { _id: 'app_1', jobId: 'job_1', status: 'applied' };
      Application.create.mockResolvedValue(mockApp);
      Job.findByIdAndUpdate.mockResolvedValue({});

      const req = mockReq({ body: { jobId: 'job_1', coverLetter: 'Hire me!' } });
      const res = mockRes();

      await applyToJob(req, res);

      expect(Application.create).toHaveBeenCalledWith(
        expect.objectContaining({
          jobId: 'job_1',
          candidateId: 'clerk_candidate',
          status: 'applied',
          coverLetter: 'Hire me!',
        })
      );
      expect(Job.findByIdAndUpdate).toHaveBeenCalledWith('job_1', { $inc: { applicantCount: 1 } });
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it('should return 404 if job does not exist', async () => {
      Job.findById.mockResolvedValue(null);

      const req = mockReq({ body: { jobId: 'ghost' } });
      const res = mockRes();

      await applyToJob(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res._json).toHaveBeenCalledWith({ message: 'Job not found' });
    });

    it('should return 400 if job is not published', async () => {
      Job.findById.mockResolvedValue({ _id: 'job_1', status: 'draft' });

      const req = mockReq({ body: { jobId: 'job_1' } });
      const res = mockRes();

      await applyToJob(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res._json).toHaveBeenCalledWith({ message: 'Job is not accepting applications' });
    });

    it('should return 409 on duplicate application', async () => {
      Job.findById.mockResolvedValue({ _id: 'job_1', status: 'published' });
      Application.findOne.mockResolvedValue({ _id: 'existing_app' }); // Duplicate

      const req = mockReq({ body: { jobId: 'job_1' } });
      const res = mockRes();

      await applyToJob(req, res);

      expect(res.status).toHaveBeenCalledWith(409);
      expect(res._json).toHaveBeenCalledWith({ message: 'Already applied to this job' });
    });
  });

  // ── getApplicationsForJob ────────────────────────────────────
  describe('getApplicationsForJob', () => {
    it('should return applications for a job owned by the recruiter', async () => {
      Job.findById.mockResolvedValue({ _id: 'job_1', companyId: 'clerk_recruiter' });
      const mockApps = [{ _id: 'app_1' }, { _id: 'app_2' }];
      Application.find.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          sort: vi.fn().mockResolvedValue(mockApps),
        }),
      });

      const req = mockReq({
        user: { clerkId: 'clerk_recruiter', role: 'recruiter' },
        params: { jobId: 'job_1' },
      });
      const res = mockRes();

      await getApplicationsForJob(req, res);

      expect(res.json).toHaveBeenCalledWith({ applications: mockApps });
    });

    it('should return 403 if recruiter does not own the job', async () => {
      Job.findById.mockResolvedValue({ _id: 'job_1', companyId: 'other_recruiter' });

      const req = mockReq({
        user: { clerkId: 'clerk_recruiter', role: 'recruiter' },
        params: { jobId: 'job_1' },
      });
      const res = mockRes();

      await getApplicationsForJob(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  // ── updateApplicationStatus ──────────────────────────────────
  describe('updateApplicationStatus', () => {
    it('should update status for recruiter who owns it', async () => {
      const mockApp = {
        _id: 'app_1',
        recruiterId: 'clerk_recruiter',
        status: 'applied',
        save: vi.fn().mockResolvedValue(true),
      };
      Application.findById.mockResolvedValue(mockApp);

      const req = mockReq({
        user: { clerkId: 'clerk_recruiter', role: 'recruiter' },
        params: { id: 'app_1' },
        body: { status: 'shortlisted', recruiterNotes: 'Good fit' },
      });
      const res = mockRes();

      await updateApplicationStatus(req, res);

      expect(mockApp.status).toBe('shortlisted');
      expect(mockApp.recruiterNotes).toBe('Good fit');
      expect(mockApp.save).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith({ application: mockApp });
    });

    it('should return 403 for unauthorized recruiter', async () => {
      Application.findById.mockResolvedValue({ recruiterId: 'other_clerk' });

      const req = mockReq({
        user: { clerkId: 'clerk_recruiter' },
        params: { id: 'app_1' },
        body: { status: 'shortlisted' },
      });
      const res = mockRes();

      await updateApplicationStatus(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  // ── sendOffer ────────────────────────────────────────────────
  describe('sendOffer', () => {
    it('should send offer with salary and update status', async () => {
      const mockApp = {
        _id: 'app_1',
        recruiterId: 'clerk_recruiter',
        save: vi.fn().mockResolvedValue(true),
      };
      Application.findById.mockResolvedValue(mockApp);

      const req = mockReq({
        user: { clerkId: 'clerk_recruiter', role: 'recruiter' },
        params: { id: 'app_1' },
        body: { offeredSalary: 120000, message: 'Congratulations!' },
      });
      const res = mockRes();

      await sendOffer(req, res);

      expect(mockApp.offerSent).toBe(true);
      expect(mockApp.offeredSalary).toBe(120000);
      expect(mockApp.status).toBe('offer_sent');
      expect(mockApp.offerStatus).toBe('pending');
      expect(mockApp.save).toHaveBeenCalled();
    });
  });

  // ── respondToOffer ───────────────────────────────────────────
  describe('respondToOffer', () => {
    it('should accept offer and set status to hired', async () => {
      const mockApp = {
        _id: 'app_1',
        candidateId: 'clerk_candidate',
        save: vi.fn().mockResolvedValue(true),
      };
      Application.findById.mockResolvedValue(mockApp);

      const req = mockReq({
        params: { id: 'app_1' },
        body: { response: 'accepted' },
      });
      const res = mockRes();

      await respondToOffer(req, res);

      expect(mockApp.offerStatus).toBe('accepted');
      expect(mockApp.status).toBe('hired');
      expect(mockApp.save).toHaveBeenCalled();
    });

    it('should reject offer and set status to rejected', async () => {
      const mockApp = {
        _id: 'app_1',
        candidateId: 'clerk_candidate',
        save: vi.fn().mockResolvedValue(true),
      };
      Application.findById.mockResolvedValue(mockApp);

      const req = mockReq({
        params: { id: 'app_1' },
        body: { response: 'rejected' },
      });
      const res = mockRes();

      await respondToOffer(req, res);

      expect(mockApp.offerStatus).toBe('rejected');
      expect(mockApp.status).toBe('rejected');
    });

    it('should return 403 if non-candidate responds', async () => {
      Application.findById.mockResolvedValue({ candidateId: 'other_candidate' });

      const req = mockReq({
        params: { id: 'app_1' },
        body: { response: 'accepted' },
      });
      const res = mockRes();

      await respondToOffer(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });
  });

  // ── getApplicationById ───────────────────────────────────────
  describe('getApplicationById', () => {
    it('should return application for the recruiter who owns it', async () => {
      const mockApp = { _id: 'app_1', recruiterId: 'clerk_recruiter', candidateId: 'clerk_other' };
      Application.findById.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockResolvedValue(mockApp),
        }),
      });

      const req = mockReq({
        user: { clerkId: 'clerk_recruiter', role: 'recruiter' },
        params: { id: 'app_1' },
      });
      const res = mockRes();

      await getApplicationById(req, res);

      expect(res.json).toHaveBeenCalledWith({ application: mockApp });
    });

    it('should return application for the candidate who submitted it', async () => {
      const mockApp = { _id: 'app_1', recruiterId: 'clerk_rec', candidateId: 'clerk_candidate' };
      Application.findById.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockResolvedValue(mockApp),
        }),
      });

      const req = mockReq({ params: { id: 'app_1' } });
      const res = mockRes();

      await getApplicationById(req, res);

      expect(res.json).toHaveBeenCalledWith({ application: mockApp });
    });

    it('should return 403 for unauthorized user', async () => {
      const mockApp = { _id: 'app_1', recruiterId: 'someone', candidateId: 'someone_else' };
      Application.findById.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockResolvedValue(mockApp),
        }),
      });

      const req = mockReq({ params: { id: 'app_1' } });
      const res = mockRes();

      await getApplicationById(req, res);

      expect(res.status).toHaveBeenCalledWith(403);
    });

    it('should return 404 if application not found', async () => {
      Application.findById.mockReturnValue({
        populate: vi.fn().mockReturnValue({
          populate: vi.fn().mockResolvedValue(null),
        }),
      });

      const req = mockReq({ params: { id: 'ghost' } });
      const res = mockRes();

      await getApplicationById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });
});
