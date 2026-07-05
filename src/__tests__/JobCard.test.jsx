import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import JobCard from '../components/JobCard'

const sampleJob = {
  _id: 'abc123',
  title: 'Frontend Engineer',
  company: 'Acme',
  location: 'Remote',
  type: 'Full-time',
  salary: '80000-120000',
  description: 'Build great UIs.',
  createdAt: new Date().toISOString()
}

describe('JobCard', () => {
  it('renders the job title, company and location', () => {
    render(<JobCard job={sampleJob} onView={() => {}} onToggleSave={() => {}} saved={false} />)
    expect(screen.getByText('Frontend Engineer')).toBeTruthy()
    expect(screen.getByText(/Acme/)).toBeTruthy()
    expect(screen.getByText(/Remote/)).toBeTruthy()
  })

  it('shows "Save job" when not saved and "Saved" when saved', () => {
    const { rerender } = render(
      <JobCard job={sampleJob} onView={() => {}} onToggleSave={() => {}} saved={false} />
    )
    expect(screen.getByText(/Save job/)).toBeTruthy()

    rerender(<JobCard job={sampleJob} onView={() => {}} onToggleSave={() => {}} saved={true} />)
    expect(screen.getByText(/Saved/)).toBeTruthy()
  })

  it('fires callbacks when the buttons are clicked', () => {
    const onView = vi.fn()
    const onToggleSave = vi.fn()
    render(<JobCard job={sampleJob} onView={onView} onToggleSave={onToggleSave} saved={false} />)

    fireEvent.click(screen.getByText(/View details/))
    fireEvent.click(screen.getByText(/Save job/))

    expect(onView).toHaveBeenCalledWith(sampleJob)
    expect(onToggleSave).toHaveBeenCalledWith('abc123')
  })
})
