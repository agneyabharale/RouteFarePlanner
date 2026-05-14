from dataclasses import dataclass
from typing import Optional

@dataclass
class CabRate:
    base_fare: float
    per_km: float
    per_min: float
    min_fare: float

# Standard rate cards (Pune approx)
CAB_RATES = {
    "uber_go": CabRate(base_fare=40.0, per_km=9.0, per_min=1.2, min_fare=70.0),
    "uber_sedan": CabRate(base_fare=50.0, per_km=11.0, per_min=1.5, min_fare=80.0),
    "uber_xl": CabRate(base_fare=70.0, per_km=14.0, per_min=2.0, min_fare=120.0),
    "ola_mini": CabRate(base_fare=40.0, per_km=9.5, per_min=1.0, min_fare=70.0),
    "auto_rickshaw": CabRate(base_fare=23.0, per_km=15.0, per_min=0.0, min_fare=23.0),
}

def calculate_cab_fare(
    distance_km: float, 
    time_min: float, 
    cab_type: str = "uber_go", 
    surge_multiplier: float = 1.0
) -> float:
    """
    Calculate the estimated fare for a cab or auto rickshaw.
    
    Args:
        distance_km: Distance in kilometers
        time_min: Estimated travel time in minutes
        cab_type: Type of cab (e.g., 'uber_go', 'auto_rickshaw')
        surge_multiplier: Surge pricing multiplier (default 1.0)
        
    Returns:
        Estimated fare in INR
    """
    rate = CAB_RATES.get(cab_type)
    if not rate:
        raise ValueError(f"Unknown cab type: {cab_type}")
        
    if cab_type == "auto_rickshaw":
        # Pune Auto Rickshaw rules: First 1.5 km is Rs 23. Rs 15 per km after.
        if distance_km <= 1.5:
            fare = rate.base_fare
        else:
            fare = rate.base_fare + ((distance_km - 1.5) * rate.per_km)
    else:
        # Standard Cab rules
        fare = rate.base_fare + (distance_km * rate.per_km) + (time_min * rate.per_min)
        
    # Apply surge
    fare *= surge_multiplier
    
    # Enforce minimum fare
    fare = max(fare, rate.min_fare)
    
    return round(fare, 2)

def get_available_cabs(distance_km: float, time_min: float, surge_multiplier: float = 1.0) -> dict[str, float]:
    """
    Returns estimated fares for all available cab types.
    """
    results = {}
    for cab_type in CAB_RATES:
        results[cab_type] = calculate_cab_fare(distance_km, time_min, cab_type, surge_multiplier)
    return results

if __name__ == "__main__":
    print("Testing Cab Fares for Hinjawadi to Swargate (~18 km, 50 mins)")
    
    dist = 18.0
    time = 50.0
    
    all_fares = get_available_cabs(dist, time)
    for cab, fare in all_fares.items():
        print(f"  {cab}: ₹{fare}")
