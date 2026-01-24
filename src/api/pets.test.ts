import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import AxiosMockAdapter from 'axios-mock-adapter'
import { api } from './client'
import { getPets, getPetById, createPet, updatePet, uploadPetPhoto } from './pets'

describe('pets api', () => {
  let mock: AxiosMockAdapter

  beforeEach(() => {
    mock = new AxiosMockAdapter(api)
  })

  afterEach(() => {
    mock.restore()
  })

  it('getPets retornar os pets', async () => {
    mock.onGet('/v1/pets').reply((config) => {
      expect(config.params.page).toBe(1)
      expect(config.params.size).toBe(10)
      return [200, { page: 1, size: 10, total: 1, pageCount: 1, content: [{ id: 1, nome: 'Rex', raca: 'SRD', idade: 3 }] }]
    })

    const data = await getPets(1, 10)
    expect(data.content[0].nome).toBe('Rex')
  })

  it('retorna o detalhe do pet', async () => {
    mock.onGet('/v1/pets/5').reply(200, { id: 5, nome: 'Bola', raca: 'Poodle', idade: 2 })

    const pet = await getPetById(5)
    expect(pet.id).toBe(5)
    expect(pet.nome).toBe('Bola')
  })

  it('criar pet', async () => {
    mock.onPost('/v1/pets').reply((config) => {
      const payload = JSON.parse(config.data)
      expect(payload.nome).toBe('Novo')
      return [201, { id: 10, ...payload }]
    })

    const created = await createPet({ nome: 'Novo', raca: 'Vira-lata', idade: 1 })
    expect(created.id).toBe(10)
  })

  it('atualizar pet', async () => {
    mock.onPut('/v1/pets/7').reply((config) => {
      const payload = JSON.parse(config.data)
      expect(payload.raca).toBe('Labrador')
      return [200, { id: 7, ...payload }]
    })

    const updated = await updatePet(7, { nome: 'Max', raca: 'Labrador', idade: 4 })
    expect(updated.raca).toBe('Labrador')
  })

  it('envia arquivo e retorna objeto da foto', async () => {
    mock.onPost('/v1/pets/3/fotos').reply(() => {
      return [200, { id: 100, nome: 'foto.jpg', url: 'http://example.com/foto.jpg' }]
    })

    // Criar arquivo fake 
    const file = new File(['hello'], 'foto.jpg', { type: 'image/jpeg' })
    const photo = await uploadPetPhoto(3, file)
    expect(photo.id).toBe(100)
    expect(photo.url).toContain('http')
  })
})
