import { useAuthStore } from '@/stores/authStore'
import { Redirect } from 'expo-router'
import React from 'react'

const Index = () => {
  const mode = useAuthStore(state => state.mode)
  // return true ? <Redirect href={'/(host)/(tabs)/home/(toptabs)/Homes'} /> : <Redirect href={'/(guest)/(tabs)/home/(toptabs)/Homes'} />
  return mode === 'host' ? <Redirect href={'/(host)/(tabs)/home/(toptabs)/Homes'} /> : <Redirect href={'/(guest)/(tabs)/home/(toptabs)/Homes'} />
}

export default Index