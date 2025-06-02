import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, Dimensions } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';

const NAV_ITEMS = [
  { label: 'Dashboard', route: 'Dashboard', icon: '🏠' },
  { label: 'Learning materials', route: 'LearningMaterials', icon: '📖' },
  { label: 'Assessment', route: 'Assessment', icon: '📊' },
  { label: 'PC Recommendation', route: 'PCRecommendation', icon: '💻' },
];

const BOTTOM_ITEMS = [
  { label: 'User Account', route: 'UserAccount', icon: '👤' },
  { label: 'Help', route: 'Help', icon: '❓' },
  { label: 'Notification', route: 'Notification', icon: '🔔' },
];

export default function SidebarLayout({ activeTab, children }) {
  const navigation = useNavigation();
  const route = useRoute();
  const [active, setActive] = useState(activeTab || 'Dashboard');
  // Get user from navigation params
  const user = route.params?.user;

  const sidebarWidth = Dimensions.get('window').width > 600 ? 260 : 90;

  const handleNav = (item) => {
    setActive(item.label);
    navigation.navigate(item.route, { user });
  };

  const handleLogout = () => {
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <View style={styles.wrapper}>
      {/* Sidebar */}
      <View style={[styles.sidebar, { width: sidebarWidth }]}>
        {/* Logo and Title */}
        <View style={styles.logoRow}>
          <Image source={require('../../assets/cosmart_logo_white.png')} style={styles.logo} />
          {sidebarWidth > 120 && <Text style={styles.title}>CO-SMART</Text>}
        </View>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.userImagePlaceholder}>
            {user?.imageUrl ? (
              <Image source={{ uri: user.imageUrl }} style={styles.userImage} />
            ) : (
              <Text style={styles.userInitial}>{user?.username?.[0]?.toUpperCase() || '?'}</Text>
            )}
          </View>
          {sidebarWidth > 120 && user && (
            <>
              <Text style={styles.userName}>{user.username}</Text>
              <Text style={styles.userRole}>{user.userType ? `(${user.userType})` : ''}</Text>
            </>
          )}
        </View>
        {/* Navigation */}
        <View style={styles.navSection}>
          {NAV_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => handleNav(item)}
              style={({ pressed }) => [
                styles.navItem,
                active === item.label && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              {sidebarWidth > 120 && <Text style={styles.navLabel}>{item.label}</Text>}
            </Pressable>
          ))}
        </View>
        {/* Bottom Section */}
        <View style={styles.bottomSection}>
          {BOTTOM_ITEMS.map((item) => (
            <Pressable
              key={item.label}
              onPress={() => handleNav(item)}
              style={({ pressed }) => [
                styles.navItem,
                active === item.label && styles.navItemActive,
                pressed && styles.navItemPressed,
              ]}
            >
              <Text style={styles.navIcon}>{item.icon}</Text>
              {sidebarWidth > 120 && <Text style={styles.navLabel}>{item.label}</Text>}
            </Pressable>
          ))}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.navItem,
              pressed && styles.navItemPressed,
              { marginTop: 16, borderTopWidth: 1, borderTopColor: '#444' }
            ]}
          >
            <Text style={styles.navIcon}>🚪</Text>
            {sidebarWidth > 120 && <Text style={styles.navLabel}>Log Out</Text>}
          </Pressable>
        </View>
      </View>
      {/* Main Content */}
      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.contentInner}>
          {children}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#ededed',
  },
  sidebar: {
    backgroundColor: '#222',
    paddingTop: 0,
    paddingHorizontal: 0,
    justifyContent: 'flex-start',
    borderRightWidth: 1,
    borderRightColor: '#ccc',
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD600',
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  logo: {
    width: 32,
    height: 32,
    resizeMode: 'contain',
    marginRight: 8,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
    letterSpacing: 1,
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#444',
  },
  userImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#bbb',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  userImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  userInitial: {
    fontSize: 28,
    color: '#fff',
    fontWeight: 'bold',
  },
  userName: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  userRole: {
    color: '#ccc',
    fontSize: 12,
  },
  navSection: {
    marginTop: 16,
    flex: 1,
  },
  navItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    backgroundColor: 'transparent',
  },
  navItemActive: {
    backgroundColor: '#FFD600',
  },
  navItemPressed: {
    backgroundColor: '#ffe066',
  },
  navIcon: {
    fontSize: 20,
    marginRight: 12,
    color: '#fff',
  },
  navLabel: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  bottomSection: {
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingVertical: 8,
  },
  content: {
    flex: 1,
    backgroundColor: '#ededed',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    position: 'relative',
    overflow: 'hidden', // Add this to contain scrolling
    height: '100vh', // Add fixed height
  },
  contentInner: {
    flexGrow: 1,
    height: '100%', // Add this
    overflow: 'auto', // Add this
  },
});
