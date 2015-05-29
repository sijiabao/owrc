(function () {

  // Global variables
  var tilesUrl = "https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png",
    map = null,
    tiles = null,
    closeTooltip = null,
    markers = [],
    options = {
      maxZoom: 5,
      minZoom: 3,
      zoomControl: false
    },
    statesLayer = null,
    popup = new L.Popup({ autoPan: false }),
    attributions = {
      attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
      '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
      'Imagery © <a href="http://mapbox.com">Mapbox</a>',
      id: 'examples.map-20v6611k'
    };

  // Init function to bootstrap the app.
  var init = function () {

    map = L.map('map', options).setView([31.7365746,-24.355225], 3);
    var layer = new L.StamenTileLayer('watercolor');
     map.addLayer(layer);
    //tiles = L.tileLayer(tilesUrl, attributions);
    //var layer = new L.StamenTileLayer('watercolor');
    //tiles.addTo(map);
    getData();
  };

  // Get the data from the json file
  var getData = function () {
    $.getJSON('data/split.json', renderDataToMap);
  };

  // Render the data to the map
  var renderDataToMap = function (data) {


    var LeafIcon = L.Icon.extend({
        options: {
          //shadowUrl: '../docs/images/leaf-shadow.png',
          iconSize:     [50, 50],
          shadowSize:   [0, 0],
          iconAnchor:   [22, 94],
          shadowAnchor: [4, 62],
          popupAnchor:  [-3, -76]
        }
      });

    var icons = [];
    var bounds = new L.LatLngBounds();
    var options = {
      nearbyDistance: 20,
      circleSpiralSwitchover: 100,
      keepSpiderfied: true,
      legWeight: 0
    }
    var oms = new OverlappingMarkerSpiderfier(map, options);

    var bounds = new L.LatLngBounds();

    for(var i=0; i < data.length; i++) {

        var datum = data[i];
        var loc = new L.LatLng(datum.Latitude, datum.Longitude);
        icons.push(new LeafIcon({iconUrl: './images/'+ (i + 1) +'.png'}));
        bounds.extend(loc);
        var marker = L.marker(loc, {icon: icons[i]}).bindPopup(getPopup(data[i], i+1));
        markers.push(marker)
        //marker.desc = datum.d;
        map.addLayer(marker);
        oms.addMarker(marker);

    }
    map.fitBounds(bounds);
  };

  var getPopup = function(data, i) {
    return '<div class="cont">' +
          // '  <div class="img">' +
          // '    <img src="../images/'+ i +'.png" alt="" height="50" width="50">' +
          // '  </div>' +
          '  <div class="left title">' +
          '    <h2> '+ data.Name +' </h2>' +
          '    <h3> '+ data.Occupation +' </h3>' +

          '  </div>' +

          '  <div class="clear"></div> ' +
          '  <div class="deatils">' +
          '    <h4>' + data.State + ', ' +  data.Country +'</h4>' +
          '    <h3>' + data.email+'</h3>' +
          '    <a href="'+ data.link +'">' + data.link + '</a>' +
          '  </div> <h3>About: </h3>' +
          '  <div class="desc">' +


              data.about +
          '  </div>' +
          '</div>'
  }



  // Initialize our application.
  init();

})();
