package com.anonymous.carpooling

import android.content.Intent
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import java.util.concurrent.atomic.AtomicReference

/**
 * 高德导航 RN 模块：拉起自定义 NaviActivity。
 *
 * JS 调用方式：
 *   NativeModules.AmapNavi.startNavi(startLat, startLng, startName, endLat, endLng, endName)
 *
 * Promise 在算路成功（导航真正启动）后 resolve，算路失败时 reject，
 * 由 NaviActivity 通过 pendingPromise 回调。
 */
class AmapNaviModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = NAME

    @ReactMethod
    fun startNavi(
        startLat: Double,
        startLng: Double,
        startName: String?,
        endLat: Double,
        endLng: Double,
        endName: String?,
        promise: Promise
    ) {
        try {
            val currentActivity = reactContext.currentActivity
            if (currentActivity == null) {
                promise.reject("NAVI_ERROR", "currentActivity is null")
                return
            }

            // 若上次导航 promise 尚未消费，先 reject 掉
            pendingPromise.getAndSet(promise)?.reject("NAVI_CANCELLED", "新导航请求已覆盖上一次")

            currentActivity.runOnUiThread {
                try {
                    val intent = Intent(currentActivity, NaviActivity::class.java).apply {
                        putExtra(NaviActivity.EXTRA_START_LAT, startLat)
                        putExtra(NaviActivity.EXTRA_START_LNG, startLng)
                        putExtra(NaviActivity.EXTRA_START_NAME, startName ?: "起点")
                        putExtra(NaviActivity.EXTRA_END_LAT, endLat)
                        putExtra(NaviActivity.EXTRA_END_LNG, endLng)
                        putExtra(NaviActivity.EXTRA_END_NAME, endName ?: "终点")
                    }
                    currentActivity.startActivity(intent)
                    // Promise 不在此处 resolve，由 NaviActivity 在算路结果回调中处理
                } catch (e: Exception) {
                    pendingPromise.getAndSet(null)?.reject("NAVI_EXCEPTION", e.message, e)
                }
            }
        } catch (e: Exception) {
            pendingPromise.getAndSet(null)?.reject("NAVI_EXCEPTION", e.message, e)
        }
    }

    companion object {
        const val NAME = "AmapNavi"

        /** NaviActivity 通过此引用回调算路结果给 JS Promise。 */
        val pendingPromise: AtomicReference<Promise?> = AtomicReference(null)
    }
}
