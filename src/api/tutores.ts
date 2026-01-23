import { api } from "./client"

export interface Photo {
  id?: number
  nome?: string
  contentType?: string
  url?: string | null
}

export interface Pet {
  id: number
  nome: string
  raca: string
  idade: number
  foto?: Photo | null
}

export interface Tutor {
  id: number
  nome: string
  email?: string | null
  telefone?: string | null
  endereco?: string | null
  cpf?: number | null
  foto?: Photo | null
  pets?: Pet[]
}

export interface TutoresResponse {
  page: number
  size: number
  total: number
  pageCount: number
  content: Tutor[]
}

export async function getTutores(page = 0, size = 10): Promise<TutoresResponse> {
  const response = await api.get("/v1/tutores", {
    params: { page, size },
  })

  return response.data
}

export async function getTutorById(id: number): Promise<Tutor> {
  const response = await api.get(`/v1/tutores/${id}`)
  return response.data
}

export async function getTutoresByIds(ids: number[]): Promise<Tutor[]> {
  const promises = ids.map((id) => getTutorById(id))
  return Promise.all(promises)
}

export interface CreateTutorData {
  nome: string
  telefone?: string
  endereco?: string
  email?: string
  cpf?: number
}

export async function createTutor(data: CreateTutorData): Promise<Tutor> {
  const response = await api.post("/v1/tutores", data)
  return response.data
}

export async function updateTutor(id: number, data: CreateTutorData): Promise<Tutor> {
  const response = await api.put(`/v1/tutores/${id}`, data)
  return response.data
}

export async function uploadTutorPhoto(tutorId: number, file: File): Promise<Photo> {
  const formData = new FormData()
  formData.append("foto", file)
  
  const response = await api.post(`/v1/tutores/${tutorId}/fotos`, formData)
  
  return response.data
}

export async function deleteTutorPhoto(tutorId: number, fotoId: number): Promise<void> {
  await api.delete(`/v1/tutores/${tutorId}/fotos/${fotoId}`)
}

export async function vincularPet(tutorId: number, petId: number): Promise<void> {
  await api.post(`/v1/tutores/${tutorId}/pets/${petId}`)
}

export async function desvincularPet(tutorId: number, petId: number): Promise<void> {
  await api.delete(`/v1/tutores/${tutorId}/pets/${petId}`)
}

