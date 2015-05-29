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
          shadowUrl: '../docs/images/leaf-shadow.png',
          iconSize:     [50, 50],
          shadowSize:   [0, 0],
          iconAnchor:   [22, 94],
          shadowAnchor: [4, 62],
          popupAnchor:  [-3, -76]
        }
      });

    var icons = [];
    console.log(data.length)
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
        icons.push(new LeafIcon({iconUrl: '../images/'+ (i + 1) +'.png'}));
        bounds.extend(loc);
        var marker = L.marker(loc, {icon: icons[i]}).bindPopup(getPopup(data[i], i+1));
        markers.push(marker)
        //marker.desc = datum.d;
        map.addLayer(marker);
        oms.addMarker(marker);

    }
    map.fitBounds(bounds);
    //var popup = new L.Popup({closeButton: false, offset: new L.Point(0.5, 0)});
    // oms.addListener('click', function(marker) {
    //   console.log(marker)
    //   //var id = markers[i]._icon.src.split['/'][4].split['.'][0]
    //   popup.setContent(marker.desc);
    //   popup.setLatLng(marker.getLatLng());
    //   //map.openPopup(popup);
    // });
    // oms.addListener('spiderfy', function(markers) {
    //   for (var i = 0, len = markers.length; i < len; i ++)
    //     var id = markers[i]._icon.src.split['/'][4].split['.'][0]
    //     markers[i].setIcon(new markers[id]);
    //   map.closePopup();
    // });
    // oms.addListener('unspiderfy', function(markers) {
    //   for (var i = 0, len = markers.length; i < len; i ++)
    //     markers[i].setIcon(new markers[id]);
    // });




    // var greenIcon = new LeafIcon({iconUrl: '../images/1.jpg'}),
    //   redIcon = new LeafIcon({iconUrl: '../images/2.jpg'}),
    //   orangeIcon = new LeafIcon({iconUrl: '../images/3.jpg'});


    // L.marker([data[0]['Latitude'], data[0]['Longitude']], {icon: greenIcon}).bindPopup("I am a green leaf.").addTo(map);
    // L.marker([51.495, -0.083], {icon: redIcon}).bindPopup("I am a red leaf.").addTo(map);
    // L.marker([51.49, -0.1], {icon: orangeIcon}).bindPopup("I am an orange leaf.").addTo(map);


    // statesLayer = L.geoJson(data, {
    //   style: getStyle,
    //   onEachFeature: onEachFeature
    // }).addTo(map);

    // barGraph("USA");
    // setTimeout(function(){bindEvents();}, 100);
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
          '    <h3>' + data.email+'</h3>' +
          '    <a href="'+ data.link +'">' + data.link + '</a>' +
          '  </div> <h3>About: </h3>' +
          '  <div class="desc">' +


              data.about +
          '  </div>' +
          '</div>'
  }


  var onEachFeature = function (feature, layer) {
    layer.on({
      click: updateSidebar,
      mousemove: showTooltip,
      mouseout: resetHighlight
    })
  };

  var resetHighlight = function() {
    closeTooltip = window.setTimeout(function() { map.closePopup(); }, 100);
  };

  var showTooltip = function(e) {
    var layer = e.target;
    popup.setLatLng(e.latlng);
    popup.setContent(getMapTooltip(layer.feature.properties));
    if(!popup._map) {
      popup.openOn(map);
    }
    window.clearTimeout(closeTooltip);
    layer.bringToFront();
  };

  var getMapTooltip = function(properties) {
    return "<h3>" + properties.name + "</h3> <h4> <small>Immigrants count – </small>"+ properties.total +"</h4>"
  };

  // Update the sidebar graph
  var updateSidebar = function (e) {
    if(e.target.feature.properties['isActive'] != true) {
      statesLayer.eachLayer(function(layer) {
        layer.feature.properties.isActive = false
      });

      statesLayer.setStyle(setDisableStyle);

      $('.current-state').text(e.target.feature.properties.name);
      e.target.setStyle(highlightOnClick(e));
      barGraph(e.target.feature.properties.name);
      e.target.feature.properties['isActive'] = true;
      pieChart($('.current-continent').text(), e.target.feature.properties.name);
    }
    else {
      statesLayer.eachLayer(function(layer) {
        layer.setStyle(getStyle(layer.feature))
      });
      $('.current-state').text("USA");
      e.target.feature.properties['isActive'] = false;
      barGraph("USA");
    }
  };

  var bindEvents = function() {

    $('.nv-bar').on('click', function(e){
      var index = $('.nv-bar').index(this);
      var continents = ['Europe', 'Asia', 'Africa', 'Americans', 'Oceania'];
      var currentContinent = continents[index];
      $('.current-continent').text(currentContinent);
      pieChart(currentContinent, $('.current-state').text());
    });
  };

  var pieChart = function(cont, state) {
    $.getJSON('data/sub-split.json', function(data){
      var filteredData = data[0][state][cont];
      renderPieChart(filteredData);
    });
  };


  var renderPieChart = function(data) {
    console.log(formatData(data));
    nv.addGraph(function() {
      var chart = nv.models.pieChart()
        .x(function(d) { return d.label })
        .y(function(d) { return d.value })
        .showLabels(true);

      d3.select("#pie-chart svg")
        .datum(formatData(data)[0].values)
        .transition().duration(350)
        .call(chart);

      return chart;
    });

  };

  // Disabled styles
  var setDisableStyle = function() {
    return {
      weight: 0,
      dashArray: '',
      fillOpacity: 0.3
    }
  };

  // Highlight styles
  var highlightOnClick = function() {
    return {
      weight: 1,
      color: '#fff',
      dashArray: '',
      fillOpacity: 1
    }
  };

  var barGraph = function (state) {
    $.getJSON('data/split.json', function (data) {
      renderBarGraph(data[0][state]);
    });
  };

  // Render the bar graph on the side
  var renderBarGraph = function (stateData) {
    nv.addGraph(function () {
      var chart = nv.models.discreteBarChart()
          .x(function (d) { return d.label })
          .y(function (d) { return d.value })
          .staggerLabels(false)
          .tooltips(true)
          .showValues(true);

      chart.yAxis
        .tickFormat(d3.format(',.0f'));

      d3.select('#bar-chart svg')
        .datum(formatData(stateData))
        .call(chart);

      nv.utils.windowResize(chart.update);
      return chart;
    });
  };

  // Prepare our data in a certain format
  var formatData = function (data) {

    var output = [
      {
        key: "Number of immigrants",
        values: []
      }
    ];

    for (var key in data) {
      output[0].values.push({
        "label": key,
        "value": data[key]
      })
    }
    return output;
  };

  // Util Methods
  var getStyle = function (feature) {
    return {
      fillColor: getColor(feature.properties.total),
      weight: 1,
      opacity: 0.9,
      color: 'white',
      dashArray: '3',
      fillOpacity: 0.9
    };
  };

  // Returns a color based on the scale
  // Refer https://github.com/mbostock/d3/wiki/Quantitative-Scales
  var getColor = function (value) {
    return d3.scale.linear()
      .domain([18568, 4314692]) // Min and Max values
      .range(['#fdbb84', '#d7301f'])(value)
  };

  // Initialize our application.
  init();

})();
