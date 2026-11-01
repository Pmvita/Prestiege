import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { fetchListing, formatPrice } from '../config/api';
import { colors } from '../theme';

export default function ListingScreen({ route, navigation }) {
  const { id } = route.params;
  const [listing, setListing] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await fetchListing(id);
        setListing(data);
        navigation.setOptions({ title: data.title?.slice(0, 28) || 'Listing' });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [id, navigation]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.gold} />
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error || 'Not found'}</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Image source={{ uri: listing.image }} style={styles.hero} />
      <Text style={styles.meta}>{listing.categoryName || listing.category}</Text>
      <Text style={styles.title}>{listing.title}</Text>
      <Text style={styles.price}>{formatPrice(listing.price, listing.currency)}</Text>
      {listing.location ? <Text style={styles.loc}>{listing.location}</Text> : null}
      {listing.summary ? <Text style={styles.summary}>{listing.summary}</Text> : null}

      <View style={styles.metaBlock}>
        {listing.status ? (
          <Row label="Status" value={listing.status} />
        ) : null}
        {listing.condition ? (
          <Row label="Condition" value={listing.condition} />
        ) : null}
        {listing.brand ? <Row label="Make" value={listing.brand} /> : null}
        {listing.year ? <Row label="Year" value={String(listing.year)} /> : null}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { paddingBottom: 40 },
  centered: {
    flex: 1,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  hero: { width: '100%', height: 260, backgroundColor: '#222' },
  meta: {
    color: colors.gold,
    letterSpacing: 2,
    textTransform: 'uppercase',
    fontSize: 11,
    marginTop: 18,
    marginHorizontal: 20,
  },
  title: {
    color: colors.parchment,
    fontSize: 26,
    marginHorizontal: 20,
    marginTop: 6,
    lineHeight: 32,
  },
  price: {
    color: colors.goldBright,
    fontSize: 18,
    marginHorizontal: 20,
    marginTop: 10,
  },
  loc: { color: colors.stone, marginHorizontal: 20, marginTop: 6 },
  summary: {
    color: colors.parchmentDim,
    marginHorizontal: 20,
    marginTop: 16,
    lineHeight: 22,
    fontSize: 15,
  },
  metaBlock: {
    marginTop: 24,
    marginHorizontal: 20,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(184,149,106,0.15)',
    gap: 12,
  },
  rowLabel: {
    color: colors.stone,
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 11,
  },
  rowValue: { color: colors.parchment, flexShrink: 1, textAlign: 'right' },
  error: { color: '#c98a7a' },
});
