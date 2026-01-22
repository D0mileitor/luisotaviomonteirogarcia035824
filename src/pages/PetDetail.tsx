import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { getPetById, type Pet } from "@/api/pets"
import { getTutorById, type Tutor } from "@/api/tutores"
import {
  Card,
  CardContent
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Mail, Phone, MapPin, ArrowLeft, Users, Pencil } from "lucide-react"
import { PetFormDialog } from "@/components/pet/PetFormDialog"

export default function PetDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [pet, setPet] = useState<Pet | null>(null)
  const [tutores, setTutores] = useState<Tutor[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    if (!id) return

    async function load() {
      setLoading(true)
      try {
        const data = await getPetById(Number(id))
        setPet(data)

        // If API already returns tutor details, prefer them; otherwise fetch individually
        if (data.tutores && data.tutores.length > 0) {
          const needFetch = data.tutores.some((t) => !t.email && !t.telefone && !t.endereco)

          if (needFetch) {
            const promises = data.tutores.map((t) => getTutorById(t.id))
            const detailed = await Promise.all(promises)
            setTutores(detailed)
          } else {
            // cast to Tutor[] since shapes are compatible
            setTutores(data.tutores as Tutor[])
          }
        } else {
          setTutores([])
        }
      } catch (error) {
        console.error("Erro ao carregar pet:", error)
        alert("Erro ao carregar detalhes do pet")
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [id])

  const handleEditSuccess = async () => {
    // Recarregar dados do pet após edição
    if (id) {
      try {
        const data = await getPetById(Number(id))
        setPet(data)
      } catch (error) {
        console.error("Erro ao recarregar pet:", error)
      }
    }
  }

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              onClick={() => navigate(-1)}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Voltar</span>
            </Button>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white">
            Detalhes do Pet
          </h1>
        </div>

        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-rose-600"></div>
          </div>
        )}

        {!loading && pet && (
          <div className="space-y-6">
            {/* Card Principal do Pet */}
            <Card className="overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 px-4 py-4 border-b flex items-center justify-between">
                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-800 dark:text-white">
                  {pet.nome}
                </h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="hidden sm:inline">Editar</span>
                </Button>
              </div>

              <CardContent className="p-4 sm:p-6 lg:p-8">
                <div className="flex flex-col items-center space-y-6">
                  {/* Foto do Pet */}
                  <div className="w-full max-w-md">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 shadow-inner">
                      <img 
                        src={pet.foto?.url || "/petSemfoto.png"} 
                        alt={pet.nome} 
                        className="w-full h-full object-fill"
                      />
                    </div>
                  </div>

                  {/* Informações do Pet */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full max-w-2xl">
                    <div className="bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900/20 dark:to-zinc-800/20 p-4 rounded-lg border border-zinc-200 dark:border-zinc-700">
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 font-medium mb-1">Raça</p>
                      <p className="text-xl font-bold text-slate-800 dark:text-white">{pet.raca}</p>
                    </div>

                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900/20 dark:to-slate-800/20 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                      <p className="text-sm text-slate-600 dark:text-slate-400 font-medium mb-1">Idade</p>
                      <p className="text-xl font-bold text-slate-800 dark:text-white">
                        {pet.idade} {pet.idade === 1 ? 'ano' : 'anos'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Tutores */}
            <Card className="overflow-hidden shadow-lg">
              <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 px-3 py-6 border-b">
                <h2 className="flex items-center gap-2 text-2xl">
                  <Users className="w-6 h-6" />
                  Tutores
                </h2>
              </div>

              <CardContent className="p-6">
                {!tutores || tutores.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
                      <Users className="w-8 h-8 text-slate-400" />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Nenhum tutor cadastrado.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tutores.map((t) => (
                      <Card key={t.id} className="overflow-hidden border-2 hover:border-slate-300 dark:hover:border-slate-700 transition-all duration-300 hover:shadow-xl">
                        <div className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 p-4">
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              {t.foto?.url ? (
                                <img 
                                  src={t.foto.url} 
                                  alt={t.nome} 
                                  className="w-16 h-16 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg" 
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-400 to-slate-600 flex items-center justify-center border-4 border-white dark:border-slate-700 shadow-lg">
                                  <span className="text-white text-2xl font-bold">
                                    {t.nome.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-lg text-slate-800 dark:text-white truncate">
                                {t.nome}
                              </h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                Tutor responsável
                              </p>
                            </div>
                          </div>
                        </div>

                        <CardContent className="p-4 space-y-3">
                          {t.telefone && (
                            <div className="flex items-start gap-3 group">
                              <Phone className="w-4 h-4 mt-0.5 text-green-600 dark:text-green-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Telefone</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 break-all">
                                  {t.telefone}
                                </p>
                              </div>
                            </div>
                          )}

                          {t.email && (
                            <div className="flex items-start gap-3 group">
                              <Mail className="w-4 h-4 mt-0.5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 break-all">
                                  {t.email}
                                </p>
                              </div>
                            </div>
                          )}

                          {t.endereco && (
                            <div className="flex items-start gap-3 group">
                              <MapPin className="w-4 h-4 mt-0.5 text-red-600 dark:text-red-400 flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Endereço</p>
                                <p className="text-sm font-medium text-slate-700 dark:text-slate-300 break-words">
                                  {t.endereco}
                                </p>
                              </div>
                            </div>
                          )}

                          {!t.telefone && !t.email && !t.endereco && (
                            <p className="text-sm text-slate-400 dark:text-slate-500 italic text-center py-2">
                              Nenhuma informação de contato disponível
                            </p>
                          )}
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
        <PetFormDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          pet={pet}
          onSuccess={handleEditSuccess}
        />
      </div>
    </div>
  )
}
