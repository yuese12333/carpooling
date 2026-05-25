package com.anonymous.carpooling

import com.amap.api.maps.MapView
import com.amap.api.maps.CameraUpdateFactory
import com.amap.api.maps.model.LatLng
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext
import java.util.IdentityHashMap

/**
 * 高德 3D MapView 原生视图，供 JS 侧 requireNativeComponent('AmapMapTest') 引用。
 * 已从 2D SDK（maps2d）迁移至 3D 一体化 SDK（maps），支持导航。
 * 生命周期与当前 Activity 同步，避免白屏或崩溃。
 */
class AmapMapTestViewManager : SimpleViewManager<MapView>() {
  private val cameraState = IdentityHashMap<MapView, CameraState>()

  override fun getName(): String = NAME

  override fun createViewInstance(reactContext: ThemedReactContext): MapView {
    val mapView = MapView(reactContext)
    mapView.onCreate(null)
    cameraState[mapView] = CameraState()

    val listener =
      object : LifecycleEventListener {
        override fun onHostResume() {
          mapView.onResume()
        }

        override fun onHostPause() {
          mapView.onPause()
        }

        override fun onHostDestroy() {
          mapView.onDestroy()
          cameraState.remove(mapView)
        }
      }
    reactContext.addLifecycleEventListener(listener)

    return mapView
  }

  @ReactProp(name = "latitude")
  fun setLatitude(view: MapView, latitude: Double) {
    val state = cameraState.getOrPut(view) { CameraState() }
    state.latitude = latitude
    maybeMoveCamera(view)
  }

  @ReactProp(name = "longitude")
  fun setLongitude(view: MapView, longitude: Double) {
    val state = cameraState.getOrPut(view) { CameraState() }
    state.longitude = longitude
    maybeMoveCamera(view)
  }

  @ReactProp(name = "zoom")
  fun setZoom(view: MapView, zoom: Double) {
    val state = cameraState.getOrPut(view) { CameraState() }
    state.zoom = zoom.toFloat()
    maybeMoveCamera(view)
  }

  @ReactProp(name = "recenterToken")
  fun setRecenterToken(view: MapView, recenterToken: Double) {
    val state = cameraState.getOrPut(view) { CameraState() }
    state.recenterToken = recenterToken
    maybeMoveCamera(view)
  }

  private fun maybeMoveCamera(view: MapView) {
    val state = cameraState.getOrPut(view) { CameraState() }
    val lat = state.latitude ?: return
    val lng = state.longitude ?: return
    val zoom = state.zoom ?: DEFAULT_ZOOM
    val cameraUpdate = CameraUpdateFactory.newLatLngZoom(LatLng(lat, lng), zoom)
    view.getMap().moveCamera(cameraUpdate)
  }

  companion object {
    const val NAME = "AmapMapTest"
    private const val DEFAULT_ZOOM = 17.0f
  }

  private class CameraState(
    var latitude: Double? = null,
    var longitude: Double? = null,
    var zoom: Float? = null,
    var recenterToken: Double? = null,
  )
}
