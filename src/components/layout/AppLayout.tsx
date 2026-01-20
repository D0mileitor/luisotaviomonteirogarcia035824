import { PageContainer } from "./PageContainer"

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <>
      <header className="h-14 w-full border-b bg-white flex items-center px-4">
        <h1 className="text-sm font-semibold">Sistema</h1>
      </header>

      <PageContainer>
        {children}
      </PageContainer>
    </>
  )
}
