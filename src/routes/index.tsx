import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "@/pages/Login"
import PetsLista from "@/components/pet/PetsLista"
import PetDetail from "@/components/pet/PetDetail"
import { AppLayout } from "@/components/layout/AppLayout"

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pets" element={<AppLayout><PetsLista /></AppLayout>} />
        <Route path="/pets/:id" element={<AppLayout><PetDetail /></AppLayout>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
