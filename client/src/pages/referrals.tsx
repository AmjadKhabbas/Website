import { useState } from 'react';
import { motion } from 'framer-motion';
import { UserPlus, Mail, Phone, MapPin, Building, Award, ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface ReferralFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  licenseNumber: string;
  yearsOfExperience: string;
  referredBy: string;
  referrerContact: string;
  additionalNotes: string;
}

export default function ReferralsPage() {
  const { addToast } = useToast();
  const [formData, setFormData] = useState<ReferralFormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialty: '',
    licenseNumber: '',
    yearsOfExperience: '',
    referredBy: '',
    referrerContact: '',
    additionalNotes: '',
  });

  const submitReferralMutation = useMutation({
    mutationFn: async (data: ReferralFormData) => {
      return apiRequest('/api/referrals', {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    onSuccess: () => {
      addToast('Referral submitted successfully! We will review your application and contact you soon.', 'success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        clinicName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        specialty: '',
        licenseNumber: '',
        yearsOfExperience: '',
        referredBy: '',
        referrerContact: '',
        additionalNotes: '',
      });
    },
    onError: (error) => {
      addToast(`Failed to submit referral: ${error.message}`, 'error');
    },
  });

  const handleInputChange = (field: keyof ReferralFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    const requiredFields = ['firstName', 'lastName', 'email', 'phone', 'clinicName', 'specialty', 'licenseNumber'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof ReferralFormData]);
    
    if (missingFields.length > 0) {
      addToast('Please fill in all required fields', 'error');
      return;
    }

    submitReferralMutation.mutate(formData);
  };

  const specialties = [
    'Dermatology',
    'Plastic Surgery',
    'Aesthetic Medicine',
    'Rheumatology',
    'Orthopedics',
    'Pain Management',
    'Neurology',
    'Gynecology',
    'General Practice',
    'Other'
  ];

  const experienceRanges = [
    '1-2 years',
    '3-5 years',
    '6-10 years',
    '11-15 years',
    '16-20 years',
    '20+ years'
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-slate-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <Link href="/">
              <Button variant="ghost" className="flex items-center space-x-2">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Home</span>
              </Button>
            </Link>
          </div>
          
          <div className="text-center">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-slate-800 mb-4"
            >
              Doctor Referral Program
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 max-w-3xl mx-auto"
            >
              Join our network of healthcare professionals and gain access to premium medical products. 
              Complete the form below to submit your referral application.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Referral Form */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="bg-gradient-to-r from-blue-50 to-slate-50">
                <CardTitle className="flex items-center space-x-3 text-2xl">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                  <span>Referral Application</span>
                </CardTitle>
                <p className="text-slate-600 mt-2">
                  Please provide your professional information and referral details below.
                </p>
              </CardHeader>
              
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-8">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <Mail className="w-5 h-5 mr-2 text-blue-600" />
                      Personal Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          value={formData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          placeholder="Enter your first name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          value={formData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          placeholder="Enter your last name"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          placeholder="doctor@example.com"
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="(555) 123-4567"
                          required
                        />
                      </div>
                    </div>
                  </div>



                  {/* Professional Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <Award className="w-5 h-5 mr-2 text-blue-600" />
                      Professional Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="specialty">Medical Specialty *</Label>
                        <Select onValueChange={(value) => handleInputChange('specialty', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your specialty" />
                          </SelectTrigger>
                          <SelectContent>
                            {specialties.map((specialty) => (
                              <SelectItem key={specialty} value={specialty}>
                                {specialty}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                        <Select onValueChange={(value) => handleInputChange('yearsOfExperience', value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select experience range" />
                          </SelectTrigger>
                          <SelectContent>
                            {experienceRanges.map((range) => (
                              <SelectItem key={range} value={range}>
                                {range}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="licenseNumber">Medical License Number *</Label>
                        <Input
                          id="licenseNumber"
                          value={formData.licenseNumber}
                          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                          placeholder="Enter your medical license number"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Referral Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center">
                      <UserPlus className="w-5 h-5 mr-2 text-blue-600" />
                      Referral Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="referredBy">Referred By</Label>
                        <Input
                          id="referredBy"
                          value={formData.referredBy}
                          onChange={(e) => handleInputChange('referredBy', e.target.value)}
                          placeholder="Name of person who referred you"
                        />
                      </div>
                      <div>
                        <Label htmlFor="referrerContact">Referrer Contact Information</Label>
                        <Input
                          id="referrerContact"
                          value={formData.referrerContact}
                          onChange={(e) => handleInputChange('referrerContact', e.target.value)}
                          placeholder="Email or phone of referrer"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="additionalNotes">Additional Notes</Label>
                        <Textarea
                          id="additionalNotes"
                          value={formData.additionalNotes}
                          onChange={(e) => handleInputChange('additionalNotes', e.target.value)}
                          placeholder="Any additional information you'd like to share..."
                          rows={4}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6 border-t border-slate-200">
                    <Button
                      type="submit"
                      disabled={submitReferralMutation.isPending}
                      className="w-full md:w-auto btn-medical-primary px-8 py-3"
                    >
                      {submitReferralMutation.isPending ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Submitting...</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <UserPlus className="w-5 h-5" />
                          <span>Submit Referral Application</span>
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Benefits Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-12"
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-center">Benefits of Joining Our Network</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Award className="w-6 h-6 text-blue-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Exclusive Access</h4>
                    <p className="text-sm text-slate-600">Get priority access to premium medical products and new launches</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Building className="w-6 h-6 text-green-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Professional Support</h4>
                    <p className="text-sm text-slate-600">Dedicated account management and clinical support</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <UserPlus className="w-6 h-6 text-purple-600" />
                    </div>
                    <h4 className="font-semibold text-slate-800 mb-2">Referral Rewards</h4>
                    <p className="text-sm text-slate-600">Earn rewards for referring other qualified professionals</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>
    </div>
  );
}