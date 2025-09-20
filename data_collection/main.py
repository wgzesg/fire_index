from service.data_fetcher import get_stock_events
from models.stock_data_pb2 import EventCollection

STOCKS = {
    "DBS": "D05.SI",
    "SIA": "C6L.SI",
    "SATS": "S58.SI",
    "Mapletree Industrial Trust": "ME8U.SI",
    "Mapletree Logistics Trust": "M44U.SI",
    "Keppel": "BN4.SI",
    "Keppel Infra Trust": "A7RU.SI",
}

OUTPUT_FILE = "../frontend/public/stock_data.bin"


def main():
    """
    Main function to fetch and save stock events for multiple companies.
    """
    collection = EventCollection()

    for company, ticker in STOCKS.items():
        print(f"Fetching events for {company} ({ticker})...")
        events = get_stock_events(ticker, years=10)

        if events:
            collection.events.extend(events)
            print(f"Events for {company} fetched successfully.")
        else:
            print(
                f"Failed to fetch or no events were returned for {company} ({ticker})."
            )

    if collection.events:
        print(f"Saving data to {OUTPUT_FILE}...")
        with open(OUTPUT_FILE, "wb") as f:
            f.write(collection.SerializeToString())
        print("Data saved successfully.")


if __name__ == "__main__":
    main()
