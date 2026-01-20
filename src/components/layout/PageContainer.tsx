interface PageContainerProps {
  children: React.ReactNode
}

export function PageContainer({ children }: PageContainerProps) {
  return (
    <main className="min-h-screen w-full flex justify-center bg-zinc-50">
      <div className="w-full max-w-7xl px-4 py-6">
        {children}
      </div>
    </main>
  )
}
