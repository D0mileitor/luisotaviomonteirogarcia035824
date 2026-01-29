import { useEffect, useState, useMemo } from "react"
import { tutoresFacade } from "@/services/tutoresFacade"
import type { Tutor } from "@/api/tutores"
import { TutorCard } from "@/components/tutores/TutorCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { TutorFormDialog } from "@/components/tutores/TutorFormDialog"
import { Plus, ChevronDown } from "lucide-react"
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

export default function TutoresLista() {
  const [tutores, setTutores] = useState<Tutor[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // Subscrever ao BehaviorSubject do facade
  useEffect(() => {
    const subscription = tutoresFacade.tutores$.subscribe((data) => {
      setTutores(data.content)
      setPageCount(data.pageCount)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Carregar tutores quando a página mudar
  useEffect(() => {
    tutoresFacade.loadTutores(page, ITEMS_PER_PAGE)
  }, [page])

  const handleCreateSuccess = () => {
    // O facade já recarrega automaticamente após criar
  }

  // Função de filtragem unificada
  const filteredTutores = useMemo(() => {
    let filtered = tutores
    
    if (search.trim()) {
      const searchLower = search.toLowerCase().trim()
      
      filtered = tutores.filter((tutor) => {
        // Busca por nome
        const matchNome = tutor.nome.toLowerCase().includes(searchLower)
        
        // Busca por telefone
        const matchTelefone = tutor.telefone && tutor.telefone.toLowerCase().includes(searchLower)
        
        // Busca por endereço
        const matchEndereco = tutor.endereco && tutor.endereco.toLowerCase().includes(searchLower)
        
        // Busca por email
        const matchEmail = tutor.email && tutor.email.toLowerCase().includes(searchLower)
        
        return matchNome || matchTelefone || matchEndereco || matchEmail
      })
    }
    
    // Ordenar alfabeticamente por nome
    return filtered.sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR', { sensitivity: 'base' }))
  }, [tutores, search])

  // Mostrar tela vazia apenas quando realmente não há tutores no sistema
  if (!loading && tutores.length === 0) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center">
        <h2 className="text-2xl font-semibold">Nenhum tutor cadastrado</h2>
        <p className="text-muted-foreground max-w-sm">
          Ainda não existem tutores cadastrados no sistema.
        </p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className="flex flex-col min-h-screen p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Tutores cadastrados</h1>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => setIsCreateDialogOpen(true)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Novo Tutor
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Cadastrar um novo tutor no sistema</p>
              </TooltipContent>
            </Tooltip>
          </div>

        {/* Filtros */}
        <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <div className="border rounded-lg bg-card">
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex items-center justify-between p-4 bg-white dark:bg-accent hover:bg-accent/60"
              >
                <h2 className="text-lg font-semibold text-black dark:text-white">Filtros</h2>
                <ChevronDown className={`w-5 h-5 transition-transform ${
                  isFilterOpen ? "transform rotate-180" : ""
                }`} />
              </Button>
            </CollapsibleTrigger>

            <CollapsibleContent>
              <div className="p-4 pt-0 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar Tutor</label>
                  <Input
                    placeholder="Buscar por nome, telefone, email ou endereço..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="max-w-xl"
                  />
                </div>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>

        {loading && <p>Carregando tutores...</p>}

        {!loading && filteredTutores.length === 0 && (
          <div className="mt-10 text-center">
            <p className="text-muted-foreground">
              {search
                ? "Nenhum tutor encontrado com os filtros aplicados."
                : "Nenhum tutor encontrado."}
            </p>
          </div>
        )}

        {/* Grid */}
        {filteredTutores.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-6">
            {filteredTutores.map((tutor) => (
              <TutorCard key={tutor.id} tutor={tutor} />
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
      <TutorFormDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        tutor={null}
        onSuccess={handleCreateSuccess}
      />
      </div>
    </TooltipProvider>
  )
}
