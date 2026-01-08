import { GET_EXPERIENCES_PAGINATED } from '@/queries/experience';
import { useQuery } from '@apollo/client';
import { useEffect } from 'react';
import { GET_PROPERTIES } from './useProperties';

type DataType = 'experiences' | 'properties';

function returnQuery(type: DataType) {
//   if ()
  if (type === 'experiences') {
    return GET_EXPERIENCES_PAGINATED;
  } else {
    return GET_PROPERTIES;
  }
}

export const useGetData = (type: DataType,  query?: any) => {
  const { data, loading, error, fetchMore, networkStatus } = useQuery(returnQuery(type), {
    variables: { first: 10, input: {maxPrice: query?.maxPrice, minPrice: query?.minPrice} },
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
    data: data?.searchExperiences?.edges ? data.searchExperiences.edges.map((edge: any) => edge.node) : [],
    // sections: data?.searchExperiences?.edges ? groupByCity(data.searchExperiences.edges) : [],
    loading,
    error: error ? error.message : null,
    loadMore,
    hasNextPage: data?.searchExperiences?.pageInfo?.hasNextPage || false,
    networkStatus,
  };
};