'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Link from 'next/link'
import { useAuth } from '@/hooks/use-auth'
import { Loader2 } from 'lucide-react'
import Google from '@/components/oauth/google'
import { ThemeToggle } from '@/components/theme/theme-toggle'

export default function SignUpPage() {
  const { signUpForm, handleSignUp, isLoading } = useAuth()
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = signUpForm

  return (
    <section className="flex min-h-screen bg-zinc-50 px-4 py-16 md:py-32 dark:bg-transparent relative">
      {/* Theme Toggle - Top Right */}
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <form
        onSubmit={handleSubmit(handleSignUp)}
        className="bg-card m-auto h-fit w-full max-w-sm rounded-[calc(var(--radius)+.125rem)] border p-0.5 shadow-md dark:[--color-muted:var(--color-zinc-900)]"
      >
        <div className="p-8 pb-6">
          <div>
            <h1 className="mb-1 mt-4 text-xl font-semibold">Create a D2D Account</h1>
            <p className="text-sm text-muted-foreground">Welcome! Create an account to get started</p>
          </div>

          <hr className="my-4 border-dashed" />

          <div className="space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstname" className="block text-sm">
                  First Name
                </Label>
                <Input
                  type="text"
                  {...register("firstName")}
                  placeholder="John"
                  className={errors.firstName ? "border-destructive" : ""}
                  id="firstname"
                />
                {errors.firstName && (
                  <p className="text-xs text-destructive">{errors.firstName.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastname" className="block text-sm">
                  Last Name
                </Label>
                <Input
                  type="text"
                  {...register("lastName")}
                  placeholder="Doe"
                  className={errors.lastName ? "border-destructive" : ""}
                  id="lastname"
                />
                {errors.lastName && (
                  <p className="text-xs text-destructive">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="block text-sm">
                Email
              </Label>
              <Input
                type="email"
                {...register("email")}
                placeholder="you@example.com"
                className={errors.email ? "border-destructive" : ""}
                id="email"
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pwd" className="text-sm">
                Password
              </Label>
              <Input
                type="password"
                {...register("password")}
                placeholder="••••••••"
                className={errors.password ? "border-destructive" : ""}
                id="pwd"
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>

            {errors.root && (
              <p className="text-xs text-destructive text-center">
                {errors.root.message}
              </p>
            )}

            <Button className="w-full" disabled={isLoading} type="submit">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 px-8">
          <hr className="border-dashed" />
          <span className="text-muted-foreground text-xs">Or continue with</span>
          <hr className="border-dashed" />
        </div>

        <div className="grid grid-cols-2 gap-3 p-8 pt-4">
          <Google />
          <Button type="button" variant="outline">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="1em"
              height="1em"
              viewBox="0 0 256 256"
            >
              <path fill="#f1511b" d="M121.666 121.666H0V0h121.666z" />
              <path fill="#80cc28" d="M256 121.666H134.335V0H256z" />
              <path fill="#00adef" d="M121.663 256.002H0V134.336h121.663z" />
              <path fill="#fbbc09" d="M256 256.002H134.335V134.336H256z" />
            </svg>
            <span>Microsoft</span>
          </Button>
        </div>

        <hr className="mx-8 border-dashed" />

        <div className="bg-muted rounded-b-[calc(var(--radius)+.125rem)] border-t p-3 m-0.5 mt-4">
          <p className="text-accent-foreground text-center text-sm">
            Have an account?
            <Button asChild variant="link" className="px-2">
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
          </p>
        </div>
      </form>
    </section>
  )
}