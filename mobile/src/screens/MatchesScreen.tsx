import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchMatches } from '../store/slices/matchSlice';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { UserType } from '../../../shared/types';

const MatchesScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { matches, isLoading } = useSelector((state: RootState) => state.match);
  const { user } = useSelector((state: RootState) => state.auth);

  const isJobSeeker = user?.userType === UserType.JOB_SEEKER;

  useEffect(() => {
    dispatch(fetchMatches());
  }, []);

  const renderMatch = ({ item }: { item: any }) => {
    const otherUser = isJobSeeker ? item.employerId : item.jobSeekerId;
    const jobTitle = item.jobPostId?.title || 'İş İlanı';

    const name = isJobSeeker
      ? item.employerId?.profile?.companyName
      : `${item.jobSeekerId?.profile?.firstName} ${item.jobSeekerId?.profile?.lastName}`;

    const photo = isJobSeeker
      ? item.employerId?.profile?.logo
      : item.jobSeekerId?.profile?.photo;

    const lastMessage = item.lastMessageAt
      ? format(new Date(item.lastMessageAt), 'dd MMM, HH:mm', { locale: tr })
      : 'Henüz mesaj yok';

    return (
      <TouchableOpacity
        style={styles.matchCard}
        onPress={() => navigation.navigate('Chat', { matchId: item._id, match: item })}
      >
        <View style={styles.matchAvatar}>
          {photo ? (
            <Image source={{ uri: photo }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarPlaceholderText}>{name?.[0]}</Text>
            </View>
          )}
        </View>

        <View style={styles.matchInfo}>
          <Text style={styles.matchName}>{name}</Text>
          <Text style={styles.matchJob}>{jobTitle}</Text>
          <Text style={styles.matchTime}>{lastMessage}</Text>
        </View>

        <View style={styles.matchArrow}>
          <Text style={styles.arrowIcon}>›</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>💬 Eşleşmeler</Text>
        <Text style={styles.headerSubtitle}>{matches.length} eşleşme</Text>
      </View>

      {matches.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🤝</Text>
          <Text style={styles.emptyText}>Henüz eşleşmeniz yok</Text>
          <Text style={styles.emptySubtext}>
            Swipe yapmaya devam edin, yakında eşleşeceksiniz!
          </Text>
        </View>
      ) : (
        <FlatList
          data={matches}
          renderItem={renderMatch}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#DFE6E9',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#636E72',
  },
  listContainer: {
    padding: 16,
  },
  matchCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  matchAvatar: {
    marginRight: 16,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  avatarPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  matchInfo: {
    flex: 1,
  },
  matchName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: 4,
  },
  matchJob: {
    fontSize: 14,
    color: '#636E72',
    marginBottom: 4,
  },
  matchTime: {
    fontSize: 12,
    color: '#B2BEC3',
  },
  matchArrow: {
    marginLeft: 8,
  },
  arrowIcon: {
    fontSize: 24,
    color: '#B2BEC3',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
  },
});

export default MatchesScreen;
