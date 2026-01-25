import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import PetDetail from "../PetDetail"
import * as petsApi from "@/api/pets"
import * as tutoresApi from "@/api/tutores"

// Mock dos módulos da API
vi.mock("@/api/pets")
vi.mock("@/api/tutores")

describe("PetDetail", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockPet = {
    id: 1,
    nome: "Rex",
    raca: "Labrador",
    idade: 3,
    foto: {
      id: 1,
      nome: "rex.jpg",
      contentType: "image/jpeg",
      url: "https://example.com/rex.jpg",
    },
    tutores: [
      {
        id: 10,
        nome: "João Silva",
      },
    ],
  }

  const mockTutor = {
    id: 10,
    nome: "João Silva",
    email: "joao.silva@example.com",
    telefone: "(11) 98765-4321",
    endereco: "Rua das Flores, 123",
    cpf: 12345678900,
    foto: {
      id: 2,
      nome: "joao.jpg",
      contentType: "image/jpeg",
      url: "https://example.com/joao.jpg",
    },
  }

  it("destaca o nome do pet em destaque", async () => {
    vi.mocked(petsApi.getPetById).mockResolvedValue(mockPet)
    vi.mocked(tutoresApi.getTutorById).mockResolvedValue(mockTutor)

    render(
      <MemoryRouter initialEntries={["/pets/1"]}>
        <Routes>
          <Route path="/pets/:id" element={<PetDetail />} />
        </Routes>
      </MemoryRouter>
    )

    // Aguarda o carregamento e verifica se o nome do pet está destacado
    await waitFor(() => {
      const petName = screen.getByRole("heading", { name: "Rex", level: 2 })
      expect(petName).toBeInTheDocument()
      expect(petName).toHaveClass("font-bold")
    })
  })

  it("mostra os dados do pet (raça e idade)", async () => {
    vi.mocked(petsApi.getPetById).mockResolvedValue(mockPet)
    vi.mocked(tutoresApi.getTutorById).mockResolvedValue(mockTutor)

    render(
      <MemoryRouter initialEntries={["/pets/1"]}>
        <Routes>
          <Route path="/pets/:id" element={<PetDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      // Verifica a raça
      expect(screen.getByText("Raça")).toBeInTheDocument()
      expect(screen.getByText("Labrador")).toBeInTheDocument()

      // Verifica a idade
      expect(screen.getByText("Idade")).toBeInTheDocument()
      expect(screen.getByText("3 anos")).toBeInTheDocument()
    })
  })

  it("exibe a foto do pet quando disponível", async () => {
    vi.mocked(petsApi.getPetById).mockResolvedValue(mockPet)
    vi.mocked(tutoresApi.getTutorById).mockResolvedValue(mockTutor)

    render(
      <MemoryRouter initialEntries={["/pets/1"]}>
        <Routes>
          <Route path="/pets/:id" element={<PetDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      const petImage = screen.getByAltText("Rex")
      expect(petImage).toBeInTheDocument()
      expect(petImage).toHaveAttribute("src", "https://example.com/rex.jpg")
    })
  })

  it("se houver tutorId, exibe dados do tutor (mock)", async () => {
    vi.mocked(petsApi.getPetById).mockResolvedValue(mockPet)
    vi.mocked(tutoresApi.getTutorById).mockResolvedValue(mockTutor)

    render(
      <MemoryRouter initialEntries={["/pets/1"]}>
        <Routes>
          <Route path="/pets/:id" element={<PetDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      // Verifica o cabeçalho de tutores
      expect(screen.getByRole("heading", { name: /Tutores/i })).toBeInTheDocument()

      // Verifica o nome do tutor
      expect(screen.getByText("João Silva")).toBeInTheDocument()

      // Verifica o email do tutor
      expect(screen.getByText("Email")).toBeInTheDocument()
      expect(screen.getByText("joao.silva@example.com")).toBeInTheDocument()

      // Verifica o telefone do tutor
      expect(screen.getByText("Telefone")).toBeInTheDocument()
      expect(screen.getByText("(11) 98765-4321")).toBeInTheDocument()

      // Verifica o endereço do tutor
      expect(screen.getByText("Endereço")).toBeInTheDocument()
      expect(screen.getByText("Rua das Flores, 123")).toBeInTheDocument()
    })

    // Verifica se a API de tutor foi chamada com o ID correto
    expect(tutoresApi.getTutorById).toHaveBeenCalledWith(10)
  })

  it("mostra mensagem quando pet não tem tutores", async () => {
    const petSemTutor = {
      ...mockPet,
      tutores: [],
    }

    vi.mocked(petsApi.getPetById).mockResolvedValue(petSemTutor)

    render(
      <MemoryRouter initialEntries={["/pets/1"]}>
        <Routes>
          <Route path="/pets/:id" element={<PetDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText("Nenhum tutor cadastrado.")).toBeInTheDocument()
    })
  })

  it("mostra spinner durante o carregamento", () => {
    vi.mocked(petsApi.getPetById).mockImplementation(
      () => new Promise(() => {})
    )

    render(
      <MemoryRouter initialEntries={["/pets/1"]}>
        <Routes>
          <Route path="/pets/:id" element={<PetDetail />} />
        </Routes>
      </MemoryRouter>
    )

    // Verifica se o spinner está presente
    const spinner = document.querySelector(".animate-spin")
    expect(spinner).toBeInTheDocument()
  })

  it("exibe idade no singular quando pet tem 1 ano", async () => {
    const petComUmAno = {
      ...mockPet,
      idade: 1,
      tutores: [],
    }

    vi.mocked(petsApi.getPetById).mockResolvedValue(petComUmAno)

    render(
      <MemoryRouter initialEntries={["/pets/1"]}>
        <Routes>
          <Route path="/pets/:id" element={<PetDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText("1 ano")).toBeInTheDocument()
    })
  })

  it("não chama API de tutor quando tutor já vem com dados completos", async () => {
    const petComTutorCompleto = {
      ...mockPet,
      tutores: [mockTutor],
    }

    vi.mocked(petsApi.getPetById).mockResolvedValue(petComTutorCompleto)

    render(
      <MemoryRouter initialEntries={["/pets/1"]}>
        <Routes>
          <Route path="/pets/:id" element={<PetDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText("João Silva")).toBeInTheDocument()
    })

    expect(tutoresApi.getTutorById).not.toHaveBeenCalled()
  })
})
