import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "@/pages/Login"
import PetsLista from "@/components/pet/PetsLista"
import PetDetail from "@/components/pet/PetDetail"
import TutoresLista from "@/components/tutores/TutoresLista"
import TutorDetail from "@/components/tutores/TutorDetail"
import { AppLayout } from "@/components/layout/AppLayout"

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/pets" element={<AppLayout><PetsLista /></AppLayout>} />
        <Route path="/pets/:id" element={<AppLayout><PetDetail /></AppLayout>} />
        <Route path="/tutores" element={<AppLayout><TutoresLista /></AppLayout>} />
        <Route path="/tutores/:id" element={<AppLayout><TutorDetail /></AppLayout>} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
