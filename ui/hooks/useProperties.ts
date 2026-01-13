// hooks/useProperties.ts
import { GET_PROPERTIES } from '@/graphql/queries';
import { useSearchStore } from '@/stores';
import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

export interface Property {
  id: string;
  realtor_id: string;
  address_id: string;
  title: string;
  speciality?: string;
  amenities?: string[];
  price: number;
  description?: string;
  status: 'ACTIVE' | 'PENDING' | 'SOLD';
  created_at: string;
  baths: any,
  bedrooms: any, 
  beds: any,
  type: any,
  category: any
  updated_at: string;
  images: Array<{
    id: string;
    url: string;
  }>;
  address: {
    id: string;
    street: string;
    city: string;
    country: string;
  };
}

interface PropertiesResponse {
  searchProperties: {
    totalCount: number;
    edges: Array<{
      cursor: string;
      node: Property;
    }>;
    pageInfo: {
      hasNextPage: boolean;
      endCursor: string;
    };
  };
}

const ITEMS_PER_PAGE = 5;

export function useProperties() {
  const { query, filters } = useSearchStore();

  const { data, loading, error, fetchMore, refetch, networkStatus } = useQuery<PropertiesResponse>(
    GET_PROPERTIES,
    {
      variables: {
        input: {query: null},
        first: ITEMS_PER_PAGE,
        after: null,
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  // Extract properties from edges
  const properties = useMemo(() => {
    return data?.searchProperties?.edges?.map((edge) => edge.node) || [];
  }, [data]);

  // Filter properties based on search query and filters
  const filteredProperties = useMemo(() => {
    let result = properties;

    // Text search filter
    if (query?.trim()) {
      const normalized = query.toLowerCase().trim();
      result = result.filter((p) => {
        const matchesTitle = p.title?.toLowerCase().includes(normalized);
        const matchesCity = p.address?.city?.toLowerCase().includes(normalized);
        const matchesCountry = p.address?.country?.toLowerCase().includes(normalized);
        const matchesStreet = p.address?.street?.toLowerCase().includes(normalized);
        return matchesTitle || matchesCity || matchesCountry || matchesStreet;
      });
    }

    // Segment filter (for-sale, for-rent, sold)
    if (filters.segment) {
      result = result.filter((p) => {
        const status = p.status?.toLowerCase();
        if (filters.segment === 'sold') return status === 'sold';
        if (filters.segment === 'for-sale') return status !== 'sold';
        if (filters.segment === 'for-rent') return status === 'active' || status === 'pending';
        return true;
      });
    }

    // Price range filter
    if (filters.priceRange) {
      result = result.filter(
        (p) => p.price >= filters.priceRange.min && p.price <= filters.priceRange.max
      );
    }

    // Bedrooms filter
    if (filters.bedrooms !== 'any') {
      result = result.filter((p) => {
        const beds = p.beds || ((p.price % 3) + 2); // fallback logic from your code
        return beds >= filters.bedrooms;
      });
    }

    // Bathrooms filter
    if (filters.bathrooms !== 'any') {
      result = result.filter((p) => {
        const baths = p.baths || ((p.price % 2) + 1);
        return baths >= filters.bathrooms;
      });
    }

    // Property type filter
    if (filters.propertyTypes.length > 0) {
      result = result.filter((p) => {
        const type = (p.category || p.type || 'home').toLowerCase();
        return filters.propertyTypes.some((t) => t.toLowerCase() === type);
      });
    }

    // Amenities filter
    if (filters.amenities.length > 0) {
      result = result.filter((p) => {
        const propertyAmenities = (p.amenities || []).map((a) => a.toLowerCase());
        return filters.amenities.every((amenity) =>
          propertyAmenities.includes(amenity.toLowerCase())
        );
      });
    }

    return result;
  }, [properties, query, filters]);

  // Load more function for infinite scroll
  const loadMore = async () => {
    if (!data?.searchProperties?.pageInfo?.hasNextPage || loading) return;

    try {
      await fetchMore({
        variables: {
          first: 5,
          after: data.searchProperties.pageInfo.endCursor,
        },
        // updateQuery: (prev, { fetchMoreResult }) => {
        //   if (!fetchMoreResult) return prev;

        //   return {
        //     searchProperties: {
        //       ...fetchMoreResult.searchProperties,
        //       edges: [
        //         ...prev.searchProperties.edges,
        //         ...fetchMoreResult.searchProperties.edges,
        //       ],
        //     },
        //   };
        // },
      });
    } catch (err) {
      console.error('Error loading more properties:', err);
    }
  };

  const hasNextPage = data?.searchProperties?.pageInfo?.hasNextPage || false;
  const totalCount = data?.searchProperties?.totalCount || 0;

  return {
    data: data?.searchProperties?.edges?.map((edge) => edge.node) || [],
    // data: data?.searchProperties?.edges?.map((edge) => edge.node) || [],
    loading,
    error,
    loadMore,
    hasNextPage,
    refetch,
    totalCount,
    isRefetching: networkStatus === 4,
  };
}
