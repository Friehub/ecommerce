# Prisma Migration Plan

Total violations: 2046

## Breakdown by Model

| Model | Count | Target Service |
| :--- | :--- | :--- |
| seller | 272 | sellerService |
| order | 196 | orderService |
| user | 172 | userService |
| productVariant | 104 | productVariantService |
| product | 96 | productService |
| dispute | 76 | disputeService |
| sellerLedgerEntry | 76 | sellerLedgerEntryService |
| payout | 68 | payoutService |
| cart | 68 | cartService |
| orderPackage | 52 | orderPackageService |
| stockLevel | 48 | stockLevelService |
| eventLog | 44 | eventLogService |
| category | 44 | categoryService |
| commission | 44 | commissionService |
| cartItem | 40 | cartItemService |
| payment | 36 | paymentService |
| userAddress | 36 | userAddressService |
| $transaction | 34 | $transactionService |
| flashSale | 32 | flashSaleService |
| warehouse | 32 | warehouseService |
| brand | 28 | brandService |
| orderLine | 28 | orderLineService |
| affiliateAgent | 28 | affiliateAgentService |
| review | 28 | reviewService |
| wallet | 28 | walletService |
| shipment | 28 | shipmentService |
| sellerDocument | 24 | sellerDocumentService |
| returnShipment | 24 | returnShipmentService |
| banner | 24 | bannerService |
| adCampaign | 20 | adCampaignService |
| notificationLog | 20 | notificationLogService |
| referralLink | 16 | referralLinkService |
| wishlist | 16 | wishlistService |
| sellerStatement | 12 | sellerStatementService |
| adGroup | 12 | adGroupService |
| wishlistItem | 12 | wishlistItemService |
| productQuestion | 12 | productQuestionService |
| userDevice | 12 | userDeviceService |
| productRelation | 8 | productRelationService |
| promotion | 8 | promotionService |
| referralClick | 8 | referralClickService |
| notificationPreference | 8 | notificationPreferenceService |
| deliveryAgent | 8 | deliveryAgentService |
| $executeRawUnsafe | 6 | $executeRawUnsafeService |
| stockReservation | 4 | stockReservationService |
| adConversion | 4 | adConversionService |
| walletTransaction | 4 | walletTransactionService |
| $queryRaw | 4 | $queryRawService |
| oAuthAccount | 4 | oAuthAccountService |
| adImpression | 4 | adImpressionService |
| coupon | 4 | couponService |
| couponRedemption | 4 | couponRedemptionService |
| productAnswer | 4 | productAnswerService |
| session | 4 | sessionService |
| disputeMessage | 4 | disputeMessageService |
| disputeEvidence | 4 | disputeEvidenceService |
| pickupStation | 4 | pickupStationService |
| $disconnect | 4 | $disconnectService |
| $connect | 2 | $connectService |

## Automated Migration Strategy

1. **Service Generation**: Create generic service wrappers for models with > 50 violations.
2. **Codemod Execution**: Run a script to replace `prisma.model.action` with `modelService.action`.
3. **Import Injection**: Automatically add service imports to refactored files.
4. **Manual Polish**: Review complex queries and transactions.
