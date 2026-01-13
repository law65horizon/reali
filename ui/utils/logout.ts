import { LOGOUT } from "@/graphql/mutations";
import { useAuthStore } from "@/stores/authStore";
import { useMutation } from "@apollo/client";
import { Alert } from "react-native";

export const logout = async () => {
  const refreshToken = useAuthStore.getState().refreshToken

  const [logout, {loading}] = useMutation(LOGOUT)
    
    // Call logout mutation if you want to invalidate refresh token on server
    if (refreshToken) {
      if (loading) return;
      try {
        console.log('logging out')
        const {data} = await logout({
        })

        Alert.alert(data.logout.message)
      } catch (error) {
        console.error('Server logout failed:', error);
      }
    }
}