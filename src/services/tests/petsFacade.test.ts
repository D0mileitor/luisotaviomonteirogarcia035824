import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('@/api/pets', () => ({
  getPets: vi.fn(),
  createPet: vi.fn(),
  updatePet: vi.fn(),
  uploadPetPhoto: vi.fn(),
}))

import * as petsApi from '@/api/pets'
import { petsFacade } from '@/services/petFacade'

const sampleResponse = {
  page: 0,
  size: 10,
  total: 1,
  pageCount: 1,
  content: [
    { id: 1, nome: 'Rex', raca: 'Vira-lata', idade: 3 },
  ],
}

describe('petsFacade', () => {
  beforeEach(() => {
    ;(petsApi.getPets as any).mockReset()
    ;(petsApi.createPet as any).mockReset()
    
  })

  it('loadPets calls getPets and updates pets$', async () => {
    ;(petsApi.getPets as any).mockResolvedValue(sampleResponse)

    const res = await petsFacade.loadPets(0, 10)

    expect(petsApi.getPets).toHaveBeenCalledWith(0, 10)
    expect(res).toEqual(sampleResponse)
    expect(petsFacade.pets$.value.content.length).toBe(1)
  })

  it('createPet calls createPet and reloads pets', async () => {
    ;(petsApi.createPet as any).mockResolvedValue({ id: 2, nome: 'Luna', raca: 'Poodle', idade: 2 })
    ;(petsApi.getPets as any).mockResolvedValue(sampleResponse)

    const pet = await petsFacade.createPet({ nome: 'Luna', raca: 'Poodle', idade: 2 })

    expect(petsApi.createPet).toHaveBeenCalled()
    expect(pet).toHaveProperty('id')
    
    expect(petsFacade.pets$.value.content).toEqual(sampleResponse.content)
  })
})
