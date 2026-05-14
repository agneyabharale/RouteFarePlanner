
from fastapi import APIRouter
from core.fare_engine import calculate_cab_fare, CAB_RATES
from models.requests import FareRequest
from models.response import FareResponse, FareBreakdown

router = APIRouter()

@router.post("/fare", response_model=FareResponse)
def estimate_fare(request: FareRequest):
    if request.mode != "cab":
        return FareResponse(success=False, message="Only cab fares supported currently via this endpoint.")
        
    dist = request.distance_km or 0.0
    time = request.duration_min or 0.0
    
    # Map vehicle type to our rate cards
    vehicle_map = {
        "mini": "uber_go",
        "sedan": "uber_sedan",
        "suv": "uber_xl",
        "auto": "auto_rickshaw"
    }
    cab_type = vehicle_map.get(request.vehicle_type, "uber_sedan")
    
    try:
        total = calculate_cab_fare(
            distance_km=dist,
            time_min=time,
            cab_type=cab_type,
            surge_multiplier=request.surge_multiplier
        )
        rate = CAB_RATES[cab_type]
        base_fare = rate.base_fare
        
        breakdown = FareBreakdown(
            mode=request.mode,
            base_fare_inr=base_fare,
            distance_km=dist,
            duration_min=time,
            surge_multiplier=request.surge_multiplier,
            surge_amount_inr=0.0, # Simplified
            tax_inr=0.0, # Simplified
            total_inr=total,
            breakdown_note=f"Base ₹{base_fare} + Dist/Time + Surge"
        )
        return FareResponse(success=True, fare=breakdown)
    except Exception as e:
        return FareResponse(success=False, message=str(e))
