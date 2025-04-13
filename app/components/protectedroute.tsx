// app/components/ProtectedRoute.tsx
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '../contexts/authcontext'; // Adjust the path to your AuthContext

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isLoggedIn, ready } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (ready && !isLoggedIn) {
      router.replace('/LoginScreen');
    }
  }, [ready, isLoggedIn, router]);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
