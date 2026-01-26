import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getTutorById, vincularPet, desvincularPet, type Tutor } from "@/api/tutores"
import { getPets, type Pet } from "@/api/pets"
import {
  Card,
  CardContent
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, ArrowLeft, PawPrint, Pencil, Plus, X } from "lucide-react"
import { TutorFormDialog } from "@/components/tutores/TutorFormDialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

export default function TutorDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  const [tutor, setTutor] = useState<Tutor | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isVincularDialogOpen, setIsVincularDialogOpen] = useState(false)
  const [availablePets, setAvailablePets] = useState<Pet[]>([])
  const [selectedPetId, setSelectedPetId] = useState<string>("")
  const [isVinculando, setIsVinculando] = useState(false)

  const loadTutor = async () => {
    if (!id) return

    setLoading(true)
    try {
      const data = await getTutorById(Number(id))
      setTutor(data)
    } catch (error) {
      console.error("Erro ao carregar tutor:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar detalhes do tutor",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTutor()
  }, [id])

  const handleEditSuccess = async () => {
    await loadTutor()
  }

  const formatPhoneNumber = (phone: string): string => {
    // Remove tudo que não é número
    const cleaned = phone.replace(/\D/g, '')
    
    // Aplica a máscara conforme o tamanho
    if (cleaned.length === 11) {
      // Celular: (00) 00000-0000
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`
    } else if (cleaned.length === 10) {
      // Fixo: (00) 0000-0000
      return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 6)}-${cleaned.slice(6)}`
    }
    
    // Retorna o original se não tiver o tamanho esperado
    return phone
  }

  const handleOpenVincularDialog = async () => {
    try {
      // Carregar todos os pets disponíveis
      const petsData = await getPets(0, 100) // Carregar uma quantidade maior
      
      // Filtrar pets que já estão vinculados a este tutor
      const vinculadosIds = tutor?.pets?.map(p => p.id) || []
      const petsDisponiveis = petsData.content.filter(p => !vinculadosIds.includes(p.id))
      
      setAvailablePets(petsDisponiveis)
      setSelectedPetId("")
      setIsVincularDialogOpen(true)
    } catch (error) {
      console.error("Erro ao carregar pets:", error)
      toast({
        title: "Erro",
        description: "Erro ao carregar lista de pets",
        variant: "destructive",
      })
    }
  }

  const handleVincularPet = async () => {
    if (!selectedPetId || !tutor) return

    setIsVinculando(true)
    try {
      await vincularPet(tutor.id, Number(selectedPetId))
      toast({
        title: "Sucesso",
        description: "Pet vinculado com sucesso!",
      })
      setIsVincularDialogOpen(false)
      await loadTutor()
    } catch (error) {
      console.error("Erro ao vincular pet:", error)
      toast({
        title: "Erro",
        description: "Erro ao vincular pet",
        variant: "destructive",
      })
    } finally {
      setIsVinculando(false)
    }
  }

  const handleDesvincularPet = async (petId: number) => {
    if (!tutor) return

    if (!confirm("Tem certeza que deseja desvincular este pet?")) return

    try {
      await desvincularPet(tutor.id, petId)
      toast({
        title: "Sucesso",
        description: "Pet desvinculado com sucesso!",
      })
      await loadTutor()
    } catch (error) {
      console.error("Erro ao desvincular pet:", error)
      toast({
        title: "Erro",
        description: "Erro ao desvincular pet",
        variant: "destructive",
      })
    }
  }

  return (
    <TooltipProvider>
      <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8 space-y-4">
            <h1 className="text-2xl sm:text-3xl font-bold">
              Detalhes do Tutor
            </h1>
          </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          </div>
        )}

        {!loading && tutor && (
          <div className="space-y-6">
            {/* Card Principal do Tutor */}
            <Card className="overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 px-4 py-4 border-b">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="outline" 
                        onClick={() => navigate(-1)}
                        className="flex items-center gap-2 shrink-0"
                      >
                        <ArrowLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Voltar</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Retornar à página anterior</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditDialogOpen(true)}
                        className="flex items-center gap-2 shrink-0"
                      >
                        <Pencil className="w-4 h-4" />
                        <span className="hidden sm:inline">Editar</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Editar informações do tutor</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white break-words text-center px-2">
                  {tutor.nome}
                </h2>
              </div>

              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col items-center space-y-6">
                  {/* Foto do Tutor */}
                  <div className="w-full max-w-md">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-inner">
                      <img 
                        src={tutor.foto?.url || "/userSemfoto.png"} 
                        alt={tutor.nome} 
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Informações de Contato */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full max-w-3xl">
                    {tutor.telefone && (
                      <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 p-4 rounded-lg border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="w-5 h-5 text-green-600 dark:text-green-400" />
                          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Telefone</p>
                        </div>
                        <p className="text-lg font-bold text-slate-800 dark:text-white">{formatPhoneNumber(tutor.telefone)}</p>
                      </div>
                    )}

                    {tutor.email && (
                      <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-lg border border-blue-200 dark:border-blue-700">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Email</p>
                        </div>
                        <p className="text-lg font-bold text-slate-800 dark:text-white break-all">{tutor.email}</p>
                      </div>
                    )}

                    {tutor.endereco && (
                      <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 p-4 rounded-lg border border-red-200 dark:border-red-700 sm:col-span-2 lg:col-span-1">
                        <div className="flex items-center gap-2 mb-2">
                          <MapPin className="w-5 h-5 text-red-600 dark:text-red-400" />
                          <p className="text-sm text-red-600 dark:text-red-400 font-medium">Endereço</p>
                        </div>
                        <p className="text-lg font-bold text-slate-800 dark:text-white break-words">{tutor.endereco}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Pets Vinculados */}
            <Card className="overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 px-3 py-6 border-b flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-2xl">
                  <PawPrint className="w-6 h-6" />
                  Pets Vinculados
                </h2>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleOpenVincularDialog}
                      className="flex items-center gap-2"
                      size="sm"
                    >
                      <Plus className="w-4 h-4" />
                      Vincular Pet
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Vincular um pet a este tutor</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <CardContent className="p-6">
                {!tutor.pets || tutor.pets.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                      <PawPrint className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Nenhum pet vinculado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tutor.pets.map((pet) => (
                      <Card key={pet.id} className="overflow-hidden border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-xl">
                        <div className="relative h-48 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
                          <img
                            src={pet.foto?.url || "/petSemfoto.png"}
                            alt={pet.nome}
                            className="h-full w-full object-contain"
                          />
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 h-8 w-8 rounded-full"
                                onClick={() => handleDesvincularPet(pet.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Desvincular pet</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>

                        <CardContent className="p-4 space-y-2">
                          <h3 className="font-bold text-lg text-slate-800 dark:text-white">
                            {pet.nome}
                          </h3>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Raça:</span>
                              <span className="text-slate-600 dark:text-slate-400">{pet.raca}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">Idade:</span>
                              <span className="text-slate-600 dark:text-slate-400">
                                {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}
                              </span>
                            </div>
                          </div>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-2"
                                onClick={() => navigate(`/pets/${pet.id}`)}
                              >
                                Ver detalhes
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Ver informações completas do pet</p>
                            </TooltipContent>
                          </Tooltip>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Dialog de Edição */}
        <TutorFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          tutor={tutor}
          onSuccess={handleEditSuccess}
        />

        {/* Dialog de Vincular Pet */}
        <Dialog open={isVincularDialogOpen} onOpenChange={setIsVincularDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Vincular Pet</DialogTitle>
              <DialogDescription>
                Selecione um pet para vincular a este tutor.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              {availablePets.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  Não há pets disponíveis para vincular.
                </p>
              ) : (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Selecione o Pet</label>
                  <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Escolha um pet..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availablePets.map((pet) => (
                        <SelectItem key={pet.id} value={pet.id.toString()}>
                          {pet.nome} - {pet.raca}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsVincularDialogOpen(false)}
                disabled={isVinculando}
              >
                Cancelar
              </Button>
              <Button
                onClick={handleVincularPet}
                disabled={!selectedPetId || isVinculando}
              >
                {isVinculando ? "Vinculando..." : "Vincular"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
    </TooltipProvider>
  )
}
