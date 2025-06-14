import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { useLocation } from 'wouter';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, User, Mail, FileText, Building, MapPin, LogOut, Loader2, Package, Plus } from 'lucide-react';
import { Link } from 'wouter';
import { useToast } from '@/components/toast';
import { apiRequest } from '@/lib/queryClient';
import { useAdmin } from '@/hooks/useAdmin';

interface PendingUser {
  id: number;
  email: string;
  fullName: string;
  licenseNumber: string;
  collegeName: string;
  provinceState: string;
  practiceName: string;
  practiceAddress: string;
  isApproved: boolean;
  isLicenseVerified: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const { isAdmin, admin, logoutMutation: adminLogout } = useAdmin();

  // Fetch pending users
  const { data: pendingUsers = [], isLoading, error } = useQuery<PendingUser[]>({
    queryKey: ['/api/admin/pending-users'],
    enabled: isAdmin === true
  });

  // Approve user mutation
  const approveMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest('POST', `/api/admin/approve-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-users'] });
      addToast('User approved successfully', 'success');
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to approve user', 'error');
    }
  });

  // Reject user mutation
  const rejectMutation = useMutation({
    mutationFn: async (userId: number) => {
      return await apiRequest('DELETE', `/api/admin/reject-user/${userId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/pending-users'] });
      addToast('User rejected successfully', 'success');
    },
    onError: (error: any) => {
      addToast(error.message || 'Failed to reject user', 'error');
    }
  });

  if (!isAdmin) {
    setLocation('/admin/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Manage pending doctor registrations
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => adminLogout.mutate()}
            disabled={logoutMutation.isPending ? (
              
            
            false
            ): (false)}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pending Registrations
              </CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingUsers.length}</div>
            </CardContent>
          </Card>

          <Link href="/admin/products">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer border-blue-200 hover:border-blue-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">
                  Product Management
                </CardTitle>
                <Package className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-blue-600" />
                  <span className="text-sm font-medium text-blue-600">Add New Product</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Upload products with images and details</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Pending Users List */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : error ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-red-600 dark:text-red-400">
                Failed to load pending registrations
              </p>
            </CardContent>
          </Card>
        ) : pendingUsers.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-600 dark:text-gray-400">
                No pending registrations found
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {pendingUsers.map((user) => (
              <Card key={user.id} className="border-l-4 border-l-blue-500">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {user.fullName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">
                        Pending Approval
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">License:</span>
                        <span className="text-sm">{user.licenseNumber}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">College:</span>
                        <span className="text-sm">{user.collegeName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Province:</span>
                        <span className="text-sm">{user.provinceState}</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Building className="h-4 w-4 text-gray-500" />
                        <span className="text-sm font-medium">Practice:</span>
                        <span className="text-sm">{user.practiceName}</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-gray-500 mt-0.5" />
                        <div>
                          <span className="text-sm font-medium">Address:</span>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {user.practiceAddress}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-end gap-3">
                    <Button
                      variant="destructive"
                      onClick={() => rejectMutation.mutate(user.id)}
                      disabled={rejectMutation.isPending || approveMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </Button>
                    <Button
                      onClick={() => approveMutation.mutate(user.id)}
                      disabled={approveMutation.isPending || rejectMutation.isPending}
                      className="flex items-center gap-2"
                    >
                      <CheckCircle className="h-4 w-4" />
                      Approve
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}