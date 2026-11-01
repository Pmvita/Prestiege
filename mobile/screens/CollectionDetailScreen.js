import React from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { formatPrice } from '../config/api';
import { colors } from '../theme';

export default function CollectionDetailScreen({ route, navigation }) {
  const { collection } = route.params;
  const listings = collection?.listings || [];

  return (
    <FlatList
      style={styles.screen}
      contentContainerStyle={styles.content}
      data={listings}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={
        <>
          <Text style={styles.heading}>{collection.name}</Text>
          <Text style={styles.sub}>{collection.summary}</Text>
          {collection.estimatedValue ? (
            <Text style={styles.est}>
              Est.{' '}
              {formatPrice(
                collection.estimatedValue.amount,
                collection.estimatedValue.currency
              )}
            </Text>
          ) : null}
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
      ListEmptyComponent={<Text style={styles.muted}>No linked listings.</Text>}
    />
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.ink },
  content: { padding: 20, paddingBottom: 40 },
  heading: { color: colors.parchment, fontSize: 26, marginBottom: 8 },
  sub: { color: colors.stone, marginBottom: 8, lineHeight: 20 },
  est: { color: colors.goldBright, marginBottom: 16 },
  card: { marginBottom: 14, backgroundColor: colors.inkSoft },
  image: { width: '100%', height: 150, backgroundColor: '#222' },
  body: { padding: 12 },
  title: { color: colors.parchment, fontSize: 16, marginBottom: 4 },
  price: { color: colors.goldBright },
  muted: { color: colors.stone },
});
