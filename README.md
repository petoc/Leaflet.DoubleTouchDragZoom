# Leaflet.DoubleTouchDragZoom

Leaflet plugin for one finger zoom.

## Usage

Include plugin after Leaflet script and enable it in map options.

```html
<script src="leaflet.js"></script>
<script src="leaflet-double-touch-drag-zoom.js"></script>
<script>
    var map = L.map('map', {
        center: [48.6726, 19.6994],
        zoom: 8,
        zoomControl: true,
        doubleTouchDragZoom: true
    });
    L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
</script>
```

Add CSS style to disable user-select and change cursor during zooming.

```html
<style>
    .leaflet-double-touch-drag {
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        cursor: move;
        cursor: -webkit-grabbing;
        cursor:    -moz-grabbing;
        cursor:       row-resize;
        }
</style>
```

## Options

Plugin adds following options to map configuration.

| Option                         | Type              | Default | Description |
|--------------------------------|-------------------|---------|-------------|
| doubleTouchDragZoom            | Boolean \| String | false   | Whether the map can be zoomed in by double touch dragging down or zoomed out by double touch dragging up with one finger. If passed `'center'`, it will zoom to the center of the view regardless of where the touch event was. Enabled for touch-capable web browsers except for old Androids. |
| doubleTouchDragZoomDelay       | Number            | 300     | Maximum delay between touches to trigger double touch. |
| doubleTouchDragZoomScaleFactor | Number            | 100     | Zooming sensitivity to vertical dragging (high < 100 < low). |

## Compatibility

Plugin should be compatible with all major desktop and mobile browsers.

## License

Licensed under MIT License.
