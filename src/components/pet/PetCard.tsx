import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Pet } from "@/api/pets"
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
  const [, setIsHovered] = useState(false)
  const navigate = useNavigate()
  const handleDetailsClick = () => {
    navigate(`/pets/${pet.id}`)
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-lg border-slate-200"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br dark:from-slate-800 dark:to-slate-900">
        <img
          src={pet.foto?.url || "/petSemfoto.png"}
          alt={pet.nome}
          className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>

      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold text-slate-100">
          {pet.nome}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-100 min-w-[60px]">Raça:</span>
            <span className="text-slate-400">{pet.raca}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-slate-100 min-w-[60px]">Idade:</span>
            <span className="text-slate-400">{pet.idade} anos</span>
          </div>
        </div>

        <Button
          onClick={handleDetailsClick}
          variant="outline"
          className="w-full mt-4 transition-colors"
        >
          Ver detalhes
        </Button>
      </CardContent>
    </Card>
  )
}
