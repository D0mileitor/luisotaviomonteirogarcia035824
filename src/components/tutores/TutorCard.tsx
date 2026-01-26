import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { Tutor } from "@/api/tutores"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { Mail, Phone, MapPin } from "lucide-react"

interface TutorCardProps {
  tutor: Tutor
}

export function TutorCard({ tutor }: TutorCardProps) {
  const [, setIsHovered] = useState(false)
  const navigate = useNavigate()
  
  const handleDetailsClick = () => {
    navigate(`/tutores/${tutor.id}`)
  }

  // Função para truncar texto
  const truncateText = (text: string, maxLength: number = 20): string => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength) + '...'
  }

  // Função para formatar telefone
  const formatPhoneNumber = (value: string): string => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 10) {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2')
    } else {
      return numbers
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2')
    }
  }

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative h-56 w-full overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900">
        <img
          src={tutor.foto?.url || "/userSemfoto.png"} 
          alt={tutor.nome}
          className="h-full w-full object-contain transition-transform duration-300 hover:scale-105"
        />
      </div>

      <CardHeader className="pb-3">
        <Tooltip>
          <TooltipTrigger asChild>
            <CardTitle className="text-xl font-semibold truncate">
              {truncateText(tutor.nome, 20)}
            </CardTitle>
          </TooltipTrigger>
          {tutor.nome.length > 20 && (
            <TooltipContent>
              <p>{tutor.nome}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </CardHeader>

      <CardContent className="space-y-3 pb-4">
        <div className="space-y-2 text-sm min-h-[80px]">
          {tutor.telefone && (
            <div className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-green-600 dark:text-green-400" />
              <span className="text-muted-foreground">{formatPhoneNumber(tutor.telefone)}</span>
            </div>
          )}
          {tutor.email && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-muted-foreground truncate">{truncateText(tutor.email, 20)}</span>
                </div>
              </TooltipTrigger>
              {tutor.email.length > 20 && (
                <TooltipContent>
                  <p>{tutor.email}</p>
                </TooltipContent>
              )}
            </Tooltip>
          )}
          {tutor.endereco && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-red-600 dark:text-red-400 mt-0.5" />
                  <span className="text-muted-foreground line-clamp-2">{truncateText(tutor.endereco, 15)}</span>
                </div>
              </TooltipTrigger>
              {tutor.endereco.length > 40 && (
                <TooltipContent>
                  <p className="max-w-xs">{tutor.endereco}</p>
                </TooltipContent>
              )}
            </Tooltip>
          )}
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
            <p>Ver informações completas do tutor</p>
          </TooltipContent>
        </Tooltip>
      </CardContent>
    </Card>
  )
}
