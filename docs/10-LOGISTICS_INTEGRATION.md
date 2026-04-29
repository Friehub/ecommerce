# 10 - Logistics Integration

**Status:** Lower Priority — mock API sufficient for contest.

---

## Delivery Models

| Model | Description |
|---|---|
| Seller Self-Fulfilled | Seller ships via their own courier. They log tracking number manually. |
| Jumia Logistics (In-house) | Platform assigns delivery agents from its own fleet. |
| Third-Party Logistics (3PL) | API integration with partners (DHL, Kwik, Sendbox). |

---

## For the Contest: Mock Delivery Agent Flow

No third-party API integration required. The delivery agent app directly marks status.

```
Order PROCESSING
  → Admin assigns agent (or auto-assign by zone)
  → Shipment created (status=ASSIGNED)
  → Agent sees it in their app
  → Agent marks PICKED_UP → IN_TRANSIT → OUT_FOR_DELIVERY → DELIVERED
  → On DELIVERED: proof photo uploaded to R2, shipment.delivered event fired
```

---

## Third-Party API Design (For Production)

Each logistics partner is wrapped in a standard interface so they can be swapped without changing the logistics module.

```typescript
interface LogisticsProvider {
  createShipment(order: OrderPackage): Promise<{ trackingNumber: string }>
  getTrackingStatus(trackingNumber: string): Promise<ShipmentStatus>
  cancelShipment(trackingNumber: string): Promise<void>
  schedulePickup(address: Address, date: Date): Promise<{ pickupId: string }>
}
```

Concrete implementations:
- `InHouseLogisticsProvider` — Uses our own agent app.
- `KwikDeliveryProvider` — Kwik API (Lagos-focused last-mile).
- `SendboxProvider` — Sendbox API (national coverage).

---

## Webhook Callbacks from 3PL

If using a 3PL, they push status updates to our webhook:

```
POST /api/webhooks/logistics
Body: { provider, trackingNumber, status, timestamp, location }
```

We map their status codes to our internal `ShipmentStatus` enum.

---

## Pickup Stations

| Field | Description |
|---|---|
| id | Unique station ID |
| name | Display name (e.g. "Ikeja Station") |
| address | Full street address |
| city, state | For zone filtering |
| lat, lng | For map display and distance calculation |
| operating_hours | JSON: { mon: "8am-6pm", ... } |
| is_active | Whether the station is currently operational |

Buyer selects a pickup station at checkout as an alternative to home delivery.
Package is held for 7 days. After 7 days, auto-returned to warehouse.
