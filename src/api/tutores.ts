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

export async function getTutorById(id: number): Promise<Tutor> {
  const response = await api.get(`/v1/tutores/${id}`)
  return response.data
}

export async function getTutoresByIds(ids: number[]): Promise<Tutor[]> {
  const promises = ids.map((id) => getTutorById(id))
  return Promise.all(promises)
}
