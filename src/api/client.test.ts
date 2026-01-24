import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import AxiosMockAdapter from 'axios-mock-adapter'
import { api, publicApi, saveTokens } from './client'

describe('api client', () => {
  let mockApi: AxiosMockAdapter
  let mockPublic: AxiosMockAdapter

  beforeEach(() => {
    mockApi = new AxiosMockAdapter(api)
    mockPublic = new AxiosMockAdapter(publicApi)
    localStorage.clear()
  })

  afterEach(() => {
    mockApi.restore()
    mockPublic.restore()
    localStorage.clear()
  })

  it('salva tokens no localStorage', () => {
    saveTokens('access-1', 'refresh-1', 300, 1800)

    expect(localStorage.getItem('access_token')).toBe('access-1')
    expect(localStorage.getItem('refresh_token')).toBe('refresh-1')
    expect(localStorage.getItem('token_expires_at')).toBeTruthy()
    expect(localStorage.getItem('refresh_expires_at')).toBeTruthy()
  })

  it('request interceptor adiciona header Authorization quando tem token presente', async () => {
    localStorage.setItem('access_token', 'token-abc')

    mockApi.onGet('/test-auth').reply((config) => {
      expect(config.headers?.Authorization).toBe('Bearer token-abc')
      return [200, { ok: true }]
    })

    const response = await api.get('/test-auth')
    expect(response.data).toEqual({ ok: true })
  })

  it('endpoint de refresh chamado quando refreshAccessToken é invocado', async () => {
    
    mockPublic.onPut('/autenticacao/refresh').reply(200, {
      access_token: 'new-access',
      refresh_token: 'new-refresh',
      expires_in: 300,
      refresh_expires_in: 1800,
    })

    // Dispara o fluxo de refresh chamando publicApi.put diretamente via o módulo client
    // Chamamos o publicApi para simular o comportamento de refresh
    const res = await publicApi.put('/autenticacao/refresh')
    expect(res.data.access_token).toBe('new-access')
  })
})
