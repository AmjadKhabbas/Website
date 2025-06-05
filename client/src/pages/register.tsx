import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useNavigate } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, AlertCircle, CheckCircle } from "lucide-react";
import { useState } from "react";

const registrationSchema = z.object({
  ehriId: z.string().min(1, "Ehri ID is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  
  // Professional Information
  licenseNumber: z.string().min(1, "License number is required"),
  licenseState: z.string().min(1, "License state is required"),
  licenseExpiration: z.string().min(1, "License expiration is required"),
  specialty: z.string().min(1, "Specialty is required"),
  
  // Practice Information
  practiceName: z.string().min(1, "Practice name is required"),
  practiceType: z.string().min(1, "Practice type is required"),
  practiceAddress: z.string().min(1, "Practice address is required"),
  practiceCity: z.string().min(1, "Practice city is required"),
  practiceState: z.string().min(1, "Practice state is required"),
  practiceZip: z.string().min(5, "Please enter a valid ZIP code"),
  
  // Additional Information
  deaNumber: z.string().optional(),
  npiNumber: z.string().optional(),
  yearsInPractice: z.string().min(1, "Years in practice is required"),
  averagePatientsPerMonth: z.string().min(1, "Average patients per month is required"),
});

type RegistrationFormData = z.infer<typeof registrationSchema>;

const specialties = [
  "Family Medicine",
  "Internal Medicine",
  "Dermatology",
  "Plastic Surgery",
  "Ophthalmology",
  "Orthopedics",
  "Neurology",
  "Cardiology",
  "Emergency Medicine",
  "Other"
];

const practiceTypes = [
  "Private Practice",
  "Hospital",
  "Clinic",
  "Academic Medical Center",
  "Urgent Care",
  "Other"
];

const usStates = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY"
];

export default function RegisterPage() {
  const [, navigate] = useNavigate();
  const [registrationComplete, setRegistrationComplete] = useState(false);

  const form = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      ehriId: "",
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      licenseNumber: "",
      licenseState: "",
      licenseExpiration: "",
      specialty: "",
      practiceName: "",
      practiceType: "",
      practiceAddress: "",
      practiceCity: "",
      practiceState: "",
      practiceZip: "",
      deaNumber: "",
      npiNumber: "",
      yearsInPractice: "",
      averagePatientsPerMonth: "",
    },
  });

  const registrationMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await apiRequest("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      });
      return response;
    },
    onSuccess: () => {
      setRegistrationComplete(true);
    },
  });

  const onSubmit = (data: RegistrationFormData) => {
    registrationMutation.mutate(data);
  };

  if (registrationComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500 mb-4" />
              <CardTitle className="text-2xl font-bold text-gray-900">
                Registration Successful
              </CardTitle>
              <CardDescription>
                Your account has been submitted for approval
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600">
                Thank you for registering. Your account is pending approval from our team. 
                You will receive an email notification once your account has been approved.
              </p>
              <Button onClick={() => navigate("/")} className="w-full">
                Return to Home
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-gray-900">
              Healthcare Professional Registration
            </CardTitle>
            <CardDescription>
              Complete your registration to access our medical marketplace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Ehri Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Ehri Account Information
                  </h3>
                  <FormField
                    control={form.control}
                    name="ehriId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ehri ID *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter your verified Ehri ID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Personal Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="John" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Last Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="john.doe@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="(555) 123-4567" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Professional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Medical License Number *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter license number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="licenseState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License State *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {usStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="licenseExpiration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Expiration Date *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="specialty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Specialty *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select specialty" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {specialties.map((specialty) => (
                                <SelectItem key={specialty} value={specialty}>
                                  {specialty}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Practice Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Practice Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="practiceName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Practice Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter practice name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="practiceType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Practice Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select practice type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {practiceTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={form.control}
                    name="practiceAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Practice Address *</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter practice address" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="practiceCity"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>City *</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter city" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="practiceState"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>State *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select state" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {usStates.map((state) => (
                                <SelectItem key={state} value={state}>
                                  {state}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="practiceZip"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ZIP Code *</FormLabel>
                          <FormControl>
                            <Input placeholder="12345" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                    Additional Information
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="deaNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>DEA Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter DEA number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="npiNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>NPI Number (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter NPI number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="yearsInPractice"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Practice *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 5-10 years" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="averagePatientsPerMonth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Average Patients per Month *</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g., 100-200" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {registrationMutation.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {(registrationMutation.error as Error).message}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="flex justify-between pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate("/link-ehri")}
                  >
                    Back to Ehri Linking
                  </Button>
                  <Button
                    type="submit"
                    disabled={registrationMutation.isPending}
                    className="min-w-[150px]"
                  >
                    {registrationMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Complete Registration
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}