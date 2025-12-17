import { Tabs } from 'expo-router';
import { FileText, User } from 'lucide-react-native';
import { theme } from '../../theme/theme';
import { Text, View, StyleSheet } from 'react-native';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerTransparent: true,
        header: () => (
          <View style={styles.headerContainer}>
            <View style={styles.headerContent}>
              <Text style={styles.appName}>ZingZui</Text>
            </View>
          </View>
        ),
        tabBarStyle: {
          backgroundColor: 'rgba(11,18,32,0.95)',
          borderTopColor: theme.palette.glassBorder,
        },
        tabBarActiveTintColor: theme.palette.primaryGradient[0],
        tabBarInactiveTintColor: theme.palette.textSecondary,
      }}
      initialRouteName="notes"
    >
      <Tabs.Screen
        name="notes"
        options={{
          title: 'Notes',
          tabBarIcon: ({ size, color }) => <FileText size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => <User size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    paddingTop: 0,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  appName: {
    fontFamily: 'Caveat-Bold',
    fontSize: 32,
    color: '#FF6B35',
  },
});
