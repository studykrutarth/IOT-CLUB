import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';

function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Verifying...');

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get the hash from URL (Supabase uses hash fragments for auth)
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const error = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        if (error) {
          setStatus(`Error: ${errorDescription || error}`);
          setTimeout(() => navigate('/'), 3000);
          return;
        }

        if (accessToken) {
          // Exchange the code for a session
          const { data, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError) {
            setStatus(`Error: ${sessionError.message}`);
            setTimeout(() => navigate('/'), 3000);
            return;
          }

          if (data.session) {
            setStatus('Email verified successfully! Redirecting...');
            setTimeout(() => navigate('/'), 2000);
          } else {
            setStatus('Verification failed. Please try again.');
            setTimeout(() => navigate('/'), 3000);
          }
        } else {
          // Check for code in query params (alternative method)
          const code = searchParams.get('code');
          if (code) {
            const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
            if (exchangeError) {
              setStatus(`Error: ${exchangeError.message}`);
              setTimeout(() => navigate('/'), 3000);
            } else {
              setStatus('Email verified successfully! Redirecting...');
              setTimeout(() => navigate('/'), 2000);
            }
          } else {
            setStatus('No verification token found. Please check your email link.');
            setTimeout(() => navigate('/'), 3000);
          }
        }
      } catch (err) {
        console.error('Auth callback error:', err);
        setStatus(`Error: ${err.message}`);
        setTimeout(() => navigate('/'), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#1b1833] to-[#0f0c1d] flex items-center justify-center text-white">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-400 mb-4"></div>
        <p className="text-xl">{status}</p>
      </div>
    </div>
  );
}

export default AuthCallback;
