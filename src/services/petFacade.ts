import { BehaviorSubject } from 'rxjs'
import * as petsApi from '@/api/pets'
import type { PetsResponse, CreatePetData } from '@/api/pets'

const initial: PetsResponse = {
  page: 0,
  size: 10,
  total: 0,
  pageCount: 0,
  content: [],
}

const pets$ = new BehaviorSubject<PetsResponse>(initial)

async function loadPets(page = 0, size = 10): Promise<PetsResponse> {
  const data = await petsApi.getPets(page, size)
  pets$.next(data)
  return data
}

async function createPet(data: CreatePetData) {
  const pet = await petsApi.createPet(data)
  
  await loadPets(pets$.value.page, pets$.value.size)
  return pet
}

async function updatePet(id: number, data: CreatePetData) {
  const pet = await petsApi.updatePet(id, data)
  await loadPets(pets$.value.page, pets$.value.size)
  return pet
}

const uploadPetPhoto = petsApi.uploadPetPhoto
const deletePetPhoto = petsApi.deletePetPhoto
const getPetById = petsApi.getPetById

export const petsFacade = {
  pets$,
  loadPets,
  createPet,
  updatePet,
  uploadPetPhoto,
  deletePetPhoto,
  getPetById,
}

export default petsFacade
