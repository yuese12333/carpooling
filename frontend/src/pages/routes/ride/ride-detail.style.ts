/**
 * @file ride-detail.style.ts
 * @description 行程详情页面样式
 */

import { StyleSheet } from "react-native";
import { COLORS } from '@/pages/style';

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  placeholder: {
    width: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSub,
    fontSize: 14,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: COLORS.textSub,
    marginBottom: 20,
  },
  backButtonText: {
    fontSize: 16,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  routeCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  routePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  routeDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.primary,
    marginTop: 4,
    marginRight: 12,
  },
  routeDotEnd: {
    backgroundColor: COLORS.success,
  },
  routeLine: {
    width: 2,
    height: 30,
    backgroundColor: COLORS.border,
    marginLeft: 5,
    marginVertical: 4,
  },
  routeInfo: {
    flex: 1,
  },
  routeLabel: {
    fontSize: 12,
    color: COLORS.textSub,
    marginBottom: 2,
  },
  routeAddress: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoContent: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: COLORS.textSub,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
  },
  infoDivider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  priceLabel: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  priceValue: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: '600',
  },
  driverCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 14,
    color: COLORS.textSub,
    marginBottom: 12,
  },
  driverInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatarPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 20,
    color: COLORS.primary,
    fontWeight: '600',
  },
  driverDetail: {
    marginLeft: 12,
    flex: 1,
  },
  driverName: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: '500',
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: 4,
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '500',
  },
  contactButton: {
    padding: 12,
    backgroundColor: COLORS.primaryLight,
    borderRadius: 24,
  },
  vehicleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  vehicleInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  vehicleText: {
    marginLeft: 12,
    fontSize: 14,
    color: COLORS.text,
  },
  remarkCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  remarkText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  messageButton: {
    padding: 12,
    marginRight: 12,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 24,
  },
  bookButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 24,
    alignItems: 'center',
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
});
