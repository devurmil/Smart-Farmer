# Facebook Login Setup Guide

This guide will help you set up Facebook login for your Smart Farm India application.

## Prerequisites

1. A Facebook Developer Account
2. A Facebook App created in the Facebook Developer Console

## Step 1: Create a Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "My Apps" and then "Create App"
3. Choose "Consumer" as the app type
4. Fill in your app details and create the app

## Step 2: Configure Facebook Login

1. In your Facebook App dashboard, go to "Add Product"
2. Find "Facebook Login" and click "Set Up"
3. Choose "Web" as your platform
4. Enter your website URL (e.g., `http://localhost:3000` for development)
5. Save the changes

## Step 3: Get Your App ID

1. In your Facebook App dashboard, go to "Settings" > "Basic"
2. Copy your "App ID" (this is what you'll use in the environment variable)

## Step 4: Configure Environment Variables

1. Open the `.env.local` file in your project root
2. Replace `YOUR_FACEBOOK_APP_ID_HERE` with your actual Facebook App ID:

```env
VITE_FACEBOOK_APP_ID=123456789012345
```

## Step 5: Configure App Domains

1. In your Facebook App dashboard, go to "Settings" > "Basic"
2. Add your domain to "App Domains" (e.g., `localhost` for development)
3. Add your website URL to "Website" section

## Step 6: Configure Valid OAuth Redirect URIs

1. In your Facebook App dashboard, go to "Facebook Login" > "Settings"
2. Add your redirect URIs:
   - For development: `http://localhost:3000/`
   - For production: `https://yourdomain.com/`

## Step 7: Test the Integration

1. Start your development server: `npm run dev`
2. Navigate to the login or signup page
3. Click the "Facebook" button
4. You should see the Facebook login popup
5. After successful login, check the browser console for user information

## Troubleshooting

### Common Issues:

1. **"App ID not found" error**: Make sure your App ID is correctly set in `.env.local`
2. **"Invalid App ID" error**: Verify your App ID in the Facebook Developer Console
3. **"URL blocked" error**: Add your domain to the App Domains and Valid OAuth Redirect URIs
4. **SDK not loading**: Check your internet connection and ensure the Facebook SDK URL is accessible

### Development vs Production:

- For development, use `http://localhost:3000` (or your dev server port)
- For production, use your actual domain (e.g., `https://smartfarmindia.com`)
- Make sure to update both App Domains and Valid OAuth Redirect URIs accordingly

## Security Notes

1. Never commit your `.env.local` file to version control
2. Keep your Facebook App ID secure
3. Regularly review your Facebook App settings
4. Consider implementing additional security measures on your backend

## Backend Integration

The current implementation logs user information to the console. In a production environment, you should:

1. Send the Facebook user data to your backend
2. Verify the Facebook access token on your server
3. Create or update user records in your database
4. Implement proper session management
5. Handle error cases and edge scenarios

## Additional Features

You can extend the Facebook login functionality by:

1. Requesting additional permissions (e.g., `user_birthday`, `user_location`)
2. Implementing Facebook logout functionality
3. Adding Facebook profile picture display
4. Implementing "Login with Facebook" persistence
5. Adding Facebook sharing capabilities

## Support

If you encounter any issues:

1. Check the Facebook Developer Console for error messages
2. Review the browser console for JavaScript errors
3. Verify your environment variables are correctly set
4. Ensure your Facebook App is properly configured
5. Check the Facebook Login documentation for updates 