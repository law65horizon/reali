import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Line } from '@/components/ui/Line';
import { useSession } from '@/context/ctx';
import { signOut } from '@/lib/appwrite';
import { useTheme } from '@/theme/theme';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Briefcase, FileText, Gift, CircleHelp as HelpCircle, Chrome as HomeIcon, Lock, LogOut, Settings, Share, User, UserPlus, Users } from 'lucide-react-native';
import React, { useState } from 'react';
import { Dimensions, ScrollView, StatusBar, StyleSheet, TouchableOpacity, View } from 'react-native';


export default function ProfileTab() {
  const [accountExpanded, setAccountExpanded] = useState(true);
  const {theme} = useTheme()
  const {session, isLoading, signOut: removeSession, updateSession} = useSession()
  const {height, width} = Dimensions.get('screen')

  const menuItems: any = [
    { icon: 'settings-outline', text: 'Account settings' },
    { icon: 'help-circle-outline', text: 'Support' },
    { icon: 'document-text-outline', text: 'Legal & Privacy' },
  ];

  const logout = async () => {
    console.log('working')
    try {
      await signOut();
      removeSession()
    } catch (error) {
      console.error(error)
    }

    // router.replace("/sign-in");
  };

  const switchMode = (mode:string) => {
    if(session) {
      updateSession({...session, mode})
    }
    // updateSession({...session, mode: 'guest'})
    // router.replace("/sign-in");
  };

  if(!session && !isLoading) {
    return(
      <ThemedView plain secondary style={[styles.container, {paddingVertical: 30, height}]}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.mainContent}>
        <ThemedText style={styles.headerText}>Profile</ThemedText>
        <ThemedText secondary style={styles.subheaderText}>Log in and start planning your next trip.</ThemedText>
        <TouchableOpacity onPress={() => (router.push('/(guest)/(auth)/auth_page'))} style={[styles.button, {backgroundColor: theme.colors.text}]}>
          <ThemedText style={[styles.buttonText, {color: theme.colors.background}]}>Log in or sign up</ThemedText>
        </TouchableOpacity>
        <View style={styles.menuContainer}>
          {menuItems.map((item:any, index:any) => (
            <React.Fragment key={index}>
              <TouchableOpacity style={styles.menuItemxs}>
                <Ionicons name={item.icon} size={24} color={theme.colors.text} />
                <ThemedText style={styles.menuText}>{item.text}</ThemedText>
                <Ionicons name="chevron-forward" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              {index < menuItems.length - 1 && <Line style={{borderBottomWidth:1, marginVertical: 8}} />}
              {/* {index < menuItems.length - 1 && <Line style={styles.separator} />} */}
            </React.Fragment>
          ))}
        </View>
      </View>
    </ThemedView>
    )
  }

  return (
    <ThemedView plain secondary>
      <View style={{position:'absolute', bottom: 90, left: 0, zIndex:1, width, justifyContent: 'center', alignItems: 'center',}}>
        <TouchableOpacity onPress={() => session?.mode === 'host' ? switchMode('guest'): switchMode('host') } style={[styles.hostingButton, {backgroundColor: theme.colors.accent}]}>
              <HomeIcon size={20} color={theme.colors.background} />
              <ThemedText style={[styles.hostingButtonText, {color: theme.mode === 'light'? 'white': 'black'}]}>
               Switch to {session?.mode === 'guest' ? 'Host': 'Guest' }
              </ThemedText>
        </TouchableOpacity>
      </View>
      {/* Header */}
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <ThemedText style={styles.headerTitle}>Profile</ThemedText>
      </View>


      <View style={{flexDirection:'row', alignItems: 'center', paddingBottom: 10}}>
        <View style={{flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <MaterialCommunityIcons name='face-woman-profile' color={theme.colors.primary} size={63} />
            <View style={{flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <ThemedText> {'Rissa May'} </ThemedText>
              {/* <Entypo name='pen' size={24} color={theme.colors.text} /> */}
              <MaterialCommunityIcons name='pen' size={24} color={theme.colors.text} />
            </View>
        </View>
      </View>

      {/* Profile Card */}
      {/* <View style={[styles.profileCard, {backgroundColor: theme.colors.background}]}>
        <View style={[styles.avatar, {backgroundColor: theme.colors.primary}]}>
          <ThemedText style={[styles.avatarText, ]}>M</ThemedText>
        </View>
        <ThemedText style={styles.name}>Michael</ThemedText>
        <ThemedText secondary style={styles.status}>Guest</ThemedText>
      </View> */}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.profileCard, {width: '48%', backgroundColor: theme.colors.primary}]}>
          <View style={[{flexDirection: 'column', width:'100%', alignItems: 'center', gap:2}]}>
            <Briefcase size={70} style={{marginTop: 10}} color={theme.colors.background} />
            <ThemedText type='defaultSemiBold' style={[styles.buttonText, {color:theme.colors.background}]}>Past trips</ThemedText>
            <View style={[styles.badge, {right: -8, backgroundColor: theme.colors.accent, paddingHorizontal: 10}]}>
              <ThemedText style={styles.badgeText}>NEW</ThemedText>
            </View>
          </View>
        </TouchableOpacity>
        
        <TouchableOpacity style={[styles.profileCard, {width: '48%', backgroundColor: theme.colors.primary}]}>
          <View style={[{flexDirection: 'column', width: '100%', alignItems: 'center', gap:2}]}>
            <View style={[styles.badge, {right: -8, backgroundColor: theme.colors.accent, paddingHorizontal: 10}]}>
              <ThemedText style={styles.badgeText}>NEW</ThemedText>
            </View>
            <Users size={70} style={{marginTop: 10}} color={theme.colors.background} />
            <ThemedText type='defaultSemiBold' style={[styles.buttonText, {color:theme.colors.background}]}>Connections</ThemedText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Promotional Banner */}
      {/* <View style={[styles.banner, {backgroundColor: theme.colors.primary}]}>
        <HomeIcon size={24} color={theme.colors.text} />
        <View style={styles.bannerContent}>
          <ThemedText style={styles.bannerTitle}>Become a host</ThemedText>
          <ThemedText secondary style={styles.bannerSubtitle}>It's easy to start hosting and earn extra income.</ThemedText>
        </View>
      </View> */}

      {/* Account Section */}
      <View style={styles.section}>

          <View style={{gap:15}}>
            <TouchableOpacity style={styles.menuItem}>
              <Settings size={24} color={theme.colors.text} />
              <ThemedText>Account settings</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <HelpCircle size={24} color={theme.colors.text} />
              <ThemedText>Get help</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <User size={24} color={theme.colors.text} />
              <ThemedText>View profile</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Lock size={24} color={theme.colors.text} />
              <ThemedText>Privacy</ThemedText>
            </TouchableOpacity>

            <Line style={{borderBottomWidth: 0.3}} />
            {/* <TouchableOpacity onPress={() => [logout]} style={styles.menuItem}> */}
            <TouchableOpacity onPress={() => logout()} style={styles.menuItem}>
              <LogOut size={24} color={theme.colors.text} />
              <ThemedText>Log out</ThemedText>
            </TouchableOpacity>
            <TouchableOpacity style={styles.menuItem}>
              <Share size={24} color={theme.colors.text} />
              <ThemedText>Refer a host</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <UserPlus size={24} color={theme.colors.text} />
              <ThemedText>Find a co-host</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <Gift size={24} color={theme.colors.text} />
              <ThemedText>Gift cards</ThemedText>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.menuItem}>
              <FileText size={24} color={theme.colors.text} />
              <ThemedText>Legal</ThemedText>
            </TouchableOpacity>
            
            {/* <TouchableOpacity onPress={() => logout} style={styles.menuItem}>
              <LogOut size={24} color={theme.colors.text} />
              <ThemedText>Log out</ThemedText>
            </TouchableOpacity> */}

            
          </View>
      </View>

      {/* Bottom spacing for tab bar */}
      {/* Switch to hosting button */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
   </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    // flex: 1,
    paddingHorizontal: 20,
    marginBottom:100,
  },
  header: {
    paddingTop: 60,
    paddingBottom: 16,
    
    // alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    // color: 'black',
  },
  profileCard: {
    // marginHorizontal: 16,
    marginBottom: 16,
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    // backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    // color: 'black',
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
  },
  buttonContainer: {
    flexDirection: 'row',
    // marginHorizontal: 16,
    marginBottom: 16,
    gap: 16,
  },
  actionButton: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: '#1E90FF',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    // color: 'black',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#1E90FF',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
    // marginBottom: 
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  banner: {
    backgroundColor: '#r',
    // marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bannerContent: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    // color: 'black',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    // color: '#757575',
    lineHeight: 20,
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    // color: 'black',
  },
  sectionContent: {
    paddingHorizontal: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    paddingHorizontal: 8,
  },
  hostingButton: {
    // backgroundColor: 'black',
    width:  250,
    height: 48,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginTop: 16,
  },
  hostingButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bottomSpacing: {
    height: 20,
  },
  mainContent: {
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  headerText: {
    fontSize: 24,
    fontWeight: '700',
  },
  subheaderText: {
    fontSize: 16,
    fontWeight: '400',
    marginTop: 8,
  },
  button: {
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
    width: '100%',
  },
  menuContainer: {
    marginTop: 32,
  },
  menuItemxs: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuText: {
    flex: 1,
    marginLeft: 16,
    fontSize: 16,
  },
  navItem: {
    alignItems: 'center',
  },
  navText: {
    marginTop: 4,
    fontSize: 12,
  },
});