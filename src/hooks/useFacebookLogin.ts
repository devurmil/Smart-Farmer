import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';
import { getBackendUrl } from '@/lib/utils';

// Facebook SDK types
declare global {
  interface Window {
    FB: any;
    fbAsyncInit: () => void;
  }
}

interface FacebookUserInfo {
  id: string;
  name: string;
  email: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

interface UseFacebookLoginReturn {
  isFacebookLoading: boolean;
  facebookLogin: () => void;
  isSDKLoaded: boolean;
}

export const useFacebookLogin = (): UseFacebookLoginReturn => {
  const [isFacebookLoading, setIsFacebookLoading] = useState(false);
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const navigate = useNavigate();
  const { login } = useUser();

  // Initialize Facebook SDK
  useEffect(() => {
    // Load Facebook SDK
    const loadFacebookSDK = () => {
      const script = document.createElement('script');
      script.src = 'https://connect.facebook.net/en_US/sdk.js';
      script.async = true;
      script.defer = true;
      script.crossOrigin = 'anonymous';
      document.head.appendChild(script);

      // Initialize Facebook SDK
      window.fbAsyncInit = function () {
        window.FB.init({
          appId: import.meta.env.VITE_FACEBOOK_APP_ID,
          cookie: true,
          xfbml: true,
          version: 'v19.0'
        });

        window.FB.AppEvents.logPageView();
        setIsSDKLoaded(true);
      };
    };

    loadFacebookSDK();

    // Cleanup
    return () => {
      const script = document.querySelector('script[src*="connect.facebook.net"]');
      if (script) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const facebookLogin = async () => {
    if (!window.FB) {
      console.error('Facebook SDK not loaded');
      return;
    }

    setIsFacebookLoading(true);
    
    try {
      // First, get Facebook user info
      const userInfo = await new Promise<FacebookUserInfo>((resolve, reject) => {
        window.FB.login(function (response: any) {
          if (response.authResponse) {
            console.log('Welcome! Fetching your info...');
            window.FB.api('/me', { 
              fields: 'name,email,picture.type(large)' 
            }, function (userInfo: FacebookUserInfo) {
              console.log('Facebook user info:', userInfo);
              resolve(userInfo);
            });
          } else {
            console.log('User cancelled login or did not fully authorize.');
            reject(new Error('User cancelled login'));
          }
        }, { scope: 'email,public_profile' });
      });

      // Send user data to backend
      const backendUrl = getBackendUrl();
      const response = await fetch(`${backendUrl}/api/auth/facebook`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: userInfo.name,
          email: userInfo.email,
          facebookId: userInfo.id,
          profilePicture: userInfo.picture?.data?.url
        })
      });

      const data = await response.json();

      if (response.ok && data.success && data.data && data.data.user) {
        // Success - user logged in and saved to database
        console.log('Facebook login successful:', data);
        login(data.data.user);
        
        // Redirect to main page
        setTimeout(() => {
          setIsFacebookLoading(false);
          navigate('/');
        }, 1000);
      } else {
        // Error from backend
        const errorMsg = data.message || 'Facebook login failed';
        console.error('Facebook login failed:', errorMsg);
        alert(errorMsg);
        setIsFacebookLoading(false);
      }
    } catch (error) {
      console.error('Facebook login error:', error);
      alert('Facebook login failed. Please try again.');
      setIsFacebookLoading(false);
    }
  };

  return {
    isFacebookLoading,
    facebookLogin,
    isSDKLoaded
  };
}; 