import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import AxiosMockAdapter from 'axios-mock-adapter'
import { api } from './client'
import { getTutores, getTutorById, createTutor, vincularPet, desvincularPet } from './tutores'

describe('tutores api', () => {
  let mock: AxiosMockAdapter

  beforeEach(() => {
    mock = new AxiosMockAdapter(api)
  })

  afterEach(() => {
    mock.restore()
  })

  it('retorna os tutores', async () => {
    mock.onGet('/v1/tutores').reply((config) => {
      expect(config.params.page).toBe(0)
      expect(config.params.size).toBe(10)
      return [200, { page: 0, size: 10, total: 0, pageCount: 0, content: [] }]
    })

    const res = await getTutores()
    expect(res.content).toBeInstanceOf(Array)
  })

  it('retorna o detalhe do tutor', async () => {
    mock.onGet('/v1/tutores/2').reply(200, { id: 2, nome: 'João', telefone: '123' })
    const t = await getTutorById(2)
    expect(t.nome).toBe('João')
  })

  it('criar tutor', async () => {
    mock.onPost('/v1/tutores').reply((config) => {
      const payload = JSON.parse(config.data)
      expect(payload.nome).toBe('Maria')
      return [201, { id: 20, ...payload }]
    })

    const created = await createTutor({ nome: 'Maria' })
    expect(created.id).toBe(20)
  })

  it('chama endpoint e desvincularPet também', async () => {
    mock.onPost('/v1/tutores/5/pets/9').reply(204)
    mock.onDelete('/v1/tutores/5/pets/9').reply(204)

    await expect(vincularPet(5, 9)).resolves.toBeUndefined()
    await expect(desvincularPet(5, 9)).resolves.toBeUndefined()
  })
})
