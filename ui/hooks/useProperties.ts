import { useQuery } from '@apollo/client';
import gql from 'graphql-tag';
import { useEffect } from 'react';

export const GET_PROPERTIES = gql`
  query GetProperties($first: Int!, $after: String) {
    getProperties(first: $first, after: $after) {
      totalCount
      edges {
        cursor
        node {
          id
          realtor_id
          address_id
          title
          speciality
          amenities
          price
          description
          status
          created_at
          updated_at
          images {
            id
            url
          }
          address {
            id
            street
            city
            country
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;


export const useProperties = (query?: any) => {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(GET_PROPERTIES, {
    variables: { first: 5 },
    notifyOnNetworkStatusChange: true,
  });

  const loadMore = () => {
    if (!data?.getProperties.pageInfo.hasNextPage || networkStatus === 3) return;

    fetchMore({
      variables: {
        first: 10,
        after: data.getProperties.pageInfo.endCursor,
      },
    });
  };

  // Debug: Log IDs to check for duplicates/missing
  useEffect(() => {
    if (data) {
      const ids = data.getProperties.edges.map((edge: any) => edge.node.id);
      const uniqueIds = new Set(ids);
      if (uniqueIds.size !== ids.length) {
        console.warn('Duplicate IDs detected:', ids.filter((id: any, index: number) => ids.indexOf(id) !== index));
      } else if (ids.some((id:any) => id == null)) {
        console.warn('Missing IDs detected in some items');
      }
      console.log('Property IDs:', ids);
    }
  }, [data]);

  return {
    data: data?.getProperties.edges.map((edge: any) => edge.node) || [],
    loading,
    error,
    loadMore,
    hasNextPage: data?.getProperties.pageInfo.hasNextPage || false,
    networkStatus,
  };
};

export const useSectionedProperties = (query?: any) => {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(GET_PROPERTIES, {
    variables: { first: 10, input: {query} },
    // variables: { first: 10, input: {maxPrice: query?.maxPrice, minPrice: query?.minPrice} },
    notifyOnNetworkStatusChange: true,
    fetchPolicy: 'cache-and-network',
  });

  console.log(loading, error, data)
  // Group experiences by city
  const groupByCity = (edges: any[]) => {
    const grouped = edges.reduce((acc, { node }) => {
      const city = node.address?.city || 'Unknown';
      if (!acc[city]) {
        acc[city] = { title: city, data: [] };
      }
      acc[city].data.push({
        id: node.id,
        name: node.title,
        price: node.price,
        location: node.address?.city,
        tag: node.category,
        image: node.images?.[0]?.url || 'https://via.placeholder.com/170x140.png?text=Experience',
        rating: node.reviews?.length ? (node.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / node.reviews.length).toFixed(2) : '0.00'
      });
      return acc;
    }, {} as { [key: string]: { title: string; data: any[] } });

    return Object.values(grouped).sort((a:any, b:any) => a.title.localeCompare(b.title));
  };

  const loadMore = () => {
    if (!data?.getProperties?.pageInfo?.hasNextPage || networkStatus === 3) return;

    fetchMore({
      variables: {
        first: 10,
        after: data.getProperties.pageInfo.endCursor,
      },
    });
  };

  // Debug: Log IDs to check for duplicates
  useEffect(() => {
    if (data) {
      console.log('Data in useExperiences hook:', data?.getProperties);
      const ids = data.getProperties?.edges?.map((edge: any) => edge.node.id) || [];
      const uniqueIds = new Set(ids);
      if (uniqueIds.size !== ids.length) {
        console.warn('Duplicate IDs detected:', ids.filter((id: any, index: number) => ids.indexOf(id) !== index));
      } else if (ids.some((id: any) => id == null)) {
        console.warn('Missing IDs detected in some items');
      }
      console.log('Experience IDs:', ids);
    }
  }, [data]);

  return {
    // sections: data?.getProperties?.edges ? data.getProperties.edges.map((edge: any) => edge.node) : [],
    sections: data?.getProperties?.edges ? groupByCity(data.getProperties.edges) : [],
    loading,
    error: error ? error.message : null,
    loadMore,
    hasNextPage: data?.searchExperiences?.pageInfo?.hasNextPage || false,
    networkStatus,
  };
};