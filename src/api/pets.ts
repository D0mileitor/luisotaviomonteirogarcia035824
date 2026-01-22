import { api } from "./client"

export interface Photo {
  id?: number
  nome?: string
  contentType?: string
  url?: string | null
}

export interface Tutor {
  id: number
  nome: string
  email?: string | null
  telefone?: string | null
  endereco?: string | null
  cpf?: number | null
  foto?: Photo | null
}

export interface Pet {
  id: number
  nome: string
  raca: string
  idade: number
  foto?: Photo | null
  tutores?: Tutor[]
}

export interface PetsResponse {
  page: number
  size: number
  total: number
  pageCount: number
  content: Pet[]
}

export async function getPets(page = 0, size = 10): Promise<PetsResponse> {
  const response = await api.get("/v1/pets", {
    params: { page, size },
  })

  return response.data
}

export async function getPetById(id: number): Promise<Pet> {
  const response = await api.get(`/v1/pets/${id}`)
  return response.data
}
