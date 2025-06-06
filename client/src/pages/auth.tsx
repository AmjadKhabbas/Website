import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Eye, EyeOff, ArrowLeft, Shield, UserCheck, Building, FileText } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registrationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters long')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  licenseNumber: z.string().min(5, 'Please enter a valid license number'),
  collegeName: z.string().min(2, 'Professional association name is required'),
  provinceState: z.string().min(2, 'Province or state is required'),
  practiceName: z.string().min(2, 'Practice/clinic name is required'),
  practiceAddress: z.string().min(10, 'Please enter a complete practice address'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegistrationFormData = z.infer<typeof registrationSchema>;

export default function AuthPage() {
  const [, navigate] = useLocation();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const { toast } = useToast();

  // Login form
  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Registration form
  const {
    register: registerRegister,
    handleSubmit: handleRegisterSubmit,
    formState: { errors: registerErrors },
    reset: resetRegister,
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Login failed');
      }
      
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Login Successful",
        description: `Welcome back, ${data.user.fullName}!`,
      });
      navigate('/');
    },
    onError: (error: Error) => {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Registration mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegistrationFormData) => {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Registration failed');
      }
      
      return result;
    },
    onSuccess: (data) => {
      toast({
        title: "Registration Successful",
        description: data.message,
      });
      resetRegister();
      setActiveTab('login');
    },
    onError: (error: Error) => {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onLoginSubmit = (data: LoginFormData) => {
    loginMutation.mutate(data);
  };

  const onRegisterSubmit = (data: RegistrationFormData) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 pt-20">
      {/* Header */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            
            {/* Left Column - Authentication Forms */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Card className="border-2 border-blue-100 shadow-xl">
                <CardHeader className="text-center pb-4">
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    Medical Professional Portal
                  </CardTitle>
                  <p className="text-slate-600">
                    Secure access for licensed healthcare providers
                  </p>
                </CardHeader>
                
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="login">Sign In</TabsTrigger>
                      <TabsTrigger value="register">Register</TabsTrigger>
                    </TabsList>

                    {/* Login Tab */}
                    <TabsContent value="login" className="space-y-6 mt-6">
                      <form onSubmit={handleLoginSubmit(onLoginSubmit)} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="login-email">Email Address</Label>
                          <Input
                            id="login-email"
                            type="email"
                            placeholder="doctor@example.com"
                            {...loginRegister('email')}
                            className={loginErrors.email ? 'border-red-500' : ''}
                          />
                          {loginErrors.email && (
                            <p className="text-sm text-red-600">{loginErrors.email.message}</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="login-password">Password</Label>
                          <div className="relative">
                            <Input
                              id="login-password"
                              type={showPassword ? 'text' : 'password'}
                              placeholder="Enter your password"
                              {...loginRegister('password')}
                              className={loginErrors.password ? 'border-red-500' : ''}
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                          {loginErrors.password && (
                            <p className="text-sm text-red-600">{loginErrors.password.message}</p>
                          )}
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-blue-600 hover:bg-blue-700"
                          disabled={loginMutation.isPending}
                        >
                          {loginMutation.isPending ? 'Signing In...' : 'Sign In'}
                        </Button>
                      </form>
                    </TabsContent>

                    {/* Registration Tab */}
                    <TabsContent value="register" className="space-y-6 mt-6">
                      <form onSubmit={handleRegisterSubmit(onRegisterSubmit)} className="space-y-4">
                        {/* Personal Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <UserCheck className="w-5 h-5 text-blue-600" />
                            Personal Information
                          </h3>
                          
                          <div className="space-y-2">
                            <Label htmlFor="fullName">Full Name *</Label>
                            <Input
                              id="fullName"
                              placeholder="Dr. John Smith"
                              {...registerRegister('fullName')}
                              className={registerErrors.fullName ? 'border-red-500' : ''}
                            />
                            {registerErrors.fullName && (
                              <p className="text-sm text-red-600">{registerErrors.fullName.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="email">Email Address *</Label>
                            <Input
                              id="email"
                              type="email"
                              placeholder="doctor@example.com"
                              {...registerRegister('email')}
                              className={registerErrors.email ? 'border-red-500' : ''}
                            />
                            {registerErrors.email && (
                              <p className="text-sm text-red-600">{registerErrors.email.message}</p>
                            )}
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="password">Password *</Label>
                              <div className="relative">
                                <Input
                                  id="password"
                                  type={showPassword ? 'text' : 'password'}
                                  placeholder="Create password"
                                  {...registerRegister('password')}
                                  className={registerErrors.password ? 'border-red-500' : ''}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowPassword(!showPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                              {registerErrors.password && (
                                <p className="text-sm text-red-600">{registerErrors.password.message}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="confirmPassword">Confirm Password *</Label>
                              <div className="relative">
                                <Input
                                  id="confirmPassword"
                                  type={showConfirmPassword ? 'text' : 'password'}
                                  placeholder="Confirm password"
                                  {...registerRegister('confirmPassword')}
                                  className={registerErrors.confirmPassword ? 'border-red-500' : ''}
                                />
                                <button
                                  type="button"
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                >
                                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                              </div>
                              {registerErrors.confirmPassword && (
                                <p className="text-sm text-red-600">{registerErrors.confirmPassword.message}</p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Medical License Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Shield className="w-5 h-5 text-green-600" />
                            Medical License Information
                          </h3>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="licenseNumber">License Number *</Label>
                              <Input
                                id="licenseNumber"
                                placeholder="12345678"
                                {...registerRegister('licenseNumber')}
                                className={registerErrors.licenseNumber ? 'border-red-500' : ''}
                              />
                              {registerErrors.licenseNumber && (
                                <p className="text-sm text-red-600">{registerErrors.licenseNumber.message}</p>
                              )}
                            </div>

                            <div className="space-y-2">
                              <Label htmlFor="provinceState">Province/State of Registration *</Label>
                              <Input
                                id="provinceState"
                                placeholder="Ontario, California, etc."
                                {...registerRegister('provinceState')}
                                className={registerErrors.provinceState ? 'border-red-500' : ''}
                              />
                              {registerErrors.provinceState && (
                                <p className="text-sm text-red-600">{registerErrors.provinceState.message}</p>
                              )}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="collegeName">Professional Association/College Name *</Label>
                            <Input
                              id="collegeName"
                              placeholder="College of Physicians and Surgeons"
                              {...registerRegister('collegeName')}
                              className={registerErrors.collegeName ? 'border-red-500' : ''}
                            />
                            {registerErrors.collegeName && (
                              <p className="text-sm text-red-600">{registerErrors.collegeName.message}</p>
                            )}
                          </div>
                        </div>

                        {/* Practice Information */}
                        <div className="space-y-4">
                          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                            <Building className="w-5 h-5 text-purple-600" />
                            Practice Information
                          </h3>
                          
                          <div className="space-y-2">
                            <Label htmlFor="practiceName">Practice/Clinic Name *</Label>
                            <Input
                              id="practiceName"
                              placeholder="Downtown Medical Clinic"
                              {...registerRegister('practiceName')}
                              className={registerErrors.practiceName ? 'border-red-500' : ''}
                            />
                            {registerErrors.practiceName && (
                              <p className="text-sm text-red-600">{registerErrors.practiceName.message}</p>
                            )}
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="practiceAddress">Practice/Clinic Address *</Label>
                            <Textarea
                              id="practiceAddress"
                              placeholder="123 Main Street, Suite 100, City, Province/State, Postal Code"
                              rows={3}
                              {...registerRegister('practiceAddress')}
                              className={registerErrors.practiceAddress ? 'border-red-500' : ''}
                            />
                            {registerErrors.practiceAddress && (
                              <p className="text-sm text-red-600">{registerErrors.practiceAddress.message}</p>
                            )}
                          </div>
                        </div>

                        <Button
                          type="submit"
                          className="w-full bg-green-600 hover:bg-green-700"
                          disabled={registerMutation.isPending}
                        >
                          {registerMutation.isPending ? 'Creating Account...' : 'Create Account'}
                        </Button>
                      </form>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            </motion.div>

            {/* Right Column - Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h2 className="text-3xl font-bold text-slate-800 mb-4">
                  Secure Medical Marketplace
                </h2>
                <p className="text-lg text-slate-600 mb-8">
                  Access premium medical products with verified professional credentials
                </p>
              </div>

              <div className="space-y-6">
                <Card className="border border-blue-200 bg-blue-50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <Shield className="w-8 h-8 text-blue-600 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                          License Verification Required
                        </h3>
                        <p className="text-slate-600">
                          All accounts undergo medical license verification to ensure compliance and authenticity.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-green-200 bg-green-50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <UserCheck className="w-8 h-8 text-green-600 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                          Manual Review Process
                        </h3>
                        <p className="text-slate-600">
                          Each registration is manually reviewed by our compliance team for accuracy and legitimacy.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border border-purple-200 bg-purple-50">
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4">
                      <FileText className="w-8 h-8 text-purple-600 mt-1" />
                      <div>
                        <h3 className="text-lg font-semibold text-slate-800 mb-2">
                          Pending Approval Status
                        </h3>
                        <p className="text-slate-600">
                          After registration, your account will be pending approval until license verification is complete.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="bg-slate-100 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">
                  Need Help?
                </h3>
                <p className="text-slate-600 mb-4">
                  Contact our support team for assistance with registration or license verification.
                </p>
                <div className="space-y-2 text-sm text-slate-600">
                  <p><strong>Email:</strong> info@meds-go.com</p>
                  <p><strong>Phone:</strong> +1 (647) 913-5659</p>
                  <p><strong>Response Time:</strong> 1-2 business days</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}