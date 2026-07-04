import { render, screen } from '@testing-library/react'
import App from '../App'

test('renders latest job listings header', () => {
  render(<App />)
  expect(screen.getByText(/Latest job listings/i)).toBeInTheDocument()
})
