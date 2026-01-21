import { useEffect } from "react"
import { AppRoutes } from "./routes"
import { initializeTokenRefresh } from "@/api/client"

export default function App() {
  useEffect(() => {
    // Inicializa renovação automática de token ao carregar o app
    initializeTokenRefresh()
  }, [])

  return <AppRoutes />
}
