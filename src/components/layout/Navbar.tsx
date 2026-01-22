import { Button } from "@/components/ui/button"
import { LogOut, Moon, Sun, PawPrint } from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"
import { useTheme } from "@/contexts/ThemeContext"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()
  const { theme, toggleTheme } = useTheme()

  const handleLogout = () => {
    // Remove todos os tokens do localStorage
    localStorage.removeItem("access_token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("token_expires_at")
    localStorage.removeItem("refresh_expires_at")
    
    // Redireciona para a página de login
    navigate("/login")
  }

  const isPetsPage = location.pathname.startsWith("/pets")

  return (
    <TooltipProvider>
      <header className="h-14 w-full border-b bg-background flex items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/pets")}>
                <img src="/pet-house.png" alt="Logo" className="w-10 h-10" />
                <h1 className="text-lg font-semibold">Sistema de Gestão de Pets  - MT</h1>
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ir para a página de pets</p>
            </TooltipContent>
          </Tooltip>
          
          <nav className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/pets")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isPetsPage 
                      ? "bg-accent text-accent-foreground" 
                      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  <PawPrint className="w-4 h-4" />
                  Pets
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver lista de pets cadastrados</p>
              </TooltipContent>
            </Tooltip>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="flex items-center gap-2"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4" />
                    Claro
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    Escuro
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Alternar entre modo claro e escuro</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sair do sistema</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </header>
    </TooltipProvider>
  )
}
