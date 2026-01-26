import { Button } from "@/components/ui/button"
import { LogOut, Moon, Sun, PawPrint, Users } from "lucide-react"
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
  const isTutoresPage = location.pathname.startsWith("/tutores")

  return (
    <TooltipProvider>
      <header className="h-14 w-full border-b bg-background flex items-center justify-between px-3 sm:px-6">
        <div className="flex items-center gap-2 sm:gap-6">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/pets")}>
                <img src="/pet-house.png" alt="Logo" className="w-8 h-8 sm:w-10 sm:h-10" />
                <h1 className="text-sm sm:text-lg font-semibold hidden sm:block">Sistema de Gestão de Pets  - MT</h1>
                <h1 className="text-sm font-semibold sm:hidden">G.P.C - MT</h1>
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
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isPetsPage 
                        ? "bg-white dark:bg-accent text-black dark:text-accent-foreground border border-gray-300 dark:border-transparent" 
                        : "bg-white text-black dark:bg-transparent dark:text-white hover:bg-accent/50 hover:text-foreground"
                    }`}
                >
                  <PawPrint className="w-4 h-4" />
                  <span className="hidden sm:inline ">Pets</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver lista de pets cadastrados</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  onClick={() => navigate("/tutores")}
                  className={`flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                      isTutoresPage 
                        ? "bg-white dark:bg-accent text-black dark:text-accent-foreground border border-gray-300 dark:border-transparent" 
                        : "bg-white text-black dark:bg-transparent dark:text-white hover:bg-accent/50 hover:text-foreground"
                    }`}
                >
                  <Users className="w-4 h-4" />
                  <span className="hidden sm:inline">Tutores</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver lista de tutores cadastrados</p>
              </TooltipContent>
            </Tooltip>
          </nav>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleTheme}
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 bg-white text-black dark:bg-transparent dark:text-white"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="w-4 h-4" />
                    <span className="hidden sm:inline">Claro</span>
                  </>
                ) : (
                  <>
                    <Moon className="w-4 h-4" />
                    <span className="hidden sm:inline">Escuro</span>
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
                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 bg-white text-black dark:bg-transparent dark:text-white"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
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
