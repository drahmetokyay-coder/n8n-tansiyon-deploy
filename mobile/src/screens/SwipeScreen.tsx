import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import Swiper from 'react-native-deck-swiper';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchJobs, swipeJob, fetchCandidates, swipeCandidate } from '../store/slices/jobSlice';
import SwipeCard from '../components/SwipeCard';
import { UserType } from '../../../shared/types';

const SwipeScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const swiperRef = useRef<any>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const { user } = useSelector((state: RootState) => state.auth);
  const { jobs, candidates, isLoading } = useSelector((state: RootState) => state.job);

  const isJobSeeker = user?.userType === UserType.JOB_SEEKER;
  const cards = isJobSeeker ? jobs : candidates;

  useEffect(() => {
    if (isJobSeeker) {
      dispatch(fetchJobs());
    }
  }, [isJobSeeker]);

  const handleSwipe = async (index: number, direction: 'left' | 'right') => {
    const card = cards[index];
    const swipeDirection = direction === 'right' ? 'right' : 'left';

    try {
      if (isJobSeeker) {
        const result = await dispatch(swipeJob({ jobId: card._id, direction: swipeDirection })).unwrap();

        if (result.isMatch) {
          Alert.alert(
            '🎉 Eşleşme!',
            'Tebrikler! Yeni bir eşleşmeniz var.',
            [
              { text: 'Devam Et', style: 'cancel' },
              {
                text: 'Mesaj Gönder',
                onPress: () => navigation.navigate('Matches'),
              },
            ]
          );
        }
      } else {
        // Employer swiping on candidate
        const selectedJobId = user?.selectedJobId; // This should be selected from a job picker
        if (!selectedJobId) {
          Alert.alert('Hata', 'Lütfen önce bir iş ilanı seçin');
          return;
        }

        const result = await dispatch(
          swipeCandidate({
            candidateId: card._id,
            jobId: selectedJobId,
            direction: swipeDirection,
          })
        ).unwrap();

        if (result.isMatch) {
          Alert.alert(
            '🎉 Eşleşme!',
            'Tebrikler! Yeni bir aday eşleşmeniz var.',
            [
              { text: 'Devam Et', style: 'cancel' },
              {
                text: 'Mesaj Gönder',
                onPress: () => navigation.navigate('Matches'),
              },
            ]
          );
        }
      }
    } catch (error) {
      console.error('Swipe error:', error);
    }
  };

  const handleSwipeLeft = (index: number) => {
    handleSwipe(index, 'left');
  };

  const handleSwipeRight = (index: number) => {
    handleSwipe(index, 'right');
  };

  const handleSwipeAll = () => {
    Alert.alert(
      'Tüm Kartlar Gezildi',
      isJobSeeker ? 'Yeni iş ilanları için tekrar kontrol edin!' : 'Yeni adaylar için tekrar kontrol edin!',
      [
        {
          text: 'Yenile',
          onPress: () => {
            if (isJobSeeker) {
              dispatch(fetchJobs());
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#6C5CE7" />
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>
          {isJobSeeker ? '📋 Henüz iş ilanı yok' : '👥 Henüz aday yok'}
        </Text>
        <Text style={styles.emptySubtext}>
          {isJobSeeker ? 'Yeni ilanlar eklendiğinde buradan görebilirsiniz' : 'Bir iş ilanı seçin ve adaylara göz atın'}
        </Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={() => {
            if (isJobSeeker) {
              dispatch(fetchJobs());
            }
          }}
        >
          <Text style={styles.refreshButtonText}>Yenile</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {isJobSeeker ? '🔍 İş Ara' : '👥 Aday Bul'}
        </Text>
      </View>

      <View style={styles.swiperContainer}>
        <Swiper
          ref={swiperRef}
          cards={cards}
          renderCard={(card) => <SwipeCard item={card} isJobSeeker={isJobSeeker} />}
          onSwipedLeft={handleSwipeLeft}
          onSwipedRight={handleSwipeRight}
          onSwipedAll={handleSwipeAll}
          cardIndex={currentIndex}
          backgroundColor="transparent"
          stackSize={3}
          stackSeparation={15}
          overlayLabels={{
            left: {
              title: 'GEÇ',
              style: {
                label: {
                  backgroundColor: '#FF6B6B',
                  color: '#fff',
                  fontSize: 24,
                  fontWeight: 'bold',
                  borderRadius: 10,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: -30,
                },
              },
            },
            right: {
              title: 'BEĞENDİM',
              style: {
                label: {
                  backgroundColor: '#4ECDC4',
                  color: '#fff',
                  fontSize: 24,
                  fontWeight: 'bold',
                  borderRadius: 10,
                  padding: 10,
                },
                wrapper: {
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  justifyContent: 'flex-start',
                  marginTop: 30,
                  marginLeft: 30,
                },
              },
            },
          }}
          animateOverlayLabelsOpacity
          animateCardOpacity
          swipeBackCard
        />
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={[styles.button, styles.passButton]}
          onPress={() => swiperRef.current?.swipeLeft()}
        >
          <Text style={styles.buttonIcon}>✕</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.likeButton]}
          onPress={() => swiperRef.current?.swipeRight()}
        >
          <Text style={styles.buttonIcon}>♥</Text>
        </TouchableOpacity>
      </View>
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
    padding: 20,
  },
  header: {
    padding: 20,
    paddingTop: 40,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3436',
  },
  swiperContainer: {
    flex: 1,
    paddingTop: 20,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 40,
    gap: 20,
  },
  button: {
    width: 70,
    height: 70,
    borderRadius: 35,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  passButton: {
    backgroundColor: '#FF6B6B',
  },
  likeButton: {
    backgroundColor: '#4ECDC4',
  },
  buttonIcon: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 12,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#636E72',
    textAlign: 'center',
    marginBottom: 24,
  },
  refreshButton: {
    backgroundColor: '#6C5CE7',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SwipeScreen;
