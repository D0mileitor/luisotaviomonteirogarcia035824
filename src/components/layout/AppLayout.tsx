import { PageContainer } from "./PageContainer"
import { Navbar } from "./Navbar"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <Navbar />

      <PageContainer>
        {children}
      </PageContainer>
    </>
  )
}
