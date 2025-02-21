"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const signInSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const SignInForm = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const signInForm = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Sign in to access the BoST Inventory Management Portal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...signInForm.register("email")}
            />
            {signInForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {signInForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              {...signInForm.register("password")}
            />
            {signInForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {signInForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            <LogIn className="w-4 h-4 mr-2" />
            Sign In
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          variant="link"
          className="w-full"
          onClick={() => setActiveTab("signup")}
        >
          Don&apos;t have an account? Sign Up
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SignInForm;
