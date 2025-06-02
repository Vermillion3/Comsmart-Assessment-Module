import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import RegistrationScreen from './screens/RegistrationScreen';
import DashboardScreen from './screens/dashboard/DashboardScreen';

// Placeholder screens for navigation
import AssessmentScreen from './screens/dashboard/assessment-module/AssessmentScreen';
import PCRecommendationScreen from './screens/dashboard/PCRecommendationScreen';
import UserAccountScreen from './screens/dashboard/UserAccountScreen';
import ContactScreen from './screens/dashboard/ContactScreen';
import HelpScreen from './screens/dashboard/HelpScreen';
import NotificationScreen from './screens/dashboard/NotificationScreen';
import LearningMaterialsScreen from './screens/dashboard/LearningMaterialsScreen';
import QuizScreen from './screens/dashboard/assessment-module/quiz/QuizScreen';
import CompatibilityScreen from './screens/dashboard/assessment-module/compatibility/CompatibilityScreen';
import PartPickerScreen from './screens/dashboard/assessment-module/part-picker/PartPickerScreen';
import FinalAssessmentScreen from './screens/dashboard/assessment-module/final-assessment/FinalAssessmentScreen';
import FinalAssessmentAssemblyScreen from './screens/dashboard/assessment-module/final-assessment/FinalAssessmentAssemblyScreen';
import CreateCompatibilityScreen from './screens/dashboard/assessment-module/compatibility/CreateCompatibilityScreen';
import AssessmentResultsScreen from './screens/dashboard/assessment-module/AssessmentResultsScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login" screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegistrationScreen} />
        <Stack.Screen name="Dashboard" component={DashboardScreen} />
        <Stack.Screen name="LearningMaterials" component={LearningMaterialsScreen} />
        <Stack.Screen name="Assessment" component={AssessmentScreen} />
        <Stack.Screen name="PCRecommendation" component={PCRecommendationScreen} />
        <Stack.Screen name="UserAccount" component={UserAccountScreen} />
        <Stack.Screen name="Contact" component={ContactScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="Notification" component={NotificationScreen} />
        <Stack.Screen name="QuizScreen" component={QuizScreen} />
        <Stack.Screen name="CompatibilityScreen" component={CompatibilityScreen} />
        <Stack.Screen name="PartPickerScreen" component={PartPickerScreen} />
        <Stack.Screen name="FinalAssessmentScreen" component={FinalAssessmentScreen} />
        <Stack.Screen name="FinalAssessmentAssemblyScreen" component={FinalAssessmentAssemblyScreen} />
        <Stack.Screen name="CreateCompatibilityScreen" component={CreateCompatibilityScreen} />
        <Stack.Screen name="AssessmentResultsScreen" component={AssessmentResultsScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F3F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
