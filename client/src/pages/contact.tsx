import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, ArrowLeft, Send, MessageCircle } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  company: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  message: z.string().min(10, 'Please enter a detailed message'),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true);
    try {
      // Simulate form submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      reset();
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const contactInfo = [
    {
      icon: Phone,
      title: "Phone",
      details: ["+1 (855) 637-7462", "Available 24/7"],
      color: "text-blue-600"
    },
    {
      icon: Mail,
      title: "Email",
      details: ["support@meds-go.com", "Response within 2 hours"],
      color: "text-green-600"
    },
    {
      icon: MapPin,
      title: "Address",
      details: ["123 Medical Center Drive", "Healthcare District, CA 90210"],
      color: "text-purple-600"
    },
    {
      icon: Clock,
      title: "Business Hours",
      details: ["Mon-Fri: 8:00 AM - 6:00 PM PST", "Emergency support 24/7"],
      color: "text-orange-600"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20">
      {/* Header */}
      <section className="bg-gradient-to-br from-blue-50 via-white to-slate-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
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
              Contact Our Friendly Team
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 max-w-3xl mx-auto"
            >
              We're here to help with your medical product needs. Get in touch with our expert team 
              for personalized assistance, product information, or technical support.
            </motion.p>
          </div>
        </div>
      </section>

      {/* Contact Information Cards */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {contactInfo.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full border border-slate-200 hover:border-blue-200 transition-all duration-300 hover:shadow-lg">
                  <CardContent className="p-6 text-center">
                    <div className={`w-12 h-12 ${item.color} bg-opacity-10 rounded-lg flex items-center justify-center mx-auto mb-4`}>
                      <item.icon className={`w-6 h-6 ${item.color}`} />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800 mb-2">{item.title}</h3>
                    {item.details.map((detail, idx) => (
                      <p key={idx} className={`${idx === 0 ? 'text-slate-800 font-medium' : 'text-slate-500 text-sm'}`}>
                        {detail}
                      </p>
                    ))}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="border border-slate-200">
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-slate-800">
                    Send Us a Message
                  </CardTitle>
                  <p className="text-slate-600">
                    Fill out the form below and we'll get back to you within 2 hours during business hours.
                  </p>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-green-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-slate-800 mb-2">Message Sent!</h3>
                      <p className="text-slate-600">Thank you for contacting us. We'll respond within 2 hours.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            First Name *
                          </label>
                          <Input
                            {...register('firstName')}
                            placeholder="John"
                            className={errors.firstName ? 'border-red-300' : ''}
                          />
                          {errors.firstName && (
                            <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Last Name *
                          </label>
                          <Input
                            {...register('lastName')}
                            placeholder="Doe"
                            className={errors.lastName ? 'border-red-300' : ''}
                          />
                          {errors.lastName && (
                            <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          {...register('email')}
                          type="email"
                          placeholder="john.doe@example.com"
                          className={errors.email ? 'border-red-300' : ''}
                        />
                        {errors.email && (
                          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Phone Number *
                          </label>
                          <Input
                            {...register('phone')}
                            placeholder="(555) 123-4567"
                            className={errors.phone ? 'border-red-300' : ''}
                          />
                          {errors.phone && (
                            <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Company (Optional)
                          </label>
                          <Input
                            {...register('company')}
                            placeholder="Medical Practice Name"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Subject *
                        </label>
                        <Input
                          {...register('subject')}
                          placeholder="Product inquiry, technical support, etc."
                          className={errors.subject ? 'border-red-300' : ''}
                        />
                        {errors.subject && (
                          <p className="text-red-500 text-sm mt-1">{errors.subject.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Message *
                        </label>
                        <Textarea
                          {...register('message')}
                          placeholder="Please provide details about your inquiry..."
                          rows={5}
                          className={errors.message ? 'border-red-300' : ''}
                        />
                        {errors.message && (
                          <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                        )}
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full btn-medical-primary flex items-center justify-center space-x-2"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4" />
                            <span>Send Message</span>
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Additional Information */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-8"
            >
              <div>
                <h3 className="text-xl font-bold text-slate-800 mb-4">Why Choose Meds-Go?</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Expert Support</h4>
                      <p className="text-slate-600 text-sm">Our team includes licensed healthcare professionals ready to assist you.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">Fast Response</h4>
                      <p className="text-slate-600 text-sm">We respond to all inquiries within 2 hours during business hours.</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-slate-800">24/7 Emergency Support</h4>
                      <p className="text-slate-600 text-sm">Critical support available around the clock for urgent needs.</p>
                    </div>
                  </div>
                </div>
              </div>

              <Card className="border border-slate-200 bg-blue-50">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3 mb-4">
                    <MessageCircle className="w-6 h-6 text-blue-600" />
                    <h4 className="font-semibold text-slate-800">Live Chat Available</h4>
                  </div>
                  <p className="text-slate-600 text-sm mb-4">
                    Need immediate assistance? Our live chat support is available during business hours for real-time help.
                  </p>
                  <Button variant="outline" className="w-full border-blue-200 text-blue-700 hover:bg-blue-100">
                    Start Live Chat
                  </Button>
                </CardContent>
              </Card>

              <Card className="border border-slate-200">
                <CardContent className="p-6">
                  <h4 className="font-semibold text-slate-800 mb-3">Emergency Contact</h4>
                  <p className="text-slate-600 text-sm mb-3">
                    For urgent medical product needs outside business hours:
                  </p>
                  <div className="space-y-2">
                    <p className="text-slate-800 font-medium">Emergency Hotline: +1 (855) 637-URGENT</p>
                    <p className="text-slate-600 text-sm">Available 24/7 for critical situations</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}