"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { LogIn, UserPlus } from "lucide-react";
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

const signUpSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const SignUpForm = ({ setActiveTab }: { setActiveTab: (tab: string) => void }) => {
  const signUpForm = useForm({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create an account to access the BoST Inventory Management Portal
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Enter your name"
              {...signUpForm.register("name")}
            />
            {signUpForm.formState.errors.name && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.name.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              {...signUpForm.register("email")}
            />
            {signUpForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.email.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Create a password"
              {...signUpForm.register("password")}
            />
            {signUpForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.password.message}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your password"
              {...signUpForm.register("confirmPassword")}
            />
            {signUpForm.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.confirmPassword.message}
              </p>
            )}
          </div>
          <Button type="submit" className="w-full">
            <UserPlus className="w-4 h-4 mr-2" />
            Sign Up
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Button
          variant="link"
          className="w-full"
          onClick={() => setActiveTab("signin")}
        >
          Already have an account? Sign In
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SignUpForm;
