import algoliasearch from "algoliasearch";

const client = algoliasearch("N5ZS06PQ7W", "df4e5a603df38d73860f180647020788"); // Env vars

const index = client.initIndex("pets");

export async function createPetAlgolia(pet) {
  try {
    const petCreated = await index.saveObject({
      objectID: pet.get("id"),
      fullName: pet.get("fullName"),
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

export { index };
