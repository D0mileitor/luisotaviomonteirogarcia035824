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
import { createPet, updatePet, uploadPetPhoto, deletePetPhoto, type Pet, type CreatePetData } from "@/api/pets"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload, X } from "lucide-react"

interface PetFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  pet?: Pet | null
  onSuccess?: () => void
}

export function PetFormDialog({ open, onOpenChange, pet, onSuccess }: PetFormDialogProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [photoRemoved, setPhotoRemoved] = useState(false)

  const form = useForm<CreatePetData>({
    defaultValues: {
      nome: "",
      raca: "",
      idade: 0,
    },
  })

  // Reset form when dialog opens/closes or pet changes
  useEffect(() => {
    if (open && pet) {
      form.reset({
        nome: pet.nome,
        raca: pet.raca,
        idade: pet.idade,
      })
      setPreviewUrl(pet.foto?.url || null)
      setPhotoRemoved(false)
    } else if (open && !pet) {
      form.reset({
        nome: "",
        raca: "",
        idade: 0,
      })
      setPreviewUrl(null)
      setPhotoRemoved(false)
    }
    setSelectedFile(null)
  }, [open, pet, form])

  const sanitizeInput = (input: string): string => {
    // Remove caracteres perigosos para prevenir XSS
    return input
      .replace(/[<>]/g, "")
      .trim()
  }

  const validateAge = (age: number): boolean => {
    return age >= 0 && age <= 50 && Number.isInteger(age)
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
    if (pet && pet.foto) {
      setPhotoRemoved(true)
    }
  }

  const onSubmit = async (data: CreatePetData) => {
    setIsSubmitting(true)

    try {
      // Sanitizar inputs
      const sanitizedData: CreatePetData = {
        nome: sanitizeInput(data.nome),
        raca: sanitizeInput(data.raca),
        idade: Number(data.idade),
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

      if (!sanitizedData.raca || sanitizedData.raca.length < 2) {
        toast({
          title: "Erro de validação",
          description: "Raça deve ter pelo menos 2 caracteres",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      if (!validateAge(sanitizedData.idade)) {
        toast({
          title: "Erro de validação",
          description: "Idade deve ser um número entre 0 e 50",
          variant: "destructive",
        })
        setIsSubmitting(false)
        return
      }

      let savedPet: Pet

      if (pet) {
        // Atualizar pet existente
        savedPet = await updatePet(pet.id, sanitizedData)
        
        // Deletar foto se o usuário removeu
        if (photoRemoved && pet.foto?.id) {
          try {
            await deletePetPhoto(pet.id, pet.foto.id)
            toast({
              title: "Sucesso",
              description: "Foto removida com sucesso!",
            })
          } catch (error) {
            console.error("Erro ao remover foto:", error)
            toast({
              title: "Aviso",
              description: "Pet atualizado, mas houve erro ao remover a foto",
              variant: "destructive",
            })
          }
        }
        
        toast({
          title: "Sucesso",
          description: "Pet atualizado com sucesso!",
        })
      } else {
        // Criar novo pet
        savedPet = await createPet(sanitizedData)
        toast({
          title: "Sucesso",
          description: "Pet criado com sucesso!",
        })
      }

      // Upload de foto se houver
      if (selectedFile && savedPet.id) {
        try {
          await uploadPetPhoto(savedPet.id, selectedFile)
          toast({
            title: "Sucesso",
            description: "Foto enviada com sucesso!",
          })
        } catch (error) {
          console.error("Erro ao fazer upload da foto:", error)
          toast({
            title: "Aviso",
            description: "Pet salvo, mas houve erro ao enviar a foto",
            variant: "destructive",
          })
        }
      }

      onOpenChange(false)
      if (onSuccess) {
        onSuccess()
      }
    } catch (error: any) {
      console.error("Erro ao salvar pet:", error)
      toast({
        title: "Erro",
        description: error?.response?.data?.message || "Erro ao salvar pet",
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
          <DialogTitle>{pet ? "Editar Pet" : "Novo Pet"}</DialogTitle>
          <DialogDescription>
            {pet
              ? "Atualize as informações do pet"
              : "Preencha os dados para cadastrar um novo pet"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Upload de Foto */}
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Foto do Pet
              </label>
              <div className="flex flex-col items-center gap-4">
                {previewUrl ? (
                  <div className="relative">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border-2 border-slate-200"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                      onClick={removePhoto}
                    >
                      <X className="h-3 w-3" />
                    </Button>
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
                  <FormLabel>Nome *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Nome do pet"
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
              name="raca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Raça *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Raça do pet"
                      {...field}
                      maxLength={50}
                      required
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, '')
                        field.onChange(value)
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="idade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Idade (anos) *</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      inputMode="numeric"
                      placeholder="0"
                      value={field.value || ""}
                      maxLength={3}
                      required
                      onChange={(e) => {
                        const value = e.target.value.replace(/[^0-9]/g, "")
                        const numValue = value ? parseInt(value) : 0
                        if (numValue <= 100) {
                          field.onChange(numValue)
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {pet ? "Atualizar" : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
