"use client"

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

/* ======================================================
   1. Schemas (Single Source of Truth)
====================================================== */

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signUpSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInData = z.infer<typeof signInSchema>;
type SignUpData = z.infer<typeof signUpSchema>;

/* ======================================================
   2. Auth Hook
====================================================== */

export const useAuth = () => {
  const { signIn, signOut } = useAuthActions();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  /* ------------------------------
     Sign In Form
  ------------------------------ */

  const signInForm = useForm<SignInData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  /* ------------------------------
     Sign Up Form
  ------------------------------ */

  const signUpForm = useForm<SignUpData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  /* ======================================================
     3. Handlers
  ====================================================== */

  const handleSignIn = async (data: SignInData) => {
    setIsLoading(true);
    try {
      await signIn("password", {
        email: data.email,
        password: data.password,
        flow: "signIn",
      });

      toast.success("Signed in successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign in error:", error);
      signInForm.setError("root", {
        message: "Invalid email or password",
      });
      toast.error("Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async (data: SignUpData) => {
    setIsLoading(true);
    try {
      await signIn("password", {
        email: data.email,
        password: data.password,
        name: `${data.firstName} ${data.lastName}`,
        flow: "signUp",
      });

      toast.success("Account created successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Sign up error:", error);
      signUpForm.setError("root", {
        message: "Failed to create account. Email may already exist.",
      });
      toast.error("Failed to create account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut();
      toast.success("Signed out successfully!");
      router.push("/auth/sign-in");
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error("Failed to sign out");
    } finally {
      setIsLoading(false);
    }
  };

  /* ======================================================
     4. Public API
  ====================================================== */

  return {
    signInForm,
    signUpForm,
    handleSignIn,
    handleSignUp,
    handleSignOut,
    isLoading,
  };
};