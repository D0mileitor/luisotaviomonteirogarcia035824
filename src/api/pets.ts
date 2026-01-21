import { api } from "./client"

export interface Pet {
  id: number
  nome: string
  raca: string
  idade: number
  foto?: {
    url: string
  } | null
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
