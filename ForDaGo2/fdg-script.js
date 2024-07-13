const searchBtn = document.querySelector('.searchbtn');
const searchBar = document.querySelector('.searchbar');
const searchList = document.querySelector('.searchList');
const clearList = document.getElementById("clearDataLoc");
const fade_in_msg = document.querySelector('.msgpane');
const msgbox = document.getElementById("msghere");
const trackpin = document.querySelector('.pinbtn');
let map, searchManager;
let clickCount = 0;
let locObj;
let locations = []; //object for latitude & longitude
let delpushpins = []; // object for removing pins
let placeData = []; //object for table 
let TraceCont = [];// object fot tracking data
let noRepeat = []; // object for index repeated
let msgData = []; //object for error messages
const bingApi = 'Ajsa8ckEGwA2lbTuYiKgKz41tu4umVSf4KFBJZD8KdNJmG0XvxSjNFRULvq3Z-sG'; //BING MAP API KEY

//TEST TO GET YOUR LOCATION


function getLocation() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
        console.error("Geolocation is not supported in this browser.");
    }
}

trackpin.addEventListener('click', getLocation);


function successCallback(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const location = new Microsoft.Maps.Location(latitude, longitude);
    sharedPushpin(location);
    map.setView({
        center: location,
        zoom: 25
    });
}


function sharedPushpin(location, label = 0, color = 'green') {
    const yourpin = new Microsoft.Maps.Pushpin(location, {
        title: `You're here!`,
        subTitle: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        text: label,
        color: color
    });

    Microsoft.Maps.Events.addHandler(yourpin, 'click', () => {
        removePushpin(yourpin, location);
    });
    map.entities.push(yourpin);
   
}


function errorCallback(error) {
    console.error(`Geolocation error: ${error.message}`);
    alert("Failed to get your location.");
}

// ENDS HERE
//data-lat="14.600500431473876" data-lng="120.98560881614685"

function initMap() { 
    map = new Microsoft.Maps.Map('.mapcontainer', {
        credentials: bingApi,
        center: new Microsoft.Maps.Location(14.600500431473876, 120.98560881614685),
        mapTypeId: Microsoft.Maps.MapTypeId.road,
        zoom: 15
    });
    loadSearchModule();
    attachMapClickHandler();
}

function loadSearchModule() {
    Microsoft.Maps.loadModule('Microsoft.Maps.Search', () => {
        searchManager = new Microsoft.Maps.Search.SearchManager(map);
    });
}

searchBtn.addEventListener("click", () => {
    if (map) {
        map.entities.clear();
        geocodeQuery(searchBar.value);
        searchList.innerHTML = '';
    } else {
        console.error("Map is not initialized.");
    }
});

function geocodeQuery(query) {
    if (searchManager) {
        const searchRequest = {
            where: query,
            callback: (r) => {
                if (r && r.results && r.results.length > 0) {
                    const location = r.results[0].location;
                    searchedPushpin(location);
                    map.setView({
                        center: location,
                        zoom: 25,
                        bounds: r.results[0].bestView
                    });
                } else {
                   msgData.push("No results found for the query.");
                }
            },
            errorCallback: (e) => {
                msgData.push("Error in search query.");
                console.error("Geocode error: ", e);
            }
            
        };
        searchManager.geocode(searchRequest);
    } else {
        console.error("SearchManager is not initialized.");
    }
}

function searchedPushpin(location, color = 'green'){
    const search_pin = new Microsoft.Maps.Pushpin(location, {
        title: `PLACE LOCATED`,
        subTitle: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        color: color
    });
    
    Microsoft.Maps.Events.addHandler(search_pin, 'click', () => {
        removePushpin(search_pin, location);
    });
    
    map.entities.push(search_pin);
}
function attachMapClickHandler() {
    Microsoft.Maps.Events.addHandler(map, 'click', (e) => {
        const point = e.location;
        if (point && clickCount < 100) {
            addPushpin(point, clickCount);
            addLocationToArray(point);
            clickCount++;
        } else if (clickCount >= 100) {
            msgData.push("Maximum of 100 points reached.");
        }
    });
}

function addPushpin(location, label = 0) {
    const pin = new Microsoft.Maps.Pushpin(location, {
        title: ``,
        subTitle: `${location.latitude.toFixed(4)}, ${location.longitude.toFixed(4)}`,
        text: label
    });

    Microsoft.Maps.Events.addHandler(pin, 'click', () => {
        removePushpin(pin, location);
    });
    map.entities.push(pin);
   
}


function addLocationToArray(location) {
    locObj = {
        latitude: location.latitude,
        longitude: location.longitude
    };
    locations.push(locObj);
  //  console.log(`Point ${locations.length} added:`, locObj);
    updateLocationCount();
}



function updateLocationCount() {
    const pinpointList = document.getElementById("pointOption");
    pinpointList.innerHTML = ""; 

    locations.forEach((locObj, index) => {
        const option = document.createElement("OPTION");
        option.textContent = `Location ${index + 1}`;
        option.value = `Location ${index + 1}`;
        option.setAttribute("data-lat", locObj.latitude);
        option.setAttribute("data-lng", locObj.longitude);
        pinpointList.appendChild(option);
    });
}


function updatePushpinsAndDropdown() {
    map.entities.clear();
    var pinlist = document.getElementById("pointOption");
    pinlist.innerHTML = "";
    var defaultOption = document.createElement("OPTION");
    defaultOption.text = "select pin points";
    pinlist.add(defaultOption);
    locations.forEach((locObj, index) => {
        const pin = new Microsoft.Maps.Pushpin(new Microsoft.Maps.Location(locObj.latitude, locObj.longitude), {
            title: ``,
            subTitle: `${locObj.latitude.toFixed(4)}, ${locObj.longitude.toFixed(4)}`,
            text: index
        });

        Microsoft.Maps.Events.addHandler(pin, 'click', () => {
            removePushpin(pin, locObj);
        });
        map.entities.push(pin);
        var option = document.createElement("OPTION");
        option.text = `Location ${index + 1}`;
        option.value = `Location ${index + 1}`;
        option.setAttribute("data-lat", locObj.latitude);
        option.setAttribute("data-lng", locObj.longitude);
        pinlist.add(option);
    });
}


function onDropdownChange() {
    var dropdown = document.getElementById("pointOption");
    var selectedOption = dropdown.options[dropdown.selectedIndex];
    var latitude = selectedOption.getAttribute("data-lat");
    var longitude = selectedOption.getAttribute("data-lng");
    console.log("Selected Latitude: " + latitude);
    console.log("Selected Longitude: " + longitude);
    const location = new Microsoft.Maps.Location(latitude, longitude);
    viewOption(location);
    map.setView({
        center: location,
        zoom: 23
    });
}



function viewOption(location) {
    const viewpin = new Microsoft.Maps.Pushpin(location, {
        title: `+`,
        subTitle: `${location.latitude.toFixed(4)},\n ${location.longitude.toFixed(4)}`
    });

    Microsoft.Maps.Events.addHandler(viewpin, 'click', () => {
        removePushpin(viewpin, location);
    });
    map.entities.push(viewpin);
}



function removePushpin(pin, location) {
    map.entities.remove(pin);
    const indexToRemove = locations.findIndex(
        loc => loc.latitude === location.latitude && loc.longitude === location.longitude
    );
    

    if (indexToRemove !== -1) {
        locations.splice(indexToRemove, 1);
    }
    updatePushpinsAndDropdown();
}
clearList.addEventListener('click',() =>{
    var plist = document.getElementById("pointOption");
    map.entities.clear();
    clickCount = 0;
    locations = [];    
    plist.innerHTML = "select pin points";
});
    


window.onload = function() {
    var dropdown = document.getElementById("pointOption");
    dropdown.addEventListener("change", onDropdownChange);
}

// functions for table

const addDataToTab = document.getElementById("addDataLoc");
const table = document.getElementById('crud-table');

addDataToTab.addEventListener('click', addDataToTable);

function addDataToTable(event) {
    event.preventDefault();
    const selectElement = document.getElementById("pointOption");
    const selectedOption = selectElement.options[selectElement.selectedIndex];

    const namelabel = selectElement.value;
    const latitude = selectedOption.getAttribute("data-lat");
    const longitude = selectedOption.getAttribute("data-lng");

    if (latitude === null || longitude === null) {
        msgData.push("Please select a pin");
        messageCall();
        return;
    }

    if (isDuplicate(latitude, longitude)) {
        msgData.push('Location already exists');
        messageCall();
        return;
    }
    
    const record = { namelabel, latitude, longitude};
    const index = addDataToTab.dataset.index;

    if (index) {
        placeData[index] = record;
        addDataToTab.removeAttribute('data-index');
    } else {
        const location = new Microsoft.Maps.Location(parseFloat(latitude), parseFloat(longitude));
        viewCell(location, namelabel,'red');
        placeData.push(record);

    }
    renderTable();
}

function isDuplicate(latitude, longitude) {
    return placeData.some(record => 
        record.latitude === latitude && record.longitude === longitude
    );
}

function renderTable() {
    const table = document.getElementById('crud-table');
    table.innerHTML = '';

    placeData.forEach((record, i = 0) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${record.namelabel}</td>
            <td hidden>${i}</td>
            <td hidden>${record.latitude}</td>
            <td hidden>${record.longitude}</td>
            <td>
               <span onclick="editCoordination(${i})" class="material-symbols-outlined">edit_square</span>
               <span onclick="viewCoordination(${i})"class="material-symbols-outlined">visibility</span> 
               <span onclick="measurePoints(${i})"class="material-symbols-outlined" id="icon-action-this">equalizer</span>  
               <span onclick="delCoordination(${i})"class="material-symbols-outlined">delete</span>
            </td>
        `;
        table.appendChild(row);
    });
}

function viewCoordination(index) {
    const record = placeData[index];
    //initMap();
    const location = new Microsoft.Maps.Location(parseFloat(record.latitude), parseFloat(record.longitude));
    viewCell(location, record.namelabel, 'red');
    map.setView({
        center: location,
        zoom: 18
    });
}

function viewCell(location, label, pincolor = 'red') {
    const viewData = new Microsoft.Maps.Pushpin(location, {
        title: `${label}`,
        color: pincolor
    });

    map.entities.push(viewData);
    delpushpins.push({ label, pincolor, pin: viewData });
}

function delCoordination(index, pincolor = 'red') {
    const pushpinIndex = delpushpins.findIndex(p => p.pincolor === pincolor);
    
        const pushpin = delpushpins[pushpinIndex].pin;
        initMap();
        map.entities.remove(pushpin);
        delpushpins.splice(pushpinIndex, 1);
        placeData.splice(index, 1);
        renderTable();
}

// FOR SEARCHING FUNCTION
searchBar.addEventListener('input', debounce(function() {
    const query = searchBar.value.trim();
    if (query.length > 0) {
      fetchSuggestions(query);
    } else {
      clearSuggestions();
    }
}, 300)); 


function fetchSuggestions(query) {
    const url = `https://dev.virtualearth.net/REST/v1/Autosuggest?query=${encodeURIComponent(query)}&key=${'Ajsa8ckEGwA2lbTuYiKgKz41tu4umVSf4KFBJZD8KdNJmG0XvxSjNFRULvq3Z-sG'}`;
  
    fetch(url)
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then(data => {
      const addresses = data.resourceSets[0].resources[0].value.map(getAddress);
      displaySuggestions(addresses); 
      //console.log(addresses);
    })
    .catch(error => console.error('Error:', error));
  }

function getAddress(location) {
    return location.address.formattedAddress;
}


function displaySuggestions(suggestions) {
    searchList.innerHTML = ''; 
    
    suggestions.forEach((location, j) => {
      const li = document.createElement('ul');
      li.style.listStyleType = "none";
     
      li.innerHTML = `
         <li onclick="clickData(${j})" data-map-location="${location}" class="searchInfo">
         ${location}
         </li>
      `; 
      searchList.appendChild(li);
    });
  }
  
function clearSuggestions() {
    searchList.innerHTML = '';
}
  
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      }
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
}

function clickData(index){
    const listOfData = document.querySelectorAll('.searchInfo');
    const callSearch = [];
    listOfData.forEach((info) => {
        callSearch.push(info.getAttribute("data-map-location"));
    });
    
    if(index >= 0 && index <= callSearch.length){
      searchBar.value = callSearch[index];
    }
}

//FOR TRACING FUNCTION

function measurePoints(index) {
    const clickEffect = document.querySelectorAll('#icon-action-this');

    if (index >= 0 && index < clickEffect.length && !noRepeat.includes(index)) {
        noRepeat.push(index);
        clickEffect[index].classList.add('glowEffect');

        if (TraceCont.length < 2) {
            TraceCont.push(placeData[index]);
        }

        if (TraceCont.length === 2) {
            console.log("Location tracing starts...");
            msgData.push(`Location A: ${TraceCont[0].latitude}, ${TraceCont[0].longitude}\nLocation B: ${TraceCont[1].latitude}, ${TraceCont[1].longitude}`);
            messageCall();
            calculateDistance();
            
            TraceCont = [];
            noRepeat = [];
            
            clickEffect.forEach(effect => {
                effect.classList.remove('glowEffect');
            });
        }
    } else {
        msgData.push("Clicking error or repeated location.");
        messageCall();
        clickEffect.forEach(effect => {
            effect.classList.remove('glowEffect');
        });
    }
}


//COMPUTATION FOR TRACING
function calculateDistance() {
    initMap();
    if (TraceCont.length >= 2) {
        const loc_A = TraceCont[0];
        const loc_B = TraceCont[1];
        const locationDistance = haversineDistance(loc_A, loc_B);
        drawRouteBetweenPoints(loc_A, loc_B);
        console.log(`Distance between points: ${locationDistance.toFixed(2)} km`)
    } else {
        msgData.push("At least two locations are required to calculate distance.");
        messageCall();
    }
  
}

function haversineDistance(loc1, loc2) {
    const R = 6371; 
    const lat1 = loc1.latitude * (Math.PI / 180); 
    const lon1 = loc1.longitude * (Math.PI / 180);
    const lat2 = loc2.latitude * (Math.PI / 180);
    const lon2 = loc2.longitude * (Math.PI / 180);

    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;

    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; 
}

function drawRouteBetweenPoints(loc1, loc2) {
    const origin = `${loc1.latitude},${loc1.longitude}`;
    const destination = `${loc2.latitude},${loc2.longitude}`;
    console.log(`${origin},${destination}`);
    haversineDistance(origin,destination);

    const routeRequestUrl = `https://dev.virtualearth.net/REST/V1/Routes/Driving?wp.0=${origin}&wp.1=${destination}&key=Ajsa8ckEGwA2lbTuYiKgKz41tu4umVSf4KFBJZD8KdNJmG0XvxSjNFRULvq3Z-sG&routePathOutput=Points`;

    fetch(routeRequestUrl)
        .then(response => response.json())
        .then(data => {
            if (data.resourceSets.length > 0 && data.resourceSets[0].resources.length > 0) {
                const route = data.resourceSets[0].resources[0];
                const routePoints = route.routePath.line.coordinates.map(coord => new Microsoft.Maps.Location(coord[0], coord[1]));

                const routeLine = new Microsoft.Maps.Polyline(routePoints, {
                    strokeColor: 'red',
                    strokeThickness: 2.5
                });

                map.entities.push(routeLine);

                const calculatedRoute = route.travelDistance;

                msgData.push(`The Route distance between ${loc1.namelabel} & ${loc2.namelabel} is ${calculatedRoute.toFixed(2)} km \n`);
                messageCall();
            } else {
                msgData.push("No route found between the points.");
                messageCall();
            }
        })
        .catch(error => console.error("Error fetching route:", error));
}

//edit table 

const closeForm = document.querySelector('.editform');
const editForm = document.getElementById("myForm");
const editInput = document.getElementById("modify-name"); 
const updateInput = document.getElementById("updateName");

function editCoordination(index) {
    closeForm.style.display = "flex";
    const changerecord = placeData[index];
    editInput.value = changerecord.namelabel;
    updateInput.dataset.index = index;
}

closeForm.addEventListener('click', function(event) {
    if (event.target === closeForm) {
        closeForm.style.display = "none";
    }
});

editForm.addEventListener('submit', function(event) {
    event.preventDefault();
    saveRecord();
});

function saveRecord() {
    const newname = editInput.value;
    const index = updateInput.dataset.index;

    if (index !== undefined) {
        placeData[index].namelabel = newname;
    } else {
        placeData.push({ namelabel: newname });
    }

    editInput.value = '';
    closeForm.style.display = "none";
    updateInput.removeAttribute('data-index');
    initMap();
    
    renderTable();
}

function messageCall(){
    fade_in_msg.style.display = "flex";
    msgData.forEach((GetMessage)=>{
        console.log(GetMessage);
        msgbox.textContent = GetMessage; 
    });
    
}

fade_in_msg.addEventListener('click', function(event) {
    if (event.target === fade_in_msg) {
        fade_in_msg.style.display = "none";
        msgData = [];
    }
});



