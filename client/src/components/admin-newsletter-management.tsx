import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Mail, Download, Eye, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Newsletter } from '@shared/schema';

export function AdminNewsletterManagement() {
  const [showSubscriptions, setShowSubscriptions] = useState(false);

  const { data: subscriptions = [], isLoading } = useQuery<Newsletter[]>({
    queryKey: ['/api/newsletter/subscriptions'],
    enabled: showSubscriptions,
  });

  const handleExportEmails = () => {
    const emails = subscriptions.map(sub => sub.email).join('\n');
    const blob = new Blob([emails], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter-subscribers-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="w-5 h-5 text-green-600" />
          <span>Newsletter Management</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowSubscriptions(!showSubscriptions)}
            variant={showSubscriptions ? "default" : "outline"}
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{showSubscriptions ? 'Hide' : 'View'} Subscriptions</span>
          </Button>
          
          {subscriptions.length > 0 && (
            <Button
              onClick={handleExportEmails}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Download className="w-4 h-4" />
              <span>Export Emails</span>
            </Button>
          )}
        </div>

        {showSubscriptions && (
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
                <p className="text-slate-600">Loading subscriptions...</p>
              </div>
            ) : subscriptions.length === 0 ? (
              <div className="text-center py-8">
                <Mail className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">No newsletter subscriptions yet</p>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary" className="text-green-600">
                    {subscriptions.length} Subscriber{subscriptions.length !== 1 ? 's' : ''}
                  </Badge>
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {subscriptions.map((subscription, index) => (
                    <motion.div
                      key={subscription.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border"
                    >
                      <div className="flex items-center space-x-3">
                        <Mail className="w-4 h-4 text-green-600" />
                        <span className="font-medium text-slate-800 dark:text-slate-200">
                          {subscription.email}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-slate-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(subscription.subscribedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}