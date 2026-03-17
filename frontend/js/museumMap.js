export function initMuseumMap() {
    const mapContainer = document.getElementById('map');
    if (!mapContainer) return;

    const museumCoords = [30.3141, 59.9386];
    const coords = ol.proj.fromLonLat(museumCoords);

    const map = new ol.Map({
        target: 'map',
        layers: [
            new ol.layer.Tile({
                source: new ol.source.OSM()
            })
        ],
        view: new ol.View({
            center: coords,
            zoom: 14
        })
    });

    const marker = new ol.Feature({
        geometry: new ol.geom.Point(coords)
    });

    const vectorLayer = new ol.layer.Vector({
        source: new ol.source.Vector({
            features: [marker]
        })
    });

    map.addLayer(vectorLayer);
}
