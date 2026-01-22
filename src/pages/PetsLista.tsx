import { useEffect, useState } from "react"
import { getPets } from "@/api/pets"
import type { Pet } from "@/api/pets"
import { PetCard } from "@/components/pet/PetCard"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

const ITEMS_PER_PAGE = 10

export default function PetsLista() {
  const [pets, setPets] = useState<Pet[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [loading, setLoading] = useState(true)

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

  const filteredPets = pets.filter((pet) =>
    pet.nome.toLowerCase().includes(search.toLowerCase())
  )

  if (!loading && filteredPets.length === 0 && search === "") {
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
    <div className="flex flex-col min-h-screen p-6">
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold">Pets cadastrados</h1>

        {/* Busca */}
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />

        {loading && <p>Carregando pets...</p>}

        {filteredPets.length === 0 && search && (
          <div className="mt-10 text-center">
            <p className="text-muted-foreground">
              Nenhum pet encontrado com esse nome.
            </p>
          </div>
        )}

        {/* Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5 mb-6">
          {filteredPets.map((pet) => (
            <PetCard key={pet.id} pet={pet} />
          ))}
        </div>
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
    </div>
  )
}
