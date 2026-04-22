package com.anonymous.carpooling

import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * 高德导航 RN 模块，暴露 startNavi 方法给 JS 层。
 *
 * JS 调用方式：
 *   NativeModules.AmapNavi.startNavi(startLat, startLng, endLat, endLng)
 */
class AmapNaviModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    /**
     * 启动导航 Activity。
     *
     * @param startLat 起点纬度
     * @param startLng 起点经度
     * @param endLat   终点纬度
     * @param endLng   终点经度
     */
    @ReactMethod
    fun startNavi(startLat: Double, startLng: Double, endLat: Double, endLng: Double, promise: Promise) {
        try {
            val currentActivity = reactContext.currentActivity
            if (currentActivity == null) {
                promise.reject("NAVI_ERROR", "currentActivity is null")
                return
            }
            val intent = Intent(currentActivity, AmapNaviActivity::class.java).apply {
                putExtra(AmapNaviActivity.EXTRA_START_LAT, startLat)
                putExtra(AmapNaviActivity.EXTRA_START_LNG, startLng)
                putExtra(AmapNaviActivity.EXTRA_END_LAT, endLat)
                putExtra(AmapNaviActivity.EXTRA_END_LNG, endLng)
            }
            currentActivity.startActivity(intent)
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("NAVI_EXCEPTION", e.message, e)
        }
    }

    companion object {
        const val NAME = "AmapNavi"
    }
}
