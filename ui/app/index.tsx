import { useSession } from '@/context/ctx'
import { Redirect } from 'expo-router'
import React from 'react'

const Index = () => {
  const {session, isLoading} = useSession()
  // return true ? <Redirect href={'/(host)/(tabs)/home/(toptabs)/Homes'} /> : <Redirect href={'/(guest)/(tabs)/home/(toptabs)/Homes'} />
  return session?.mode === 'host' ? <Redirect href={'/(host)/(tabs)/home/(toptabs)/Homes'} /> : <Redirect href={'/(guest)/(tabs)/home/(toptabs)/Homes'} />
}

export default Index