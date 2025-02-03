"use client";
import React, { useEffect, useState } from "react";
import { useSignIn, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SignInPage = () => {
  // Below error
  const [bError, setBError] = useState("");
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { user } = useUser();
  const router = useRouter();
  useEffect(() => {
    // Redirect to /inventory if the user is logged in
    if (user) {
      router.push("/inventory");
    }
  }, [user, router]);
  if (!isLoaded) {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!isLoaded) {
      return;
    }

    try {
      const result = await signIn?.create({
        identifier: email,
        password: password,
      });

      if (result.status === "complete") {
        await setActive({ session: result.createdSessionId });
        router.push("/inventory");
      } else {
        /*Investigate why the sign-in hasn't completed */
        setBError("Invalid email or password");
      }
    } catch (error) {
      console.log(error);
      setBError("Invalid email or password");
    }
  };

  return (
    <div className="flex pt-5 flex-col items-center justify-center lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <img
            src="/bost.png"
            className="md:h-20 md:w-20 h-14 w-14 rounded-full"
          />
          <div className="mx-auto rounded-none md:rounded-2xl shadow-input bg-white sm:w-auto w-full flex justify-center">
            <Card className="sm:w-[400px] w-8/12 min-w-80 h-fit border">
              <CardHeader>
                <CardTitle>Sign In</CardTitle>
                <CardDescription>
                  Sign in using user credentials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="my-8" onSubmit={handleSubmit}>
                  <div className="grid w-full items-center gap-4">
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="email" className="text-left">
                        Email
                      </Label>
                      <Input
                        id="email"
                        placeholder="email"
                        onChange={(e) => {
                          setEmail((e.target as HTMLInputElement).value);
                          setBError("");
                        }}
                      />
                    </div>
                    <div className="flex flex-col space-y-1.5">
                      <Label htmlFor="password" className="text-left">
                        Password
                      </Label>
                      <Input
                        id="email_username"
                        placeholder="••••••••"
                        type="password"
                        onChange={(e) => {
                          setPassword((e.target as HTMLInputElement).value);
                          setBError("");
                        }}
                      />
                    </div>
                  </div>
                  <br/>
                  <div className="signUpError-Div text-center w-full text-red-600">
                    <p>{bError && bError}</p>
                  </div>
                  <CardFooter className="flex justify-center mt-8">
                    <Button variant="outline" type="submit">
                      Login
                    </Button>
                  </CardFooter>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignInPage;
