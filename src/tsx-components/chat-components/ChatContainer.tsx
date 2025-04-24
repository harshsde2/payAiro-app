import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { useSelector } from 'react-redux';
import { getContactListsForAll } from '../../services/Services';
import ChatComponent from './ChatComponent';
import { ContactData, Interaction } from './chat.types';

interface ChatContainerProps {
  contactData: ContactData;
  getUserData: any;
}

const ChatContainer: React.FC<ChatContainerProps> = ({ contactData, getUserData }) => {
  const isFocused = useIsFocused();
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // Refs for performance optimization
  const isMountedRef = useRef<boolean>(true);
  const timeoutIdRef = useRef<NodeJS.Timeout | null>(null);
  const isRequestPendingRef = useRef<boolean>(false);
  const previousInteractionsRef = useRef<string>('');
  const intervalIdRef = useRef<NodeJS.Timeout | null>(null);
  
  // Get tokens from Redux state
  const { tokens } = useSelector((state: any) => state.authenticationSlice);

  // Function to get chat messages
  const getContactMessages = useCallback(async () => {
    // Skip if not mounted, not focused, no contact data, no token, or request already in progress
    if (!isMountedRef.current || 
        !isFocused || 
        !contactData?.username || 
        !tokens?.access || 
        isRequestPendingRef.current) {
      return;
    }
    
    // Set the request as pending
    isRequestPendingRef.current = true;
    
    try {
      setIsLoading(true);
      
      const data = await getContactListsForAll(
        'username',
        contactData.username,
        tokens.access
      );
      
      if (data?.data?.interactions && isMountedRef.current) {
        // Stringify for comparison to avoid unnecessary updates
        const newInteractionsString = JSON.stringify(data.data.interactions);
        
        // Only update state if the interactions have changed
        if (newInteractionsString !== previousInteractionsRef.current) {
          previousInteractionsRef.current = newInteractionsString;
          
          // Sort interactions by timestamp
          const sortedInteractions = data.data.interactions.map((interaction: any) => ({
            ...interaction,
            sortTimestamp: new Date(interaction.timestamp).getTime()
          }));
          
          setInteractions(sortedInteractions);
        }
      }
    } catch (error) {
      console.log('Error fetching chat messages:', error);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
      
      // Schedule the next fetch after a delay to prevent immediate re-fetching
      if (isFocused && isMountedRef.current) {
        // Use a timeout instead of immediate polling to give device a break
        timeoutIdRef.current = setTimeout(() => {
          isRequestPendingRef.current = false;
        }, 500);
      } else {
        isRequestPendingRef.current = false;
      }
    }
  }, [contactData?.username, tokens?.access, isFocused]);

  // Start polling when component mounts or screen gets focus
  useEffect(() => {
    isMountedRef.current = true;
    
    // Initial fetch
    getContactMessages();
    
    // Set up polling interval
    if (isFocused) {
      // Clear any existing interval
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
      
      // Start new interval
      intervalIdRef.current = setInterval(() => {
        if (!isRequestPendingRef.current) {
          getContactMessages();
        }
      }, 5000); // Poll every 5 seconds
    } else if (intervalIdRef.current) {
      // Clear interval if not focused
      clearInterval(intervalIdRef.current);
      intervalIdRef.current = null;
    }
    
    // Cleanup function
    return () => {
      isMountedRef.current = false;
      
      // Clear interval
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
      
      // Clear timeout
      if (timeoutIdRef.current) {
        clearTimeout(timeoutIdRef.current);
        timeoutIdRef.current = null;
      }
    };
  }, [isFocused, getContactMessages]);

//   console.log("interactions-->>> ",JSON.stringify(interactions,null,2))
  return (
    <View style={styles.container}>
      <ChatComponent
        key={`chat-${contactData?.username || 'unknown'}`}
        currentUser={getUserData}
        initialMessages={interactions as any}
        contact={contactData}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});

export default ChatContainer; 