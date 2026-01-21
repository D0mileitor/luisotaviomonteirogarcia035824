import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "@/pages/Login"
import PetsLista from "@/pages/PetsLista"

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/pets" element={<PetsLista />} />
      </Routes>
    </BrowserRouter>
  )
}
