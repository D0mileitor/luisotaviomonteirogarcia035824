import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter, useNavigate } from 'react-router-dom'
import userEvent from '@testing-library/user-event'
import PetsLista from '../PetsLista'
import * as petsApi from '@/api/pets'
import type { PetsResponse } from '@/api/pets'

// Mock do react-router-dom
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: vi.fn(),
  }
})

// Mock do módulo de pets API
vi.mock('@/api/pets', () => ({
  getPets: vi.fn(),
  createPet: vi.fn(),
  updatePet: vi.fn(),
  uploadPetPhoto: vi.fn(),
  deletePetPhoto: vi.fn(),
  getPetById: vi.fn(),
}))

// Helper para renderizar com Router
const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>)
}

describe('PetsLista', () => {
  const mockNavigate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useNavigate).mockReturnValue(mockNavigate)
  })

  it('renderiza 10 cards por página mostrando foto/nome/raça/idade', async () => {
    // Criar mock com 10 pets
    const mockPets: PetsResponse = {
      page: 0,
      size: 10,
      total: 10,
      pageCount: 1,
      content: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        nome: `Pet ${i + 1}`,
        raca: `Raça ${i + 1}`,
        idade: i + 1,
        foto: {
          id: i + 1,
          nome: `pet-${i + 1}.jpg`,
          contentType: 'image/jpeg',
          url: `https://example.com/pet-${i + 1}.jpg`,
        },
      })),
    }

    vi.mocked(petsApi.getPets).mockResolvedValue(mockPets)

    renderWithRouter(<PetsLista />)

    // Aguardar o carregamento
    await waitFor(() => {
      expect(screen.queryByText('Carregando pets...')).not.toBeInTheDocument()
    })

    // Verificar se getPets foi chamado com os parâmetros corretos
    expect(petsApi.getPets).toHaveBeenCalledWith(0, 10)

    // Verificar se exatamente 10 cards foram renderizados
    const petCards = screen.getAllByRole('img', { name: /Pet \d+/ })
    expect(petCards).toHaveLength(10)

    // Verificar cada pet individualmente
    for (let i = 1; i <= 10; i++) {
      // Verificar nome (aparece como heading no CardTitle)
      expect(screen.getByText(`Pet ${i}`)).toBeInTheDocument()
      
      // Verificar raça
      expect(screen.getByText(`Raça ${i}`)).toBeInTheDocument()
      
      // Verificar idade
      const idadeText = i === 1 ? '1 anos' : `${i} anos`
      expect(screen.getByText(idadeText)).toBeInTheDocument()
      
      // Verificar foto
      const img = screen.getByAltText(`Pet ${i}`)
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('src', `https://example.com/pet-${i}.jpg`)
    }
  })

  it('exibe foto padrão quando pet não tem foto', async () => {
    const mockPets: PetsResponse = {
      page: 0,
      size: 10,
      total: 1,
      pageCount: 1,
      content: [
        {
          id: 1,
          nome: 'Pet Sem Foto',
          raca: 'Vira-lata',
          idade: 3,
          foto: null,
        },
      ],
    }

    vi.mocked(petsApi.getPets).mockResolvedValue(mockPets)

    renderWithRouter(<PetsLista />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando pets...')).not.toBeInTheDocument()
    })

    const img = screen.getByAltText('Pet Sem Foto')
    expect(img).toHaveAttribute('src', '/petSemfoto.png')
  })

  it('exibe mensagem quando não há pets cadastrados', async () => {
    const mockPets: PetsResponse = {
      page: 0,
      size: 10,
      total: 0,
      pageCount: 0,
      content: [],
    }

    vi.mocked(petsApi.getPets).mockResolvedValue(mockPets)

    renderWithRouter(<PetsLista />)

    await waitFor(() => {
      expect(screen.getByText('Nenhum pet cadastrado')).toBeInTheDocument()
    })

    expect(
      screen.getByText('Ainda não existem pets cadastrados no sistema.')
    ).toBeInTheDocument()
  })

  it('pesquisa por nome filtra resultados localmente', async () => {
    const user = userEvent.setup()
    const mockPets: PetsResponse = {
      page: 0,
      size: 10,
      total: 5,
      pageCount: 1,
      content: [
        { id: 1, nome: 'Rex', raca: 'Pastor Alemão', idade: 3, foto: null },
        { id: 2, nome: 'Bolinha', raca: 'Poodle', idade: 2, foto: null },
        { id: 3, nome: 'Max', raca: 'Labrador', idade: 5, foto: null },
        { id: 4, nome: 'Bella', raca: 'Golden', idade: 4, foto: null },
        { id: 5, nome: 'Luna', raca: 'Husky', idade: 1, foto: null },
      ],
    }

    vi.mocked(petsApi.getPets).mockResolvedValue(mockPets)

    renderWithRouter(<PetsLista />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando pets...')).not.toBeInTheDocument()
    })

    // Verificar que todos os 5 pets estão visíveis
    expect(screen.getByText('Rex')).toBeInTheDocument()
    expect(screen.getByText('Bolinha')).toBeInTheDocument()
    expect(screen.getByText('Max')).toBeInTheDocument()
    expect(screen.getByText('Bella')).toBeInTheDocument()
    expect(screen.getByText('Luna')).toBeInTheDocument()

    // Abrir o collapsible de filtros
    const filtrosButton = screen.getByRole('button', { name: /filtros/i })
    await user.click(filtrosButton)

    // Digitar no campo de busca
    const searchInput = await screen.findByPlaceholderText('Buscar por nome...')
    await user.type(searchInput, 'Rex')

    // Verificar que apenas Rex está visível
    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument()
      expect(screen.queryByText('Bolinha')).not.toBeInTheDocument()
      expect(screen.queryByText('Max')).not.toBeInTheDocument()
      expect(screen.queryByText('Bella')).not.toBeInTheDocument()
      expect(screen.queryByText('Luna')).not.toBeInTheDocument()
    })
  })

  it('filtro de raça funciona corretamente', async () => {
    const user = userEvent.setup()
    const mockPets: PetsResponse = {
      page: 0,
      size: 10,
      total: 3,
      pageCount: 1,
      content: [
        { id: 1, nome: 'Rex', raca: 'Labrador', idade: 3, foto: null },
        { id: 2, nome: 'Bolinha', raca: 'Poodle', idade: 2, foto: null },
        { id: 3, nome: 'Max', raca: 'Labrador', idade: 5, foto: null },
      ],
    }

    vi.mocked(petsApi.getPets).mockResolvedValue(mockPets)

    renderWithRouter(<PetsLista />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando pets...')).not.toBeInTheDocument()
    })

    // Todos os pets devem estar visíveis
    expect(screen.getByText('Rex')).toBeInTheDocument()
    expect(screen.getByText('Bolinha')).toBeInTheDocument()
    expect(screen.getByText('Max')).toBeInTheDocument()

    // Abrir o collapsible de filtros
    const filtrosButton = screen.getByRole('button', { name: /filtros/i })
    await user.click(filtrosButton)

    // Abrir o select de raça (encontrar pelo texto do placeholder)
    const racaSelect = await screen.findByText('Todas as raças')
    expect(racaSelect).toBeInTheDocument()
    await user.click(racaSelect!)

    // Selecionar Labrador
    const labradorOption = await screen.findByText('Labrador')
    await user.click(labradorOption)

    // Verificar que apenas Labradores estão visíveis
    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument()
      expect(screen.queryByText('Bolinha')).not.toBeInTheDocument()
      expect(screen.getByText('Max')).toBeInTheDocument()
    })
  })

  it('filtro de idade funciona corretamente', async () => {
    const user = userEvent.setup()
    const mockPets: PetsResponse = {
      page: 0,
      size: 10,
      total: 3,
      pageCount: 1,
      content: [
        { id: 1, nome: 'Rex', raca: 'Labrador', idade: 3, foto: null },
        { id: 2, nome: 'Bolinha', raca: 'Poodle', idade: 2, foto: null },
        { id: 3, nome: 'Max', raca: 'Labrador', idade: 3, foto: null },
      ],
    }

    vi.mocked(petsApi.getPets).mockResolvedValue(mockPets)

    renderWithRouter(<PetsLista />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando pets...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Bolinha')).toBeInTheDocument()
    expect(screen.getByText('Max')).toBeInTheDocument()
    expect(screen.getByText('Mia')).toBeInTheDocument()

    // Abrir o collapsible de filtros
    const filtrosButton = screen.getByRole('button', { name: /filtros/i })
    await user.click(filtrosButton)

    // Abrir o select de idade (encontrar pelo texto do placeholder)
    const idadeSelect = await screen.findByText('Todas as idades')
    const idadeSelectButton = idadeSelect.closest('button')
    expect(idadeSelectButton).toBeInTheDocument()
    await user.click(idadeSelectButton!)

    // Selecionar 3 anos
    const idadeOption = await screen.findByText('3 anos')
    await user.click(idadeOption)

    // Verificar que apenas pets com 3 anos estão visíveis
    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument()
      expect(screen.queryByText('Bolinha')).not.toBeInTheDocument()
      expect(screen.getByText('Max')).toBeInTheDocument()
    })
  })

  it('botão limpar filtros reseta todos os filtros', async () => {
    const user = userEvent.setup()
    const mockPets: PetsResponse = {
      page: 0,
      size: 10,
      total: 3,
      pageCount: 1,
      content: [
        { id: 1, nome: 'Rex', raca: 'Labrador', idade: 3, foto: null },
        { id: 2, nome: 'Bolinha', raca: 'Poodle', idade: 2, foto: null },
        { id: 3, nome: 'Max', raca: 'Golden', idade: 5, foto: null },
      ],
    }

    vi.mocked(petsApi.getPets).mockResolvedValue(mockPets)

    renderWithRouter(<PetsLista />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando pets...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Bolinha')).toBeInTheDocument()
    expect(screen.getByText('Max')).toBeInTheDocument()
    expect(screen.getByText('Rex')).toBeInTheDocument()

    // Abrir o collapsible de filtros
    const filtrosButton = screen.getByRole('button', { name: /filtros/i })
    await user.click(filtrosButton)

    // Aplicar filtro de raça (encontrar pelo texto do placeholder)
    const racaSelect = await screen.findByText('Todas as raças')
    const racaSelectButton = racaSelect.closest('button')
    expect(racaSelectButton).toBeInTheDocument()
    await user.click(racaSelectButton!)
    const labradorOption = await screen.findByText('Labrador')
    await user.click(labradorOption)

    // Verificar que filtro foi aplicado
    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument()
      expect(screen.queryByText('Bolinha')).not.toBeInTheDocument()
    })

    // Clicar no botão "Limpar filtros"
    const limparButton = screen.getByRole('button', { name: /limpar filtros/i })
    await user.click(limparButton)

    // Verificar que todos os pets estão visíveis novamente
    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument()
      expect(screen.getByText('Bolinha')).toBeInTheDocument()
      expect(screen.getByText('Max')).toBeInTheDocument()
    })
  })

  it('paginação funciona - botão próxima página', async () => {
    const user = userEvent.setup()
    
    // Primeira página
    const mockPetsPage0: PetsResponse = {
      page: 0,
      size: 10,
      total: 15,
      pageCount: 2,
      content: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        nome: `Pet ${i + 1}`,
        raca: 'Labrador',
        idade: 3,
        foto: null,
      })),
    }

    // Segunda página
    const mockPetsPage1: PetsResponse = {
      page: 1,
      size: 10,
      total: 15,
      pageCount: 2,
      content: Array.from({ length: 5 }, (_, i) => ({
        id: i + 11,
        nome: `Pet ${i + 11}`,
        raca: 'Poodle',
        idade: 2,
        foto: null,
      })),
    }

    vi.mocked(petsApi.getPets).mockResolvedValueOnce(mockPetsPage0)

    renderWithRouter(<PetsLista />)

    await waitFor(() => {
      expect(screen.getByText('Pet 1')).toBeInTheDocument()
    })

    // Verificar que estamos na página 1
    expect(screen.getByText('Página 1 de 2')).toBeInTheDocument()

    // Botão anterior deve estar desabilitado
    const previousButton = screen.getByRole('button', { name: /anterior/i })
    expect(previousButton).toBeDisabled()

    // Mock para segunda página
    vi.mocked(petsApi.getPets).mockResolvedValueOnce(mockPetsPage1)

    // Clicar em próxima
    const nextButton = screen.getByRole('button', { name: /próxima/i })
    await user.click(nextButton)

    // Verificar que getPets foi chamado com page=1
    await waitFor(() => {
      expect(petsApi.getPets).toHaveBeenCalledWith(1, 10)
    })

    // Verificar que novos pets são exibidos
    await waitFor(() => {
      expect(screen.getByText('Pet 11')).toBeInTheDocument()
    })

    // Verificar que estamos na página 2
    expect(screen.getByText('Página 2 de 2')).toBeInTheDocument()
  })

  it('paginação funciona - botão página anterior', async () => {
    const user = userEvent.setup()
    
    // Segunda página
    const mockPetsPage1: PetsResponse = {
      page: 1,
      size: 10,
      total: 15,
      pageCount: 2,
      content: Array.from({ length: 5 }, (_, i) => ({
        id: i + 11,
        nome: `Pet ${i + 11}`,
        raca: 'Poodle',
        idade: 2,
        foto: null,
      })),
    }

    // Primeira página
    const mockPetsPage0: PetsResponse = {
      page: 0,
      size: 10,
      total: 15,
      pageCount: 2,
      content: Array.from({ length: 10 }, (_, i) => ({
        id: i + 1,
        nome: `Pet ${i + 1}`,
        raca: 'Labrador',
        idade: 3,
        foto: null,
      })),
    }

    vi.mocked(petsApi.getPets).mockResolvedValueOnce(mockPetsPage0)

    renderWithRouter(<PetsLista />)

    await waitFor(() => {
      expect(screen.getByText('Pet 1')).toBeInTheDocument()
    })

    // Ir para a página 2
    vi.mocked(petsApi.getPets).mockResolvedValueOnce(mockPetsPage1)
    const nextButton = screen.getByRole('button', { name: /próxima/i })
    await user.click(nextButton)

    await waitFor(() => {
      expect(screen.getByText('Pet 11')).toBeInTheDocument()
    })

    // Botão próxima deve estar desabilitado na última página
    expect(nextButton).toBeDisabled()

    // Mock para voltar à primeira página
    vi.mocked(petsApi.getPets).mockResolvedValueOnce(mockPetsPage0)

    // Clicar em anterior
    const previousButton = screen.getByRole('button', { name: /anterior/i })
    await user.click(previousButton)

    // Verificar que voltamos à página 1
    await waitFor(() => {
      expect(petsApi.getPets).toHaveBeenCalledWith(0, 10)
      expect(screen.getByText('Pet 1')).toBeInTheDocument()
    })
  })

  it('botão Novo Pet abre o dialog de criação', async () => {
    const user = userEvent.setup()
    const mockPets: PetsResponse = {
      page: 0,
      size: 10,
      total: 1,
      pageCount: 1,
      content: [
        { id: 1, nome: 'Rex', raca: 'Labrador', idade: 3, foto: null },
      ],
    }

    vi.mocked(petsApi.getPets).mockResolvedValue(mockPets)

    renderWithRouter(<PetsLista />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando pets...')).not.toBeInTheDocument()
    })

    // Clicar no botão Novo Pet
    const novoPetButton = screen.getByRole('button', { name: /novo pet/i })
    await user.click(novoPetButton)

    // Verificar que o dialog foi aberto (procurar por elementos do formulário)
    // O dialog deve ter inputs para os campos do pet
    await waitFor(() => {
      // Como o PetFormDialog usa radix-ui, vamos verificar se um dialog foi aberto
      // procurando pelo atributo role="dialog" ou data-state="open"
      const dialogs = document.querySelectorAll('[role="dialog"]')
      expect(dialogs.length).toBeGreaterThan(0)
    })
  })

  it('botão Ver detalhes navega para a página do pet', async () => {
    const user = userEvent.setup()
    const mockPets: PetsResponse = {
      page: 0,
      size: 10,
      total: 1,
      pageCount: 1,
      content: [
        { id: 123, nome: 'Rex', raca: 'Labrador', idade: 3, foto: null },
      ],
    }

    vi.mocked(petsApi.getPets).mockResolvedValue(mockPets)

    renderWithRouter(<PetsLista />)

    await waitFor(() => {
      expect(screen.getByText('Rex')).toBeInTheDocument()
    })

    // Clicar no botão "Ver detalhes"
    const detalhesButton = screen.getByRole('button', { name: /ver detalhes/i })
    await user.click(detalhesButton)

    // Verificar que navigate foi chamado com o caminho correto
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/pets/123')
    })
  })

  it('exibe mensagem quando pesquisa não retorna resultados', async () => {
    const user = userEvent.setup()
    const mockPets: PetsResponse = {
      page: 0,
      size: 10,
      total: 2,
      pageCount: 1,
      content: [
        { id: 1, nome: 'Rex', raca: 'Labrador', idade: 3, foto: null },
        { id: 2, nome: 'Max', raca: 'Poodle', idade: 2, foto: null },
      ],
    }

    vi.mocked(petsApi.getPets).mockResolvedValue(mockPets)

    renderWithRouter(<PetsLista />)

    await waitFor(() => {
      expect(screen.queryByText('Carregando pets...')).not.toBeInTheDocument()
    })

    expect(screen.getByText('Max')).toBeInTheDocument()
    expect(screen.getByText('Rex')).toBeInTheDocument()

    // Abrir o collapsible de filtros
    const filtrosButton = screen.getByRole('button', { name: /filtros/i })
    await user.click(filtrosButton)

    // Buscar por um nome que não existe
    const searchInput = await screen.findByPlaceholderText('Buscar por nome...')
    await user.type(searchInput, 'NomeInexistente')

    // Verificar mensagem de nenhum resultado
    await waitFor(() => {
      expect(
        screen.getByText('Nenhum pet encontrado com os filtros aplicados.')
      ).toBeInTheDocument()
    })
  })
})
