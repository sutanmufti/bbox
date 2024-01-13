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
  center: [-0.111458, 51.506923,],
  zoom: 13,
});

const nav = new mapboxgl.NavigationControl();
map.addControl(nav, 'bottom-left');

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
    'id': 'myLabelLayer',
    'type': 'symbol',
    'source': 'bboxlive',
    'layout': {
        'text-field': 'My label', // Replace with the property name from your GeoJSON
        'text-size': 12,
        'text-anchor': 'center',
        'text-offset': [0, 0],
        "text-allow-overlap": true,
        "text-ignore-placement": true,
    },
    'paint': {
        'text-color': '#000000'
    }
});

map.addLayer({
  'id': 'myLabelLayer2',
  'type': 'symbol',
  'source': 'boxfeature',
  'layout': {
      'text-field': 'My label', // Replace with the property name from your GeoJSON
      'text-size': 12,
      'text-anchor': 'center',
      'text-offset': [0, 0],
      "text-allow-overlap": true,
      "text-ignore-placement": true,
      "visibility": "none"
  },
  'paint': {
      'text-color': '#000000'
  }
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

  return { bboxPolygon, boundingBox };
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


    if (coordinateArray.length === 2) {

      const { bboxPolygon, boundingBox } = generateBbox();
      
      const {format, value} = formatNumber(turf.area(bboxPolygon))
      const {format: formatAcre, value: valueAcre} = formatNumberAcre(turf.area(bboxPolygon))
      
      map.setLayoutProperty("myLabelLayer2", 'visibility', `visible`);
      map.setLayoutProperty("myLabelLayer2", 'text-field', `area: ${value} ${format} / ${valueAcre} ${formatAcre}`);
    }

    

    

    setSourceData();
    
  } else {
    coordinateArray = [];
    liveCoorindateArray = [];
    generateLiveBbox();
    // coordinateArray.push([e.lngLat.lng,e.lngLat.lat])
    setSourceData();
    map.setLayoutProperty("myLabelLayer2", 'visibility', `none`);
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

    const {format, value} = formatNumber(turf.area(bboxPolygon))
    const {format: formatAcre, value: valueAcre} = formatNumberAcre(turf.area(bboxPolygon))

    map.setLayoutProperty("myLabelLayer", 'text-field', `area: ${value} ${format} / ${valueAcre} ${formatAcre}`);

    
  
  }
});



function copyDivTextContent(divId: string): void {
  // Find the div element by its ID
  const div = document.getElementById(divId);
  if (!div) {
      console.error(`No div found with id: ${divId}`);
      return;
  }

  // Create a temporary textarea element to copy the text
  const textarea = document.createElement("textarea");
  textarea.value = div.textContent || '';
  document.body.appendChild(textarea);

  // Select and copy the text
  textarea.select();
  document.execCommand('copy');

  // Clean up by removing the temporary textarea
  document.body.removeChild(textarea);

  alert(`Copied to Clipboard`);
}

document.getElementById("copybbox")?.addEventListener("click", () => {
  copyDivTextContent("bbox");
});

document.getElementById("copygeojson")?.addEventListener("click", () => {
  copyDivTextContent("bboxgeojson");
});



function formatNumber(num: number) {

  const valueToBeFormated = (num > 10000) ? num / 10000 : num;

  const value =valueToBeFormated.toLocaleString('en-US', {
    maximumFractionDigits: 2, // Change this value to set the number of decimal places
    minimumFractionDigits: 2 // Ensures decimal part is always shown
  });

  const format = (num > 10000) ?  'Hectare' : 'm²';
  return {value, format}
}

function formatNumberAcre(num: number) {

  const valueToBeFormated = num / 4047

  const value =valueToBeFormated.toLocaleString('en-US', {
    maximumFractionDigits: 2, // Change this value to set the number of decimal places
    minimumFractionDigits: 2 // Ensures decimal part is always shown
  });

  const format = 'acre'
  return {value, format}
}