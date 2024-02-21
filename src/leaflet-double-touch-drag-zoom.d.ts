import * as L from 'leaflet';

declare module 'leaflet' {
    interface MapOptions {
        doubleTouchDragZoom?: boolean
        doubleTouchDragZoomDelay?: number
        doubleTouchDragZoomInvert?: boolean
        doubleTouchDragZoomScaleFactor?: number
    }
}
