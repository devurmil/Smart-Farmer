import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

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

  const facebookLogin = () => {
    if (!window.FB) {
      console.error('Facebook SDK not loaded');
      return;
    }

    setIsFacebookLoading(true);
    
    window.FB.login(function (response: any) {
      if (response.authResponse) {
        console.log('Welcome! Fetching your info...');
        window.FB.api('/me', { 
          fields: 'name,email,picture.type(large)' 
        }, function (userInfo: FacebookUserInfo) {
          console.log('Facebook user info:', userInfo);
          
          // Create user object with profile picture
          const userData = {
            id: userInfo.id,
            name: userInfo.name,
            email: userInfo.email,
            profilePicture: userInfo.picture?.data?.url,
            loginMethod: 'facebook' as const
          };

          // Use the user context to login
          login(userData);
          
          // Redirect to main page
          setTimeout(() => {
            setIsFacebookLoading(false);
            console.log('Facebook login successful:', userData);
            navigate('/');
          }, 1000);
        });
      } else {
        console.log('User cancelled login or did not fully authorize.');
        setIsFacebookLoading(false);
      }
    }, { scope: 'email,public_profile' });
  };

  return {
    isFacebookLoading,
    facebookLogin,
    isSDKLoaded
  };
}; 