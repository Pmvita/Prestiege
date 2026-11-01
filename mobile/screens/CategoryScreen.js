import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { fetchListings, formatPrice } from '../config/api';
import { colors } from '../theme';

const SORT_OPTIONS = [
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'price_asc', label: 'Price ↑' },
  { value: 'title', label: 'A–Z' },
  { value: 'brand', label: 'Brand' },
];

function matchesSearch(listing, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return true;
  const haystack = `${listing.title || ''} ${listing.brand || ''} ${listing.model || ''}`.toLowerCase();
  return haystack.includes(needle);
}

export default function CategoryScreen({ route, navigation }) {
  const { slug, name } = route.params;
  const [listings, setListings] = useState([]);
  const [sort, setSort] = useState('price_desc');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const visible = useMemo(
    () => listings.filter((listing) => matchesSearch(listing, search)),
    [listings, search]
  );

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchListings({ category: slug, limit: 500, sort });
      setListings(data.listings || []);
    } catch (err) {
      setError(err.message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [slug, sort]);

  useEffect(() => {
    navigation.setOptions({ title: name || slug });
  }, [slug, name, navigation]);

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
      data={visible}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <Text style={styles.heading}>{name}</Text>
          <Text style={styles.sub}>{visible.length} listings</Text>
          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="Title, brand, or model"
            placeholderTextColor={colors.stone}
            autoCapitalize="none"
            autoCorrect={false}
            clearButtonMode="while-editing"
          />
          <View style={styles.sortRow}>
            {SORT_OPTIONS.map((opt) => {
              const active = sort === opt.value;
              return (
                <Pressable
                  key={opt.value}
                  style={[styles.sortChip, active && styles.sortChipActive]}
                  onPress={() => setSort(opt.value)}
                >
                  <Text style={[styles.sortText, active && styles.sortTextActive]}>
                    {opt.label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </>
      }
      renderItem={({ item }) => (
        <Pressable
          style={styles.card}
          onPress={() => navigation.navigate('Listing', { id: item.id })}
        >
          <Image source={{ uri: item.image }} style={styles.image} />
          <View style={styles.body}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.price}>{formatPrice(item.price, item.currency)}</Text>
          </View>
        </Pressable>
      )}
      ListEmptyComponent={
        !error ? (
          <Text style={styles.muted}>
            {search.trim() ? 'No listings match your search.' : 'No listings.'}
          </Text>
        ) : null
      }
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
  search: {
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.inkSoft,
    color: colors.parchment,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 15,
  },
  sortRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  sortChip: {
    borderWidth: 1,
    borderColor: colors.line,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  sortChipActive: {
    borderColor: colors.gold,
    backgroundColor: 'rgba(184, 149, 106, 0.12)',
  },
  sortText: {
    color: colors.stone,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  sortTextActive: { color: colors.goldBright },
  error: { color: '#c98a7a', marginBottom: 12 },
  card: { marginBottom: 14, backgroundColor: colors.inkSoft },
  image: { width: '100%', height: 160, backgroundColor: '#222' },
  body: { padding: 12 },
  title: { color: colors.parchment, fontSize: 17, marginBottom: 4 },
  price: { color: colors.goldBright },
  muted: { color: colors.stone },
});
