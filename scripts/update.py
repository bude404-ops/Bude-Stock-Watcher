import requests, json

symbols = ["AAPL","MSFT","NVDA","TSLA","AMZN","META","GOOGL"]

API_KEY = "YOUR_FINNHUB_KEY"

data = []

for s in symbols:
    url = f"https://finnhub.io/api/v1/quote?symbol={s}&token={API_KEY}"
    r = requests.get(url).json()

    change = ((r["c"] - r["pc"]) / r["pc"]) * 100

    data.append({
        "symbol": s,
        "price": r["c"],
        "change": round(change, 2)
    })

with open("data/market.json", "w") as f:
    json.dump(data, f, indent=2)
