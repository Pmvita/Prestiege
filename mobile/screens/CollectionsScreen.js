import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchCollection, fetchCollections, formatPrice } from '../config/api';
import { colors } from '../theme';

export default function CollectionsScreen({ navigation }) {
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchCollections();
        setCollections(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={collections}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <Text style={styles.heading}>Collections</Text>
          <Text style={styles.sub}>Portfolio-centric holdings</Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={async () => {
            try {
              const full = await fetchCollection(item.id);
              navigation.navigate('CollectionDetail', { collection: full });
            } catch (err) {
              setError(err.message);
            }
          }}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.body}>
            <Text style={styles.meta}>{item.categoryName || item.category}</Text>
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.price}>
              {item.estimatedValue
                ? formatPrice(item.estimatedValue.amount, item.estimatedValue.currency)
                : `${item.listingCount} pieces`}
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 20, paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heading: { color: colors.parchment, fontSize: 28, marginBottom: 4 },
  sub: { color: colors.stone, marginBottom: 16 },
  error: { color: '#c98a7a', marginBottom: 12 },
  card: { marginBottom: 14, backgroundColor: colors.inkSoft },
  image: { width: '100%', height: 160, backgroundColor: '#222' },
  body: { padding: 12 },
  meta: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  title: { color: colors.parchment, fontSize: 18, marginBottom: 4 },
  price: { color: colors.parchmentDim },
});
