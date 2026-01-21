import { useState } from "react"
import { getPetById, type Pet } from "@/api/pets"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [detailedPet, setDetailedPet] = useState<Pet | null>(null)
  const [loadingDetails, setLoadingDetails] = useState(false)

  const handleDetailsClick = async () => {
    if (!isFlipped && !detailedPet) {
      setLoadingDetails(true)
      try {
        const data = await getPetById(pet.id)
        setDetailedPet(data)
      } catch (error) {
        console.error("Erro ao carregar detalhes:", error)
      } finally {
        setLoadingDetails(false)
      }
    }
    setIsFlipped(!isFlipped)
  }

  return (
    <div
      className="relative h-[400px] perspective-1000"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`relative w-full h-full transition-transform duration-1000 ease-in-out transform-style-3d ${
          isFlipped ? "rotate-y-180" : ""
        }`}
      >
        {/* Front of card */}
        <Card
          className={`absolute w-full h-full backface-hidden transition-all duration-500 ease-in-out overflow-hidden ${
            isHovered ? "shadow-2xl" : "shadow-md"
          }`}
        >
          <div className={`transition-all duration-500 ${isHovered ? "blur-sm" : ""}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{pet.nome}</span>
              </CardTitle>
            </CardHeader>

            <CardContent className="space-y-2">
              {pet.foto?.url ? (
                <div className="h-48 w-full rounded-md overflow-hidden">
                  <img
                    src={pet.foto.url}
                    alt={pet.nome}
                    className={`h-full w-full object-contain transition-all duration-500 ${
                      isHovered ? "scale-105" : ""
                    }`}
                  />
                </div>
              ) : (
                <div className="h-48 w-full rounded-md bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center">
                  <span className="text-4xl opacity-50">🐾</span>
                </div>
              )}

              <p className="text-sm">
                <strong>Raça:</strong> {pet.raca}
              </p>
              <p className="text-sm">
                <strong>Idade:</strong> {pet.idade} anos
              </p>
            </CardContent>
          </div>

          {isHovered && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center animate-in fade-in duration-300">
              <Button
                size="lg"
                onClick={handleDetailsClick}
                disabled={loadingDetails}
                className="z-10 scale-110"
              >
                {loadingDetails ? "..." : "Detalhes"}
              </Button>
            </div>
          )}
        </Card>

        {/* Back of card */}
        <Card className="absolute w-full h-full backface-hidden rotate-y-180 bg-gradient-to-br from-slate-900 to-slate-800 border-slate-700 overflow-hidden">
          <CardHeader>
            <CardTitle className="flex items-center justify-between text-white">
              <span>Detalhes de {pet.nome}</span>
              <Button
                size="sm"
                variant="outline"
                onClick={handleDetailsClick}
                className="bg-transparent border-white text-white hover:bg-white hover:text-black transition-all duration-300"
              >
                Voltar
              </Button>
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-white">
            {detailedPet ? (
              <>
                {detailedPet.foto?.url && (
                  <div className="h-40 w-full rounded-md overflow-hidden">
                    <img
                      src={detailedPet.foto.url}
                      alt={detailedPet.nome}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                
                <div className="space-y-2 text-sm">
                  <p>
                    <strong>ID:</strong> {detailedPet.id}
                  </p>
                  <p>
                    <strong>Nome completo:</strong> {detailedPet.nome}
                  </p>
                  <p>
                    <strong>Raça:</strong> {detailedPet.raca}
                  </p>
                  <p>
                    <strong>Idade:</strong> {detailedPet.idade} anos
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-48">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
