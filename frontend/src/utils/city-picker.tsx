/**
 * @file city-picker.tsx
 * @summary 中国省 / 市级数据、城市选择 UI，以及与高德 Android 搜索 SDK（POI 关键字）对接的同城参数。
 *
 * @description
 * - **CityPicker**：两步选择——先选省级行政区（含直辖市），再选地级市；首项「全国」表示不限制城市。
 *   传入 `locatedCity`（逆地理城市名）时：若能在数据中匹配省份，则在该省城市列表顶部插入该城市；
 *   若无法匹配任一省，则显示「使用定位城市：xxx」快捷项。
 * - **cityToNativeParam**：将 UI 中的「全国」或空串转为 `''`，供 `NativeModules.AmapSearch.poiKeywordSearch(keyword, city, …)` 使用
 *   （空串表示 `setCityLimit(false)` 全国检索；非空为同城检索）。
 * - **数据**：`CHINA_PROVINCE_CITIES`、`NATIONAL_WIDE_LABEL`、`PROVINCE_ORDER`；可按业务在对象中增删城市名，
 *   名称建议与高德返回的 `city` 字段写法一致（通常带「市」等后缀）。
 *
 * @note 须放在 `frontend/utils/`（与 `src` 同级），勿放入 `src/`。Expo Router 在 `app.json` 中配置 `root: "src"`，
 *   `src` 下任意 `.tsx` 会被当作路由页面，导致缺少 default export 的告警。
 *
 * @see docs/frontend/高德地图Android_SDK接入与开发说明.md — §9.4 搜索
 */

import React, { useCallback, useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// ---------------------------------------------------------------------------
// 省 / 市数据（可按业务扩展；名称尽量与高德 POI 同城检索一致，带「市」后缀）
// ---------------------------------------------------------------------------

/** 省级行政区 → 下辖城市名列表 */
export const CHINA_PROVINCE_CITIES: Record<string, readonly string[]> = {
  北京市: ['北京市'],
  天津市: ['天津市'],
  上海市: ['上海市'],
  重庆市: ['重庆市'],
  河北省: ['石家庄市','唐山市','秦皇岛市','邯郸市','邢台市','保定市','张家口市','承德市','沧州市','廊坊市','衡水市'],
  山西省: ['太原市', '大同市', '阳泉市', '长治市', '晋城市', '朔州市', '晋中市', '运城市', '忻州市', '临汾市', '吕梁市'],
  内蒙古自治区: ['呼和浩特市', '包头市', '乌海市', '赤峰市', '通辽市', '鄂尔多斯市', '呼伦贝尔市', '巴彦淖尔市', '乌兰察布市'],
  辽宁省: ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市', '丹东市', '锦州市', '营口市', '阜新市', '辽阳市', '盘锦市', '铁岭市', '朝阳市', '葫芦岛市'],
  吉林省: ['长春市', '吉林市', '四平市', '辽源市', '通化市', '白山市', '松原市', '白城市', '延边朝鲜族自治州'],
  黑龙江省: ['哈尔滨市', '齐齐哈尔市', '鸡西市', '鹤岗市', '双鸭山市', '大庆市', '伊春市', '佳木斯市', '七台河市', '牡丹江市', '黑河市', '绥化市'],
  江苏省: ['南京市', '无锡市', '徐州市', '常州市', '苏州市', '南通市', '连云港市', '淮安市', '盐城市', '扬州市', '镇江市', '泰州市', '宿迁市'],
  浙江省: ['杭州市', '宁波市', '温州市', '嘉兴市', '湖州市', '绍兴市', '金华市', '衢州市', '舟山市', '台州市', '丽水市'],
  安徽省: ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市', '淮北市', '铜陵市', '安庆市', '黄山市', '滁州市', '阜阳市', '宿州市', '六安市', '亳州市', '池州市', '宣城市'],
  福建省: ['福州市', '厦门市', '莆田市', '三明市', '泉州市', '漳州市', '南平市', '龙岩市', '宁德市'],
  江西省: ['南昌市', '景德镇市', '萍乡市', '九江市', '新余市', '鹰潭市', '赣州市', '吉安市', '宜春市', '抚州市', '上饶市'],
  山东省: ['济南市', '青岛市', '淄博市', '枣庄市', '东营市', '烟台市', '潍坊市', '济宁市', '泰安市', '威海市', '日照市', '临沂市', '德州市', '聊城市', '滨州市', '菏泽市'],
  河南省: ['郑州市', '开封市', '洛阳市', '平顶山市', '安阳市', '鹤壁市', '新乡市', '焦作市', '濮阳市', '许昌市', '漯河市', '三门峡市', '南阳市', '商丘市', '信阳市', '周口市', '驻马店市'],
  湖北省: ['武汉市', '黄石市', '十堰市', '宜昌市', '襄阳市', '鄂州市', '荆门市', '孝感市', '荆州市', '黄冈市', '咸宁市', '随州市'],
  湖南省: ['长沙市', '株洲市', '湘潭市', '衡阳市', '邵阳市', '岳阳市', '常德市', '张家界市', '益阳市', '郴州市', '永州市', '怀化市', '娄底市'],
  广东省: ['广州市','韶关市','深圳市','珠海市','汕头市','佛山市','江门市','湛江市','茂名市','肇庆市','惠州市','梅州市','汕尾市','河源市','阳江市','清远市','东莞市','中山市','潮州市','揭阳市','云浮市'],
  广西壮族自治区: ['南宁市', '柳州市', '桂林市', '梧州市', '北海市', '防城港市', '钦州市', '贵港市', '玉林市', '百色市', '贺州市', '河池市', '来宾市', '崇左市'],
  海南省: ['海口市', '三亚市', '三沙市', '儋州市'],
  四川省: ['成都市', '自贡市', '攀枝花市', '泸州市', '德阳市', '绵阳市', '广元市', '遂宁市', '内江市', '乐山市', '南充市', '眉山市', '宜宾市', '广安市', '达州市', '雅安市', '巴中市', '资阳市'],
  贵州省: ['贵阳市', '六盘水市', '遵义市', '安顺市', '毕节市', '铜仁市'],
  云南省: ['昆明市', '曲靖市', '玉溪市', '保山市', '昭通市', '丽江市', '普洱市', '临沧市'],
  西藏自治区: ['拉萨市', '日喀则市', '昌都市', '林芝市', '山南市', '那曲市'],
  陕西省: ['西安市', '铜川市', '宝鸡市', '咸阳市', '渭南市', '延安市', '汉中市', '榆林市', '安康市', '商洛市'],
  甘肃省: ['兰州市', '嘉峪关市', '金昌市', '白银市', '天水市', '武威市', '张掖市', '平凉市', '酒泉市', '庆阳市', '定西市', '陇南市'],
  青海省: ['西宁市', '海东市'],
  宁夏回族自治区: ['银川市', '石嘴山市', '吴忠市', '固原市', '中卫市'],
  新疆维吾尔自治区: ['乌鲁木齐市', '克拉玛依市', '吐鲁番市', '哈密市'],
  台湾省: ['台北市', '高雄市', '台中市', '台南市', '新北市', '桃园市'],
  香港特别行政区: ['香港特别行政区'],
  澳门特别行政区: ['澳门特别行政区'],
};

/** 选择「全国」时的展示文案；传给原生时需转为空串（见 cityToNativeParam） */
export const NATIONAL_WIDE_LABEL = '全国';

/** 省级列表展示顺序（直辖市靠前，其余按对象键顺序） */
export const PROVINCE_ORDER: readonly string[] = [
  '北京市',
  '天津市',
  '上海市',
  '重庆市',
  ...Object.keys(CHINA_PROVINCE_CITIES).filter(
    (p) => !['北京市', '天津市', '上海市', '重庆市'].includes(p),
  ),
];

/** 某省下辖城市（若传入逆地理城市且不在列表中，会插在列表最前） */
export function getCitiesForProvince(province: string, locatedCity?: string): string[] {
  const base = [...(CHINA_PROVINCE_CITIES[province] ?? [])];
  const loc = locatedCity?.trim();
  if (!loc || base.includes(loc)) return base;
  return [loc, ...base];
}

/** 根据城市名反查所属省级名（用于定位结果高亮/插入） */
export function findProvinceForCity(city: string): string | null {
  const c = city.trim();
  if (!c) return null;
  for (const [province, cities] of Object.entries(CHINA_PROVINCE_CITIES)) {
    if ((cities as readonly string[]).includes(c)) return province;
  }
  return null;
}

// ---------------------------------------------------------------------------
// 高德原生 POI：同城参数
// ---------------------------------------------------------------------------

/** 选「全国」时，原生侧传空字符串，表示全国 POI 检索 */
export function cityToNativeParam(city: string): string {
  const t = city.trim();
  if (t === '' || t === NATIONAL_WIDE_LABEL) return '';
  return t;
}

// ---------------------------------------------------------------------------
// CityPicker UI
// ---------------------------------------------------------------------------

export type CityPickerProps = {
  /** 当前选中：「全国」或「xx市」 */
  value: string;
  onChange: (city: string) => void;
  disabled?: boolean;
  /** 定位逆地理得到的城市名：会插入对应省份列表；若无法匹配省份则显示快捷项 */
  locatedCity?: string;
};

type Step = 'province' | 'city';

export function CityPicker({ value, onChange, disabled, locatedCity }: CityPickerProps) {
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState<Step>('province');
  const [province, setProvince] = useState<string | null>(null);

  const loc = locatedCity?.trim() ?? '';
  const locatedProvince = useMemo(() => (loc ? findProvinceForCity(loc) : null), [loc]);

  const open = useCallback(() => {
    if (disabled) return;
    setStep('province');
    setProvince(null);
    setVisible(true);
  }, [disabled]);

  const close = useCallback(() => {
    setVisible(false);
    setStep('province');
    setProvince(null);
  }, []);

  const cityRows = useMemo(() => {
    if (!province) return [];
    return getCitiesForProvince(province, loc);
  }, [province, loc]);

  const pickNational = useCallback(() => {
    onChange(NATIONAL_WIDE_LABEL);
    close();
  }, [onChange, close]);

  const pickLocatedOnly = useCallback(() => {
    if (!loc) return;
    onChange(loc);
    close();
  }, [loc, onChange, close]);

  const pickProvince = useCallback((p: string) => {
    setProvince(p);
    setStep('city');
  }, []);

  const pickCity = useCallback(
    (city: string) => {
      onChange(city);
      close();
    },
    [onChange, close],
  );

  const goBackToProvince = useCallback(() => {
    setStep('province');
    setProvince(null);
  }, []);

  const showLocatedShortcut = Boolean(loc && !locatedProvince);

  /** 当前选中城市所属省，用于在省列表上高亮 */
  const provinceForCurrentValue = useMemo(() => {
    if (value === NATIONAL_WIDE_LABEL) return null;
    return findProvinceForCity(value);
  }, [value]);

  return (
    <>
      <TouchableOpacity
        style={[styles.citySelect, disabled && styles.citySelectDisabled]}
        onPress={open}
        disabled={disabled}
        activeOpacity={0.75}
      >
        <Text style={styles.citySelectText}>{value}</Text>
        <Text style={styles.citySelectArrow}>▼</Text>
      </TouchableOpacity>

      <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
        <View style={styles.modalRoot}>
          <Pressable style={styles.modalBackdrop} onPress={close} />
          <View style={styles.modalCardWrap} pointerEvents="box-none">
            <View style={styles.modalCard}>
              {step === 'province' ? (
                <>
                  <Text style={styles.modalTitle}>选择地区</Text>
                  <Text style={styles.modalHint}>先选省 / 直辖市；「全国」表示不限制城市</Text>
                  <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
                    <TouchableOpacity
                      style={[styles.row, value === NATIONAL_WIDE_LABEL && styles.rowSelected]}
                      onPress={pickNational}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[styles.rowText, value === NATIONAL_WIDE_LABEL && styles.rowTextSelected]}
                      >
                        {NATIONAL_WIDE_LABEL}
                      </Text>
                      {value === NATIONAL_WIDE_LABEL ? <Text style={styles.check}>✓</Text> : null}
                    </TouchableOpacity>

                    {showLocatedShortcut ? (
                      <TouchableOpacity
                        style={[styles.row, value === loc && styles.rowSelected]}
                        onPress={pickLocatedOnly}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.rowText, value === loc && styles.rowTextSelected]}>
                          使用定位城市：{loc}
                        </Text>
                        {value === loc ? <Text style={styles.check}>✓</Text> : null}
                      </TouchableOpacity>
                    ) : null}

                    {PROVINCE_ORDER.map((p) => {
                      const selected = provinceForCurrentValue === p;
                      return (
                        <TouchableOpacity
                          key={p}
                          style={[styles.row, selected && styles.rowSelected]}
                          onPress={() => pickProvince(p)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.rowText, selected && styles.rowTextSelected]}>{p}</Text>
                          <Text style={styles.chevron}>›</Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.backRow} onPress={goBackToProvince} activeOpacity={0.7}>
                    <Text style={styles.backChevron}>‹</Text>
                    <Text style={styles.backText}>返回</Text>
                    <Text style={styles.backProvince} numberOfLines={1}>
                      {province}
                    </Text>
                  </TouchableOpacity>
                  <Text style={styles.modalTitle}>选择城市</Text>
                  <Text style={styles.modalHint}>请选择地级市（或直辖市）</Text>
                  <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
                    {cityRows.map((city) => {
                      const selected = value === city;
                      return (
                        <TouchableOpacity
                          key={city}
                          style={[styles.row, selected && styles.rowSelected]}
                          onPress={() => pickCity(city)}
                          activeOpacity={0.7}
                        >
                          <Text style={[styles.rowText, selected && styles.rowTextSelected]}>{city}</Text>
                          {selected ? <Text style={styles.check}>✓</Text> : null}
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </>
              )}

              <TouchableOpacity style={styles.closeBtn} onPress={close} activeOpacity={0.8}>
                <Text style={styles.closeBtnText}>关闭</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  citySelect: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#d1d5db',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 10,
    backgroundColor: '#f9fafb',
  },
  citySelectDisabled: {
    opacity: 0.65,
  },
  citySelectText: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  citySelectArrow: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 8,
  },
  modalRoot: {
    flex: 1,
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modalCardWrap: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    pointerEvents: 'box-none',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    maxHeight: '72%',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 6,
  },
  modalHint: {
    fontSize: 12,
    color: '#6b7280',
    lineHeight: 18,
    marginBottom: 10,
  },
  modalList: {
    maxHeight: 320,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginBottom: 4,
  },
  rowSelected: {
    backgroundColor: '#ecfdf5',
  },
  rowText: {
    fontSize: 15,
    color: '#111827',
    flex: 1,
  },
  rowTextSelected: {
    color: '#047857',
    fontWeight: '600',
  },
  check: {
    fontSize: 16,
    color: '#059669',
    marginLeft: 8,
  },
  chevron: {
    fontSize: 20,
    color: '#9ca3af',
    marginLeft: 8,
  },
  backRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingVertical: 4,
  },
  backChevron: {
    fontSize: 22,
    color: '#2563eb',
    marginRight: 4,
  },
  backText: {
    fontSize: 15,
    color: '#2563eb',
    fontWeight: '600',
  },
  backProvince: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'right',
  },
  closeBtn: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: '600',
  },
});
