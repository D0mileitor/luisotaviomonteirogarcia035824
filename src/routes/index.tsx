import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { lazy, Suspense  } from "react"
import { useEffect, useRef } from "react"
import { AppLayout } from "@/components/layout/AppLayout"
import Lottie from "lottie-react"
import pawLoading from "@/assets/Paws.json"

const Login = lazy(() => import("@/pages/Login"))
const PetsLista = lazy(() => import("@/components/pet/PetsLista"))
const PetDetail = lazy(() => import("@/components/pet/PetDetail"))
const TutoresLista = lazy(() => import("@/components/tutores/TutoresLista"))
const TutorDetail = lazy(() => import("@/components/tutores/TutorDetail"))

export function Loading() {
  const lottieRef = useRef<any>(null)

  useEffect(() => {
    lottieRef.current?.setSpeed(10.5)
  }, [])

  return (
    <div className="flex items-center justify-center h-screen">
      <Lottie
        lottieRef={lottieRef}
        animationData={pawLoading}
        loop
        className="w-40 dark:invert"
      />
    </div>
  )
}


export function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />

          {/* Rotas protegidas / com layout */}
          <Route element={<AppLayout />}>
            <Route path="/pets" element={<PetsLista />} />
            <Route path="/pets/:id" element={<PetDetail />} />
            <Route path="/tutores" element={<TutoresLista />} />
            <Route path="/tutores/:id" element={<TutorDetail />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
