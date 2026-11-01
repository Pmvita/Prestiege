import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { API_URL, fetchCategories, fetchListings, formatPrice } from '../config/api';
import { colors } from '../theme';

export default function HomeScreen({ navigation }) {
  const [categories, setCategories] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setError(null);
    try {
      const [cats, listingsData] = await Promise.all([
        fetchCategories(),
        fetchListings({ limit: 12 }),
      ]);
      setCategories(cats);
      setFeatured(listingsData.listings || []);
    } catch (err) {
      setError(`${err.message}\nAPI: ${API_URL}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      data={featured}
      keyExtractor={(item) => item.id}
      refreshControl={<RefreshControl refreshing={false} onRefresh={load} tintColor={colors.gold} />}
      ListHeaderComponent={
        <>
          <Text style={styles.brand}>PRESTIEGE</Text>
          <Text style={styles.tagline}>
            Luxury marketplace — estates, cars, collections.
          </Text>
          {error ? <Text style={styles.error}>{error}</Text> : null}

          <View style={styles.rowBetween}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Pressable onPress={() => navigation.navigate('Collections')}>
              <Text style={styles.link}>Collections</Text>
            </Pressable>
          </View>
          <View style={styles.catWrap}>
            {categories.map((cat) => (
              <Pressable
                key={cat.slug}
                style={styles.catChip}
                onPress={() =>
                  navigation.navigate('Category', { slug: cat.slug, name: cat.name })
                }
              >
                <Text style={styles.catName}>{cat.name}</Text>
                <Text style={styles.catCount}>{cat.listingCount}</Text>
              </Pressable>
            ))}
          </View>
          <View style={[styles.rowBetween, { marginTop: 20, marginBottom: 12 }]}>
            <Text style={[styles.sectionTitle, { marginBottom: 0 }]}>Featured</Text>
            <Pressable onPress={() => navigation.navigate('Listings')}>
              <Text style={styles.link}>Browse all →</Text>
            </Pressable>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Listing', { id: item.id })}
        >
          <Image source={{ uri: item.image }} style={styles.cardImage} />
          <View style={styles.cardBody}>
            <Text style={styles.meta}>{item.categoryName || item.category}</Text>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.price}>{formatPrice(item.price, item.currency)}</Text>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={!error ? <Text style={styles.muted}>No listings yet.</Text> : null}
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
  brand: {
    color: colors.parchment,
    fontSize: 34,
    letterSpacing: 8,
    fontWeight: '500',
    marginBottom: 8,
  },
  tagline: { color: colors.stone, marginBottom: 20, fontSize: 15, lineHeight: 22 },
  error: { color: '#c98a7a', marginBottom: 16, lineHeight: 20 },
  sectionTitle: {
    color: colors.parchment,
    fontSize: 22,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  link: { color: colors.gold, letterSpacing: 1, textTransform: 'uppercase', fontSize: 11 },
  catWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  catChip: {
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 4,
    minWidth: '46%',
    flexGrow: 1,
  },
  catName: { color: colors.parchment, fontSize: 15 },
  catCount: { color: colors.stone, fontSize: 12, marginTop: 2 },
  card: {
    marginBottom: 16,
    backgroundColor: colors.inkSoft,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: 180, backgroundColor: '#222' },
  cardBody: { padding: 14 },
  meta: {
    color: colors.gold,
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  cardTitle: { color: colors.parchment, fontSize: 18, marginBottom: 6 },
  price: { color: colors.parchmentDim },
  muted: { color: colors.stone, marginTop: 8 },
});
