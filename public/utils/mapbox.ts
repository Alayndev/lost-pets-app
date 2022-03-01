//import mapbox, mapboxtoken, mapboxgl
const MapboxClient = require("mapbox");
import * as mapboxgl from "../../node_modules/mapbox-gl/dist/mapbox-gl.js";
import "mapbox-gl/dist/mapbox-gl.css";
import { Marker } from "mapbox-gl";
import { state } from "../state";

// Repasar cap. 5 Desafio - Boilerplate gist

const TOKEN = process.env.MAPBOX_TOKEN;

export async function mapping(initial?) {
  const form: any = document.querySelector(".form"); // Puedo selecionarlo al NO tener shadow root en la page/comp pet-data.ts
  const mapboxClient = new MapboxClient(TOKEN);

  function initMap() {
    mapboxgl.accessToken = TOKEN;

    return new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/streets-v11",
      center: initial ? initial : [0, 0],
      zoom: initial ? 8 : 0,
    });
  }

  function initSearchForm(callback) {
    form.addEventListener("change", (e) => {
      e.preventDefault();

      mapboxClient.geocodeForward(
        form.geoloc.value,
        {
          country: "ar",
          autocomplete: true,
          language: "es",
        },
        function (err, data, res) {
          if (!err) callback(data.features);
        }
      );
    });
  }

  const map = initMap();
  let initialMarker;
  if (initial) {
    initialMarker = new mapboxgl.Marker().setLngLat(initial).addTo(map);
  }

  initSearchForm(async function (results) {
    if (initial) {
      initialMarker.remove();
    }

    const firstResult = results[0];
    const marker = new mapboxgl.Marker({ color: "#222", draggable: true })
      .setLngLat(firstResult.geometry.coordinates)
      .addTo(map);

    map.setCenter(firstResult.geometry.coordinates);
    map.setZoom(10);

    // Seteamos en el state lat y lng del lugar de la búsqueda realizada (el 1er resultado obtenido)
    const { lat, lng } = marker.getLngLat();
    state.setPetGeoloc({ lat, lng });

    // Seteamos en el state lat y lng cuando el usuario mueve el marker
    marker.on("dragend", () => {
      const { lat, lng } = marker.getLngLat();
      state.setPetGeoloc({ lat, lng });
    });
  });
}
