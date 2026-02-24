// hooks/usesearchRoomTypes.ts
import { useQuery } from '@apollo/client';
import { useCallback, useMemo } from 'react';
import { GET_ROOM_TYPE, SearchRoomTypes } from '../graphql/queries';

interface SearchVariables {
  propertyType?: string[]
  beds?: number;
  // bathrooms?: number;
  minPrice?: number;
  maxPrice?: number;
  minsize?: number;
  sale_status: string;
  maxSize?: number;
  amenities?: string[];
  address?: string;
  checkIn?: string;
  checkOut?: string;
  radiusSh?: {
    latitude: number,
    longitude: number;
    radius: number
  }
}

interface SearchRoomTypesProps {
  pageSize: number;
  skip: boolean
  variables?: SearchVariables
  query?: any
}

export const usesearchRoomTypes = ({
  pageSize = 20,
  skip = false,
  variables,
  query
}: SearchRoomTypesProps) => {
  console.log({hook: variables})
  const queryIdentifier = Object.keys(query)[0]
  const value = Object.values(query)[0]
  console.log({queryIdentifier, value, sale: query?.sale_status})
  const { data, loading, error, fetchMore: apolloFetchMore, refetch, networkStatus } = useQuery(SearchRoomTypes, {
    variables: {
      input: {first: pageSize, query:queryIdentifier, value, ...variables,},
      // input: {first: pageSize, query:queryIdentifier, value, sale_status: query?.sale_status??variables?.sale_status, ...variables,},
    },
    skip,
    notifyOnNetworkStatusChange: true,
  });

  // Extract properties from edges
  const properties = useMemo(() => {
    console.log('so',data?.searchRoomTypes.edges.map((edge:any) => edge.node).length)
    return data?.searchRoomTypes.edges.map((edge:any) => edge.node) || [];
  }, [data]);

  // Check if there are more items to load
  const hasMore = data?.searchRoomTypes.pageInfo.hasNextPage || false;

  // Total count of properties
  const totalCount = data?.searchRoomTypes.totalCount || 0;

  // Fetch more function for infinite scrolling
  const fetchMore = useCallback(async () => {
    if (!hasMore || loading) return;

    const endCursor = data?.searchRoomTypes.pageInfo.endCursor;
    console.log({endCursor})

    if (!endCursor) return;

    try {
      await apolloFetchMore({
        variables: {
          input: { first: pageSize, after: endCursor, query: queryIdentifier, value },
        }
      });
    } catch (err) {
      // console.error('Error fetching more properties:', err);
    }
  }, [hasMore, loading, data, apolloFetchMore]);

  // Refetch function
  const refetchProperties = useCallback(async () => {
    try {
      await refetch();
    } catch (err) {
      // console.error('Error refetching properties:', err);
    }
  }, [refetch]);

  console.log(properties.length)

  return {
    properties,
    loading,
    error,
    hasMore,
    totalCount,
    fetchMore,
    refetch: refetchProperties,
    networkStatus,
    isRefetching: networkStatus == 4
  };
};

export const useGetProperty = (roomTypeId: number) => {
  const {data, loading, error, refetch, networkStatus } = useQuery(GET_ROOM_TYPE, {
    variables: {id: roomTypeId},
    notifyOnNetworkStatusChange: true
  })

  return {data: data?.getRoomType, loading, error, networkStatus, refetch}
}
