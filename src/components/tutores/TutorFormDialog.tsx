import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { createTutor, updateTutor, uploadTutorPhoto, deleteTutorPhoto, type Tutor, type CreateTutorData } from "@/api/tutores"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TutorFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tutor?: Tutor | null
  onSuccess?: () => void
}

export function TutorFormDialog({ open, onOpenChange, tutor, onSuccess }: TutorFormDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [photoRemoved, setPhotoRemoved] = useState(false)

  // Função para aplicar máscara de telefone
  const formatPhoneNumber = (value: string): string => {
    // Remove tudo que não é dígito
    const numbers = value.replace(/\D/g, '')
    
    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11)
    
    // Aplica a máscara baseado na quantidade de dígitos
    if (limitedNumbers.length <= 10) {
      // Telefone fixo: (XX) XXXX-XXXX
      return limitedNumbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      // Celular: (XX) XXXXX-XXXX
      return limitedNumbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
  }

  const form = useForm<CreateTutorData>({
    defaultValues: {
      nome: "",
      telefone: "",
      endereco: "",
      email: "",
    },
  })

  // Reset form when dialog opens/closes or tutor changes
  useEffect(() => {
    if (open && tutor) {
      form.reset({
        nome: tutor.nome,
        telefone: tutor.telefone ? formatPhoneNumber(tutor.telefone) : "",
        endereco: tutor.endereco || "",
        email: tutor.email || "",
      })
      setPreviewUrl(tutor.foto?.url || null)
      setPhotoRemoved(false)
    } else if (open && !tutor) {
      form.reset({
        nome: "",
        telefone: "",
        endereco: "",
        email: "",
      })
      setPreviewUrl(null)
      setPhotoRemoved(false)
    }
    setSelectedFile(null)
  }, [open, tutor, form])

  const sanitizeInput = (input: string): string => {
    // Remove caracteres perigosos para prevenir XSS
    return input
      .replace(/[<>]/g, "")
      .trim()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validar tipo de arquivo
      const allowedTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
      if (!allowedTypes.includes(file.type)) {
        toast({
          title: "Erro",
          description: "Apenas imagens JPG, PNG ou WEBP são permitidas",
          variant: "destructive",
        })
        return
      }

      // Validar tamanho (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Erro",
          description: "A imagem deve ter no máximo 5MB",
          variant: "destructive",
        })
        return
      }

      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const removePhoto = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    // Marcar que o usuário removeu a foto quando estava editando
    if (tutor && tutor.foto) {
      setPhotoRemoved(true)
    }
  }

  const onSubmit = async (data: CreateTutorData) => {
    setIsSubmitting(true)

    try {
      // Remover formatação do telefone antes de enviar
      const cleanPhone = data.telefone ? data.telefone.replace(/\D/g, '') : undefined

      // Sanitizar inputs
      const sanitizedData: CreateTutorData = {
        nome: sanitizeInput(data.nome),
        telefone: cleanPhone,
        endereco: data.endereco ? sanitizeInput(data.endereco) : undefined,
        email: data.email ? sanitizeInput(data.email) : undefined,
      }

      // Validações
      if (!sanitizedData.nome || sanitizedData.nome.length < 2) {
        toast({
          title: "Erro de validação",
          description: "Nome deve ter pelo menos 2 caracteres",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Validação de nome - máximo 100 caracteres
      if (sanitizedData.nome.length > 100) {
        toast({
          title: "Erro de validação",
          description: "Nome deve ter no máximo 100 caracteres",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Validação de telefone se fornecido
      if (sanitizedData.telefone && (sanitizedData.telefone.length < 10 || sanitizedData.telefone.length > 11)) {
        toast({
          title: "Erro de validação",
          description: "Telefone deve ter 10 ou 11 dígitos",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Validação de email se fornecido
      if (sanitizedData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitizedData.email)) {
        toast({
          title: "Erro de validação",
          description: "Email inválido",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Validação de email - máximo 100 caracteres
      if (sanitizedData.email && sanitizedData.email.length > 100) {
        toast({
          title: "Erro de validação",
          description: "Email deve ter no máximo 100 caracteres",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      // Validação de endereço - máximo 200 caracteres
      if (sanitizedData.endereco && sanitizedData.endereco.length > 200) {
        toast({
          title: "Erro de validação",
          description: "Endereço deve ter no máximo 200 caracteres",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      let savedTutor: Tutor

      if (tutor) {
        // Atualizar tutor existente
        savedTutor = await updateTutor(tutor.id, sanitizedData)
        
        // Deletar foto se o usuário removeu
        if (photoRemoved && tutor.foto?.id) {
          try {
            await deleteTutorPhoto(tutor.id, tutor.foto.id)
            toast({
              title: "Sucesso",
              description: "Foto removida com sucesso!",
            })
          } catch (error) {
            console.error("Erro ao remover foto:", error)
            toast({
              title: "Aviso",
              description: "Tutor atualizado, mas houve erro ao remover a foto",
              variant: "destructive",
            })
          }
        }
        
        toast({
          title: "Sucesso",
          description: "Tutor atualizado com sucesso!",
        })
      } else {
        // Criar novo tutor
        savedTutor = await createTutor(sanitizedData)
        toast({
          title: "Sucesso",
          description: "Tutor criado com sucesso!",
        })
      }

      // Upload de foto se houver
      if (selectedFile && savedTutor.id) {
        try {
          await uploadTutorPhoto(savedTutor.id, selectedFile)
          toast({
            title: "Sucesso",
            description: "Foto enviada com sucesso!",
          })
        } catch (error) {
          console.error("Erro ao fazer upload da foto:", error)
          toast({
            title: "Aviso",
            description: "Tutor salvo, mas houve erro ao enviar a foto",
            variant: "destructive",
          })
        }
      }

      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Erro ao salvar tutor:", error)
      toast({
        title: "Erro",
        description: error?.response?.data?.message || "Erro ao salvar tutor",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{tutor ? "Editar Tutor" : "Novo Tutor"}</DialogTitle>
          <DialogDescription>
            {tutor
              ? "Atualize as informações do tutor"
              : "Preencha os dados para cadastrar um novo tutor"}
          </DialogDescription>
        </DialogHeader>

        <TooltipProvider>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Upload de Foto */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Foto do Tutor
              </label>
              <div className="flex flex-col items-center gap-4">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-slate-200"
                    />
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                          onClick={removePhoto}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remover foto</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                ) : (
                  <div className="w-32 h-32 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center">
                    <Upload className="h-8 w-8 text-slate-400" />
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/jpg,image/webp"
                  onChange={handleFileChange}
                  className="max-w-xs"
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome completo do tutor"
                      {...field}
                      maxLength={100}
                      required
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="telefone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Telefone</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="(00) 00000-0000"
                      value={field.value || ""}
                      onChange={(e) => {
                        const formatted = formatPhoneNumber(e.target.value)
                        field.onChange(formatted)
                      }}
                      maxLength={15}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      {...field}
                      maxLength={100}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereço</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Rua, número, bairro, cidade"
                      {...field}
                      maxLength={200}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Fechar sem salvar alterações</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {tutor ? "Atualizar" : "Criar"}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{tutor ? "Salvar alterações do tutor" : "Cadastrar novo tutor"}</p>
                </TooltipContent>
              </Tooltip>
            </DialogFooter>
          </form>
        </Form>
        </TooltipProvider>
      </DialogContent>
    </Dialog>
  )
}
