import { useAuthStore } from '@/stores/authStore';
import { ApolloClient, HttpLink, InMemoryCache, defaultDataIdFromObject } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { from } from '@apollo/client/link/core';
import { onError } from '@apollo/client/link/error';
import { Observable } from "@apollo/client/utilities";
import * as SecureStore from 'expo-secure-store';
import { triggerTokenRefreshFailed } from './authUtils';
import { server_port } from './constants';

const errorLink = onError(({ graphQLErrors, operation, forward }) => {
  if (graphQLErrors) {
    for (const err of graphQLErrors) {
      if (err.message === "Unauthorized" || err.message === 'Authentication required' || err.message.includes("token")) {
        return new Observable(observer => {
          (async () => {
            try {
              const newAccessToken = await refreshAccessToken();

              if (!newAccessToken) {
                throw new Error("Failed to refresh");
              }

              // Set new token in context
              operation.setContext(({ headers = {} }) => ({
                headers: {
                  ...headers,
                  Authorization: `Bearer ${newAccessToken}`,
                },
              }));

              // Retry request
              const subscriber = forward(operation).subscribe({
                next: result => observer.next(result),
                error: error => observer.error(error),
                complete: () => observer.complete(),
              });

              return () => subscriber.unsubscribe();
            } catch (e) {
              observer.error(e);
            }
          })();
        });
      }
    }
  }
});



const authLink = setContext(async (_, { headers }) => {
  const token = await SecureStore.getItemAsync('accessToken');
  // const tokens = await SecureStore.getItemAsync('refreshToken');
  // console.log({tokens})
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : '',
    },
  };
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
        searchProperties: {
          keyArgs: ['input', ['query', 'minPrice', 'maxPrice', 'speciality', 'amenities', 'startDate', 'endDate', 'minRating']],
          merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming, { args, readField }) {
            console.log('Merge called:', { existingEdges: existing.edges.length, incomingEdges: incoming.edges.length, cursor: args?.after, data: incoming.edges.map((edge) => edge.node) });
            const mergedEdges = existing.edges ? [...existing.edges] : [];
            const cursor = args?.after; // Use the 'after' cursor from query variables
            let offset = cursor ? offsetFromCursor(mergedEdges, cursor, readField) : -1;

            if (offset < 0) offset = mergedEdges.length; // Append if cursor not found

            // Deduplicate incoming edges to avoid duplicates
            const incomingIds = new Set(mergedEdges.map((edge) => readField('id', edge.node)));
            const newEdges = incoming.edges.filter((edge) => !incomingIds.has(readField('id', edge.node)));
            console.log({newEdges})
            // Insert new edges at the correct offset
            for (let i = 0; i < newEdges.length; ++i) {
              mergedEdges[offset + i] = newEdges[i];
            }

            return {
              ...incoming,
              edges: mergedEdges,
              pageInfo: incoming.pageInfo,
              totalCount: incoming.totalCount,
            };
          },
        },
        searchRoomTypes: {
          keyArgs: ['input', ['query', 'minPrice', 'maxPrice', 'speciality', 'amenities', 'startDate', 'endDate', 'minRating']],
          merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming, { args, readField }) {
            console.log('Merge called:', { existingEdges: existing.edges.length, incomingEdges: incoming.edges.length, cursor: args?.after, data: incoming.edges.map((edge) => edge.node) });
            const mergedEdges = existing.edges ? [...existing.edges] : [];
            const cursor = args?.after; // Use the 'after' cursor from query variables
            let offset = cursor ? offsetFromCursor(mergedEdges, cursor, readField) : -1;

            if (offset < 0) offset = mergedEdges.length; // Append if cursor not found

            // Deduplicate incoming edges to avoid duplicates
            const incomingIds = new Set(mergedEdges.map((edge) => readField('id', edge.node)));
            const newEdges = incoming.edges.filter((edge) => !incomingIds.has(readField('id', edge.node)));
            console.log({newEdges})
            // Insert new edges at the correct offset
            for (let i = 0; i < newEdges.length; ++i) {
              mergedEdges[offset + i] = newEdges[i];
            }

            return {
              ...incoming,
              edges: mergedEdges,
              pageInfo: incoming.pageInfo,
              totalCount: incoming.totalCount,
            };
          },
        },
        getProperties: {
          keyArgs: false, // Cache based on all args (first, after)
          merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming, { args, readField }) {
            const mergedEdges = existing.edges ? [...existing.edges] : [];
            const cursor = args?.after;
            let offset = cursor ? offsetFromCursor(mergedEdges, cursor, readField) : -1;

            if (offset < 0) offset = mergedEdges.length;

            // Deduplicate incoming edges
            const incomingIds = new Set(mergedEdges.map((edge) => readField('id', edge.node)));
            const newEdges = incoming.edges.filter((edge) => !incomingIds.has(readField('id', edge.node)));

            for (let i = 0; i < newEdges.length; ++i) {
              mergedEdges[offset + i] = newEdges[i];
            }

            return {
              ...incoming,
              edges: mergedEdges,
              pageInfo: incoming.pageInfo,
              totalCount: incoming.totalCount,
            };
          },
        },
        // Remove the duplicate searchProperties policy
      },
    },
  },
});

// const cache = new InMemoryCache({
//   dataIdFromObject: (object) => defaultDataIdFromObject(object),
//   resultCaching: true,
//   typePolicies: {
//     Query: {
//       fields: {
//         searchExperiences: {
//           keyArgs: ['input', ['query', 'minPrice', 'maxPrice', 'category']],
//           merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming) {
//             const mergedEdges = [...(existing.edges || [])];
//             const incomingIds = new Set(incoming.edges.map((edge) => edge.node.id));
//             const uniqueEdges = mergedEdges
//               .filter((edge) => !incomingIds.has(edge.node.id))
//               .concat(incoming.edges);
//             return {
//               ...incoming,
//               edges: uniqueEdges,
//               pageInfo: incoming.pageInfo,
//               totalCount: incoming.totalCount,
//             };
//           },
//         },
//         getExperiencesPaginated: {
//           keyArgs: ['input', ['query', 'minPrice', 'maxPrice', 'category']],
//           merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming) {
//             const mergedEdges = [...(existing.edges || [])];
//             const incomingIds = new Set(incoming.edges.map((edge) => edge.node.id));
//             const uniqueEdges = mergedEdges
//               .filter((edge) => !incomingIds.has(edge.node.id))
//               .concat(incoming.edges);
//             return {
//               ...incoming,
//               edges: uniqueEdges,
//               pageInfo: incoming.pageInfo,
//               totalCount: incoming.totalCount,
//             };
//           },
//         },

//         searchProperties: {
//           keyArgs: ['input', ['query', 'minPrice', 'maxPrice', 'category']],
//           merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming) {
//             console.warn('incoming', incoming)
//             return {
//               ...incoming,
//               edges: [...(existing.edges || []), ...incoming.edges],
//               pageInfo: incoming.pageInfo,
//               totalCount: incoming.totalCount,
//             };
//           },
//         },
        

//         // getProperties: {
//         //   // keyArgs: ['input', ['query', 'minPrice', 'maxPrice', 'category']],
//         //   merge(existing = { edges: [], pageInfo: {}, totalCount: 0 }, incoming) {
//         //     const mergedEdges = [...(existing.edges || [])];
//         //     const incomingIds = new Set(incoming.edges.map((edge: any) => edge.node.id));
//         //     const uniqueEdges = mergedEdges
//         //       .filter((edge: any) => !incomingIds.has(edge.node.id))
//         //       .concat(incoming.edges);
//         //     return {
//         //       ...incoming,
//         //       edges: uniqueEdges,
//         //       pageInfo: incoming.pageInfo,
//         //       totalCount: incoming.totalCount,
//         //     };
//         //   },
//         // },

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
//       },
//     },
//     // ... other type policies
//   },
// });

function offsetFromCursor(items, cursor, readField) {
  for (let i = items.length - 1; i >= 0; --i) {
    const item = items[i];
    if (readField('id', item.node) === cursor) {
      return i + 1;
    }
  }
  return -1;
}

export const client = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
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
//   console.warn('sisoiqa')
//   if (cache.gc) {
//     cache.gc();
//   }
// }, 1000);

const refreshAccessToken = async () => {
  console.log({called: 'called'});
  const refreshToken = await SecureStore.getItemAsync('refreshToken');
  console.log({refreshToken});

  if (!refreshToken) {
    // If there's no refresh token, log out the user
    await triggerTokenRefreshFailed();
    throw new Error('No refresh token available');
  }

  try {
    const response = await fetch(server_port, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          mutation RefreshToken($refreshToken: String!) {
            refreshAccessToken(refreshToken: $refreshToken) {
              accessToken
              refreshToken
            }
          }
        `,
        variables: { refreshToken },
      }),
    });

    const { data } = await response.json();
    console.log({ data: data?.refreshAccessToken.accessToken });

    if (data?.refreshAccessToken) {
      const { accessToken, refreshToken, user } = data.refreshAccessToken;

      // Update the auth store with the new tokens
      await useAuthStore.getState().setAuth(
        accessToken,
        refreshToken,
        // { id: user.id, email: user.email, name: user.name },
        {},
        'guest'
      );

      return accessToken;
    } else {
      await triggerTokenRefreshFailed();
      throw new Error('Token refresh failed');
    }
  } catch (error) {
    console.error('Token refresh failed:', error);
    await triggerTokenRefreshFailed();
    throw new Error('Token refresh failed');
  }
};

