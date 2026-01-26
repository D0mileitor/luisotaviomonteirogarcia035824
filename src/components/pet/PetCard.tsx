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
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

interface PetCardProps {
  pet: Pet
}

export function PetCard({ pet }: PetCardProps) {
  const [, setIsHovered] = useState(false)
  const navigate = useNavigate()
  const handleDetailsClick = () => {
    navigate(`/pets/${pet.id}`)
  }

  // Função para truncar texto
  const truncateText = (text: string, maxLength: number = 20): string => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        <img
          src={pet.foto?.url || "/petSemfoto.png"} 
          alt={pet.nome}
          className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>

      <CardHeader className="pb-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <CardTitle className="text-xl font-semibold truncate">
              {truncateText(pet.nome, 20)}
            </CardTitle>
          </TooltipTrigger>
          {pet.nome.length > 20 && (
            <TooltipContent>
              <p>{pet.nome}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="space-y-2 text-sm">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2">
                <span className="font-medium min-w-[60px]">Raça:</span>
                <span className="text-muted-foreground truncate">{truncateText(pet.raca, 15)}</span>
              </div>
            </TooltipTrigger>
            {pet.raca.length > 15 && (
              <TooltipContent>
                <p>{pet.raca}</p>
              </TooltipContent>
            )}
          </Tooltip>
          <div className="flex items-center gap-2">
            <span className="font-medium min-w-[60px]">Idade:</span>
            <span className="text-muted-foreground">{pet.idade} anos</span>
          </div>
        </div>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={handleDetailsClick}
              variant="outline"
              className="w-full mt-4 transition-colors"
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
  )
}
