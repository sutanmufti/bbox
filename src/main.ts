import "./output.css";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";
import mapboxgl from "mapbox-gl";
import clearControl from "./control";
import mapboxtoken from "./mapboxtoken";

const clearControlControl = new clearControl(() => {
  coordinateArray = [];
  liveCoorindateArray = [];
  drawMode = false;
  setSourceData();
  generateBbox();
  generateLiveBbox();
});



mapboxgl.accessToken = mapboxtoken

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/light-v10",
  center: [0, 0],
  zoom: 1,
});

map.on("load", function () {
  map.addControl(clearControlControl, "top-right");
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
      showUserHeading: true,
    }),
    "top-left"
  );

  map.getCanvas().style.cursor = "default";

  map.addSource("points", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  console.log("loggin point source:");
  console.log("point source:", map.getSource("points"));

  map.addSource("boxfeature", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [

      ],
    },
  });

  map.addSource("bboxlive", {
    type: "geojson",
    data: {
      type: "FeatureCollection",
      features: [],
    },
  });

  map.addLayer({
    id: "boxlayer",
    type: "fill",
    source: "boxfeature",
    layout: {},
    paint: {
      "fill-color": "#088",
      "fill-opacity": 0.8,
    },
  });

  map.addLayer({
    id: "bboxlive",
    type: "fill",
    source: "bboxlive",
    layout: {},
    paint: {
      "fill-color": "#088",
      "fill-opacity": 0.8,
    },
  });

  map.addLayer({
    id: "points",
    type: "circle",
    source: "points",
    paint: {
      "circle-radius": 5,
      "circle-color": "#007cbf",
    },
  });
});

function generatePoint(lat: number, lng: number) {
  return {
    type: "Feature" as const,
    properties: {},
    geometry: {
      type: "Point",
      coordinates: [lng, lat],
    },
  };
}

function setSourceData() {
  const source = map.getSource("points") as mapboxgl.GeoJSONSource;
  source.setData({
    type: "FeatureCollection",
    features: coordinateArray.map(([lng, lat]) =>
      turf.helpers.point([lng, lat])
    ),
  });
}

function generateBbox() {
  const features = map.querySourceFeatures("points");

  const points = coordinateArray.map(([lng, lat]) =>
    turf.helpers.point([lng, lat])
  );

  console.log("features:", features);
  const featureCollection = {
    type: "FeatureCollection" as const,
    features: points,
  };
  const boundingBox = turf.bbox(featureCollection);
  const bboxPolygon = turf.bboxPolygon(boundingBox);
  const bboxSource = map.getSource("boxfeature") as mapboxgl.GeoJSONSource;
  bboxSource.setData(bboxPolygon);
}

function generateLiveBbox() {
  const points = liveCoorindateArray.map(([lng, lat]) =>
    turf.helpers.point([lng, lat])
  );

  const featureCollection = {
    type: "FeatureCollection" as const,
    features: points,
  };
  const boundingBox = turf.bbox(featureCollection);
  const bboxPolygon = turf.bboxPolygon(boundingBox);
  const bboxSource = map.getSource("bboxlive") as mapboxgl.GeoJSONSource;
  bboxSource.setData(bboxPolygon);

  return { bboxPolygon, boundingBox };
}

let coordinateArray: [number, number][] = [];
let liveCoorindateArray: [number, number][] = [];

let drawMode = false;
map.on("click", function (e) {
  if (coordinateArray.length < 2) {
    drawMode = true;
    coordinateArray.push([e.lngLat.lng, e.lngLat.lat]);

    if (coordinateArray.length === 1) {
      liveCoorindateArray.push(coordinateArray[0]);
    } else {
      liveCoorindateArray = [];
      generateLiveBbox();
    }

    setSourceData();
  } else {
    coordinateArray = [];
    liveCoorindateArray = [];
    generateLiveBbox();
    // coordinateArray.push([e.lngLat.lng,e.lngLat.lat])
    setSourceData();
    drawMode = false;
  }

  generateBbox();
});

map.on("mousemove", function (e) {
  const lng = e.lngLat.lng;
  const lat = e.lngLat.lat;

  if (drawMode) {
    liveCoorindateArray[1] = [lng, lat];
    const { bboxPolygon, boundingBox } = generateLiveBbox();

    const {type,properties,geometry} = bboxPolygon;
    boundingBox;

    const bboxdiv = document.getElementById("bbox");
    const bboxgeojsondiv = document.getElementById("bboxgeojson");

    if (bboxdiv) {
      bboxdiv.innerHTML = `[${boundingBox.join(", ")}]`;
    }

    if (bboxgeojsondiv) {
      bboxgeojsondiv.innerHTML = JSON.stringify({type,properties,geometry}, null, 2);
    }
  }
});
