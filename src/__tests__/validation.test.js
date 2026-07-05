import { describe, expect, it } from 'vitest'
const { validateJobPayload } = require('../../backend/utils/validation.cjs')

describe('validateJobPayload', () => {
  it('accepts numeric salary ranges', () => {
    const result = validateJobPayload({
      title: 'Senior Developer',
      company: 'Acme',
      location: 'Remote',
      salary: '80000-120000',
      type: 'Full-time'
    })

    expect(result.isValid).toBe(true)
    expect(result.errors).toEqual([])
  })

  it('rejects non-numeric salary input', () => {
    const result = validateJobPayload({
      title: 'Senior Developer',
      company: 'Acme',
      location: 'Remote',
      salary: 'twenty thousand',
      type: 'Full-time'
    })

    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('salary must be numeric or a numeric range like 80000-120000')
  })
})
