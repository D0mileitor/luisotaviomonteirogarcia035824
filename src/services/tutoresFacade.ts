import { BehaviorSubject } from 'rxjs'
import * as tutoresApi from '@/api/tutores'
import type { TutoresResponse, CreateTutorData } from '@/api/tutores'

const initial: TutoresResponse = {
  page: 0,
  size: 10,
  total: 0,
  pageCount: 0,
  content: [],
}

const tutores$ = new BehaviorSubject<TutoresResponse>(initial)

async function loadTutores(page = 0, size = 10): Promise<TutoresResponse> {
  const data = await tutoresApi.getTutores(page, size)
  tutores$.next(data)
  return data
}

async function createTutor(data: CreateTutorData) {
  const tutor = await tutoresApi.createTutor(data)
  
  await loadTutores(tutores$.value.page, tutores$.value.size)
  return tutor
}

async function updateTutor(id: number, data: CreateTutorData) {
  const tutor = await tutoresApi.updateTutor(id, data)
  await loadTutores(tutores$.value.page, tutores$.value.size)
  return tutor
}

async function vincularPet(tutorId: number, petId: number) {
  await tutoresApi.vincularPet(tutorId, petId)
  await loadTutores(tutores$.value.page, tutores$.value.size)
}

async function desvincularPet(tutorId: number, petId: number) {
  await tutoresApi.desvincularPet(tutorId, petId)
  await loadTutores(tutores$.value.page, tutores$.value.size)
}

const uploadTutorPhoto = tutoresApi.uploadTutorPhoto
const deleteTutorPhoto = tutoresApi.deleteTutorPhoto
const getTutorById = tutoresApi.getTutorById

export const tutoresFacade = {
  tutores$,
  loadTutores,
  createTutor,
  updateTutor,
  vincularPet,
  desvincularPet,
  uploadTutorPhoto,
  deleteTutorPhoto,
  getTutorById,
}

export default tutoresFacade
