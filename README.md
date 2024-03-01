# Leaflet.DoubleTouchDragZoom

Leaflet plugin for one finger zoom.

## Demo

<https://petoc.github.io/Leaflet.DoubleTouchDragZoom/example/>

## Usage

```sh
npm i @petoc/leaflet-double-touch-drag-zoom
```

```js
import L from 'leaflet';
import '@petoc/leaflet-double-touch-drag-zoom';
import 'leaflet/dist/leaflet.css';
import '@petoc/leaflet-double-touch-drag-zoom/src/leaflet-double-touch-drag-zoom.css';

const map = L.map('map', {
    center: [48.6726, 19.6994],
    zoom: 8,
    doubleTouchDragZoom: true
});
```

Alternative usage

```html
<link rel="stylesheet" href="leaflet-double-touch-drag-zoom.css" />
...
<script src="leaflet.js"></script>
<script src="leaflet-double-touch-drag-zoom.js"></script>
<script>
    var map = L.map('map', {
        center: [48.6726, 19.6994],
        zoom: 8,
        doubleTouchDragZoom: true
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
</script>
```

## Options

Plugin adds following options to map configuration.

| Option                         | Type              | Default | Description |
|--------------------------------|-------------------|---------|-------------|
| doubleTouchDragZoom            | Boolean \| String | false   | Whether the map can be zoomed in by double touch dragging down or zoomed out by double touch dragging up with one finger. If passed `'center'`, it will zoom to the center of the view regardless of where the touch event was. Enabled for touch-capable web browsers except for old Androids. |
| doubleTouchDragZoomDelay       | Number            | 300     | Maximum delay between touches to trigger double touch. |
| doubleTouchDragZoomInvert      | Boolean           | false   | Invert dragging directions for zoom in/out. |
| doubleTouchDragZoomScaleFactor | Number            | 100     | Zooming sensitivity to vertical dragging (high < 100 < low). |

## Compatibility

Plugin should be compatible with all major desktop and mobile browsers.

## License

Licensed under MIT License.
