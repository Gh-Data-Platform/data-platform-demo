// layers

const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution:
    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
});

const googleSatellite = L.tileLayer(
  "https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}",
  {
    maxZoom: 19,
    attribution: '&copy; <a href="">google</a>',
  }
);

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

const baseLayers = {
  OpenStreetMap: osm,
  "OpenStreetMap.HOT": osmHOT,
  Google_Imagery: googleSatellite,
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
      color: getColor(feature.properties.landuse),
      dashArray: "3",
      fillOpacity: 0.7,
      fillColor: getColor(feature.properties.landuse),
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
  layers: [googleSatellite, parcelLayers],
});

const layerControl = L.control.layers(baseLayers, overlays).addTo(map);
createAlert();
// layerControl.addBaseLayer(googleSatellite, "Imagery");

const getGeojson = async function () {
  const response = await fetch("data/demo_plots_wp.geojson");
  return await response.json();
};

getGeojson().then((data) => {
  parcelLayers.addData(data);

  fillTableWithData(data.features);
});

map.addLayer(parcelLayers);

/** Seting up the Icons  */
new L.cascadeButtons(
  [
    {
      icon: "fas fa-home reset-to-home",
      command: () => {
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
      icon: "fa-solid fa-window-restore opentoolsbar ",
      items: [
        {
          icon: "fa-solid fa-table  toggleTableBtn",
          command: () => {
            tableCallback();
          },
        },
        {
          icon: "fa-solid fa-pen-to-square editortool",
          command: () => {},
        },
      ],
    },
  ],
  { position: "topleft", direction: "vertical" }
).addTo(map);

const setToolIconStyle = ({ className, color }) => {
  const element = document.querySelector(`.${className}`);
  element.style.color = `${color}`;
};

//Set and modify the ICons
setToolIconStyle({
  className: "toggleTableBtn",
  color: "#63E6BE",
});
setToolIconStyle({
  className: "opentoolsbar",
  color: "blue",
});
setToolIconStyle({
  className: "reset-to-home",
  color: "blue",
});

const animateIconOnHover = ({ className }) => {
  const element = document.querySelector(`.${className}`);

  element.addEventListener("mouseenter", () => {
    element.classList.add("fa-beat");
  });

  element.addEventListener("mouseleave", () => {
    element.classList.remove("fa-beat");
  });
};
// animate ICons Tools on Hover
animateIconOnHover({ className: "opentoolsbar" });
animateIconOnHover({ className: "toggleTableBtn" });
animateIconOnHover({ className: "editortool" });
animateIconOnHover({ className: "reset-to-home" });

/** */

const triggerClick = (e) => {
  zoomToFeature(e);
};

function zoomToFeature(e) {
  map.fitBounds(e.target.getBounds());
}

const popupfunction = (e) => {
  const {
    feature: {
      properties: { landsize, contact, landuse, owner, plotid, price },
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
      landuse === "Residential" ? "residential-theme" : "commercial-theme"
    }">
      <h2>${landuse}</h2>
    </div>
    <div class="card-body">
      <div class="card-text text-dark mb-2" > 
        <h5><i class="fa-regular fa-id-badge fa-lg pe-3" style="color: #B197FC;"></i> <span class="cost-text ">${plotid}</span> </h5><br>
      </div>
      <div class="card-text text-dark mb-2" > 
      <h5><i class="fa-solid fa-users pe-3" style="color: #B197FC;"></i> <span class="">${owner}</span></h5><br>
      </div>
      <div class="card-text text-dark mb-2" > 
      <h5><i class="fa-solid fa-address-card pe-3" style="color: #B197FC;"></i><span class="">${contact}</span></h5><br>
      </div>
      <div class="card-text text-dark mb-2"> 
      <h5><i class="fa-solid fa-location-crosshairs pe-3" style="color: #B197FC;"></i> <span class="acres-text">${landsize} acres</span></h5><br>
      </div>
      <div class="card-text text-dark mb-2"> 
      <h5><i class="fa-solid fa-cent-sign pe-3" style="color: #B197FC;"></i> <span class="acres-text">${price.toLocaleString()} Gh₵</span></h5><br>
      </div>
    </div>
  </div>
`;
};

const tableCallback2 = () => {
  const tableDiv = document.querySelector(".fixed-bottom");
  tableDiv.classList.toggle("d-none");
};

function createAlert() {
  // Remove any existing alert
  const existingAlert = document.querySelector(".disclaimer-alert");
  if (existingAlert) {
    existingAlert.remove();
  }

  // Create the Bootstrap alert element
  const alert = document.createElement("div");
  alert.className =
    "alert alert-warning alert-dismissible fade show disclaimer-alert";
  alert.style.zIndex = "1050";
  alert.style.position = "relative";
  alert.setAttribute("role", "alert");
  alert.innerHTML = `Please note: The data presented here is for demonstration purposes only.
  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>`;

  // Assuming you have a div with the class 'map-container' that wraps your map
  const mapContainer = document.querySelector(".map-container");
  if (mapContainer) {
    mapContainer.prepend(alert);
  } else {
    // As a fallback, add it to the beginning of the body if no map container is found
    document.body.prepend(alert);
  }
}

// Adjusted tableCallback function to include createAlert call
const tableCallback = () => {
  const tableDiv = document.querySelector(".fixed-bottom");
  tableDiv.classList.toggle("d-none");

  // Show the alert only if the table is now visible
  if (!tableDiv.classList.contains("d-none")) {
    createAlert();
  }
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
      <button class="btn btn-primary close-table">  <i class="fa-solid fa-arrow-right-from-bracket"></i> </button>
        </div>
        <div class="card-body" style="max-height: 300px; overflow-y: auto;">
          <table class="table table-bordered table-hover">
            <thead class="table-info fw-bold">
              <tr>
               <th scope="col">ID</th>
                <th scope="col"><i class="fa-solid fa-users pe-3" style="color: #B197FC;"></i>Owner Name</th>
                <th scope="col"><i class="fa-solid fa-building pe-3" style="color: #B197FC;"></i>Landuse</th>
                <th scope="col"><i class="fa-solid fa-address-card pe-3" style="color: #B197FC;"></i>Contact</th>
                <th scope="col"> <i class="fa-solid fa-layer-group pe-3 " style="color: #B197FC;"></i> size [acres]</th>
                <th scope="col"> <i class="fa-solid fa-cent-sign pe-3 " style="color: #B197FC;"></i> Price </th>
                <th scope="col"><i class="fa-solid fa-location-crosshairs pe-3" style="color: #B197FC;"></i>Location</th>
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
  console.log("dataArray");
  console.log(dataArray);
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
    const {
      geometry,
      properties: { landsize, contact, landuse, owner, plotid, price },
    } = dataItem;

    // const geojsonString = JSON.stringify(geometry);
    const newRow = document.createElement("tr");
    // newRow.classList.add('table-primary')
    newRow.innerHTML = `
        <td>${plotid}</td>
        <td>${owner}</td>
        <td>${landuse}</td>
        <td>${contact}</td>
        <td>${landsize.toFixed(2)}</td>
        <td>${price.toLocaleString()}</td>
        <td class="ps-5"> <i class="fa-solid fa-location-crosshairs fa-beat-fade clickable-icon" style="color: #63E6BE;"></i></td>
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

  const geoJSONCoordinates = dataItem.geometry.coordinates[0][0];
  const leafletCoordinates = geoJSONCoordinates.map(([longitude, latitude]) =>
    L.latLng(latitude, longitude)
  );
  map.flyToBounds(leafletCoordinates);

  const fixedBottomDiv = document.querySelector(".fixed-bottom");
  fixedBottomDiv.classList.add("d-none");
}
