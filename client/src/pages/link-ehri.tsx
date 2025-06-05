import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";

const linkEhriSchema = z.object({
  ehriId: z.string().min(1, "Ehri ID is required"),
  email: z.string().email("Please enter a valid email address"),
});

type LinkEhriFormData = z.infer<typeof linkEhriSchema>;

export default function LinkEhriPage() {
  const [step, setStep] = useState<"link" | "verify">("link");
  const [verificationToken, setVerificationToken] = useState("");
  const [ehriId, setEhriId] = useState("");
  const [, navigate] = useNavigate();

  const form = useForm<LinkEhriFormData>({
    resolver: zodResolver(linkEhriSchema),
    defaultValues: {
      ehriId: "",
      email: "",
    },
  });

  const linkEhriMutation = useMutation({
    mutationFn: async (data: LinkEhriFormData) => {
      const response = await apiRequest("/api/auth/link-ehri", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: (data) => {
      setVerificationToken(data.verificationToken);
      setEhriId(form.getValues("ehriId"));
      setStep("verify");
    },
  });

  const verifyEhriMutation = useMutation({
    mutationFn: async (token: string) => {
      const response = await apiRequest("/api/auth/verify-ehri", {
        method: "POST",
        body: JSON.stringify({ ehriId, token }),
      });
      return response;
    },
    onSuccess: () => {
      navigate("/register");
    },
  });

  const onSubmit = (data: LinkEhriFormData) => {
    linkEhriMutation.mutate(data);
  };

  const handleVerification = () => {
    const token = (document.getElementById("verificationToken") as HTMLInputElement)?.value;
    if (token) {
      verifyEhriMutation.mutate(token);
    }
  };

  if (step === "verify") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                Verify Ehri Account
              </CardTitle>
              <CardDescription>
                Enter the verification token to complete the linking process
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Verification token: <strong>{verificationToken}</strong>
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div>
                  <label htmlFor="verificationToken" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Token
                  </label>
                  <Input
                    id="verificationToken"
                    placeholder="Enter verification token"
                    defaultValue={verificationToken}
                  />
                </div>

                {verifyEhriMutation.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {(verifyEhriMutation.error as Error).message}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleVerification}
                  disabled={verifyEhriMutation.isPending}
                  className="w-full"
                >
                  {verifyEhriMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Verify & Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              Link Your Ehri Account
            </CardTitle>
            <CardDescription>
              You must link your existing Ehri account before registering
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="ehriId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ehri ID</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter your Ehri ID" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="Enter your email address"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {linkEhriMutation.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {(linkEhriMutation.error as Error).message}
                    </AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  disabled={linkEhriMutation.isPending}
                  className="w-full"
                >
                  {linkEhriMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Link Ehri Account
                </Button>
              </form>
            </Form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an Ehri account?{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500">
                  Contact support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}