(function (factory, window) {
  if (typeof define === 'function' && define.amd) {
    define(['leaflet'], factory);
  } else if (typeof exports === 'object') {
    module.exports = factory(require('leaflet'));
  }
  if (typeof window !== 'undefined' && window.L) {
    window.L.DoubleTouchDragZoom = factory(L);
  }
}(function (L) {
  /*
   * L.Handler.DoubleTouchDragZoom is used by L.Map to add one finger zoom on supported browsers.
   */

  // @namespace L.Map
  // @section Interaction Options
  L.Map.mergeOptions({
    // @section Touch interaction options
    // @option doubleTouchDragZoom: Boolean|String = *
    // Whether the map can be zoomed in by double touch dragging down or
    // zoomed out by double touch dragging up with one finger. If
    // passed `'center'`, it will zoom to the center of the view regardless of
    // where the touch event was. Enabled for touch-capable web
    // browsers except for old Androids.
    doubleTouchDragZoom: false,
    // @option doubleTouchDragZoomDelay: Number = 300
    // Maximum delay between touches to trigger double touch.
    doubleTouchDragZoomDelay: 300,
    // @option doubleTouchDragZoomInvert: Boolean = false
    // Invert dragging directions for zoom in/out.
    doubleTouchDragZoomInvert: false,
    // @option doubleTouchDragZoomScaleFactor: Number = 100
    // Zooming sensitivity to vertical dragging (high < 100 < low).
    doubleTouchDragZoomScaleFactor: 100
  });

  var DoubleTouchDragZoom = L.Handler.extend({
    addHooks: function () {
      this._eventCache = [];
      this._onTouchStart = this._onTouchStart.bind(this);
      this._onTouchMove = this._onTouchMove.bind(this);
      this._onTouchEnd = this._onTouchEnd.bind(this);
      L.DomUtil.addClass(this._map._container, 'leaflet-double-touch-drag-zoom');
      this._map._container.addEventListener('touchstart', this._onTouchStart);
      this._map._container.addEventListener('pointerdown', this._onTouchStart);
      this._map._container.addEventListener('mousedown', this._onTouchStart);
    },

    removeHooks: function () {
      L.DomUtil.removeClass(this._map._container, 'leaflet-double-touch-drag-zoom');
      this._map._container.removeEventListener('touchstart', this._onTouchStart);
      this._map._container.removeEventListener('pointerdown', this._onTouchStart);
      this._map._container.removeEventListener('mousedown', this._onTouchStart);
    },

    _disableHandlers: function () {
      if (this._map.dragging.enabled()) {
        this._map.dragging.disable();
        this._draggingDisabled = true;
      }

      if (this._map.doubleClickZoom.enabled()) {
        this._map.doubleClickZoom.disable();
        this._doubleClickZoomDisabled = true;
      }
    },

    _enableHandlers: function () {
      if (this._draggingDisabled === true) {
        this._map.dragging.enable();
      }

      if (this._doubleClickZoomDisabled === true) {
        this._map.doubleClickZoom.enable();
      }
    },

    _onTouchStart: function (e) {
      if (this._map._animatingZoom || this._zooming
          || (this._touchStartEvent && this._touchStartEvent !== e.type)
          || this._eventCache.length > 1
      ) {
        return;
      }
      this._touch = true;
      this._touchStartEvent = e.type;
      var now = Date.now();
      this._doubleTouch = this._lastTouchTime && ((now - this._lastTouchTime) <= this._map.options.doubleTouchDragZoomDelay);
      this._eventNameMove = e.type.replace('start', 'move').replace('down', 'move');
      this._eventNameEnd = e.type.replace('start', 'end').replace('down', 'up');
      this._eventCache.push(e);
      var that = this;
      document.addEventListener(this._eventNameEnd, function () {
        that._eventCache.pop();
      });

      if (this._doubleTouch) {
        L.DomUtil.addClass(this._map._container, 'leaflet-double-touch');

        this._startPoint = this._map.mouseEventToContainerPoint(e.touches && e.touches.length > 0 ? e.touches[0] : e);
        this._centerPoint = this._map.getSize()._divideBy(2);
        this._startLatLng = this._map.containerPointToLatLng(this._centerPoint);

        if (this._map.options.doubleTouchDragZoom !== 'center') {
          this._doubleTouchStartLatLng = this._map.containerPointToLatLng(this._startPoint);
        }

        this._startZoom = this._map.getZoom();

        this._moved = false;
        this._zooming = true;

        this._map._stop();

        L.DomUtil.addClass(this._map._container, 'leaflet-double-touch-drag-zoom');
        document.addEventListener(this._eventNameMove, this._onTouchMove);
        document.addEventListener(this._eventNameEnd, this._onTouchEnd);
        this._touchStartEvent = null;
      }

      this._lastTouchTime = now;
    },

    _onTouchMove: function (e) {
      if (this._eventCache.length > 1) {
        this._onTouchEnd();
        return;
      }

      if (!this._zooming) { return; }

      if (this._doubleTouch) {
        if (!this._moved) {
          this._disableHandlers();
          L.DomUtil.addClass(this._map._container, 'leaflet-double-touch-drag');
        }

        var p = this._map.mouseEventToContainerPoint(e.touches && e.touches.length > 0 ? e.touches[0] : e);
        var py = this._map.options.doubleTouchDragZoomInvert ? this._startPoint.y - p.y : p.y - this._startPoint.y;
        var scale = Math.exp(py / this._map.options.doubleTouchDragZoomScaleFactor);
        this._zoom = this._map.getScaleZoom(scale, this._startZoom);

        if (!this._map.options.bounceAtZoomLimits && (
            (this._zoom < this._map.getMinZoom() && scale < 1) ||
            (this._zoom > this._map.getMaxZoom() && scale > 1))) {
          this._zoom = this._map._limitZoom(this._zoom);
        }

        if (this._map.options.doubleTouchDragZoom === 'center') {
          this._center = this._startLatLng;
          if (scale === 1) { return; }
        } else {
          var delta = (new L.Point(this._startPoint.x, this._startPoint.y))._subtract(this._centerPoint);
          if (scale === 1 && delta.x === 0 && delta.y === 0) { return; }
          this._center = this._map.unproject(this._map.project(this._doubleTouchStartLatLng, this._zoom).subtract(delta), this._zoom);
        }

        if (!this._moved) {
          this._map._moveStart(true, false);
          this._moved = true;
        }

        L.Util.cancelAnimFrame(this._animRequest);
        var moveFn = L.Util.bind(this._map._move, this._map, this._center, this._zoom, {pinch: true, round: false});
        this._animRequest = L.Util.requestAnimFrame(moveFn, this, true);
      }
    },

    _onTouchEnd: function () {
      if (!this._touch) { return; }

      if (this._doubleTouch) {
        L.DomUtil.removeClass(this._map._container, 'leaflet-double-touch-drag');
        L.DomUtil.removeClass(this._map._container, 'leaflet-double-touch');
        document.removeEventListener(this._eventNameMove, this._onTouchMove);
        document.removeEventListener(this._eventNameEnd, this._onTouchEnd);

        if (!this._moved || !this._zooming) {
          this._zooming = false;
          return;
        }

        this._doubleTouch = false;
        this._moved = false;
        this._zooming = false;
        L.Util.cancelAnimFrame(this._animRequest);

        if (!this._center) { return; }

        var zoomend = function () {
          this._enableHandlers();
          L.DomEvent.off(this._map, 'zoomend', zoomend, this);
        };
        L.DomEvent.on(this._map, 'zoomend', zoomend, this);

        if (this._map.options.doubleTouchDragZoom === 'center') {
          this._map.setZoom(this._map._limitZoom(this._zoom));
        } else {
          this._map.setZoomAround(this._startPoint, this._map._limitZoom(this._zoom));
        }
        this._center = null;
      }
      this._touch = false;
    }
  });

  // @section Handlers
  // @property doubleTouchDragZoom: Handler
  // Double touch zoom handler.
  L.Map.addInitHook('addHandler', 'doubleTouchDragZoom', DoubleTouchDragZoom);

  return DoubleTouchDragZoom;
}, window));
