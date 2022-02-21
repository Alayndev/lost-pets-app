import algoliasearch from "algoliasearch";

const client = algoliasearch("N5ZS06PQ7W", "df4e5a603df38d73860f180647020788"); // Env vars

const index = client.initIndex("pets");

export async function createPetAlgolia(pet) {
  try {
    const petCreated = await index.saveObject({
      objectID: pet.get("id"),
      fullName: pet.get("fullName"),
      pictureURL: pet.get("pictureURL"),
      description: pet.get("description"),
      _geoloc: {
        lat: pet.get("lat"),
        lng: pet.get("lng"),
      },
    });

    return petCreated;
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function updatePetAlgolia(pet) {
  const { petDataToAlgolia } = pet;

  try {
    const petUpdated = await index.partialUpdateObject(petDataToAlgolia);

    return petUpdated;
  } catch (error) {
    console.error(error);
    return { error };
  }
}

export async function searchPetsAround(lat, lng) {
  const { hits, nbHits } = await index.search("", {
    aroundLatLng: [lat, lng].join(","),

    aroundRadius: 10000, // 10 km
  });

  return { hits, nbHits };
}

export async function deletePetAlgolia(petId) {
  const algoliaPetDeleted = await index.deleteObject(petId);

  return algoliaPetDeleted;
}

export { index };
