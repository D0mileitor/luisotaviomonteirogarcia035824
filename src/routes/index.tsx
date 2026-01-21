import { BrowserRouter, Routes, Route } from "react-router-dom"
import Login from "@/pages/Login"
import PetsLista from "@/pages/PetsLista"

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/petslista" element={<PetsLista />} />
      </Routes>
    </BrowserRouter>
  )
}
