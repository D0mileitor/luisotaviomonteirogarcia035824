import { Outlet } from "react-router-dom"
import { PageContainer } from "./PageContainer"
import { Navbar } from "./Navbar"

export function AppLayout() {
  return (
    <>
      <Navbar />
      <PageContainer>
        <Outlet />
      </PageContainer>
    </>
  )
}
