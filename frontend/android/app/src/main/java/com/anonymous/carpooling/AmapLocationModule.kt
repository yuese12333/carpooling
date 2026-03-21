package com.anonymous.carpooling

import com.amap.api.location.AMapLocationClient
import com.amap.api.location.AMapLocationClientOption
import com.amap.api.location.AMapLocationListener
import com.amap.api.location.AMapLocation
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * 高德定位 Native Module（仅做“单次定位”返回经纬度，供 /map-test 页面展示）。
 *
 * 注意：
 * - AMapLocationClient 的隐私合规初始化在 MainApplication.onCreate() 完成。
 * - 运行时定位权限仍需由 JS 侧请求（Android 动态权限）。
 */
class AmapLocationModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = NAME

  @ReactMethod
  fun getCurrentLocation(promise: Promise) {
    try {
      val client = AMapLocationClient(reactContext)
      val option = AMapLocationClientOption()
      option.setOnceLocation(true)
      option.setOnceLocationLatest(true)
      // 需要地址/城市信息，供 POI 搜索限定「当前定位城市」
      option.setNeedAddress(true)
      // 只做一次定位即可，避免持续耗电
      client.setLocationOption(option)

      client.setLocationListener(
        object : AMapLocationListener {
          override fun onLocationChanged(amapLocation: AMapLocation) {
            try {
              if (amapLocation.errorCode == 0) {
                val map = Arguments.createMap()
                map.putDouble("latitude", amapLocation.latitude)
                map.putDouble("longitude", amapLocation.longitude)
                map.putDouble("accuracy", amapLocation.accuracy.toDouble())
                map.putInt("errorCode", amapLocation.errorCode)
                map.putString("city", amapLocation.city ?: "")
                map.putString("district", amapLocation.district ?: "")
                map.putString("province", amapLocation.province ?: "")
                map.putString("address", amapLocation.address ?: "")
                promise.resolve(map)
              } else {
                promise.reject(
                  "AMAP_LOCATION_ERROR",
                  "code=${amapLocation.errorCode}, info=${amapLocation.errorInfo}"
                )
              }
            } finally {
              // 单次定位结束后停止，释放资源
              client.stopLocation()
            }
          }
        },
      )

      client.startLocation()
    } catch (e: Exception) {
      promise.reject("AMAP_LOCATION_EXCEPTION", e.message, e)
    }
  }

  companion object {
    const val NAME = "AmapLocation"
  }
}
