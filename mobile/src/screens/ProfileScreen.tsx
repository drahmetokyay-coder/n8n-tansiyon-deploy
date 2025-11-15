import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { logout } from '../store/slices/authSlice';
import { UserType } from '../../../shared/types';

const ProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);

  const isJobSeeker = user?.userType === UserType.JOB_SEEKER;

  const handleLogout = () => {
    Alert.alert('Çıkış Yap', 'Çıkış yapmak istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      {
        text: 'Çıkış Yap',
        style: 'destructive',
        onPress: () => dispatch(logout()),
      },
    ]);
  };

  const renderJobSeekerProfile = () => (
    <>
      <View style={styles.profileHeader}>
        {user.profile?.photo ? (
          <Image source={{ uri: user.profile.photo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarPlaceholderText}>
              {user.profile?.firstName?.[0]}{user.profile?.lastName?.[0]}
            </Text>
          </View>
        )}
        <Text style={styles.name}>
          {user.profile?.firstName} {user.profile?.lastName}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tecrübe</Text>
        <Text style={styles.sectionContent}>{user.profile?.experience || 'Belirtilmemiş'}</Text>
      </View>

      {user.profile?.bio && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hakkında</Text>
          <Text style={styles.sectionContent}>{user.profile.bio}</Text>
        </View>
      )}

      {user.profile?.skills && user.profile.skills.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yetenekler</Text>
          <View style={styles.skillsContainer}>
            {user.profile.skills.map((skill: string, index: number) => (
              <View key={index} style={styles.skillTag}>
                <Text style={styles.skillText}>{skill}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {user.profile?.hourlyRate && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Saat Ücreti</Text>
          <Text style={styles.sectionContent}>
            {user.profile.hourlyRate.min} - {user.profile.hourlyRate.max}{' '}
            {user.profile.hourlyRate.currency}/saat
          </Text>
        </View>
      )}

      {user.profile?.availability && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uygunluk</Text>
          <Text style={styles.sectionContent}>{user.profile.availability.hours}</Text>
          <View style={styles.daysContainer}>
            {user.profile.availability.days?.map((day: string, index: number) => (
              <Text key={index} style={styles.dayText}>
                {day}
              </Text>
            ))}
          </View>
        </View>
      )}
    </>
  );

  const renderEmployerProfile = () => (
    <>
      <View style={styles.profileHeader}>
        {user.profile?.logo ? (
          <Image source={{ uri: user.profile.logo }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatar, styles.avatarPlaceholder]}>
            <Text style={styles.avatarPlaceholderText}>
              {user.profile?.companyName?.[0]}
            </Text>
          </View>
        )}
        <Text style={styles.name}>
          {user.profile?.companyName}
          {user.profile?.verified && ' ✓'}
        </Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>İletişim Kişisi</Text>
        <Text style={styles.sectionContent}>{user.profile?.contactName}</Text>
        {user.profile?.phone && (
          <Text style={styles.sectionSubContent}>{user.profile.phone}</Text>
        )}
      </View>

      {user.profile?.description && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Şirket Hakkında</Text>
          <Text style={styles.sectionContent}>{user.profile.description}</Text>
        </View>
      )}

      {user.profile?.industry && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sektör</Text>
          <Text style={styles.sectionContent}>{user.profile.industry}</Text>
        </View>
      )}

      {user.profile?.companySize && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Şirket Büyüklüğü</Text>
          <Text style={styles.sectionContent}>{user.profile.companySize}</Text>
        </View>
      )}

      {user.profile?.website && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Website</Text>
          <Text style={[styles.sectionContent, styles.link]}>{user.profile.website}</Text>
        </View>
      )}
    </>
  );

  return (
    <ScrollView style={styles.container}>
      {isJobSeeker ? renderJobSeekerProfile() : renderEmployerProfile()}

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Konum</Text>
        <Text style={styles.sectionContent}>
          {user.location?.city || user.location?.address || 'Belirtilmemiş'}
        </Text>
      </View>

      <TouchableOpacity style={styles.editButton} onPress={() => navigation.navigate('EditProfile')}>
        <Text style={styles.editButtonText}>Profili Düzenle</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutButtonText}>Çıkış Yap</Text>
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={styles.footerText}>JobSwipe v1.0.0</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  profileHeader: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#DFE6E9',
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  avatarPlaceholder: {
    backgroundColor: '#6C5CE7',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarPlaceholderText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3436',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: '#636E72',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#636E72',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  sectionContent: {
    fontSize: 16,
    color: '#2D3436',
    lineHeight: 24,
  },
  sectionSubContent: {
    fontSize: 14,
    color: '#636E72',
    marginTop: 4,
  },
  link: {
    color: '#6C5CE7',
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skillTag: {
    backgroundColor: '#6C5CE7',
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
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  dayText: {
    fontSize: 14,
    color: '#636E72',
    marginRight: 12,
  },
  editButton: {
    backgroundColor: '#6C5CE7',
    margin: 20,
    marginTop: 32,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  editButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButton: {
    backgroundColor: '#fff',
    margin: 20,
    marginTop: 0,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FF6B6B',
  },
  logoutButtonText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    alignItems: 'center',
    padding: 20,
  },
  footerText: {
    fontSize: 12,
    color: '#B2BEC3',
  },
});

export default ProfileScreen;
