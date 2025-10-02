import { GET_EXPERIENCES_PAGINATED } from '@/queries/experience';
import { GET_PROPERTIES } from '@/queries/properties';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';

type DataType = 'experiences' | 'properties';

function returnQuery(type: DataType) {
  if (type === 'experiences') {
    return GET_EXPERIENCES_PAGINATED;
  } else {
    return GET_PROPERTIES;
  }
}

export const useSectionedExperiences = (query?: any) => {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(GET_EXPERIENCES_PAGINATED, {
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
    if (!data?.getExperiencesPaginated?.pageInfo?.hasNextPage || networkStatus === 3) return;

    fetchMore({
      variables: {
        first: 10,
        after: data.getExperiencesPaginated.pageInfo.endCursor,
      },
    });
  };

  // Debug: Log IDs to check for duplicates
  useEffect(() => {
    if (data) {
      console.log('Data in useExperiences hook:', data?.searchExperiences);
      const ids = data.searchExperiences?.edges?.map((edge: any) => edge.node.id) || [];
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
    // sections: data?.searchExperiences?.edges ? data.searchExperiences.edges.map((edge: any) => edge.node) : [],
    sections: data?.searchExperiences?.edges ? groupByCity(data.searchExperiences.edges) : [],
    loading,
    error: error ? error.message : null,
    loadMore,
    hasNextPage: data?.searchExperiences?.pageInfo?.hasNextPage || false,
    networkStatus,
  };
};

interface ExperienceQueryInput {
  query?: string;
  minPrice?: number;
  maxPrice?: number;
  category?: string;
  type: DataType;
}

interface ExperienceNode {
  id: string;
  title: string;
  price: number;
  address?: { city: string };
  images?: { url: string }[];
  reviews?: { rating: number }[];
  category?: string;
}

interface QueryResponse {
  searchExperiences?: {
    edges: { node: ExperienceNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
    totalCount: number;
  };
  getProperties?: {
    edges: { node: ExperienceNode }[];
    pageInfo: { hasNextPage: boolean; endCursor: string };
    totalCount: number;
  };
}

export const useExperiences = (query: ExperienceQueryInput) => {
  const dataKey = query?.type === 'properties' ? 'getProperties' : 'searchExperiences';

  const { data, loading, error, fetchMore, networkStatus } = useQuery<QueryResponse>(
    returnQuery(query?.type),
    {
      variables: {
        first: 10,
        input: {
          query: query?.query,
          maxPrice: query?.maxPrice,
          minPrice: query?.minPrice,
          category: query?.category,
        },
      },
      notifyOnNetworkStatusChange: true,
      fetchPolicy: 'cache-and-network',
    }
  );

  const loadMore = () => {
    if (!data?.[dataKey]?.pageInfo?.hasNextPage || networkStatus === 3) return;

    fetchMore({
      variables: {
        first: 10,
        after: data[dataKey].pageInfo.endCursor,
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        if (!fetchMoreResult?.[dataKey]) return prev;

        return {
          ...prev,
          [dataKey]: {
            ...fetchMoreResult[dataKey],
            edges: [...prev[dataKey]!.edges, ...fetchMoreResult[dataKey].edges],
            pageInfo: fetchMoreResult[dataKey].pageInfo,
            totalCount: fetchMoreResult[dataKey].totalCount,
          },
        };
      },
    });
  };

  useEffect(() => {
    if (data) {
      const ids = data[dataKey]?.edges?.map((edge: any) => edge.node.id) || [];
      const uniqueIds = new Set(ids);
      if (uniqueIds.size !== ids.length) {
        console.warn('Duplicate IDs detected:', ids.filter((id: any, index: number) => ids.indexOf(id) !== index));
      } else if (ids.some((id: any) => id == null)) {
        console.warn('Missing IDs detected in some items');
      }
      console.log('Experience IDs:', ids);
    }
  }, [data, dataKey]);

  return {
    data: data?.[dataKey]?.edges ? data[dataKey].edges.map((edge: any) => edge.node) : [],
    loading,
    error: error ? error.message : null,
    loadMore,
    hasNextPage: data?.[dataKey]?.pageInfo?.hasNextPage || false,
    networkStatus,
  };
};


// export const useExperiences = (query?: any) => {
//   const { data, loading, error, fetchMore, networkStatus } = useQuery(returnQuery(query?.type), {
//     variables: { first: 10, input: {maxPrice: query?.maxPrice, minPrice: query?.minPrice} },
//     notifyOnNetworkStatusChange: true,
//     fetchPolicy: 'cache-and-network',
//   });

//   console.log(loading, error, data)
//   // Group experiences by city

//   const dataKey = query?.type === 'properties' ? 'getProperties' : 'searchExperiences';


//   const loadMore = () => {
//     if (!data?.[dataKey]?.pageInfo?.hasNextPage || networkStatus === 3) return;

//     fetchMore({
//       variables: {
//         first: 10,
//         after: data[dataKey].pageInfo.endCursor,
//       },
//     });
//   };

//   // Debug: Log IDs to check for duplicates
//   useEffect(() => {
//     if (data) {
//       console.log('Data in useExperiences hook:', data?.searchExperiences);
//       const ids = data.searchExperiences?.edges?.map((edge: any) => edge.node.id) || [];
//       const uniqueIds = new Set(ids);
//       if (uniqueIds.size !== ids.length) {
//         console.warn('Duplicate IDs detected:', ids.filter((id: any, index: number) => ids.indexOf(id) !== index));
//       } else if (ids.some((id: any) => id == null)) {
//         console.warn('Missing IDs detected in some items');
//       }
//       console.log('Experience IDs:', ids);
//     }
//   }, [data, dataKey]);

//   return {
//     data: data?.[dataKey]?.edges ? data[dataKey].edges.map((edge: any) => edge.node) : [],
//     // sections: data?.[dataKey]?.edges ? groupByCity(data.[dataKey].edges) : [],
//     loading,
//     error: error ? error.message : null,
//     loadMore,
//     hasNextPage: data?.[dataKey]?.pageInfo?.hasNextPage || false,
//     networkStatus,
//   };
// };