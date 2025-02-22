"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LogIn, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SignInSchema } from "@/lib/auth/validation";
import { useEffect, useState } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

const SignInForm = ({
  setActiveTab,
}: {
  setActiveTab: (tab: string) => void;
}) => {
  const { user } = useUser();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [bError, setBError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(SignInSchema),
    defaultValues: { email: "", password: "" },
  });
  const { isLoaded, signIn, setActive } = useSignIn();
  useEffect(() => {
    if (user) {
      router.replace("/inventory");
    }
  }, [user, router]);

  const handleSignIn = async (email: string, password: string) => {
    if (!isLoaded || loading) return;
    setLoading(true);

    try {
      const result = await signIn?.create({ identifier: email, password });

      if (result?.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.replace("/inventory");
      } else {
        setBError("Invalid email or password");
      }
    } catch (error) {
      console.error(error);
      setBError("Invalid email or password");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
          onSubmit={handleSubmit((data) =>
            handleSignIn(data.email, data.password)
          )}
        >
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>
          {bError && <p className="text-red-600 text-center">{bError}</p>}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogIn className="w-4 h-4 mr-2" />
            )}
            {loading ? "Signing In..." : "Sign In"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          variant="link"
          className="w-full"
          onClick={() => setActiveTab("signup")}
          disabled={loading}
        >
          Don't have an account? Sign Up
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SignInForm;
