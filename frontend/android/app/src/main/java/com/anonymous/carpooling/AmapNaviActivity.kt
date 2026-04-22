package com.anonymous.carpooling

import android.os.Bundle
import android.app.Activity
import android.view.Window
import android.widget.Toast
import com.amap.api.maps.AMapException
import com.amap.api.navi.AMapNavi
import com.amap.api.navi.AMapNaviListener
import com.amap.api.navi.AMapNaviView
import com.amap.api.navi.AMapNaviViewListener
import com.amap.api.navi.AmapPageType
import com.amap.api.navi.ParallelRoadListener
import com.amap.api.navi.enums.AMapNaviParallelRoadStatus
import com.amap.api.navi.model.*

/**
 * 高德导航 Activity，接收起点/终点经纬度并启动逐步导航。
 *
 * 由 AmapNaviModule 通过 Intent 启动，传入以下 Extra：
 *   - START_LAT / START_LNG：起点坐标
 *   - END_LAT / END_LNG：终点坐标
 */
class AmapNaviActivity : Activity(), AMapNaviListener, AMapNaviViewListener, ParallelRoadListener {

    private lateinit var mNaviView: AMapNaviView
    private var mAMapNavi: AMapNavi? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        requestWindowFeature(Window.FEATURE_NO_TITLE)
        setContentView(R.layout.activity_amap_navi)

        mNaviView = findViewById(R.id.navi_view)
        mNaviView.onCreate(savedInstanceState)
        mNaviView.setAMapNaviViewListener(this)

        val startLat = intent.getDoubleExtra(EXTRA_START_LAT, 0.0)
        val startLng = intent.getDoubleExtra(EXTRA_START_LNG, 0.0)
        val endLat = intent.getDoubleExtra(EXTRA_END_LAT, 0.0)
        val endLng = intent.getDoubleExtra(EXTRA_END_LNG, 0.0)

        try {
            mAMapNavi = AMapNavi.getInstance(applicationContext)
            mAMapNavi?.addAMapNaviListener(this)
            mAMapNavi?.addParallelRoadListener(this)
            mAMapNavi?.setUseInnerVoice(true, true)

            val sList = listOf(NaviLatLng(startLat, startLng))
            val eList = listOf(NaviLatLng(endLat, endLng))
            // 策略 0：速度优先
            mAMapNavi?.calculateDriveRoute(sList, eList, null, 0)
        } catch (e: AMapException) {
            Toast.makeText(this, "导航初始化失败：${e.message}", Toast.LENGTH_SHORT).show()
            finish()
        }
    }

    override fun onResume() {
        super.onResume()
        mNaviView.onResume()
    }

    override fun onPause() {
        super.onPause()
        mNaviView.onPause()
    }

    override fun onDestroy() {
        super.onDestroy()
        mNaviView.onDestroy()
        mAMapNavi?.stopNavi()
        mAMapNavi?.destroy()
    }

    // --- AMapNaviListener ---

    override fun onInitNaviFailure() {
        Toast.makeText(this, "导航引擎初始化失败", Toast.LENGTH_SHORT).show()
    }

    override fun onInitNaviSuccess() {}
    override fun onStartNavi(type: Int) {}
    override fun onTrafficStatusUpdate() {}
    override fun onLocationChange(location: AMapNaviLocation?) {}
    override fun onGetNavigationText(type: Int, text: String?) {}
    override fun onGetNavigationText(s: String?) {}
    override fun onEndEmulatorNavi() {}
    override fun onArriveDestination() {
        Toast.makeText(this, "已到达目的地", Toast.LENGTH_SHORT).show()
    }
    override fun onCalculateRouteFailure(errorInfo: Int) {
        Toast.makeText(this, "路线计算失败，错误码：$errorInfo", Toast.LENGTH_SHORT).show()
    }
    override fun onCalculateRouteFailure(result: AMapCalcRouteResult?) {
        Toast.makeText(this, "路线计算失败：${result?.getErrorDescription()}", Toast.LENGTH_SHORT).show()
    }
    override fun onCalculateRouteSuccess(ints: IntArray?) {}
    override fun onCalculateRouteSuccess(result: AMapCalcRouteResult?) {
        mAMapNavi?.startNavi(com.amap.api.navi.enums.NaviType.GPS)
    }
    override fun onReCalculateRouteForYaw() {}
    override fun onReCalculateRouteForTrafficJam() {}
    override fun onArrivedWayPoint(wayID: Int) {}
    override fun onGpsOpenStatus(enabled: Boolean) {}
    override fun updateCameraInfo(infos: Array<out AMapNaviCameraInfo>?) {}
    override fun updateIntervalCameraInfo(i1: AMapNaviCameraInfo?, i2: AMapNaviCameraInfo?, i: Int) {}
    override fun onServiceAreaUpdate(infos: Array<out AMapServiceAreaInfo>?) {}
    override fun onNaviInfoUpdate(naviinfo: NaviInfo?) {}
    override fun OnUpdateTrafficFacility(info: AMapNaviTrafficFacilityInfo?) {}
    override fun OnUpdateTrafficFacility(infos: Array<out AMapNaviTrafficFacilityInfo>?) {}
    override fun showCross(cross: AMapNaviCross?) {}
    override fun hideCross() {}
    override fun showModeCross(cross: AMapModelCross?) {}
    override fun hideModeCross() {}
    override fun showLaneInfo(laneInfos: Array<out AMapLaneInfo>?, bg: ByteArray?, rec: ByteArray?) {}
    override fun showLaneInfo(info: AMapLaneInfo?) {}
    override fun hideLaneInfo() {}
    override fun notifyParallelRoad(i: Int) {}
    override fun notifyParallelRoad(status: AMapNaviParallelRoadStatus?) {}
    override fun updateAimlessModeStatistics(stat: AimLessModeStat?) {}
    override fun updateAimlessModeCongestionInfo(info: AimLessModeCongestionInfo?) {}
    override fun onPlayRing(i: Int) {}
    override fun onNaviRouteNotify(data: AMapNaviRouteNotifyData?) {}
    override fun onGpsSignalWeak(b: Boolean) {}

    // --- AMapNaviViewListener ---

    override fun onNaviSetting() {}
    override fun onNaviCancel() { finish() }
    override fun onNaviBackClick(): Boolean = false
    override fun onNaviMapMode(naviMode: Int) {}
    override fun onNaviTurnClick() {}
    override fun onNextRoadClick() {}
    override fun onScanViewButtonClick() {}
    override fun onLockMap(isLock: Boolean) {}
    override fun onNaviViewLoaded() {}
    override fun onMapTypeChanged(i: Int) {}
    override fun onNaviViewShowMode(i: Int) {}
    override fun onStopSpeaking() {}
    override fun onViewTypeChanged(type: AmapPageType?) {}
    override fun onAMapNaviViewExit() {}
    override fun onStrategyChanged(i: Int) {}
    override fun onBroadcastModeChanged(i: Int) {}
    override fun onDayAndNightModeChanged(i: Int) {}
    override fun onScaleAutoChanged(b: Boolean) {}
    override fun onListenToVoiceDuringCallChanged(b: Boolean) {}
    override fun onControlMusicVolumeModeChanged(i: Int) {}
    override fun onEagleChanged(b: Boolean) {}
    override fun onNaviRouteHighlightChange(l: Long, i: Int) {}

    // --- ParallelRoadListener ---

    companion object {
        const val EXTRA_START_LAT = "START_LAT"
        const val EXTRA_START_LNG = "START_LNG"
        const val EXTRA_END_LAT = "END_LAT"
        const val EXTRA_END_LNG = "END_LNG"
    }
}
