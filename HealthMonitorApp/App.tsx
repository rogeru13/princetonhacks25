import { AuthProvider } from './context/AuthContext';
import { Stack } from 'expo-router';

export default function App() {
  return (
    <AuthProvider>
      <Stack>
        {/* Your stack screens */}
      </Stack>
    </AuthProvider>
  );
} 