// screens/ChatScreen.tsx (IMPROVED VERSION)
import { ThemedText } from '@/components/ThemedText';
import {
  CONVERSATION_QUERY,
  MARK_MESSAGES_AS_READ,
  MESSAGE_ADDED_SUBSCRIPTION,
  MESSAGE_READ_SUBSCRIPTION,
  SEND_MESSAGE_MUTATION
} from '@/graphql/queries';
import { client } from '@/lib/apolloClient';
import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/theme/theme';
import { useMutation, useQuery } from '@apollo/client';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

interface Message {
  id: string;
  content: string;
  created_at: string;
  read_at?: string;
  sender: {
    id: string;
    name: string;
  };
}

interface chatParams {
  conversationId?: string;
  recipientId?: string;
  bookingId?: string;
  propertyId?: string;
}

const ChatScreen = () => {
  const params = useLocalSearchParams();
  const navigation = useNavigation();
  const parsedParams: chatParams = JSON.parse(params.chat as string);
  const conversationId = parsedParams?.conversationId;
  const { theme } = useTheme();
  const [messageText, setMessageText] = useState('');
  const flatListRef = useRef<FlatList>(null);
  const user = useAuthStore().user;
  const currentUserId = user.id;
  const [isAtBottom, setIsAtBottom] = useState(true);

  // Fetch messages
  // const {  data: messagesData, loading, refetch } = useQuery(MESSAGES_QUERY, {
  //   variables: { conversationId, limit: 50 },
  //   fetchPolicy: 'cache-and-network',
  //   skip: !conversationId,
  // });

  // Fetch conversation details
  const { data: convData, loading, error, subscribeToMore, refetch } = useQuery(CONVERSATION_QUERY, {
    variables: { conversationId, recipient: parsedParams.recipientId, limit: 50 },
    skip: !conversationId && !parsedParams.recipientId,
  });
  console.log(conversationId)

  // Send message mutation
  const [sendMessage, { loading: sending }] = useMutation(SEND_MESSAGE_MUTATION, {
    optimisticResponse: {
      sendMessage: {
        __typename: 'Message',
        id: `temp-${Date.now()}`,
        content: messageText,
        created_at: new Date().toISOString(),
        read_at: null,
        message_type: 'text',
        sender: {
          __typename: 'User',
          id: currentUserId,
          name: user.name || 'You',
        },
      }
    },
    update: (cache, { data }) => {
      if (!data?.sendMessage) return;

      const existingData: any = cache.readQuery({
        query: CONVERSATION_QUERY,
        variables: { conversationId, recipient: parsedParams.recipientId, limit: 50 },
      });

      if (existingData?.conversation) {
        // Remove temp message and add real one
        // const filteredMessages = existingData.messages.filter(
        //   (m: Message) => !m.id.startsWith('temp-')
        // );

        console.log(existingData.conversation)

        // cache.writeQuery({
        //   query: CONVERSATION_QUERY,
        //   variables: { conversationId, recipient: parsedParams.recipientId, limit: 50 },
        //   data: {
        //     ...existingData,
        //     conversation: {
        //       ...existingData.conversation,
        //       messages: [...existingData.conversation.messages.filter((m:any) => !m.id.startsWith('temp-')), data.sendMessage]
        //     }
        //   },
        // });

        const newMessaage = data.sendMessage

        console.log({newMessaage})

        cache.modify({
          id: cache.identify({__typename: 'Conversation', id: conversationId}),
          fields: {
            lastMessage() {
              return newMessaage;
            },

            messages(existingMessages = [], {toReference}) {
              const newMessageRef = toReference(newMessaage)

              return [...existingMessages, newMessageRef]
            },

            unreadCount(existingCount) {
              return newMessaage.sender.id !== currentUserId? existingCount + 1: existingCount
            },

            last_message_at() {
              return newMessaage.created_at
            }
          }
        })

        cache.modify({
          fields: {
            conversations(existingData, {toReference, readField}) {
              const edges = existingData.edges || []
              const index = edges.findIndex(
                (edge:any) => readField('id', edge.node) === conversationId
              )

              let targetEdge;

              if (index > -1) {
                targetEdge = edges[index]
              } else {
                targetEdge = {
                  __typename: 'ConversationEdge',
                  node: toReference({__typename: 'Conversation', id: conversationId}),
                  cursor: Date.now().toString(),
                }
              }

              const filteredEdges = edges.filter(
                (edge:any) => readField('id', edge.node) !== conversationId
              )

              return {
                ...existingData,
                edges: [targetEdge, ...filteredEdges]
              }
            }
          }
        })
      }
    },
    onCompleted: () => {
      setMessageText('');
      scrollToBottom();
    },
  });

  useEffect(() => {
    if (convData?.conversation?.unreadCount>0) {
      markAsRead({variables: {conversationId}})
    }
  }, [convData])
  // Mark as read mutation
  const [markAsRead] = useMutation(MARK_MESSAGES_AS_READ, {
    update: (cache, { data }, { variables }) => {
      if (!data?.markMessagesAsRead) return;

      const existingData: any = cache.readQuery({
        query: CONVERSATION_QUERY,
        variables: { conversationId: variables?.conversationId, limit: 50 },
      });

      if (existingData?.conversation.messages) {
        const updatedMessages = existingData.conversation.messages.map((msg: Message) => {
          if (msg.sender.id !== currentUserId && !msg.read_at) {
            return { ...msg, read_at: new Date().toISOString() };
          }
          return msg; 
        });

        cache.writeQuery({
          query: CONVERSATION_QUERY,
          variables: { conversationId: variables?.conversationId, recipient: variables?.recipient, limit: 50 },
          data: { 
            ...existingData,
            conversation: {
              ...existingData.conversation,
              messages: updatedMessages
            }
          },
        });

        cache.modify({
          id: cache.identify({__typename: 'Conversation', id: conversationId}),
          fields: {
            messages() {return updatedMessages},
            unreadCount() {return 0}
          }
        })
      }
    },
  });

  // Subscribe to new messages
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToMore({
      document: MESSAGE_ADDED_SUBSCRIPTION,
      variables: { conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data?.messageAdded) return prev;

        const newMessage = subscriptionData.data.messageAdded;

        console.log({prev})
        // Skip if this is our own message (already added optimistically)
        if (newMessage.sender.id === currentUserId) {
          return prev;
        }

        // Check for duplicates
        if (prev.conversation.messages.some((m: Message) => m.id === newMessage.id)) {
          return prev;
        }

        // Auto-mark as read if we're at bottom
        // if (isAtBottom) {
          setTimeout(() => {
            markAsRead({ variables: { conversationId } });
          }, 500);

          client.cache.modify({
            id: client.cache.identify({ __typename: 'Conversation', id: conversationId }),
            fields: {
              lastMessage() { return newMessage; },
              last_message_at() { return newMessage.created_at; },
              unreadCount(existing) { return existing + 1; },
              messages() {return [...prev.conversation.messages, {...newMessage, read_at: Date.now()}]}
            }
          });
        // }

        client.cache.modify({
          fields: {
            conversations(existingData, {toReference, readField}) {
              const edges = existingData.edges || []
              const index = edges.findIndex(
                (edge:any) => readField('id', edge.node) === conversationId
              )

              let targetEdge;

              if (index > -1) {
                targetEdge = edges[index]
              } else {
                targetEdge = {
                  __typename: 'ConversationEdge',
                  node: toReference({__typename: 'Conversation', id: conversationId}),
                  cursor: Date.now().toString(),
                }
              }

              const filteredEdges = edges.filter(
                (edge:any) => readField('id', edge.node) !== conversationId
              )

              return {
                ...existingData,
                edges: [targetEdge, ...filteredEdges]
              }
            }
          }
        })
        

        // return {
        //   ...prev,
        //   conversation: {
        //     ...prev.conversation,
        //     messages: [...prev.conversation.messages, newMessage],
        //     last_message_at: newMessage.created_at,
        //     lastMessage: newMessage
        //   }
        // };
      },
    });

    return () => unsubscribe();
  }, [conversationId, subscribeToMore, currentUserId]);

  // Subscribe to read receipts
  useEffect(() => {
    if (!conversationId) return;

    const unsubscribe = subscribeToMore({
      document: MESSAGE_READ_SUBSCRIPTION,
      variables: { conversationId },
      updateQuery: (prev, { subscriptionData }) => {
        if (!subscriptionData.data?.messageRead) return prev;
        console.log('read receipts')
        const readMessage = subscriptionData.data.messageRead;

        return {
          ...prev,
          conversation: {
            ...prev.conversation,
            messages: prev.conversation.messages.map((msg: Message) =>
            msg.id === readMessage.id
              ? { ...msg, read_at: readMessage.read_at }
              : msg
          ),
          }
          
        };
      },
    });

    return () => unsubscribe();
  }, [conversationId, subscribeToMore]);

  // Mark messages as read when focused
  // useEffect(() => {
  //   if (conversationId && isAtBottom) {
  //     console.log('marked as read')
  //     markAsRead({ variables: { conversationId } });
  //   }
  // }, [conversationId, isAtBottom]);

  // Set navigation title
  // useEffect(() => {
  //   if (convData?.conversation) {
  //     const otherUser = convData.conversation.guest;
  //     navigation.setOptions({
  //       headerTitle: otherUser?.name || 'Chat',
  //       headerTitleStyle: { color: theme.colors.text },
  //       headerStyle: { backgroundColor: theme.colors.card },
  //     });
  //   }
  // }, [convData, navigation, theme]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, []);

  const handleSend = async () => {
    if (!messageText.trim() || !conversationId) return;

    try {
      await sendMessage({
        variables: {
          input: {
            conversationId,
            content: messageText.trim(),
            message_type: 'text'
          },
        },
      });
    } catch (error) {
      // console.error('Error sending message:', error);
    }
  };

  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    if (isToday) {
      return date.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      });
    }
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isOwnMessage = item.sender.id === currentUserId;
    // const messages = messagesData?.messages || [];
    const prevMessage = index > 0 ? messages[index - 1] : null;
    const showSender = !prevMessage || prevMessage.sender.id !== item.sender.id;
    const isTemp = item.id.startsWith('temp-');

    return (
      <View style={[
        styles.messageContainer,
        isOwnMessage ? styles.ownMessageContainer : styles.otherMessageContainer
      ]}>
        {!isOwnMessage && showSender && (
          <Text style={[styles.senderName, { color: theme.colors.textSecondary }]}>
            {item.sender.name}
          </Text>
        )}
        
        <View style={[
          styles.messageBubble,
          isOwnMessage 
            ? { backgroundColor: theme.colors.primary }
            : { backgroundColor: theme.colors.backgroundSec },
          isTemp && { opacity: 0.7 }
        ]}>
          <Text style={[
            styles.messageText,
            { color: isOwnMessage ? '#FFFFFF' : theme.colors.text }
          ]}>
            {item.content}
          </Text>
        </View>

        <View style={[
          styles.messageFooter,
          isOwnMessage && styles.ownMessageFooter
        ]}>
          <Text style={[styles.messageTime, { color: theme.colors.textSecondary }]}>
            {formatMessageTime(item.created_at)}
          </Text>
          {isOwnMessage && !isTemp && (
            <Ionicons 
              name={item.read_at ? "checkmark-done" : "checkmark"} 
              size={14} 
              color={item.read_at ? theme.colors.primary : theme.colors.textSecondary}
              style={styles.readIcon}
            />
          )}
          {isTemp && (
            <ActivityIndicator size="small" color={theme.colors.textSecondary} />
          )}
        </View>
      </View>
    );
  };

  const messages = convData?.conversation?.messages || [];

  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 50;
    setIsAtBottom(isBottom);
  };

  if (loading && messages.length === 0) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.colors.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: Platform.OS === 'ios' ? 60: 30, paddingHorizontal:20, backgroundColor: theme.colors.backgroundSec, paddingBottom: 10}}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <ChevronLeft />
        </TouchableOpacity>
        <ThemedText type='subtitle'>{convData?.conversation?.host.name}</ThemedText>
      </View>
      <View style={{ flex: 1, }}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={scrollToBottom}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          keyboardDismissMode="interactive"
          keyboardShouldPersistTaps="handled"
        />

        <View
          style={[
            styles.inputContainer,
            {
              backgroundColor: theme.colors.card,
              borderTopColor: theme.colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.inputWrapper,
              { backgroundColor: theme.colors.backgroundSec },
            ]}
          >
            <TextInput
              style={[styles.input, { color: theme.colors.text }]}
              placeholder="Type a message..."
              placeholderTextColor={theme.colors.textSecondary}
              value={messageText}
              onChangeText={setMessageText}
              multiline
              maxLength={1000}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.sendButton,
              { backgroundColor: theme.colors.primary },
              (!messageText.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={handleSend}
            disabled={!messageText.trim() || sending}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <Ionicons name="send" size={20} color="#FFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 8,
    flexGrow: 1,
  },
  messageContainer: {
    marginBottom: 12,
    maxWidth: '80%',
  },
  ownMessageContainer: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
  },
  senderName: {
    fontSize: 12,
    marginBottom: 4,
    marginLeft: 12,
  },
  messageBubble: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    maxWidth: '100%',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  messageFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    marginLeft: 12,
    gap: 4,
  },
  ownMessageFooter: {
    marginLeft: 0,
    marginRight: 12,
    justifyContent: 'flex-end',
  },
  messageTime: {
    fontSize: 11,
  },
  readIcon: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    gap: 8,
    paddingBottom: 20
  },
  inputWrapper: {
    flex: 1,
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 120,
  },
  input: {
    fontSize: 15,
    lineHeight: 20,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatScreen;