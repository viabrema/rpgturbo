import { describe, expect, it } from 'vitest'
import { useAppStore } from '../appStore.ts'

describe('useAppStore', () => {
  it('starts with portuguese locale', () => {
    useAppStore.setState({ locale: 'pt' })
    expect(useAppStore.getState().locale).toBe('pt')
  })

  it('updates locale via setLocale action', () => {
    const { setLocale } = useAppStore.getState()
    setLocale('en')
    expect(useAppStore.getState().locale).toBe('en')
  })
})
