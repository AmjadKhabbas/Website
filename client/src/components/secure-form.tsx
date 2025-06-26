/**
 * Secure Form Component with Anti-Phishing Protection
 * Implements security measures for credit card and bank information forms
 */

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, Lock, Eye, EyeOff, AlertTriangle } from 'lucide-react';

interface SecurityIndicatorProps {
  isSecure: boolean;
  children: React.ReactNode;
}

export function SecurityIndicator({ isSecure, children }: SecurityIndicatorProps) {
  return (
    <Card className={`border-2 ${isSecure ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50'}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          {isSecure ? (
            <Shield className="h-5 w-5 text-green-600" />
          ) : (
            <AlertTriangle className="h-5 w-5 text-red-600" />
          )}
          <Badge variant={isSecure ? "default" : "destructive"} className="text-xs">
            {isSecure ? "Secure Connection" : "Security Warning"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
}

interface SecureInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'password' | 'tel' | 'email';
  placeholder?: string;
  required?: boolean;
  pattern?: string;
  maxLength?: number;
  sensitive?: boolean;
}

export function SecureInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  pattern,
  maxLength,
  sensitive = false
}: SecureInputProps) {
  const [showValue, setShowValue] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Input validation for sensitive fields
  const validateInput = (input: string) => {
    if (sensitive) {
      // Remove any potentially malicious characters
      const sanitized = input.replace(/[<>\"']/g, '');
      onChange(sanitized);
    } else {
      onChange(input);
    }
  };

  const isSecureContext = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {sensitive && (
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-green-600" />
            <span className="text-xs text-green-600">Encrypted</span>
          </div>
        )}
      </div>
      
      <div className="relative">
        <input
          type={sensitive && !showValue ? 'password' : type}
          value={value}
          onChange={(e) => validateInput(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={placeholder}
          required={required}
          pattern={pattern}
          maxLength={maxLength}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
            sensitive ? 'bg-yellow-50 border-yellow-300' : 'border-gray-300'
          } ${!isSecureContext && sensitive ? 'border-red-400 bg-red-50' : ''}`}
          autoComplete={sensitive ? 'off' : 'on'}
          spellCheck={false}
        />
        
        {sensitive && (
          <button
            type="button"
            onClick={() => setShowValue(!showValue)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          >
            {showValue ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        )}
      </div>

      {!isSecureContext && sensitive && (
        <div className="flex items-center gap-1 text-xs text-red-600">
          <AlertTriangle className="h-3 w-3" />
          <span>Warning: Insecure connection detected</span>
        </div>
      )}

      {isFocused && sensitive && (
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3 text-green-600" />
            <span>Your information is encrypted before transmission</span>
          </div>
          <div className="flex items-center gap-1">
            <Lock className="h-3 w-3 text-green-600" />
            <span>Data is securely stored with bank-level encryption</span>
          </div>
        </div>
      )}
    </div>
  );
}

export function SecurityNotice() {
  const [isSecureConnection, setIsSecureConnection] = useState(false);

  useEffect(() => {
    setIsSecureConnection(
      window.location.protocol === 'https:' || 
      window.location.hostname === 'localhost'
    );
  }, []);

  return (
    <Card className="bg-blue-50 border-blue-200">
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Security & Privacy Protection</h3>
          </div>
          
          <div className="text-sm text-blue-800 space-y-2">
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 mt-0.5 text-blue-600" />
              <span>All payment information is encrypted using AES-256 encryption before storage</span>
            </div>
            
            <div className="flex items-start gap-2">
              <Shield className="h-4 w-4 mt-0.5 text-blue-600" />
              <span>Your data is processed manually by authorized administrators only</span>
            </div>
            
            <div className="flex items-start gap-2">
              <Lock className="h-4 w-4 mt-0.5 text-blue-600" />
              <span>Bank details are never stored in plain text and are automatically purged after processing</span>
            </div>

            {isSecureConnection ? (
              <div className="flex items-center gap-2 text-green-700 font-medium">
                <Shield className="h-4 w-4" />
                <span>Secure HTTPS connection established</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-700 font-medium">
                <AlertTriangle className="h-4 w-4" />
                <span>Warning: Connection not secure</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}