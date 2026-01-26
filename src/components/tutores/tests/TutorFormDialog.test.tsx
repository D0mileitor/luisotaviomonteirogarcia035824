import { describe, it, expect, vi, beforeEach } from "vitest"
import { render, screen, waitFor, fireEvent } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { TutorFormDialog } from "../TutorFormDialog"
import * as tutoresApi from "@/api/tutores"

vi.mock("@/api/tutores")

const mockToast = vi.fn()
vi.mock("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: mockToast }),
}))

describe("TutorFormDialog", () => {
  const user = userEvent.setup()
  const mockOnOpenChange = vi.fn()
  const mockOnSuccess = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("aplica máscara de telefone enquanto digita", async () => {
    render(<TutorFormDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    const telefone = screen.getByLabelText(/Telefone/i) as HTMLInputElement
    await user.type(telefone, "11987654321")

    // Deve aplicar máscara de celular
    expect(telefone.value).toBe("(11) 98765-4321")
  })

  it("submit chama createTutor com payload correto (telefone sem máscara)", async () => {
    const created = { id: 5, nome: "Ana", telefone: "11999999999" }
    vi.mocked(tutoresApi.createTutor).mockResolvedValue(created)

    render(<TutorFormDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    const nome = screen.getByLabelText(/Nome Completo \*/i)
    const telefone = screen.getByLabelText(/Telefone/i)
    const email = screen.getByLabelText(/Email/i)
    const endereco = screen.getByLabelText(/Endereço/i)

    await user.type(nome, "Ana <script>")
    await user.type(telefone, "11988887777")
    await user.type(email, "ana@example.com")
    await user.type(endereco, "Rua A, 123")

    const submit = screen.getByRole("button", { name: /Criar/i })
    await user.click(submit)

    await waitFor(() => {
      expect(tutoresApi.createTutor).toHaveBeenCalledWith({
        nome: "Ana script", // sanitize removes < and >
        telefone: "11988887777",
        endereco: "Rua A, 123",
        email: "ana@example.com",
      })
    })

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith(expect.objectContaining({ title: "Sucesso" }))
    })

    expect(mockOnOpenChange).toHaveBeenCalledWith(false)
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  it("upload de foto dispara uploadTutorPhoto e atualiza preview", async () => {
    const created = { id: 9, nome: "Bruno" }
    vi.mocked(tutoresApi.createTutor).mockResolvedValue(created)
    vi.mocked(tutoresApi.uploadTutorPhoto).mockResolvedValue({ id: 1, nome: "f.jpg", contentType: "image/jpeg", url: "data:image/jpeg;base64,xxx" })

    render(<TutorFormDialog open={true} onOpenChange={mockOnOpenChange} onSuccess={mockOnSuccess} />)

    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
    expect(fileInput).toBeInTheDocument()

    const imageFile = new File(["dummy"], "photo.jpg", { type: "image/jpeg" })
    Object.defineProperty(fileInput, 'files', { value: [imageFile] })
    fireEvent.change(fileInput)

    // Preenche demais campos obrigatórios
    const nome = screen.getByLabelText(/Nome Completo \*/i)
    await user.type(nome, "Bruno")

    const submit = screen.getByRole("button", { name: /Criar/i })
    await user.click(submit)

    await waitFor(() => {
      expect(tutoresApi.createTutor).toHaveBeenCalled()
    })

    await waitFor(() => {
      expect(tutoresApi.uploadTutorPhoto).toHaveBeenCalledWith(9, imageFile)
    })

    // Após leitura, deve haver preview (img alt "Preview")
    await waitFor(() => {
      const preview = document.querySelector('img[alt="Preview"]')
      expect(preview).toBeTruthy()
    })
  })
})
