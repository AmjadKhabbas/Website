import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ArrowLeft, MessageCircle, Mail } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    id: 1,
    question: "What is Meds-Go?",
    answer: "Meds-Go is a specialized medical marketplace connecting healthcare professionals with premium medical products including botulinum toxins, dermal fillers, orthopedic supplies, and other professional-grade medical treatments. We serve licensed healthcare providers with authentic, high-quality products from trusted manufacturers."
  },
  {
    id: 2,
    question: "Is a prescription or medical license required?",
    answer: "Yes, all products on Meds-Go require proper medical licensure and credentials. We verify healthcare professional status during account setup and only sell to licensed practitioners including doctors, nurses, and other qualified medical professionals."
  },
  {
    id: 3,
    question: "How do I place an order?",
    answer: "To place an order, first create an account and complete our medical professional verification process. Once verified, browse our product catalog, add items to your cart, and proceed through our secure checkout process. Orders are processed within 24-48 hours after verification."
  },
  {
    id: 4,
    question: "How long does delivery take?",
    answer: "Standard delivery takes 2-5 business days for most products. Express shipping options are available for urgent orders, typically arriving within 1-2 business days. Temperature-sensitive products are shipped with appropriate cold chain handling to maintain product integrity."
  },
  {
    id: 5,
    question: "Do you accept insurance?",
    answer: "Insurance acceptance varies by product and provider. Many professional medical supplies may be covered under practice insurance or reimbursement programs. We recommend checking with your insurance provider for specific coverage details. We provide detailed invoices for reimbursement purposes."
  },
  {
    id: 6,
    question: "Can I cancel or return my order?",
    answer: "Orders can be cancelled within 2 hours of placement if not yet shipped. Due to the medical nature of our products, returns are limited to unopened, unexpired products in original packaging within 14 days of delivery. Temperature-sensitive products cannot be returned once shipped."
  },
  {
    id: 7,
    question: "Are your products safe and legitimate?",
    answer: "Absolutely. All products are sourced directly from FDA-approved manufacturers and authorized distributors. We maintain strict quality control standards, proper storage conditions, and full chain of custody documentation. Every product comes with certificates of authenticity and lot tracking information."
  },
  {
    id: 8,
    question: "How do I contact customer support?",
    answer: "Our customer support team is available Monday-Friday, 8 AM to 6 PM EST. You can reach us via email at support@meds-go.com, phone at 1-800-MEDS-GO, or through our live chat feature. For urgent matters, use our emergency support line available 24/7."
  },
  {
    id: 9,
    question: "What payment methods do you accept?",
    answer: "We accept major credit cards (Visa, MasterCard, American Express), business checks, ACH bank transfers, and practice financing options. All transactions are processed through encrypted, HIPAA-compliant payment systems to ensure security and confidentiality."
  },
  {
    id: 10,
    question: "Do you ship internationally?",
    answer: "Currently, we ship within the United States and Canada to licensed healthcare facilities. International shipping requires additional documentation and regulatory compliance. Contact our international sales team for specific country requirements and shipping options."
  },
  {
    id: 11,
    question: "How do I join the referral program?",
    answer: "Healthcare professionals can join our referral program by completing the application on our referrals page. Approved members receive exclusive pricing, early access to new products, and referral bonuses for bringing qualified colleagues to the platform."
  },
  {
    id: 12,
    question: "What training and support do you provide?",
    answer: "We offer comprehensive product training, injection technique workshops, and continuing education credits through our professional development program. Training is available both online and in-person, with certification programs for advanced techniques."
  }
];

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([]);

  const toggleItem = (id: number) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

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
              Frequently Asked Questions
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg text-slate-600 max-w-3xl mx-auto"
            >
              Find answers to common questions about our medical products, ordering process, 
              and services. Can't find what you're looking for? Contact our support team.
            </motion.p>
          </div>
        </div>
      </section>

      {/* FAQ Content */}
      <section className="py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-4">
            {faqData.map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden border border-slate-200 hover:border-blue-200 transition-all duration-300">
                  <button
                    onClick={() => toggleItem(item.id)}
                    className="w-full text-left p-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-slate-800 pr-4">
                        {item.question}
                      </h3>
                      <motion.div
                        animate={{ rotate: openItems.includes(item.id) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                        className="flex-shrink-0"
                      >
                        <ChevronDown className="w-5 h-5 text-slate-500" />
                      </motion.div>
                    </div>
                  </button>
                  
                  <AnimatePresence>
                    {openItems.includes(item.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <CardContent className="px-6 pb-6 pt-0">
                          <div className="border-t border-slate-100 pt-4">
                            <p className="text-slate-600 leading-relaxed">
                              {item.answer}
                            </p>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h2 className="text-2xl font-bold text-slate-800 mb-4">
              Still Have Questions?
            </h2>
            <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
              Our dedicated support team is here to help. Get in touch with us for personalized assistance 
              with your medical product needs and account questions.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button className="btn-medical-primary flex items-center space-x-2">
                <MessageCircle className="w-5 h-5" />
                <span>Live Chat Support</span>
              </Button>
              
              <Button variant="outline" className="flex items-center space-x-2 border-blue-200 text-blue-700 hover:bg-blue-50">
                <Mail className="w-5 h-5" />
                <span>Email Support</span>
              </Button>
            </div>
            
            <div className="mt-8 pt-8 border-t border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-slate-600">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Support Hours</h4>
                  <p>Monday - Friday<br />8:00 AM - 6:00 PM EST</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Emergency Line</h4>
                  <p>24/7 Urgent Support<br />1-800-FOX-URGENT</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Response Time</h4>
                  <p>Email: Within 4 hours<br />Chat: Immediate</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}