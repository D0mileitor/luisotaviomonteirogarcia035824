import { useEffect } from "react"
import { AppRoutes } from "./routes"
import { initializeTokenRefresh } from "@/api/client"
import { ThemeProvider } from "@/contexts/ThemeContext"

export default function App() {
  useEffect(() => {
    // Inicializa renovação automática de token ao carregar o app
    initializeTokenRefresh()
  }, [])

  return (
    <ThemeProvider>
      <AppRoutes />
    </ThemeProvider>
  )
}
