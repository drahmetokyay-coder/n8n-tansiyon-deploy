import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchMatchMessages, addMessage } from '../store/slices/matchSlice';
import socketService from '../services/socket';
import { format } from 'date-fns';
import { UserType } from '../../../shared/types';

const ChatScreen: React.FC<{ route: any; navigation: any }> = ({ route, navigation }) => {
  const { matchId, match } = route.params;
  const dispatch = useDispatch<AppDispatch>();
  const flatListRef = useRef<FlatList>(null);

  const { messages } = useSelector((state: RootState) => state.match);
  const { user } = useSelector((state: RootState) => state.auth);

  const [messageText, setMessageText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const isJobSeeker = user?.userType === UserType.JOB_SEEKER;
  const otherUser = isJobSeeker ? match.employerId : match.jobSeekerId;
  const otherUserName = isJobSeeker
    ? match.employerId?.profile?.companyName
    : `${match.jobSeekerId?.profile?.firstName} ${match.jobSeekerId?.profile?.lastName}`;

  useEffect(() => {
    dispatch(fetchMatchMessages(matchId));
    socketService.joinMatch(matchId);

    // Listen for new messages
    socketService.onNewMessage((message: any) => {
      if (message.matchId === matchId) {
        dispatch(addMessage(message));
      }
    });

    // Listen for typing indicator
    socketService.onUserTyping((data: any) => {
      if (data.userId !== user?._id) {
        setIsTyping(data.isTyping);
      }
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, [matchId]);

  const handleSend = () => {
    if (messageText.trim()) {
      socketService.sendMessage(matchId, messageText.trim());
      setMessageText('');
      socketService.sendTyping(matchId, false);
    }
  };

  const handleTyping = (text: string) => {
    setMessageText(text);

    if (text.length > 0) {
      socketService.sendTyping(matchId, true);
    } else {
      socketService.sendTyping(matchId, false);
    }
  };

  const renderMessage = ({ item }: { item: any }) => {
    const isMine = item.senderId._id === user?._id || item.senderId === user?._id;
    const senderName = item.senderId?.profile?.firstName || item.senderId?.profile?.companyName;

    return (
      <View style={[styles.messageContainer, isMine && styles.myMessageContainer]}>
        <View style={[styles.messageBubble, isMine && styles.myMessageBubble]}>
          {!isMine && <Text style={styles.senderName}>{senderName}</Text>}
          <Text style={[styles.messageText, isMine && styles.myMessageText]}>
            {item.content}
          </Text>
          <Text style={[styles.messageTime, isMine && styles.myMessageTime]}>
            {format(new Date(item.createdAt), 'HH:mm')}
          </Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    navigation.setOptions({
      title: otherUserName,
    });
  }, [otherUserName]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>Sohbete başla! 👋</Text>
          </View>
        }
      />

      {isTyping && (
        <View style={styles.typingIndicator}>
          <Text style={styles.typingText}>Yazıyor...</Text>
        </View>
      )}

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Mesaj yazın..."
          placeholderTextColor="#999"
          value={messageText}
          onChangeText={handleTyping}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!messageText.trim()}
        >
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    marginBottom: 12,
    alignItems: 'flex-start',
  },
  myMessageContainer: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '75%',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  myMessageBubble: {
    backgroundColor: '#6C5CE7',
  },
  senderName: {
    fontSize: 12,
    color: '#636E72',
    marginBottom: 4,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 16,
    color: '#2D3436',
    marginBottom: 4,
  },
  myMessageText: {
    color: '#fff',
  },
  messageTime: {
    fontSize: 11,
    color: '#B2BEC3',
    alignSelf: 'flex-end',
  },
  myMessageTime: {
    color: 'rgba(255, 255, 255, 0.7)',
  },
  typingIndicator: {
    padding: 8,
    paddingLeft: 16,
  },
  typingText: {
    fontSize: 14,
    color: '#636E72',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#DFE6E9',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    maxHeight: 100,
    marginRight: 12,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#DFE6E9',
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#636E72',
  },
});

export default ChatScreen;
