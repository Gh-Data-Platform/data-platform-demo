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
      <h2>${land_use}</h2>
    </div>
    <div class="card-body">
      <div class="card-text text-dark mb-2" > 
        <h5><i class="fa-regular fa-id-badge fa-lg pe-3" style="color: #B197FC;"></i> <span class="cost-text ">${plotid}</span> </h5><br>
      </div>
      <div class="card-text text-dark mb-2" > 
      <h5><i class="fa-solid fa-users pe-3" style="color: #B197FC;"></i> <span class="">${owner_name}</span></h5><br>
      </div>
      <div class="card-text text-dark mb-2" > 
      <h5><i class="fa-solid fa-address-card pe-3" style="color: #B197FC;"></i><span class="">${contact}</span></h5><br>
      </div>
      <div class="card-text text-dark mb-2"> 
      <h5><i class="fa-solid fa-location-crosshairs pe-3" style="color: #B197FC;"></i> <span class="acres-text">${AreaAcres} acres</span></h5><br>
      </div>
    </div>
  </div>
`;
};

const tableCallback = () => {
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
      properties: { AreaAcres, contact, land_use, owner_name, plotid },
    } = dataItem;

    // const geojsonString = JSON.stringify(geometry);
    const newRow = document.createElement("tr");
    // newRow.classList.add('table-primary')
    newRow.innerHTML = `
        <td>${plotid}</td>
        <td>${owner_name}</td>
        <td>${land_use}</td>
        <td>${contact}</td>
        <td>${AreaAcres.toFixed(2)}</td>
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
