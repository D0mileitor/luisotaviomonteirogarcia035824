import { useEffect, useState, useMemo } from "react"
import { getPets } from "@/api/pets"
import type { Pet } from "@/api/pets"
import { PetCard } from "@/components/pet/PetCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { PetFormDialog } from "@/components/pet/PetFormDialog"
import { Plus, X, ChevronDown } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"

const ITEMS_PER_PAGE = 10

export default function PetsLista() {
  const [pets, setPets] = useState<Pet[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  
  // Estados dos filtros
  const [racaFiltro, setRacaFiltro] = useState<string>("")
  const [idadeFiltro, setIdadeFiltro] = useState<string>("")

  useEffect(() => {
    async function loadPets() {
      setLoading(true)

      try {
        const data = await getPets(page, ITEMS_PER_PAGE)

        setPets(data.content)
        setPageCount(data.pageCount)
      } catch (error) {
        console.error(error)
        alert("Erro ao carregar pets")
      } finally {
        setLoading(false)
      }
    }

    loadPets()
  }, [page])

  const handleCreateSuccess = async () => {
    // Recarregar a lista de pets após criar um novo
    try {
      const data = await getPets(page, ITEMS_PER_PAGE)
      setPets(data.content)
      setPageCount(data.pageCount)
    } catch (error) {
      console.error("Erro ao recarregar pets:", error)
    }
  }

  // Extrair raças únicas dinamicamente
  const racasDisponiveis = useMemo(() => {
    const racas = pets.map((pet) => pet.raca.trim()).filter(Boolean)
    return Array.from(new Set(racas)).sort()
  }, [pets])

  // Extrair idades únicas para o filtro
  const idadesDisponiveis = useMemo(() => {
    const idades = pets
      .map((pet) => pet.idade)
      .filter((idade) => idade !== null && idade !== undefined && idade >= 0)
    return Array.from(new Set(idades)).sort((a, b) => a - b)
  }, [pets])

  // Função de filtragem completa
  const filteredPets = useMemo(() => {
    const filtered = pets.filter((pet) => {
      // Filtro por nome
      const matchNome = pet.nome.toLowerCase().includes(search.toLowerCase())
      
      // Filtro por raça
      const matchRaca = !racaFiltro || pet.raca.trim() === racaFiltro
      
      // Filtro por idade
      const matchIdade = !idadeFiltro || pet.idade === parseInt(idadeFiltro)
      
      return matchNome && matchRaca && matchIdade
    })
    
    // Ordenar alfabeticamente por nome melhora de usabilidade
    return filtered.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
  }, [pets, search, racaFiltro, idadeFiltro])

  // Função para limpar filtros
  const limparFiltros = () => {
    setRacaFiltro("")
    setIdadeFiltro("")
  }

  const temFiltrosAtivos = racaFiltro || idadeFiltro

  // Mostrar tela vazia apenas quando realmente não há pets no sistema
  if (!loading && pets.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">Nenhum pet cadastrado</h2>
        <p className="text-muted-foreground max-w-sm">
          Ainda não existem pets cadastrados no sistema.
        </p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Pets cadastrados</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Novo Pet
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cadastrar um novo pet no sistema</p>
              </TooltipContent>
            </Tooltip>
          </div>

        {/* Filtros */}
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <div className="border rounded-lg bg-white dark:bg-card">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-accent hover:bg-accent/60"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-black dark:text-white">Filtros</h2>
                  {temFiltrosAtivos && (
                    <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                      Ativos
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {temFiltrosAtivos && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            limparFiltros()
                          }}
                          className="flex items-center gap-2 bg-white dark:bg-transparent dark:text-white"
                        >
                          <X className="w-4 h-4" />
                          <span className="hidden sm:inline">Limpar</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Remover todos os filtros aplicados</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  <ChevronDown className={`w-5 h-5 transition-transform ${
                    isFilterOpen ? "transform rotate-180" : ""
                  }`} />
                </div>
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="p-4 pt-0 space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  {/* Busca por nome */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nome</label>
                    <Input
                      placeholder="Buscar por nome..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {/* Filtro de Raça */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Raça</label>
                      {racaFiltro && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setRacaFiltro("")}
                              className="h-auto p-1 text-xs"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Limpar filtro de raça</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <Select value={racaFiltro} onValueChange={setRacaFiltro}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as raças" />
                      </SelectTrigger>
                      <SelectContent>
                        {racasDisponiveis.map((raca) => (
                          <SelectItem key={raca} value={raca}>
                            <span className="truncate block max-w-[250px]" title={raca}>
                              {raca.length > 30 ? `${raca.substring(0, 30)}...` : raca}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Filtro de Idade */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Idade</label>
                      {idadeFiltro && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setIdadeFiltro("")}
                              className="h-auto p-1 text-xs"
                            >
                              <X className="w-3 h-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Limpar filtro de idade</p>
                          </TooltipContent>
                        </Tooltip>
                      )}
                    </div>
                    <Select value={idadeFiltro} onValueChange={setIdadeFiltro}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todas as idades" />
                      </SelectTrigger>
                      <SelectContent>
                        {idadesDisponiveis.map((idade) => (
                          <SelectItem key={idade} value={idade.toString()}>
                            {idade} {idade === 1 ? "ano" : "anos"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {loading && <p>Carregando pets...</p>}

        {!loading && filteredPets.length === 0 && (
          <div className="mt-10 text-center">
            <p className="text-muted-foreground">
              {search || temFiltrosAtivos
                ? "Nenhum pet encontrado com os filtros aplicados."
                : "Nenhum pet encontrado."}
            </p>
          </div>
        )}

        {/* Grid */}
        {filteredPets.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-6">
            {filteredPets.map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        )}
      </div>

      {/* Paginação */}
      <div className="mt-auto pt-6 pb-4 flex justify-center gap-2">
        <Button
          variant="outline"
          disabled={page === 0}
          onClick={() => setPage((p) => p - 1)}
        >
          Anterior
        </Button>

        <span className="flex items-center px-2">
          Página {page + 1} de {pageCount}
        </span>

        <Button
          variant="outline"
          disabled={page + 1 >= pageCount}
          onClick={() => setPage((p) => p + 1)}
        >
          Próxima
        </Button>
      </div>

      {/* Dialog de Criação */}
      <PetFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        pet={null}
        onSuccess={handleCreateSuccess}
      />
      </div>
    </TooltipProvider>
  )
}
