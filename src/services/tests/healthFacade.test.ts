import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/api/client', () => ({
  publicApi: {
    get: vi.fn(),
  },
}))

import { publicApi } from '@/api/client'
import { health$, checkLiveness, checkReadiness, setLiveness, setReadiness } from '@/services/healthFacade'

describe('healthFacade', () => {
  beforeEach(() => {
   
    setLiveness(false)
    setReadiness(false)
    ;(publicApi.get as any).mockReset()
  })

  it('checkLiveness sets liveness true when API returns UP', async () => {
    ;(publicApi.get as any).mockResolvedValue({ data: { status: 'UP' } })

    const res = await checkLiveness()

    expect(res.liveness).toBe(true)
    expect(health$.value.liveness).toBe(true)
    expect(res.lastChecked).toBeDefined()
  })

  it('checkReadiness sets readiness true when API returns ok true', async () => {
    ;(publicApi.get as any).mockResolvedValue({ data: { ok: true } })

    const res = await checkReadiness()

    expect(res.readiness).toBe(true)
    expect(health$.value.readiness).toBe(true)
    expect(res.lastChecked).toBeDefined()
  })

  it('setLiveness and setReadiness update the BehaviorSubject', () => {
    setLiveness(true)
    expect(health$.value.liveness).toBe(true)

    setReadiness(true)
    expect(health$.value.readiness).toBe(true)
  })
})
