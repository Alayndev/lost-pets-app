// Boilerplate: https://www.algolia.com/doc/api-client/getting-started/instantiate-client-index/javascript/?client=javascript

// For the default version
import algoliasearch from "algoliasearch";

const client = algoliasearch("N5ZS06PQ7W", "df4e5a603df38d73860f180647020788");

const index = client.initIndex("products"); // Especificamos el Index. Boilerplate: const index = client.initIndex('your_index_name');

export { index };


// OCULTAR LINEA 6