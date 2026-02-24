import { useSearchStore } from "@/stores"
import { useAuthStore } from "@/stores/authStore"
import { gql, useQuery } from "@apollo/client"

const GET_RECENTS = gql`
query SearchRecents($userId: ID!) {
  searchRecents(userId: $userId) {
    userId
    city
    latitude
    longitude
    postal_code
    street
    tag
  }
}
`

export const useGetRecents = () => {
  const user = useAuthStore((state) => state.user)
  console.log({user})
  const recentSearches = useSearchStore((state) => state.recentSearches)
  if (recentSearches.length > 0) return {data: recentSearches}
  console.log('dosiosi')
  const {data, loading, error, refetch, networkStatus } = useQuery(GET_RECENTS, {
    variables: {userId: 3},
    notifyOnNetworkStatusChange: true
  })
  
  return {data: data?.searchRecents, loading, error, networkStatus, refetch}
}