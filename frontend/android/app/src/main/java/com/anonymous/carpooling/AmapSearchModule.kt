package com.anonymous.carpooling

import com.amap.api.services.core.AMapException
import com.amap.api.services.core.PoiItem
import com.amap.api.services.poisearch.PoiResult
import com.amap.api.services.poisearch.PoiSearch
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

/**
 * 高德搜索 SDK（POI 关键字搜索等），供 JS 侧联调。
 *
 * 说明：
 * - 隐私合规初始化见 [MainApplication.onCreate] 中的 [com.amap.api.services.core.ServiceSettings]。
 * - 与 2D 地图、定位共用同一套清单中的 `com.amap.api.v2.apikey`。
 */
class AmapSearchModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {

  override fun getName(): String = NAME

  /**
   * POI 关键字搜索。
   *
   * @param keyword 关键字，不可为空
   * @param city 城市名；空字符串表示未限定（全国检索）。通常由定位结果的 `city` 传入。
   * @param pageNum 页码，从 0 开始
   * @param pageSize 每页条数，建议 10～25
   */
  @ReactMethod
  fun poiKeywordSearch(keyword: String, city: String, pageNum: Int, pageSize: Int, promise: Promise) {
    val kw = keyword.trim()
    if (kw.isEmpty()) {
      promise.reject("AMAP_SEARCH_INVALID", "keyword 不能为空", null)
      return
    }

    val size = pageSize.coerceIn(1, 50)
    val page = pageNum.coerceAtLeast(0)
    val cityTrim = city.trim()

    try {
      // 有城市：同城优先（与官方 Demo 一致）；无城市：全国
      val query = PoiSearch.Query(kw, "", cityTrim)
      query.setPageSize(size)
      query.setPageNum(page)
      query.setCityLimit(cityTrim.isNotEmpty())

      val poiSearch = PoiSearch(reactContext, query)
      var settled = false

      poiSearch.setOnPoiSearchListener(
        object : PoiSearch.OnPoiSearchListener {
          override fun onPoiSearched(result: PoiResult?, rCode: Int) {
            if (settled) return
            if (rCode != AMapException.CODE_AMAP_SUCCESS) {
              settled = true
              val hint = describeSearchRCode(rCode)
              promise.reject("AMAP_SEARCH_ERROR", "rCode=$rCode $hint", null)
              return
            }

            val pois = result?.pois
            val arr = Arguments.createArray()
            if (pois != null) {
              for (item in pois) {
                arr.pushMap(poiItemToMap(item))
              }
            }
            settled = true
            promise.resolve(arr)
          }

          override fun onPoiItemSearched(item: PoiItem?, rCode: Int) {
            // 关键字搜索走 onPoiSearched；此处不处理
          }
        },
      )

      poiSearch.searchPOIAsyn()
    } catch (e: Exception) {
      promise.reject("AMAP_SEARCH_EXCEPTION", e.message, e)
    }
  }

  private fun poiItemToMap(item: PoiItem): com.facebook.react.bridge.WritableMap {
    val m = Arguments.createMap()
    m.putString("poiId", item.poiId ?: "")
    m.putString("title", item.title ?: "")
    m.putString("snippet", item.snippet ?: "")
    m.putString("cityName", item.cityName ?: "")
    m.putString("adName", item.adName ?: "")
    m.putString("provinceName", item.provinceName ?: "")
    m.putString("typeDes", item.typeDes ?: "")
    val ll = item.latLonPoint
    if (ll != null) {
      m.putDouble("latitude", ll.latitude)
      m.putDouble("longitude", ll.longitude)
    } else {
      m.putNull("latitude")
      m.putNull("longitude")
    }
    return m
  }

  companion object {
    const val NAME = "AmapSearch"

    /** 将常见 rCode 转为可读说明（完整列表见高德 AMapException 文档） */
    private fun describeSearchRCode(rCode: Int): String =
      when (rCode) {
        AMapException.CODE_AMAP_INVALID_USER_SCODE ->
          "（安全码未通过：请在控制台「应用」中核对 Android 包名 $PACKAGE_HINT 与签名 SHA1，" +
            "debug/release 证书需分别填写；地图能显示不代表搜索已通过校验）"
        AMapException.CODE_AMAP_INVALID_USER_KEY ->
          "（Key 无效或未开通相关 Web 服务）"
        AMapException.CODE_AMAP_USERKEY_PLAT_NOMATCH ->
          "（Key 与平台不匹配，请使用 Android SDK 类型 Key）"
        AMapException.CODE_AMAP_INSUFFICIENT_PRIVILEGES ->
          "（Key 权限不足或对应服务未开通）"
        else -> ""
      }

    private const val PACKAGE_HINT = "com.anonymous.carpooling"
  }
}
