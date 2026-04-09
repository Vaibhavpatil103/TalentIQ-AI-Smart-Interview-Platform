import { describe, it, expect, vi } from 'vitest';
import { validate, createProblemSchema } from '../middleware/validateRequest.js';

describe('validateRequest Middleware (Zod)', () => {
  it('should call next() if validation passes against schema', () => {
    const req = {
      body: {
        title: 'Valid Problem',
        description: { text: 'Some detailed text' },
        difficulty: 'Easy',
        category: 'Algorithms',
      },
    };
    const res = {};
    const next = vi.fn();

    const middleware = validate(createProblemSchema);
    middleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
  });

  it('should return 400 with errors if validation fails', () => {
    const req = {
      body: {
        title: '', // Invalid, min length 1 required
      },
    };
    const jsonMock = vi.fn();
    const statusMock = vi.fn().mockReturnValue({ json: jsonMock });
    const res = { status: statusMock };
    const next = vi.fn();

    const middleware = validate(createProblemSchema);
    middleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect(statusMock).toHaveBeenCalledWith(400);
    expect(jsonMock).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Validation failed',
        errors: expect.any(Array),
      })
    );
    expect(jsonMock.mock.calls[0][0].errors[0].message).toBe('Title is required');
  });
});
