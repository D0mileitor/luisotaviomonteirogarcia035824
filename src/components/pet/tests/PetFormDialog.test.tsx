import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { PetFormDialog } from "../PetFormDialog"
import * as petsApi from "@/api/pets"

// Mock dos módulos da API
vi.mock("@/api/pets")

// Mock do hook de toast
const mockToast = vi.fn()
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({
    toast: mockToast,
  }),
}))

describe("PetFormDialog", () => {
  const user = userEvent.setup()
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

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
  }

  describe("Validações de campos obrigatórios", () => {
    it("valida campo nome obrigatório com mínimo de 2 caracteres", async () => {
      vi.mocked(petsApi.createPet).mockResolvedValue(mockPet)

      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      // Preenche apenas 1 caractere no nome
      const nomeInput = screen.getByLabelText(/Nome \*/i)
      await user.type(nomeInput, "A")

      const racaInput = screen.getByLabelText(/Raça \*/i)
      await user.type(racaInput, "Poodle")

      const idadeInput = screen.getByLabelText(/Idade/i)
      await user.clear(idadeInput)
      await user.type(idadeInput, "5")

      // Submete o formulário
      const submitButton = screen.getByRole("button", { name: /Criar/i })
      await user.click(submitButton)

      // Verifica que mostra erro de validação
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Erro de validação",
            description: "Nome deve ter pelo menos 2 caracteres",
            variant: "destructive",
          })
        )
      })

      // Verifica que a API NÃO foi chamada
      expect(petsApi.createPet).not.toHaveBeenCalled()
    })

    it("valida campo raça obrigatório com mínimo de 2 caracteres", async () => {
      vi.mocked(petsApi.createPet).mockResolvedValue(mockPet)

      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      const nomeInput = screen.getByLabelText(/Nome \*/i)
      await user.type(nomeInput, "Bolinha")

      // Preenche apenas 1 caractere na raça
      const racaInput = screen.getByLabelText(/Raça \*/i)
      await user.type(racaInput, "P")

      const idadeInput = screen.getByLabelText(/Idade/i)
      await user.clear(idadeInput)
      await user.type(idadeInput, "5")

      const submitButton = screen.getByRole("button", { name: /Criar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Erro de validação",
            description: "Raça deve ter pelo menos 2 caracteres",
            variant: "destructive",
          })
        )
      })

      expect(petsApi.createPet).not.toHaveBeenCalled()
    })

    it("valida idade entre 0 e 50", async () => {
      vi.mocked(petsApi.createPet).mockResolvedValue(mockPet)

      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      const nomeInput = screen.getByLabelText(/Nome \*/i)
      await user.type(nomeInput, "Bolinha")

      const racaInput = screen.getByLabelText(/Raça \*/i)
      await user.type(racaInput, "Poodle")

      // Tenta preencher idade inválida (maior que 50)
      const idadeInput = screen.getByLabelText(/Idade/i)
      await user.clear(idadeInput)
      await user.type(idadeInput, "55")

      const submitButton = screen.getByRole("button", { name: /Criar/i })
      await user.click(submitButton)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Erro de validação",
            description: "Idade deve ser um número entre 0 e 50",
            variant: "destructive",
          })
        )
      })

      expect(petsApi.createPet).not.toHaveBeenCalled()
    })

    it("não permite submit quando nome está vazio", async () => {
      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      const nomeInput = screen.getByLabelText(/Nome \*/i) as HTMLInputElement
      
      // Verifica que o campo é required
      expect(nomeInput).toHaveAttribute("required")
    })
  })

  describe("Submissão do formulário - Criar Pet", () => {
    it("submit chama createPet com dados corretos ao criar novo pet", async () => {
      const newPet = {
        id: 10,
        nome: "Bolinha",
        raca: "Poodle",
        idade: 5,
        foto: null,
      }

      vi.mocked(petsApi.createPet).mockResolvedValue(newPet)

      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      // Preenche o formulário
      const nomeInput = screen.getByLabelText(/Nome \*/i)
      await user.type(nomeInput, "Bolinha")

      const racaInput = screen.getByLabelText(/Raça \*/i)
      await user.type(racaInput, "Poodle")

      const idadeInput = screen.getByLabelText(/Idade/i)
      await user.clear(idadeInput)
      await user.type(idadeInput, "5")

      // Submete o formulário
      const submitButton = screen.getByRole("button", { name: /Criar/i })
      await user.click(submitButton)

      // Verifica que a API foi chamada com os dados corretos
      await waitFor(() => {
        expect(petsApi.createPet).toHaveBeenCalledWith({
          nome: "Bolinha",
          raca: "Poodle",
          idade: 5,
        })
      })

      // Verifica que mostra mensagem de sucesso
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Sucesso",
            description: "Pet criado com sucesso!",
          })
        )
      })

      // Verifica que fecha o dialog e chama onSuccess
      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    it("mostra spinner enquanto salva o pet", async () => {
      const newPet = {
        id: 10,
        nome: "Bolinha",
        raca: "Poodle",
        idade: 5,
        foto: null,
      }

      // Mock que demora a resolver
      vi.mocked(petsApi.createPet).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(newPet), 100))
      )

      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      const nomeInput = screen.getByLabelText(/Nome \*/i)
      await user.type(nomeInput, "Bolinha")

      const racaInput = screen.getByLabelText(/Raça \*/i)
      await user.type(racaInput, "Poodle")

      const idadeInput = screen.getByLabelText(/Idade/i)
      await user.clear(idadeInput)
      await user.type(idadeInput, "5")

      const submitButton = screen.getByRole("button", { name: /Criar/i })
      await user.click(submitButton)

      // Verifica que o botão está desabilitado durante o salvamento
      expect(submitButton).toBeDisabled()

      // Verifica que o spinner está presente
      const spinner = document.querySelector(".animate-spin")
      expect(spinner).toBeInTheDocument()

      // Aguarda a conclusão
      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled()
      })
    })
  })

  describe("Submissão do formulário - Editar Pet", () => {
    it("submit chama updatePet com dados corretos ao editar pet existente", async () => {
      const updatedPet = {
        ...mockPet,
        nome: "Rex Updated",
        idade: 4,
      }

      vi.mocked(petsApi.updatePet).mockResolvedValue(updatedPet)

      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          pet={mockPet}
          onSuccess={mockOnSuccess}
        />
      )

      // Aguarda o form carregar com os dados do pet
      await waitFor(() => {
        expect(screen.getByDisplayValue("Rex")).toBeInTheDocument()
      })

      // Modifica o nome
      const nomeInput = screen.getByLabelText(/Nome \*/i)
      await user.clear(nomeInput)
      await user.type(nomeInput, "Rex Updated")

      // Modifica a idade
      const idadeInput = screen.getByLabelText(/Idade/i)
      await user.clear(idadeInput)
      await user.type(idadeInput, "4")

      // Submete o formulário
      const submitButton = screen.getByRole("button", { name: /Atualizar/i })
      await user.click(submitButton)

      // Verifica que updatePet foi chamado com os dados corretos
      await waitFor(() => {
        expect(petsApi.updatePet).toHaveBeenCalledWith(1, {
          nome: "Rex Updated",
          raca: "Labrador",
          idade: 4,
        })
      })

      // Verifica que mostra mensagem de sucesso
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Sucesso",
            description: "Pet atualizado com sucesso!",
          })
        )
      })

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    it("exibe título 'Editar Pet' quando está editando", async () => {
      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          pet={mockPet}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.getByText("Editar Pet")).toBeInTheDocument()
      expect(screen.getByText("Atualize as informações do pet")).toBeInTheDocument()
    })

    it("exibe título 'Novo Pet' quando está criando", async () => {
      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      expect(screen.getByText("Novo Pet")).toBeInTheDocument()
      expect(screen.getByText("Preencha os dados para cadastrar um novo pet")).toBeInTheDocument()
    })
  })

  describe("Upload de foto", () => {
    it("valida tipo de arquivo ao fazer upload", async () => {
      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      // Busca o input file diretamente
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
      expect(fileInput).toBeInTheDocument()

      // Cria um arquivo de tipo inválido
      const invalidFile = new File(["content"], "test.txt", { type: "text/plain" })

      // Dispara o evento onChange manualmente
      Object.defineProperty(fileInput, 'files', {
        value: [invalidFile],
        writable: false,
      })
      
      fireEvent.change(fileInput)

      // Verifica que mostra mensagem de erro
      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Erro",
            description: "Apenas imagens JPG, PNG ou WEBP são permitidas",
            variant: "destructive",
          })
        )
      })
    })

    it("valida tamanho máximo do arquivo (5MB)", async () => {
      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement

      // Cria um arquivo maior que 5MB
      const largeContent = new Array(6 * 1024 * 1024).fill("a").join("")
      const largeFile = new File([largeContent], "large.jpg", { type: "image/jpeg" })

      // Dispara o evento onChange manualmente
      Object.defineProperty(fileInput, 'files', {
        value: [largeFile],
        writable: false,
      })
      
      fireEvent.change(fileInput)

      await waitFor(() => {
        expect(mockToast).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Erro",
            description: "A imagem deve ter no máximo 5MB",
            variant: "destructive",
          })
        )
      })
    })
  })

  describe("Sanitização e segurança", () => {
    it("remove caracteres perigosos para prevenir XSS", async () => {
      const newPet = {
        id: 10,
        nome: "Pet Test",
        raca: "Raça Test",
        idade: 5,
        foto: null,
      }

      vi.mocked(petsApi.createPet).mockResolvedValue(newPet)

      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      const nomeInput = screen.getByLabelText(/Nome \*/i)
      await user.type(nomeInput, "<script>alert('xss')</script>Pet Test")

      const racaInput = screen.getByLabelText(/Raça \*/i)
      await user.type(racaInput, "Raça Test")

      const idadeInput = screen.getByLabelText(/Idade/i)
      await user.clear(idadeInput)
      await user.type(idadeInput, "5")

      const submitButton = screen.getByRole("button", { name: /Criar/i })
      await user.click(submitButton)

      // Verifica que os caracteres < e > foram removidos
      await waitFor(() => {
        expect(petsApi.createPet).toHaveBeenCalledWith(
          expect.objectContaining({
            nome: expect.not.stringContaining("<"),
          })
        )
      })
    })

    it("aceita apenas números no campo idade", async () => {
      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      const idadeInput = screen.getByLabelText(/Idade/i) as HTMLInputElement
      
      // Tenta digitar letras
      await user.clear(idadeInput)
      await user.type(idadeInput, "abc12def")

      // Verifica que apenas os números foram mantidos
      expect(idadeInput.value).toBe("12")
    })

    it("aceita apenas letras e espaços no campo raça", async () => {
      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      const racaInput = screen.getByLabelText(/Raça \*/i) as HTMLInputElement
      
      // Tenta digitar números e caracteres especiais
      await user.type(racaInput, "Lab123rador!@#")

      // Verifica que apenas letras foram mantidas
      expect(racaInput.value).toBe("Labrador")
    })
  })

  describe("Cancelamento", () => {
    it("fecha dialog ao clicar em cancelar sem salvar", async () => {
      render(
        <PetFormDialog
          open={true}
          onOpenChange={mockOnOpenChange}
          onSuccess={mockOnSuccess}
        />
      )

      const nomeInput = screen.getByLabelText(/Nome \*/i)
      await user.type(nomeInput, "Teste")

      const cancelButton = screen.getByRole("button", { name: /Cancelar/i })
      await user.click(cancelButton)

      expect(mockOnOpenChange).toHaveBeenCalledWith(false)
      expect(petsApi.createPet).not.toHaveBeenCalled()
      expect(mockOnSuccess).not.toHaveBeenCalled()
    })
  })
})
