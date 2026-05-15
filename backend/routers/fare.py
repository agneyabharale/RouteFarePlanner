from fastapi import APIRouter
from backend.core.fare_engine import calculate_cab_fare, CAB_RATES
from backend.models.requests import FareRequest           # Fix: was missing 'backend.'
from backend.models.response import FareResponse, FareBreakdown

router = APIRouter()


@router.post("/fare", response_model=FareResponse)
def estimate_fare(request: FareRequest):
    if request.mode != "cab":
        return FareResponse(
            success=False,
            message="Only cab fares supported via this endpoint. Bus/metro fares are calculated inline from the route result."
        )

    dist = request.distance_km or 0.0
    time = request.duration_min or 0.0

    vehicle_map = {
        "mini":  "uber_go",
        "sedan": "uber_sedan",
        "suv":   "uber_xl",
        "auto":  "auto_rickshaw",
    }
    cab_type = vehicle_map.get(request.vehicle_type, "uber_sedan")

    try:
        rate      = CAB_RATES[cab_type]
        base_fare = rate.base_fare
        total     = calculate_cab_fare(
            distance_km      = dist,
            time_min         = time,
            cab_type         = cab_type,
            surge_multiplier = request.surge_multiplier,
        )

        # Calculate how much the surge actually added
        fare_before_surge = calculate_cab_fare(dist, time, cab_type, surge_multiplier=1.0)
        surge_amount      = round(total - fare_before_surge, 2)

        breakdown = FareBreakdown(
            mode             = request.mode,
            base_fare_inr    = base_fare,
            distance_km      = dist,
            duration_min     = time,
            surge_multiplier = request.surge_multiplier,
            surge_amount_inr = surge_amount,
            tax_inr          = 0.0,
            total_inr        = total,
            breakdown_note   = (
                f"₹{base_fare} base + ₹{round(dist * rate.per_km, 1)} "
                f"({dist}km × ₹{rate.per_km}/km) + "
                f"₹{round(time * rate.per_min, 1)} "
                f"({time}min × ₹{rate.per_min}/min)"
                + (f" × {request.surge_multiplier}x surge" if request.surge_multiplier > 1.0 else "")
            ),
        )
        return FareResponse(success=True, fare=breakdown)

    except Exception as e:
        return FareResponse(success=False, message=str(e))