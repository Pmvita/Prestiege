// Prestiege Mock Data Loader
// Marketplace categories + optional Mvita-HQ imported domains

export const loadAllCategories = () => {
  return {
    estates: require('./estates/estates.json'),
    mobility: require('./mobility/mobility.json'),
    jets: require('./jets/jets.json'),
    yachts: require('./yachts/yachts.json'),
    watches: require('./watches/watches.json'),
    jewelry: require('./jewelry/jewelry.json'),
    bags: require('./bags/bags.json'),
    shoes: require('./shoes/shoes.json'),
    fashion: require('./fashion/fashion.json'),
    art: require('./art/art.json'),
    books: require('./books/books.json'),
    spirits: require('./spirits/spirits.json'),
    foods: require('./foods/foods.json'),
    collectibles: require('./collectibles/collectibles.json'),
    experiences: require('./experiences/experiences.json'),
  };
};

/** Faithful Mvita-HQ mockData tree (office domains; not all map to marketplace). */
export const loadImportedFromMvita = () => {
  return {
    vehicles: require('./imported-from-mvita/mobility/vehicles.json'),
    properties: require('./imported-from-mvita/estates/properties.json'),
    guests: require('./imported-from-mvita/estates/guests.json'),
    events: require('./imported-from-mvita/events/events.json'),
    finance: require('./imported-from-mvita/finance/manifestPortfolio.json'),
    security: require('./imported-from-mvita/security/data.json'),
    staff: require('./imported-from-mvita/staff/members.json'),
    bucketList: require('./imported-from-mvita/bucketList/bucketList.json'),
    collections: require('./imported-from-mvita/collections/collections.json'),
    vaultDocuments: require('./imported-from-mvita/vault/documents.json'),
    vaultGive: require('./imported-from-mvita/vault/Give.json'),
    vaultLegacy: require('./imported-from-mvita/vault/legacyEstate.json'),
    vaultRoster: require('./imported-from-mvita/vault/roster.json'),
  };
};
