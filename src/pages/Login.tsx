import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { publicApi } from "@/api/client"
import gridBg from "@/assets/grid.svg"

const loginSchema = z.object({
  username: z.string().min(1, "Usuário obrigatório"),
  password: z.string().min(1, "Senha obrigatória"),
})

type LoginData = z.infer<typeof loginSchema>

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginData) => {
    try {
      const response = await publicApi.post("/autenticacao/login", data)

      const { access_token, refresh_token } = response.data

      if (!access_token) {
        throw new Error("Access token não encontrado na resposta da API")
      }

      localStorage.setItem("access_token", access_token)
      localStorage.setItem("refresh_token", refresh_token)

      window.location.href = "/petslista"
    } catch (err) {
      alert("Usuário ou senha inválidos")
      console.error(err)
    }
  }

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center bg-background"
    >
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url(${gridBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      />
      <div className="w-full max-w-md mx-auto px-4 relative z-10">
        <div className="rounded-lg border border-border bg-card/95 backdrop-blur-sm p-8 shadow-2xl">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Bem-vindo ao S.G.P - MT
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistema de Gestão de Pets de Mato Grosso
          </p>
          <p className="text-sm text-muted-foreground">
             Faça login para continuar
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="username" className="text-sm font-medium">
              Usuário
            </Label>
            <Input 
              id="username" 
              {...register("username")}
              placeholder="Digite seu usuário"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-destructive">
                {errors.username.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium">
              Senha
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Digite sua senha"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full font-medium py-6"
          >
            Entrar
          </Button>
        </form>
        </div>
      </div>
    </div>
  )
}
