import { ApolloClient, HttpLink, InMemoryCache, defaultDataIdFromObject } from '@apollo/client';
import { from } from '@apollo/client/link/core';
import { onError } from '@apollo/client/link/error';
import { server_port } from './constants';

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) => {
      if (__DEV__) {
        console.log(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`);
      }
    });
  }
  if (networkError) {
    if (__DEV__) {
      console.log(`[Network error]: ${networkError}, URI: ${server_port}`);
    }
  }
});

const httpLink = new HttpLink({
  uri: server_port,
  fetchOptions: {
    timeout: 30000,
  },
});

const cache = new InMemoryCache({
  dataIdFromObject: (object) => defaultDataIdFromObject(object),
  resultCaching: true,
  typePolicies: {
    Query: {
      fields: {
        searchExperiences: {
          keyArgs: ['input', ['query', 'minPrice', 'maxPrice', 'category']],
          merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming) {
            const mergedEdges = [...(existing.edges || [])];
            const incomingIds = new Set(incoming.edges.map((edge: any) => edge.node.id));
            const uniqueEdges = mergedEdges
              .filter((edge: any) => !incomingIds.has(edge.node.id))
              .concat(incoming.edges);
            return {
              ...incoming,
              edges: uniqueEdges,
              pageInfo: incoming.pageInfo,
              totalCount: incoming.totalCount,
            };
          },
        },
        getExperiencesPaginated: {
          keyArgs: ['input', ['query', 'minPrice', 'maxPrice', 'category']],
          merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming) {
            const mergedEdges = [...(existing.edges || [])];
            const incomingIds = new Set(incoming.edges.map((edge: any) => edge.node.id));
            const uniqueEdges = mergedEdges
              .filter((edge: any) => !incomingIds.has(edge.node.id))
              .concat(incoming.edges);
            return {
              ...incoming,
              edges: uniqueEdges,
              pageInfo: incoming.pageInfo,
              totalCount: incoming.totalCount,
            };
          },
        },

        // getProperties: {
        //   // keyArgs: ['input', ['query', 'minPrice', 'maxPrice', 'category']],
        //   merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming) {
        //     const mergedEdges = [...(existing.edges || [])];
        //     const incomingIds = new Set(incoming.edges.map((edge: any) => edge.node.id));
        //     const uniqueEdges = mergedEdges
        //       .filter((edge: any) => !incomingIds.has(edge.node.id))
        //       .concat(incoming.edges);
        //     return {
        //       ...incoming,
        //       edges: uniqueEdges,
        //       pageInfo: incoming.pageInfo,
        //       totalCount: incoming.totalCount,
        //     };
        //   },
        // },

        getProperties: {
          keyArgs: false, // Cache based on all args (first, after)
          merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming) {
            return {
              ...incoming,
              edges: [...(existing.edges || []), ...incoming.edges],
              pageInfo: incoming.pageInfo,
              totalCount: incoming.totalCount,
            };
          },
        },
      },
    },
    // ... other type policies
  },
});

// const cache = new InMemoryCache({
//   dataIdFromObject: (object) => {
//     return defaultDataIdFromObject(object);
//   },
//   resultCaching: true,
//   typePolicies: {
//     Query: {
//       fields: {
//         getProperties: {
//           keyArgs: false, // Cache based on all args (first, after)
//           merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming) {
//             return {
//               ...incoming,
//               edges: [...(existing.edges || []), ...incoming.edges],
//               pageInfo: incoming.pageInfo,
//               totalCount: incoming.totalCount,
//             };
//           },
//         },
//         getExperiencesPaginated: {
//           keyArgs: false,
//           merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming) {
//             return {
//               ...incoming,
//               edges: [...(existing.edges || []), ...incoming.edges],
//               pageInfo: incoming.pageInfo,
//               totalCount: incoming.totalCount,
//             };
//           },
//         },
//         searchExperiences: {
//           keyArgs: false, // Consider specifying keyArgs for better cache granularity
//           merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming) {
//             // Deduplicate edges based on node.id
//             const mergedEdges = [...(existing.edges || [])];
//             const incomingIds = new Set(incoming.edges.map((edge: any) => edge.node.id));
//             const uniqueEdges = mergedEdges.filter(
//               (edge: any) => !incomingIds.has(edge.node.id)
//             ).concat(incoming.edges);
            
//             return {
//               ...incoming,
//               edges: uniqueEdges,
//               pageInfo: incoming.pageInfo,
//               totalCount: incoming.totalCount,
//             };
//           },
//         },
//       },
//     },
//     Property: {
//       fields: {
//         images: {
//           merge: false,
//         },
//       },
//     },
//     Experience: {
//       fields: {
//         images: { merge: false },
//         reviews: { merge: false },
//       },
//     },
//     Image: {
//       fields: {
//         url: {
//           merge: false,
//         },
//       },
//     },
//     ExperienceImage: {
//       fields: { url: { merge: false } },
//     },
//   },
// });

const client = new ApolloClient({
  link: from([errorLink, httpLink]),
  cache,
  defaultOptions: {
    watchQuery: {
      fetchPolicy: 'cache-and-network', // Use cache-and-network for real-time updates
      errorPolicy: 'all',
      notifyOnNetworkStatusChange: true, // Needed for loading states in infinite scroll
    },
    query: {
      fetchPolicy: 'cache-first',
      errorPolicy: 'all',
      // context: {
      //   timeout: 30000,
      // },
    },
    mutate: {
      errorPolicy: 'all',
      fetchPolicy: 'no-cache',
    },
  },
  assumeImmutableResults: true,
  connectToDevTools: __DEV__,
});

// setInterval(() => {
//   if (cache.gc) {
//     cache.gc();
//   }
// }, 60000);

export default client;