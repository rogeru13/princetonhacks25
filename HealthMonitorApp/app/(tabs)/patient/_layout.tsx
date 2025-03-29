import { Stack } from 'expo-router';

export default function PatientLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="PatientDetailScreen"
        options={{
          title: 'Patient Details',
        }}
      />
      <Stack.Screen
        name="LogEntryScreen"
        options={{
          title: 'Log Entry',
        }}
      />
      {/* Add other patient screens here */}
    </Stack>
  );
} 