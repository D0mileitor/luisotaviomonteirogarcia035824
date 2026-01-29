import { BehaviorSubject } from 'rxjs'
import { publicApi } from '@/api/client'

export interface HealthState {
  liveness: boolean
  readiness: boolean
  lastChecked: number | null
  details?: unknown
}

const initial: HealthState = {
  liveness: false,
  readiness: false,
  lastChecked: null,
  details: null,
}

export const health$ = new BehaviorSubject<HealthState>(initial)

export async function checkLiveness(): Promise<HealthState> {
  try {
    const res = await publicApi.get('/health/liveness')
    const ok = res?.data?.status === 'UP' || res?.data?.ok === true
    const next: HealthState = {
      ...health$.value,
      liveness: !!ok,
      lastChecked: Date.now(),
      details: res.data,
    }
    health$.next(next)
    return next
  } catch (err) {
    const next: HealthState = {
      ...health$.value,
      liveness: false,
      lastChecked: Date.now(),
      details: null,
    }
    health$.next(next)
    throw err
  }
}

export async function checkReadiness(): Promise<HealthState> {
  try {
    const res = await publicApi.get('/health/readiness')
    const ok = res?.data?.status === 'UP' || res?.data?.ok === true
    const next: HealthState = {
      ...health$.value,
      readiness: !!ok,
      lastChecked: Date.now(),
      details: { ...(health$.value.details as object), readiness: res.data },
    }
    health$.next(next)
    return next
  } catch (err) {
    const next: HealthState = {
      ...health$.value,
      readiness: false,
      lastChecked: Date.now(),
      details: null,
    }
    health$.next(next)
    throw err
  }
}

export function setLiveness(value: boolean) {
  const next: HealthState = { ...health$.value, liveness: value, lastChecked: Date.now() }
  health$.next(next)
}

export function setReadiness(value: boolean) {
  const next: HealthState = { ...health$.value, readiness: value, lastChecked: Date.now() }
  health$.next(next)
}

const healthFacade = {
  health$,
  checkLiveness,
  checkReadiness,
  setLiveness,
  setReadiness,
}

export default healthFacade
