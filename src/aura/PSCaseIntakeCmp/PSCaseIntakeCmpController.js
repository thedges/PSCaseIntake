({
	doInit: function(component, event, helper) {
        console.log('doInit...');

        // hack to prevent scrolling of screen for rangeslider JS component
		document.addEventListener('touchmove', function(e) { 
			if (e.target.classList.contains('map') || e.target.classList.contains('leaflet-interactive'))
			{
			e.preventDefault(); 
		}
		}, { passive:false });
        
        helper.getTypes(component);
        
    },
    jsLoaded: function(component, event, helper) {
        console.log('jsLoaded...');
        
        helper.setRuntimeEnv(component);
        
        setTimeout(function() {
            var markersLayer = new L.LayerGroup();
            var markersLayerList = [];
            markersLayerList.push(markersLayer);
            
            var map = L.map('map', {
                zoomControl: false,
                tap:false
            }).setView([parseFloat(component.get("v.mapCenterLat")), parseFloat(component.get("v.mapCenterLng"))], component.get("v.mapZoomLevel"));
            //var map = L.map('map', { zoomControl: false }).setView([location.coords.latitude, location.coords.longitude], 14);
            L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: 'Tiles © Esri'
            }).addTo(map);
            component.set("v.map", map);
            
            var crosshairIcon = L.icon({
                //iconUrl: '/dev/resource/mapCrosshair',
                iconUrl: $A.get('$Resource.mapCrosshair'),
                iconSize: [200, 200] // size of the icon
            });
            console.log('crosshairIcon=' + JSON.stringify(crosshairIcon));
            console.log('setting crosshair center=' + map.getCenter());
            var crosshair = new L.marker(map.getCenter(), {
                icon: crosshairIcon,
                clickable: false
            });
            crosshair.addTo(map);
            
            // Move the crosshair to the center of the map when the user pans
            map.on('move', function(e) {
                crosshair.setLatLng(map.getCenter());
            });
            
            map.on('moveend', $A.getCallback(function(e) {
                console.log('moveend2=' + map.getCenter());
                var coords = map.getCenter();
                component.set('v.latitude', coords.lat);
                component.set('v.longitude', coords.lng);
                
                //helper.reverseGeocodeNominatim(component, coords.lat, coords.lng);
                helper.reverseGeocodeEsri(component, coords.lat, coords.lng);
                
            }));
            
            console.log('getCurrentPosition');
            var autoCenter = component.get('v.autoCenter');
            if (autoCenter == 'true')
            {
                navigator.geolocation.getCurrentPosition($A.getCallback(function(location) {
                    console.log(location.coords.latitude);
                    console.log(location.coords.longitude);
                    console.log(location.coords.accuracy);
                    
                    map.setView([location.coords.latitude, location.coords.longitude], 14);
                    
                    helper.reverseGeocodeEsri(component, location.coords.latitude, location.coords.longitude);
                    
                }));
            }
            
        });
    },
    onTypeChange: function(component, event, helper) {
        console.log('onTypeChange');
        helper.getSubTypes(component, component.get("v.type"));
    },
    handleSubmit: function(component, event, helper) {
        console.log('handleSubmit');
        helper.saveCase(component);
    }
})