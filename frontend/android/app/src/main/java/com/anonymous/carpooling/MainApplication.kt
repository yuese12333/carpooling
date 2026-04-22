package com.anonymous.carpooling

import android.app.Application
import android.content.res.Configuration

import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeApplicationEntryPoint.loadReactNative
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.ReactHost
import com.facebook.react.common.ReleaseLevel
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint
import com.facebook.react.defaults.DefaultReactNativeHost

import com.amap.api.location.AMapLocationClient
import com.amap.api.services.core.ServiceSettings
import com.amap.api.navi.AMapNavi

import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
      this,
      object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              add(AmapMapPackage())
              add(AmapLocationPackage())
              add(AmapSearchPackage())
              add(AmapNaviPackage())
            }

          override fun getJSMainModuleName(): String = ".expo/.virtual-metro-entry"

          override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

          override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      }
  )

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    /*
     * 高德定位 SDK 隐私合规初始化（必须在首次使用 AMapLocationClient 之前调用）
     *
     * 位置：这里放在 `super.onCreate()` 之后、其它初始化（如 loadReactNative）之前。
     *
     * 开发说明：当前为了快速联调，临时写死 `true`。
     * 正式上线建议：在用户同意隐私政策后再把参数设为 true（或先设为 false，
     * 待用户同意后再在相应业务流程里更新）。
     */
    AMapLocationClient.updatePrivacyShow(this, true, true)
    AMapLocationClient.updatePrivacyAgree(this, true)

    /*
     * 高德搜索 SDK 隐私合规（需在首次使用搜索能力前调用；与定位 SDK 类似）
     * 正式上线请在用户同意隐私政策后再设为 true。
     */
    ServiceSettings.updatePrivacyShow(this, true, true)
    ServiceSettings.updatePrivacyAgree(this, true)

    /*
     * 高德导航 SDK 隐私合规（需在首次使用导航能力前调用）
     * 正式上线请在用户同意隐私政策后再设为 true。
     */
    AMapNavi.updatePrivacyShow(this, true, true)
    AMapNavi.updatePrivacyAgree(this, true)

    DefaultNewArchitectureEntryPoint.releaseLevel = try {
      ReleaseLevel.valueOf(BuildConfig.REACT_NATIVE_RELEASE_LEVEL.uppercase())
    } catch (e: IllegalArgumentException) {
      ReleaseLevel.STABLE
    }
    loadReactNative(this)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
