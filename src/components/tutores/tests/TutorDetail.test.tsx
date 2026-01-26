import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import TutorDetail from "../TutorDetail"
import * as tutoresApi from "@/api/tutores"
import * as petsApi from "@/api/pets"

// Mock dos módulos da API
vi.mock("@/api/tutores")
vi.mock("@/api/pets")

// Mock do hook de toast
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: vi.fn(),
  }),
}))

// Mock do window.confirm
const mockConfirm = vi.fn()
global.confirm = mockConfirm

describe("TutorDetail", () => {
  const user = userEvent.setup()

  beforeEach(() => {
    vi.clearAllMocks()
    mockConfirm.mockReturnValue(true)
  })

  const mockTutor = {
    id: 1,
    nome: "João Silva",
    email: "joao.silva@example.com",
    telefone: "11987654321",
    endereco: "Rua das Flores, 123",
    cpf: 12345678900,
    foto: {
      id: 1,
      nome: "joao.jpg",
      contentType: "image/jpeg",
      url: "https://example.com/joao.jpg",
    },
    pets: [
      {
        id: 10,
        nome: "Rex",
        raca: "Labrador",
        idade: 3,
        foto: {
          id: 2,
          nome: "rex.jpg",
          contentType: "image/jpeg",
          url: "https://example.com/rex.jpg",
        },
      },
      {
        id: 11,
        nome: "Miau",
        raca: "Persa",
        idade: 2,
        foto: null,
      },
    ],
  }

  const mockAvailablePets = {
    page: 0,
    size: 100,
    total: 2,
    pageCount: 1,
    content: [
      {
        id: 20,
        nome: "Bolinha",
        raca: "Poodle",
        idade: 1,
        foto: null,
      },
      {
        id: 21,
        nome: "Fred",
        raca: "Beagle",
        idade: 4,
        foto: null,
      },
    ],
  }

  it("lista pets vinculados ao tutor", async () => {
    vi.mocked(tutoresApi.getTutorById).mockResolvedValue(mockTutor)

    render(
      <MemoryRouter initialEntries={["/tutores/1"]}>
        <Routes>
          <Route path="/tutores/:id" element={<TutorDetail />} />
        </Routes>
      </MemoryRouter>
    )

    // Aguarda o carregamento
    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "João Silva" })).toBeInTheDocument()
    })

    // Verifica se o cabeçalho de pets vinculados está presente
    expect(screen.getByRole("heading", { name: /Pets Vinculados/i })).toBeInTheDocument()

    // Verifica se os pets estão sendo listados
    expect(screen.getByText("Rex")).toBeInTheDocument()
    expect(screen.getByText("Labrador")).toBeInTheDocument()
    expect(screen.getByText("3 anos")).toBeInTheDocument()

    expect(screen.getByText("Miau")).toBeInTheDocument()
    expect(screen.getByText("Persa")).toBeInTheDocument()
    expect(screen.getByText("2 anos")).toBeInTheDocument()

    // Verifica se há dois cards de pets
    const petCards = screen.getAllByRole("heading", { level: 3 })
    expect(petCards).toHaveLength(2)
    expect(petCards[0]).toHaveTextContent("Rex")
    expect(petCards[1]).toHaveTextContent("Miau")
  })

  it("mostra mensagem quando tutor não tem pets vinculados", async () => {
    const tutorSemPets = {
      ...mockTutor,
      pets: [],
    }

    vi.mocked(tutoresApi.getTutorById).mockResolvedValue(tutorSemPets)

    render(
      <MemoryRouter initialEntries={["/tutores/1"]}>
        <Routes>
          <Route path="/tutores/:id" element={<TutorDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText("Nenhum pet vinculado.")).toBeInTheDocument()
    })
  })

  it("remove vínculo e atualiza UI", async () => {
    const tutorAposRemocao = {
      ...mockTutor,
      pets: [mockTutor.pets![1]], // Apenas o segundo pet (Miau)
    }

    vi.mocked(tutoresApi.getTutorById)
      .mockResolvedValueOnce(mockTutor) // Primeira chamada - carregamento inicial
      .mockResolvedValueOnce(tutorAposRemocao) // Segunda chamada - após desvincular

    vi.mocked(tutoresApi.desvincularPet).mockResolvedValue(undefined)

    render(
      <MemoryRouter initialEntries={["/tutores/1"]}>
        <Routes>
          <Route path="/tutores/:id" element={<TutorDetail />} />
        </Routes>
      </MemoryRouter>
    )

    // Aguarda o carregamento inicial
    await waitFor(() => {
      expect(screen.getByText("Rex")).toBeInTheDocument()
      expect(screen.getByText("Miau")).toBeInTheDocument()
    })

    // Localiza os botões de desvincular pelo variant destructive e posição
    const allButtons = screen.getAllByRole("button")
    const desvincularButtons = allButtons.filter(btn => 
      btn.className.includes("bg-destructive") && 
      btn.className.includes("rounded-full")
    )
    expect(desvincularButtons).toHaveLength(2)

    // Clica no botão de desvincular do primeiro pet (Rex)
    await user.click(desvincularButtons[0])

    // Verifica que o confirm foi chamado
    expect(mockConfirm).toHaveBeenCalledWith("Tem certeza que deseja desvincular este pet?")

    // Verifica que a API de desvincular foi chamada
    await waitFor(() => {
      expect(tutoresApi.desvincularPet).toHaveBeenCalledWith(1, 10)
    })

    // Verifica que o tutor foi recarregado
    await waitFor(() => {
      expect(tutoresApi.getTutorById).toHaveBeenCalledTimes(2)
    })

    // Verifica que Rex não está mais na lista, mas Miau ainda está
    await waitFor(() => {
      expect(screen.queryByText("Rex")).not.toBeInTheDocument()
      expect(screen.getByText("Miau")).toBeInTheDocument()
    })
  })

  it("não remove vínculo quando usuário cancela confirmação", async () => {
    mockConfirm.mockReturnValue(false)

    vi.mocked(tutoresApi.getTutorById).mockResolvedValue(mockTutor)
    vi.mocked(tutoresApi.desvincularPet).mockResolvedValue(undefined)

    render(
      <MemoryRouter initialEntries={["/tutores/1"]}>
        <Routes>
          <Route path="/tutores/:id" element={<TutorDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Rex" })).toBeInTheDocument()
    })

    const allButtons = screen.getAllByRole("button")
    const desvincularButtons = allButtons.filter(btn => 
      btn.className.includes("bg-destructive") && 
      btn.className.includes("rounded-full")
    )
    await user.click(desvincularButtons[0])

    expect(mockConfirm).toHaveBeenCalled()
    // Verifica que a API NÃO foi chamada porque o usuário cancelou
    expect(tutoresApi.desvincularPet).not.toHaveBeenCalled()
  })

  it("exibe informações de contato do tutor corretamente formatadas", async () => {
    vi.mocked(tutoresApi.getTutorById).mockResolvedValue(mockTutor)

    render(
      <MemoryRouter initialEntries={["/tutores/1"]}>
        <Routes>
          <Route path="/tutores/:id" element={<TutorDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      // Verifica nome
      expect(screen.getByRole("heading", { name: "João Silva" })).toBeInTheDocument()

      // Verifica telefone formatado
      expect(screen.getByText("Telefone")).toBeInTheDocument()
      expect(screen.getByText("(11) 98765-4321")).toBeInTheDocument()

      // Verifica email
      expect(screen.getByText("Email")).toBeInTheDocument()
      expect(screen.getByText("joao.silva@example.com")).toBeInTheDocument()

      // Verifica endereço
      expect(screen.getByText("Endereço")).toBeInTheDocument()
      expect(screen.getByText("Rua das Flores, 123")).toBeInTheDocument()
    })
  })

  it("abre dialog para vincular novo pet ao tutor", async () => {
    vi.mocked(tutoresApi.getTutorById).mockResolvedValue(mockTutor)
    vi.mocked(petsApi.getPets).mockResolvedValue(mockAvailablePets)

    render(
      <MemoryRouter initialEntries={["/tutores/1"]}>
        <Routes>
          <Route path="/tutores/:id" element={<TutorDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText("Rex")).toBeInTheDocument()
    })

    // Clica no botão "Vincular Pet"
    const vincularButton = screen.getByRole("button", { name: /Vincular Pet/i })
    await user.click(vincularButton)

    // Aguarda o dialog abrir e a lista de pets carregar
    await waitFor(() => {
      expect(screen.getByRole("dialog")).toBeInTheDocument()
      expect(screen.getByText("Selecione um pet para vincular a este tutor.")).toBeInTheDocument()
    })

    // Verifica que a API de pets foi chamada
    expect(petsApi.getPets).toHaveBeenCalledWith(0, 100)
  })

  it("mostra spinner durante o carregamento", () => {
    vi.mocked(tutoresApi.getTutorById).mockImplementation(
      () => new Promise(() => {}) // Promessa que nunca resolve
    )

    render(
      <MemoryRouter initialEntries={["/tutores/1"]}>
        <Routes>
          <Route path="/tutores/:id" element={<TutorDetail />} />
        </Routes>
      </MemoryRouter>
    )

    // Verifica se o spinner está presente
    const spinner = document.querySelector(".animate-spin")
    expect(spinner).toBeInTheDocument()
  })

  it("exibe foto do tutor quando disponível", async () => {
    vi.mocked(tutoresApi.getTutorById).mockResolvedValue(mockTutor)

    render(
      <MemoryRouter initialEntries={["/tutores/1"]}>
        <Routes>
          <Route path="/tutores/:id" element={<TutorDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      const tutorImage = screen.getByAltText("João Silva")
      expect(tutorImage).toBeInTheDocument()
      expect(tutorImage).toHaveAttribute("src", "https://example.com/joao.jpg")
    })
  })

  it("exibe inicial do nome quando não há foto do tutor", async () => {
    const tutorSemFoto = {
      ...mockTutor,
      foto: null,
    }

    vi.mocked(tutoresApi.getTutorById).mockResolvedValue(tutorSemFoto)

    render(
      <MemoryRouter initialEntries={["/tutores/1"]}>
        <Routes>
          <Route path="/tutores/:id" element={<TutorDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText("J")).toBeInTheDocument() // Primeira letra do nome
    })
  })

  it("formata idade do pet no singular quando é 1 ano", async () => {
    const tutorComPetUmAno = {
      ...mockTutor,
      pets: [
        {
          id: 10,
          nome: "Filhote",
          raca: "Golden",
          idade: 1,
          foto: null,
        },
      ],
    }

    vi.mocked(tutoresApi.getTutorById).mockResolvedValue(tutorComPetUmAno)

    render(
      <MemoryRouter initialEntries={["/tutores/1"]}>
        <Routes>
          <Route path="/tutores/:id" element={<TutorDetail />} />
        </Routes>
      </MemoryRouter>
    )

    await waitFor(() => {
      expect(screen.getByText("1 ano")).toBeInTheDocument()
    })
  })
})
