package com.anonymous.carpooling

import android.app.Activity
import android.location.Location
import android.os.Bundle
import android.widget.Toast
import com.amap.api.navi.AMapNavi
import com.amap.api.navi.AMapNaviListener
import com.amap.api.navi.AMapNaviView
import com.amap.api.navi.AMapNaviViewListener
import com.amap.api.navi.AmapPageType
import com.amap.api.navi.enums.NaviType
import com.amap.api.navi.enums.PathPlanningStrategy
import com.amap.api.navi.model.AMapCalcRouteResult
import com.amap.api.navi.model.AMapLaneInfo
import com.amap.api.navi.model.AMapModelCross
import com.amap.api.navi.model.AMapNaviCameraInfo
import com.amap.api.navi.model.AMapNaviCross
import com.amap.api.navi.model.AMapNaviLocation
import com.amap.api.navi.model.AMapNaviRouteNotifyData
import com.amap.api.navi.model.AMapNaviTrafficFacilityInfo
import com.amap.api.navi.model.AMapServiceAreaInfo
import com.amap.api.navi.model.AimLessModeCongestionInfo
import com.amap.api.navi.model.AimLessModeStat
import com.amap.api.navi.model.NaviInfo
import com.amap.api.navi.model.NaviLatLng

class NaviActivity : Activity(), AMapNaviListener, AMapNaviViewListener {

    private lateinit var naviView: AMapNaviView
    private lateinit var aMapNavi: AMapNavi

    private var startPoint = NaviLatLng(0.0, 0.0)
    private var endPoint = NaviLatLng(0.0, 0.0)

    // GPS 信号弱时标记，防止重复弹 Toast
    private var gpsWeakToastShown = false

    companion object {
        const val EXTRA_START_LAT = "start_lat"
        const val EXTRA_START_LNG = "start_lng"
        const val EXTRA_START_NAME = "start_name"
        const val EXTRA_END_LAT = "end_lat"
        const val EXTRA_END_LNG = "end_lng"
        const val EXTRA_END_NAME = "end_name"
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_navi)

        naviView = findViewById(R.id.navi_view)
        naviView.onCreate(savedInstanceState)
        naviView.setAMapNaviViewListener(this)

        aMapNavi = AMapNavi.getInstance(applicationContext)
        aMapNavi.addAMapNaviListener(this)
        aMapNavi.setUseInnerVoice(true)

        startPoint = NaviLatLng(
            intent.getDoubleExtra(EXTRA_START_LAT, 0.0),
            intent.getDoubleExtra(EXTRA_START_LNG, 0.0)
        )
        endPoint = NaviLatLng(
            intent.getDoubleExtra(EXTRA_END_LAT, 0.0),
            intent.getDoubleExtra(EXTRA_END_LNG, 0.0)
        )
        // 算路移至 onNaviViewLoaded，确保 View 完成绑定后再发起
    }

    override fun onResume() {
        super.onResume()
        naviView.onResume()
    }

    override fun onPause() {
        super.onPause()
        naviView.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        naviView.onDestroy()
        aMapNavi.removeAMapNaviListener(this)
        AMapNavi.destroy()
        AmapNaviModule.pendingPromise.getAndSet(null)?.reject("NAVI_CANCELLED", "导航页面已关闭")
    }

    // ── AMapNaviListener ──────────────────────────────────────────────────────

    override fun onCalculateRouteSuccess(result: AMapCalcRouteResult) {
        AmapNaviModule.pendingPromise.getAndSet(null)?.resolve(null)
        aMapNavi.startNavi(NaviType.GPS)
        // GPS 冷启动阶段注入起点坐标作为初始锚点，防止视角漂移到北京
        injectStartPointAsInitialLocation()
    }

    override fun onCalculateRouteSuccess(ints: IntArray?) {}

    override fun onCalculateRouteFailure(errorCode: Int) {
        val msg = "算路失败，错误码：$errorCode"
        AmapNaviModule.pendingPromise.getAndSet(null)?.reject("NAVI_ROUTE_FAIL", msg)
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
        finish()
    }

    override fun onCalculateRouteFailure(result: AMapCalcRouteResult) {
        val msg = "算路失败，错误码：${result.errorCode}"
        AmapNaviModule.pendingPromise.getAndSet(null)?.reject("NAVI_ROUTE_FAIL", msg)
        Toast.makeText(this, msg, Toast.LENGTH_SHORT).show()
        finish()
    }

    override fun onArriveDestination() {
        finish()
    }

    // ── AMapNaviViewListener ──────────────────────────────────────────────────

    override fun onNaviCancel() {
        finish()
    }

    override fun onNaviBackClick(): Boolean = false
    override fun onAMapNaviViewExit() { finish() }

    // View 完成渲染后再触发算路，避免 View 尚未就绪时调用 SDK 导致状态异常
    override fun onNaviViewLoaded() {
        aMapNavi.calculateDriveRoute(
            listOf(startPoint),
            listOf(endPoint),
            null,
            PathPlanningStrategy.DRIVING_DEFAULT
        )
    }

    // ── 空实现（AMapNaviListener 其余方法） ───────────────────────────────────

    override fun onInitNaviFailure() {}
    override fun onInitNaviSuccess() {}
    override fun onStartNavi(type: Int) {}
    override fun onTrafficStatusUpdate() {}

    // GPS 定位回调：收到精度合理的真实位置后，重置弱信号提示标记
    override fun onLocationChange(location: AMapNaviLocation) {
        val acc = location.accuracy
        if (acc in 1f..50f) {
            gpsWeakToastShown = false
        }
    }

    override fun onGetNavigationText(type: Int, text: String?) {}
    override fun onGetNavigationText(text: String?) {}
    override fun onEndEmulatorNavi() {}
    override fun onNaviInfoUpdate(naviInfo: NaviInfo) {}
    override fun updateCameraInfo(aMapNaviCameraInfos: Array<AMapNaviCameraInfo>?) {}
    override fun updateIntervalCameraInfo(p0: AMapNaviCameraInfo?, p1: AMapNaviCameraInfo?, p2: Int) {}
    override fun onServiceAreaUpdate(aMapServiceAreaInfos: Array<AMapServiceAreaInfo>?) {}
    override fun showCross(aMapNaviCross: AMapNaviCross) {}
    override fun hideCross() {}
    override fun showModeCross(aMapNaviCross: AMapModelCross) {}
    override fun hideModeCross() {}
    override fun showLaneInfo(laneInfos: Array<AMapLaneInfo>?, laneBackgroundInfo: ByteArray?, laneRecommendedInfo: ByteArray?) {}
    override fun showLaneInfo(aMapLaneInfo: AMapLaneInfo) {}
    override fun hideLaneInfo() {}
    override fun notifyParallelRoad(parallelRoadType: Int) {}
    override fun onGpsOpenStatus(enabled: Boolean) {}

    // GPS 信号弱时提示用户，仅弹一次
    override fun onGpsSignalWeak(isWeak: Boolean) {
        if (isWeak && !gpsWeakToastShown) {
            gpsWeakToastShown = true
            Toast.makeText(this, "GPS 信号较弱，请移步开阔地带以获取准确位置", Toast.LENGTH_LONG).show()
        }
    }

    override fun onReCalculateRouteForYaw() {}
    override fun onReCalculateRouteForTrafficJam() {}
    override fun onArrivedWayPoint(index: Int) {}
    override fun OnUpdateTrafficFacility(info: AMapNaviTrafficFacilityInfo) {}
    override fun OnUpdateTrafficFacility(infos: Array<AMapNaviTrafficFacilityInfo>?) {}
    override fun updateAimlessModeStatistics(aimLessModeStat: AimLessModeStat) {}
    override fun updateAimlessModeCongestionInfo(aimLessModeCongestionInfo: AimLessModeCongestionInfo) {}
    override fun onPlayRing(p0: Int) {}
    override fun onNaviRouteNotify(data: AMapNaviRouteNotifyData) {}

    // ── 空实现（AMapNaviViewListener 其余方法） ───────────────────────────────

    override fun onNaviSetting() {}
    override fun onNaviMapMode(isLock: Int) {}
    override fun onNaviTurnClick() {}
    override fun onNextRoadClick() {}
    override fun onScanViewButtonClick() {}
    override fun onLockMap(isLock: Boolean) {}
    override fun onMapTypeChanged(p0: Int) {}
    override fun onNaviViewShowMode(p0: Int) {}
    override fun onStopSpeaking() {}
    override fun onViewTypeChanged(p0: AmapPageType) {}
    override fun onStrategyChanged(p0: Int) {}
    override fun onBroadcastModeChanged(p0: Int) {}
    override fun onDayAndNightModeChanged(p0: Int) {}
    override fun onScaleAutoChanged(p0: Boolean) {}
    override fun onListenToVoiceDuringCallChanged(p0: Boolean) {}
    override fun onControlMusicVolumeModeChanged(p0: Int) {}
    override fun onEagleChanged(p0: Boolean) {}
    override fun onNaviRouteHighlightChange(p0: Long, p1: Int) {}

    // ── 私有方法 ──────────────────────────────────────────────────────────────

    // 向 SDK 注入一条模拟起点定位，使地图视角在真实 GPS 锁定前停留在起点附近
    private fun injectStartPointAsInitialLocation() {
        val loc = AMapNaviLocation().apply {
            setCoord(startPoint)
            setAccuracy(10f)
            setSpeed(0f)
            setBearing(0f)
            setTime(System.currentTimeMillis())
        }
        // setExtraGPSData type=2 表示 GCJ-02 坐标系，与高德地图一致
        val androidLoc = Location("gps").apply {
            latitude = startPoint.latitude
            longitude = startPoint.longitude
            accuracy = 10f
            speed = 0f
            bearing = 0f
            time = System.currentTimeMillis()
        }
        aMapNavi.setIsUseExtraGPSData(true)
        aMapNavi.setExtraGPSData(2, androidLoc)
    }
}
