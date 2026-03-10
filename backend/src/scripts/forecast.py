import sys
import json
import random

def simple_forecast(history):
    """
    Mock implementation of a complex forecasting model (e.g. Prophet/ARIMA).
    In a real scenario, we would import pandas/prophet here.
    """
    values = [float(h) for h in history]
    if not values:
        return 0.0
    
    # Calculate simple trend
    n = len(values)
    avg = sum(values) / n
    last_val = values[-1]
    
    # Simulate sophisticated logic: 
    # If growing, continue growing with dampening.
    # Add seasonality noise.
    
    slope = 0
    if n > 1:
        slope = (values[-1] - values[0]) / (n - 1)
        
    next_val = last_val + slope + random.uniform(-10, 10) # Noise
    return round(next_val, 2)

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            return

        data = json.loads(input_data)
        history = data.get('history', [])
        
        forecast = simple_forecast(history)
        
        # Output result to stdout
        output = {"forecast": forecast, "model": "Python-Custom-ARIMA-Mock"}
        print(json.dumps(output))

    except Exception as e:
        error_out = {"error": str(e)}
        print(json.dumps(error_out))
        sys.exit(1)

if __name__ == "__main__":
    main()
