"use client";
import React, { useEffect, useState } from "react";
import { useSignUp, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ToastAction } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import { PasswordStrengthMeter } from "@/components/ui/password-input";
import { PassInput } from "@/components/ui/pass-input";
import { PinInput } from "@/components/ui/pin-input";

type User = {
  first_name: string;
  last_name: string;
  email_address: string;
  password: string;
};

// Helper function to calculate password strength
const calculatePasswordStrength = (password: string): number => {
  let strength = 0;

  if (password.length >= 8) strength++; // Length of at least 8
  if (/[A-Z]/.test(password)) strength++; // Contains an uppercase letter
  if (/[a-z]/.test(password)) strength++; // Contains a lowercase letter
  if (/[0-9]/.test(password)) strength++; // Contains a number
  if (/[^A-Za-z0-9]/.test(password)) strength++; // Contains a special character

  return strength; // Strength ranges from 0 to 5
};

const SignUpPage = () => {
  // Getting router query if any (Join the community)
  const searchParams = useSearchParams();

  // Below error
  const [bError, setBError] = useState("");

  const { isLoaded, signUp, setActive } = useSignUp();
  const [email, setEmail] = useState(searchParams.get("email"));
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState(0);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const { user } = useUser();
  const router = useRouter();

  const { toast } = useToast();

  useEffect(() => {
    // Redirect to /inventory if the user is logged in
    if (user) {
      router.push("/inventory");
    }
  }, [user, router]);

  if (!isLoaded && bError === "") {
    return null;
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isLoaded) return;

    // User description
    const user: User = {
      first_name: firstName,
      last_name: lastName,
      email_address: email!,
      password: password,
    };

    await signUp
      ?.create(user)
      .then(async () => {
        // Send email
        await signUp.prepareEmailAddressVerification({
          strategy: "email_code",
        });

        // Change UI
        setPendingVerification(true);
      })
      .catch((err) => {
        setBError(err.errors[0].longMessage);
      });
  };

  // Verify User Email Code
  const onPressVerify = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!isLoaded) {
      return;
    }
    await signUp
      .attemptEmailAddressVerification({
        code: code.join(""),
      })
      .then(async (completeSignUp) => {
        if (completeSignUp.status !== "complete") {
          /* Investigate the response, to see if there was an error or if the user needs to complete one more step */
          console.log(JSON.stringify(completeSignUp, null, 2));
        }
        if (completeSignUp.status === "complete") {
          toast({
            title: "Acount Created Successfully! ",
            action: <ToastAction altText="Ok">Ok</ToastAction>,
          });
          await setActive({ session: completeSignUp.createdSessionId });
          router.push("/inventory");
        }
      })
      .catch((err) => {
        setBError(err.errors[0].longMessage);
      });
  };

  // Password and its strength
  const handlePasswordChange = (value: string) => {
    setPassword(value);
    setStrength(calculatePasswordStrength(value));
  };

  return (
    <div className="flex pt-5 flex-col items-center justify-center lg:px-0">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <img
            src="/bost.png"
            className="md:h-20 md:w-20 h-14 w-14 rounded-full"
          />
          <div className="w-full mx-auto rounded-none md:rounded-2xl md:p-4 shadow-input">
            <Card className="mx-auto sm:w-[400px] w-10/12 min-w-96 h-fit backdrop-blur-sm border">
              <CardHeader>
                <CardTitle>Sign Up</CardTitle>
                <CardDescription>
                  Start your jouney for having your inventory managed
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!pendingVerification && (
                  <form className="my-8" onSubmit={handleSubmit}>
                    <div className="grid w-full items-center gap-4">
                      <div className="flex flex-col space-y-1.5">
                        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mb-4">
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name" className="text-left">
                              First Name
                            </Label>
                            <Input
                              id="name"
                              placeholder="First Name"
                              type="text"
                              onChange={(e) => {
                                setFirstName(
                                  (e.target as HTMLInputElement).value
                                );
                                setBError("");
                              }}
                            />
                          </div>
                          <div className="flex flex-col space-y-1.5">
                            <Label htmlFor="name" className="text-left">
                              Last Name
                            </Label>
                            <Input
                              id="name"
                              placeholder="Last Name"
                              type="text"
                              onChange={(e) => {
                                setLastName(
                                  (e.target as HTMLInputElement).value
                                );
                                setBError("");
                              }}
                            />
                          </div>
                        </div>
                        <Label htmlFor="email" className="text-left">
                          Email
                        </Label>
                        <Input
                          id="email"
                          placeholder="email@example.com"
                          type="email"
                          onChange={(e) => {
                            const email = (e.target as HTMLInputElement).value;
                            setEmail(email);
                            if (!email.endsWith("@iitrpr.ac.in")) {
                              setBError(
                                "Only @iitrpr.ac.in emails are allowed."
                              );
                            } else {
                              setBError("");
                            }
                          }}
                        />
                      </div>
                      <div className="flex flex-col space-y-1.5">
                        <Label htmlFor="password" className="text-left">
                          Password
                        </Label>
                        <PassInput
                          id="password"
                          placeholder="••••••••"
                          type="password"
                          onChange={(e) => {
                            handlePasswordChange(
                              (e.target as HTMLInputElement).value
                            );
                            setBError("");
                          }}
                        />
                        <PasswordStrengthMeter value={strength} max={5} />
                      </div>
                    </div>
                    <br />
                    <div className="signUpError-Div text-center w-full text-red-600 ">
                      <p>{bError && bError}</p>
                    </div>

                    <CardFooter className="flex justify-center mt-8">
                      <Button
                        variant="outline"
                        type="submit"
                        className="bg-transparent"
                      >
                        Sign Up
                      </Button>
                    </CardFooter>
                  </form>
                )}
                {pendingVerification && (
                  <form className="my-8">
                    <div className="grid w-full items-center">
                      <div className="flex flex-col space-y-1.5 items-center">
                        <Label
                          htmlFor="text"
                          className="text-center mb-3 text-neutral-600"
                        >
                          A verification code has been sent to your provided
                          email address.
                        </Label>
                        <Label htmlFor="text" className="text-left">
                          Verification Code
                        </Label>
                        <PinInput
                          value={code}
                          onValueChange={(e) => setCode(e.value)}
                        />
                      </div>
                      <br />
                      <div className="signUpError-Div text-center w-full text-red-600">
                        <p>{bError && bError}</p>
                      </div>
                      <CardFooter className="flex justify-center">
                        <Button
                          variant="outline"
                          onClick={onPressVerify}
                          className="bg-transparent"
                        >
                          Verify
                        </Button>
                      </CardFooter>
                    </div>
                  </form>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
