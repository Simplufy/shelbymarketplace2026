'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { Loader2, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function AdminDebug() {
  const [authStatus, setAuthStatus] = useState<'loading' | 'authenticated' | 'not-authenticated'>('loading');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const supabase = createClient();

  const checkAuth = useCallback(async () => {
    try {
      // Check if user is authenticated
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        setError(`Auth Error: ${authError.message}`);
        setAuthStatus('not-authenticated');
        return;
      }

      if (!user) {
        setAuthStatus('not-authenticated');
        return;
      }

      setUserEmail(user.email || null);
      setAuthStatus('authenticated');

      // Check user role in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, first_name, last_name')
        .eq('id', user.id)
        .single();

      if (profileError) {
        setError(`Profile Error: ${profileError.message}`);
        return;
      }

      setUserRole(profile?.role || 'No role found');
    } catch (err) {
      setError(`Unexpected Error: ${err}`);
    }
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => {
      void checkAuth();
    }, 0);

    return () => clearTimeout(timer);
  }, [checkAuth]);

  const isAdmin = userRole === 'ADMIN';

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-lg w-full">
        <h1 className="text-2xl font-black text-gray-900 mb-2">Admin Access Debug</h1>
        <p className="text-gray-500 mb-6">Checking your authentication status...</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-center gap-2 text-red-700 font-bold mb-1">
              <AlertTriangle className="w-5 h-5" />
              Error
            </div>
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {/* Authentication Status */}
          <div className={`p-4 rounded-xl border ${
            authStatus === 'authenticated' 
              ? 'bg-green-50 border-green-200' 
              : authStatus === 'not-authenticated'
              ? 'bg-red-50 border-red-200'
              : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-center gap-3">
              {authStatus === 'loading' ? (
                <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
              ) : authStatus === 'authenticated' ? (
                <CheckCircle className="w-6 h-6 text-green-600" />
              ) : (
                <XCircle className="w-6 h-6 text-red-600" />
              )}
              <div>
                <p className="font-bold text-gray-900">
                  {authStatus === 'loading' ? 'Checking...' : 
                   authStatus === 'authenticated' ? 'Authenticated' : 'Not Authenticated'}
                </p>
                {userEmail && (
                  <p className="text-sm text-gray-600">{userEmail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Role Status */}
          {authStatus === 'authenticated' && (
            <div className={`p-4 rounded-xl border ${
              isAdmin 
                ? 'bg-green-50 border-green-200' 
                : 'bg-yellow-50 border-yellow-200'
            }`}>
              <div className="flex items-center gap-3">
                {isAdmin ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-yellow-600" />
                )}
                <div>
                  <p className="font-bold text-gray-900">
                    Role: {userRole || 'Not found'}
                  </p>
                  <p className={`text-sm ${isAdmin ? 'text-green-600' : 'text-yellow-600'}`}>
                    {isAdmin 
                      ? '✓ You have admin access' 
                      : '✗ You need ADMIN role to access /admin'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {authStatus === 'not-authenticated' && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-blue-800 font-medium mb-2">You need to log in first</p>
              <Link
                href="/login?redirect=/admin"
                className="inline-block px-4 py-2 bg-[#002D72] text-white font-bold rounded-lg hover:bg-[#001D4A] transition-colors"
              >
                Go to Login
              </Link>
            </div>
          )}

          {authStatus === 'authenticated' && !isAdmin && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 font-medium mb-2">Admin Access Required</p>
              <p className="text-yellow-700 text-sm mb-4">
                Your account needs the ADMIN role. Current role: <strong>{userRole}</strong>
              </p>
              <div className="space-y-2 text-sm text-yellow-700">
                <p>To fix this, run this SQL in Supabase:</p>
                <code className="block bg-yellow-100 p-2 rounded text-xs font-mono">
                  {`UPDATE profiles SET role = 'ADMIN' WHERE email = '${userEmail}';`}
                </code>
              </div>
            </div>
          )}

          {isAdmin && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-800 font-medium mb-2">✓ All checks passed!</p>
              <p className="text-green-700 text-sm mb-4">
                You should be able to access the admin panel.
              </p>
              <Link
                href="/admin"
                className="inline-block px-4 py-2 bg-[#002D72] text-white font-bold rounded-lg hover:bg-[#001D4A] transition-colors"
              >
                Go to Admin
              </Link>
            </div>
          )}
        </div>

        <button
          onClick={checkAuth}
          className="mt-6 w-full py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Refresh Check
        </button>
      </div>
    </div>
  );
}
