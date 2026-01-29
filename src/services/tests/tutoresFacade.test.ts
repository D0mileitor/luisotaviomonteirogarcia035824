import { describe, it, expect, vi, beforeEach } from 'vitest'
import { tutoresFacade } from '../tutoresFacade'
import * as tutoresApi from '@/api/tutores'
import type { TutoresResponse, Tutor, CreateTutorData } from '@/api/tutores'

vi.mock('@/api/tutores')

describe('tutoresFacade', () => {
  const mockTutoresResponse: TutoresResponse = {
    page: 0,
    size: 10,
    total: 2,
    pageCount: 1,
    content: [
      {
        id: 1,
        nome: 'João Silva',
        email: 'joao@example.com',
        telefone: '11999999999',
        endereco: 'Rua A, 123',
        cpf: 12345678900,
        foto: null,
        pets: [],
      },
      {
        id: 2,
        nome: 'Maria Santos',
        email: 'maria@example.com',
        telefone: '11988888888',
        endereco: 'Rua B, 456',
        cpf: 98765432100,
        foto: null,
        pets: [],
      },
    ],
  }

  const mockTutor: Tutor = {
    id: 3,
    nome: 'Pedro Costa',
    email: 'pedro@example.com',
    telefone: '11977777777',
    endereco: 'Rua C, 789',
    cpf: 11122233344,
    foto: null,
    pets: [],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('loadTutores', () => {
    it('deve carregar tutores e atualizar o BehaviorSubject', async () => {
      vi.mocked(tutoresApi.getTutores).mockResolvedValue(mockTutoresResponse)

      const result = await tutoresFacade.loadTutores(0, 10)

      expect(tutoresApi.getTutores).toHaveBeenCalledWith(0, 10)
      expect(result).toEqual(mockTutoresResponse)
      expect(tutoresFacade.tutores$.value).toEqual(mockTutoresResponse)
    })

    it('deve usar valores padrão de página e tamanho', async () => {
      vi.mocked(tutoresApi.getTutores).mockResolvedValue(mockTutoresResponse)

      await tutoresFacade.loadTutores()

      expect(tutoresApi.getTutores).toHaveBeenCalledWith(0, 10)
    })
  })

  describe('createTutor', () => {
    it('deve criar tutor e recarregar a lista', async () => {
      const createData: CreateTutorData = {
        nome: 'Pedro Costa',
        email: 'pedro@example.com',
        telefone: '11977777777',
        endereco: 'Rua C, 789',
        cpf: 11122233344,
      }

      vi.mocked(tutoresApi.createTutor).mockResolvedValue(mockTutor)
      vi.mocked(tutoresApi.getTutores).mockResolvedValue(mockTutoresResponse)

      // Simular estado atual do BehaviorSubject
      tutoresFacade.tutores$.next({ ...mockTutoresResponse, page: 1, size: 5 })

      const result = await tutoresFacade.createTutor(createData)

      expect(tutoresApi.createTutor).toHaveBeenCalledWith(createData)
      expect(tutoresApi.getTutores).toHaveBeenCalledWith(1, 5)
      expect(result).toEqual(mockTutor)
    })
  })

  describe('updateTutor', () => {
    it('deve atualizar tutor e recarregar a lista', async () => {
      const updateData: CreateTutorData = {
        nome: 'Pedro Costa Atualizado',
        email: 'pedro.novo@example.com',
        telefone: '11966666666',
        endereco: 'Rua D, 999',
        cpf: 11122233344,
      }

      const updatedTutor = { ...mockTutor, ...updateData }

      vi.mocked(tutoresApi.updateTutor).mockResolvedValue(updatedTutor)
      vi.mocked(tutoresApi.getTutores).mockResolvedValue(mockTutoresResponse)

      tutoresFacade.tutores$.next(mockTutoresResponse)

      const result = await tutoresFacade.updateTutor(3, updateData)

      expect(tutoresApi.updateTutor).toHaveBeenCalledWith(3, updateData)
      expect(tutoresApi.getTutores).toHaveBeenCalledWith(0, 10)
      expect(result).toEqual(updatedTutor)
    })
  })

  describe('vincularPet', () => {
    it('deve vincular pet ao tutor e recarregar a lista', async () => {
      vi.mocked(tutoresApi.vincularPet).mockResolvedValue(undefined)
      vi.mocked(tutoresApi.getTutores).mockResolvedValue(mockTutoresResponse)

      tutoresFacade.tutores$.next(mockTutoresResponse)

      await tutoresFacade.vincularPet(1, 5)

      expect(tutoresApi.vincularPet).toHaveBeenCalledWith(1, 5)
      expect(tutoresApi.getTutores).toHaveBeenCalledWith(0, 10)
    })
  })

  describe('desvincularPet', () => {
    it('deve desvincular pet do tutor e recarregar a lista', async () => {
      vi.mocked(tutoresApi.desvincularPet).mockResolvedValue(undefined)
      vi.mocked(tutoresApi.getTutores).mockResolvedValue(mockTutoresResponse)

      tutoresFacade.tutores$.next(mockTutoresResponse)

      await tutoresFacade.desvincularPet(1, 5)

      expect(tutoresApi.desvincularPet).toHaveBeenCalledWith(1, 5)
      expect(tutoresApi.getTutores).toHaveBeenCalledWith(0, 10)
    })
  })

  describe('BehaviorSubject tutores$', () => {
    it('deve ter valor inicial correto', () => {
     
      const { tutores$ } = tutoresFacade

     
      expect(tutores$.value).toHaveProperty('page')
      expect(tutores$.value).toHaveProperty('size')
      expect(tutores$.value).toHaveProperty('total')
      expect(tutores$.value).toHaveProperty('pageCount')
      expect(tutores$.value).toHaveProperty('content')
    })

    it('deve permitir subscrição para mudanças', async () => {
      vi.mocked(tutoresApi.getTutores).mockResolvedValue(mockTutoresResponse)

      const values: TutoresResponse[] = []
      const subscription = tutoresFacade.tutores$.subscribe((value) => {
        values.push(value)
      })

      await tutoresFacade.loadTutores()

      subscription.unsubscribe()
      
      
      expect(values[values.length - 1]).toEqual(mockTutoresResponse)
    })
  })
})
