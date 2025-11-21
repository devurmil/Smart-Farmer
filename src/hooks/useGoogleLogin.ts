import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { getBackendUrl } from '@/lib/utils';

declare global {
  interface Window {
    google?: any;
  }
}

interface GoogleUserInfo {
  sub: string;
  email: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

interface UseGoogleLoginReturn {
  isGoogleLoading: boolean;
  googleLogin: () => void;
  isSDKLoaded: boolean;
}

export const useGoogleLogin = (): UseGoogleLoginReturn => {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const tokenClientRef = useRef<any>(null);
  const { login } = useUser();
  const navigate = useNavigate();
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) {
      console.warn('VITE_GOOGLE_CLIENT_ID is not defined. Google login disabled.');
      return;
    }

    const initializeClient = () => {
      if (!window.google?.accounts?.oauth2) {
        return;
      }

      tokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: () => undefined,
        error_callback: (error: unknown) => {
          console.error('Google OAuth error:', error);
          setIsGoogleLoading(false);
        }
      });

      setIsSDKLoaded(true);
    };

    if (window.google?.accounts?.oauth2) {
      initializeClient();
      return;
    }

    const scriptId = 'google-identity-services';
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initializeClient;
      script.onerror = () => {
        console.error('Failed to load Google Identity Services script');
        setIsSDKLoaded(false);
      };
      document.head.appendChild(script);
    } else {
      script.addEventListener('load', initializeClient);
    }

    return () => {
      script?.removeEventListener('load', initializeClient);
    };
  }, [clientId]);

  const googleLogin = () => {
    if (!clientId) {
      alert('Google login is not configured. Please set VITE_GOOGLE_CLIENT_ID.');
      return;
    }

    if (!tokenClientRef.current) {
      console.error('Google token client not initialized');
      alert('Google login is not ready yet. Please try again in a moment.');
      return;
    }

    setIsGoogleLoading(true);

    tokenClientRef.current.callback = async (tokenResponse: { access_token?: string }) => {
      if (!tokenResponse?.access_token) {
        setIsGoogleLoading(false);
        alert('Google login failed to provide an access token.');
        return;
      }

      try {
        const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            Authorization: `Bearer ${tokenResponse.access_token}`
          }
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch Google profile information.');
        }

        const userInfo = (await userInfoResponse.json()) as GoogleUserInfo;

        if (!userInfo?.email || !userInfo?.sub) {
          throw new Error('Google did not return the required profile information.');
        }

        const backendUrl = getBackendUrl();
        const response = await fetch(`${backendUrl}/api/auth/google`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            name: userInfo.name || `${userInfo.given_name ?? ''} ${userInfo.family_name ?? ''}`.trim() || 'Google User',
            email: userInfo.email,
            googleId: userInfo.sub,
            profilePicture: userInfo.picture
          })
        });

        const data = await response.json();

        if (response.ok && data.success && data.data?.user) {
          login(data.data.user);

          if (!data.data.requiresRoleSelection) {
            navigate('/');
          }
        } else {
          throw new Error(data?.message || 'Google login failed.');
        }
      } catch (error) {
        console.error('Google login error:', error);
        alert(error instanceof Error ? error.message : 'Google login failed. Please try again.');
      } finally {
        setIsGoogleLoading(false);
      }
    };

    tokenClientRef.current.requestAccessToken({
      prompt: 'consent'
    });
  };

  return {
    isGoogleLoading,
    googleLogin,
    isSDKLoaded
  };
};

