console.log("Hello App");

// layers

const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

const osmHOT = L.tileLayer(
  "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
  {
    maxZoom: 19,
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Tiles style by <a href="https://www.hotosm.org/" target="_blank">Humanitarian OpenStreetMap Team</a> hosted by <a href="https://openstreetmap.fr/" target="_blank">OpenStreetMap France</a>',
  }
);

const USGS_USImageryTopo = L.tileLayer(
  "https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}",
  {
    maxZoom: 19,
    attribution:
      'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>',
  }
);
var Esri_WorldImagery = L.tileLayer(
  "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
  {
    attribution:
      "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
  }
);

const baseLayers = {
  OpenStreetMap: osm,
  "OpenStreetMap.HOT": osmHOT,
  Esri_WorldImagery: Esri_WorldImagery,
};

const getColor = (option) => {
  switch (option) {
    case "Residential":
      return "#DAA06D";
    case "Commercial":
      return "#473AFC";
  }
};

const parcelLayers = L.geoJSON(null, {
  style: function (feature) {
    return {
      weight: 3,
      opacity: 1,
      color: getColor(feature.properties.land_use),
      dashArray: "3",
      fillOpacity: 0.7,
      fillColor: getColor(feature.properties.land_use),
    };
  },
  onEachFeature: function (feature, layer) {
    if (feature.properties) {
      layer.on({
        click: triggerClick,
      });
      layer.bindPopup(popupfunction, {});
    }
  },
});

const overlays = {
  parcels: parcelLayers,
};

let mapOptions = {
  center: [6.1459, -0.9057],
  zoom: 10,
};

const map = L.map("map", {
  center: [6.1459, -0.9057],
  zoom: 10,
  layers: [osm, parcelLayers],
});

const layerControl = L.control.layers(baseLayers, overlays).addTo(map);

layerControl.addBaseLayer(USGS_USImageryTopo, "Imagery");

const getGeojson = async function () {
  const response = await fetch("data/demo_plots.geojson");
  return await response.json();
};

getGeojson().then((data) => {
  console.log("data");
  console.log(data);
  parcelLayers.addData(data);

  fillTableWithData(data.features);
});

map.addLayer(parcelLayers);

/** */
new L.cascadeButtons(
  [
    {
      icon: "fas fa-home reset-to-home",
      command: () => {
        console.log("new ");
        document
          .querySelector(".reset-to-home")
          .addEventListener("click", function () {
            // Zoom to the initial center and zoom level
            map.setView(mapOptions.center, mapOptions.zoom);
          });
      },
    },
  ],
  { position: "topleft", direction: "vertical" }
).addTo(map);
new L.cascadeButtons(
  [
    {
      icon: "fa-solid fa-window-restore",
      items: [
        {
          icon: "fa-solid fa-table toggleTableBtn",
          command: () => {
            tableCallback();
          },
        },
        {
          icon: "fa-solid fa-pen-to-square",
          command: () => {
            console.log("hola");
          },
        },
      ],
    },
  ],
  { position: "topleft", direction: "vertical" }
).addTo(map);

// Hide the table on map load

// document.addEventListener("DOMContentLoaded", function () {
//   // Hide the table on DOMContentLoaded
//   const fixedBottomDiv = document.querySelector(".fixed-bottom");
//   fixedBottomDiv.classList.add("d-none");
// });

/** */

const triggerClick = (e) => {
  console.log("clicked");

  zoomToFeature(e);
};

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

const popupfunction = (e) => {
  console.log("inside pop up function");
  //   console.log(e);
  const {
    feature: {
      properties: { AreaAcres, contact, land_use, owner_name, plotid },
    },
  } = e;

  const styles = `
  <style>
    .residential-theme {
      background: linear-gradient(to right, #86A8E7, #91EAE4);
    }

    .commercial-theme {
      background: linear-gradient(to right, #FFD86F, #FC6262);
    }

    .cost-text {
      color: #2ecc71; /* Green color for cost */
    }

    .acres-text {
      color: #3498db; /* Blue color for acres */
    }
  </style>
`;

  document.head.insertAdjacentHTML("beforeend", styles);

  return `
  <div class="card frosted-card mb-3" style="max-width: 18rem; height: 100%; background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); border-radius: 15px; overflow: hidden; border: none;">
    <div class="card-header ${
      land_use === "Residential" ? "residential-theme" : "commercial-theme"
    }">
      <h4>${land_use}</h4>
    </div>
    <div class="card-body">
      <p class="card-text text-dark" style="margin-bottom: 1rem;">
        <i class="bi bi-currency-dollar"></i> <span class="cost-text">${plotid}</span> (Cost)<br>
        <i class="bi bi-person"></i> ${owner_name}<br>
        <i class="bi bi-telephone"></i> ${contact}<br>
        <i class="bi bi-ruler"></i> <span class="acres-text">${AreaAcres} acres</span>
      </p>
    </div>
  </div>
`;
};

const tableCallback = () => {
  console.log("Table call back");

  const tableDiv = document.querySelector(".fixed-bottom");
  tableDiv.classList.toggle("d-none");
};

function createCardTemplate() {
  return `
      <div class="card frosted-card mb-3" style="
        height: 100%;
        background: rgba(255, 255, 255, 0.2);
        backdrop-filter: blur(10px);
        border-radius: 15px;
        overflow: hidden;
        border: none;
      ">
      <div class="card-header d-flex justify-content-between align-items-center">
      <h4>Property Listings</h4>
      <button class="btn btn-primary close-table "><i class="fa-solid fa-arrow-right-from-bracket"></i></button>
        </div>
        <div class="card-body" style="max-height: 300px; overflow-y: auto;">
          <table class="table table-bordered table-hover">
            <thead class="table-info fw-bold">
              <tr>
                <th scope="col">Owner Name</th>
                <th scope="col">Landuse</th>
                <th scope="col">Contact</th>
                <th scope="col">size</th>
                <th scope="col">Price</th>
                <th scope="col">Location</th>
              </tr>
            </thead>
            <tbody>
              <!-- Data rows will be dynamically added here -->
            </tbody>
          </table>
        </div>
      </div>
    `;
}

function fillTableWithData(dataArray) {
  const fixedBottomDiv = document.querySelector(".fixed-bottom");

  fixedBottomDiv.innerHTML = "";

  const cardTemplate = createCardTemplate();
  fixedBottomDiv.innerHTML = cardTemplate;

  document.querySelector(".close-table").addEventListener("click", () => {
    fixedBottomDiv.classList.add("d-none");
  });

  const tableBody = fixedBottomDiv.querySelector(".card-body tbody");

  // Iterate over the data array and create a row for each item
  dataArray.forEach((dataItem) => {
    console.log("dataItem");
    const {
      geometry,
      properties: { AreaAcres, contact, land_use, owner_name, plotid },
    } = dataItem;

    console.log(dataItem);
    console.log("Geometry");
    console.log(geometry);
    const geojsonString = JSON.stringify(geometry);
    const newRow = document.createElement("tr");
    // newRow.classList.add('table-primary')
    newRow.innerHTML = `
        <td>${owner_name}</td>
        <td>${land_use}</td>
        <td>${contact}</td>
        <td>${AreaAcres}</td>
        <td>${plotid}</td>
        <td><i class="bi bi-geo-alt clickable-icon"></i></td>
      `;
    newRow.querySelector(".clickable-icon").dataset.item =
      JSON.stringify(dataItem);
    tableBody.appendChild(newRow);
  });
  const clickableIcons = fixedBottomDiv.querySelectorAll(".clickable-icon");
  clickableIcons.forEach((icon) => {
    icon.addEventListener("click", handleClick);
  });
}

// Event handler function
function handleClick(e) {
  const dataItem = JSON.parse(e.target.dataset.item);
  console.log(dataItem);

  const geoJSONCoordinates = dataItem.geometry.coordinates[0][0];
  const leafletCoordinates = geoJSONCoordinates.map(([longitude, latitude]) =>
    L.latLng(latitude, longitude)
  );
  map.flyToBounds(leafletCoordinates);

  const fixedBottomDiv = document.querySelector(".fixed-bottom");
  fixedBottomDiv.classList.add("d-none");
}
