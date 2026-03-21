package com.anonymous.carpooling

import com.amap.api.maps2d.MapView
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

/**
 * 高德 2D MapView 测试用原生视图，供 JS 侧 requireNativeComponent('AmapMapTest') 引用。
 * 生命周期与当前 Activity 同步，避免白屏或崩溃。
 */
class AmapMapTestViewManager : SimpleViewManager<MapView>() {

  override fun getName(): String = NAME

  override fun createViewInstance(reactContext: ThemedReactContext): MapView {
    val mapView = MapView(reactContext)
    mapView.onCreate(null)

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
        }
      }
    // ThemedReactContext 与 Activity 生命周期绑定
    reactContext.addLifecycleEventListener(listener)

    return mapView
  }

  companion object {
    const val NAME = "AmapMapTest"
  }
}
