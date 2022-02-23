import algoliasearch from "algoliasearch";
import "dotenv/config";

const client = algoliasearch(
  process.env.ALGOLIA_CLIENT,
  process.env.ALGOLIA_KEY
);

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

export async function searchPetsAround(lat: number, lng: number) {
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
