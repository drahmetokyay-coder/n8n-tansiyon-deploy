import React from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const { width, height } = Dimensions.get('window');

interface SwipeCardProps {
  item: any;
  isJobSeeker: boolean;
}

const SwipeCard: React.FC<SwipeCardProps> = ({ item, isJobSeeker }) => {
  if (isJobSeeker) {
    // Job card for job seekers
    return (
      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.cardContent}>
            {/* Company Logo */}
            {item.employerId?.profile?.logo && (
              <Image
                source={{ uri: item.employerId.profile.logo }}
                style={styles.companyLogo}
              />
            )}

            {/* Job Title */}
            <Text style={styles.title}>{item.title}</Text>

            {/* Company Name */}
            <Text style={styles.companyName}>
              {item.employerId?.profile?.companyName}
              {item.employerId?.profile?.verified && ' ✓'}
            </Text>

            {/* Job Type Badge */}
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.jobType.replace('_', ' ').toUpperCase()}
              </Text>
            </View>

            {/* Compensation */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>💰</Text>
              <Text style={styles.infoText}>
                {item.compensation.amount} {item.compensation.currency}/{item.compensation.period}
              </Text>
            </View>

            {/* Location */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍</Text>
              <Text style={styles.infoText}>{item.location.city || item.location.address}</Text>
            </View>

            {/* Schedule */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>🕒</Text>
              <Text style={styles.infoText}>{item.schedule.hours}</Text>
            </View>

            {/* Skills */}
            <View style={styles.skillsContainer}>
              {item.requirements.skills.slice(0, 4).map((skill: string, index: number) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>

            {/* Description */}
            <Text style={styles.description} numberOfLines={3}>
              {item.description}
            </Text>
          </View>
        </LinearGradient>
      </View>
    );
  } else {
    // Candidate card for employers
    return (
      <View style={styles.card}>
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.cardContent}>
            {/* Profile Photo */}
            {item.profile?.photo ? (
              <Image
                source={{ uri: item.profile.photo }}
                style={styles.profilePhoto}
              />
            ) : (
              <View style={[styles.profilePhoto, styles.placeholderPhoto]}>
                <Text style={styles.placeholderText}>
                  {item.profile?.firstName?.[0]}{item.profile?.lastName?.[0]}
                </Text>
              </View>
            )}

            {/* Name */}
            <Text style={styles.title}>
              {item.profile?.firstName} {item.profile?.lastName}
            </Text>

            {/* Experience */}
            {item.profile?.experience && (
              <Text style={styles.companyName}>{item.profile.experience}</Text>
            )}

            {/* Hourly Rate */}
            {item.profile?.hourlyRate && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>💰</Text>
                <Text style={styles.infoText}>
                  {item.profile.hourlyRate.min}-{item.profile.hourlyRate.max}{' '}
                  {item.profile.hourlyRate.currency}/saat
                </Text>
              </View>
            )}

            {/* Location */}
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>📍</Text>
              <Text style={styles.infoText}>{item.location.city || item.location.address}</Text>
            </View>

            {/* Availability */}
            {item.profile?.availability && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🕒</Text>
                <Text style={styles.infoText}>{item.profile.availability.hours}</Text>
              </View>
            )}

            {/* Skills */}
            <View style={styles.skillsContainer}>
              {item.profile?.skills?.slice(0, 6).map((skill: string, index: number) => (
                <View key={index} style={styles.skillTag}>
                  <Text style={styles.skillText}>{skill}</Text>
                </View>
              ))}
            </View>

            {/* Bio */}
            {item.profile?.bio && (
              <Text style={styles.description} numberOfLines={4}>
                {item.profile.bio}
              </Text>
            )}
          </View>
        </LinearGradient>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  card: {
    width: width - 40,
    height: height - 200,
    borderRadius: 20,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  gradient: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  cardContent: {
    padding: 20,
  },
  companyLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  profilePhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
    alignSelf: 'center',
  },
  placeholderPhoto: {
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 40,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  companyName: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 12,
    opacity: 0.9,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(108, 92, 231, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    marginBottom: 16,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 18,
    marginRight: 8,
  },
  infoText: {
    fontSize: 16,
    color: '#fff',
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 12,
    marginBottom: 12,
  },
  skillTag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  skillText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  description: {
    fontSize: 15,
    color: '#fff',
    lineHeight: 22,
    marginTop: 8,
  },
});

export default SwipeCard;
