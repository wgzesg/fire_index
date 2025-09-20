
import yfinance as yf
import pandas as pd
from datetime import datetime, timedelta
from google.protobuf.timestamp_pb2 import Timestamp
from models.stock_data_pb2 import Event, StockPrice, Dividend, BonusShare

def get_stock_events(ticker: str, years: int = 3) -> list[Event]:
    """
    Fetches stock events (monthly prices, dividends, and stock splits) for a given ticker.

    Args:
        ticker (str): The stock ticker symbol.
        years (int): The number of past years to fetch data for.

    Returns:
        list[Event]: A list of Event protobuf messages.
    """
    end_date = datetime.now()
    start_date = end_date - timedelta(days=years * 365)
    stock = yf.Ticker(ticker)
    events = []

    # Fetch monthly stock prices
    hist = stock.history(start=start_date, end=end_date, interval="1mo", auto_adjust=False)
    for index, row in hist.iterrows():
        ts = Timestamp()
        ts.FromDatetime(index)
        event = Event(
            ticker=ticker,
            event_date=ts,
            stock_price=StockPrice(
                open=row['Open'],
                high=row['High'],
                low=row['Low'],
                close=row['Close']
            )
        )
        events.append(event)

    # Fetch dividends
    dividends = stock.dividends
    dividends = dividends[dividends.index >= pd.to_datetime(start_date).tz_localize(dividends.index.tz)]
    for index, amount in dividends.items():
        ts = Timestamp()
        ts.FromDatetime(index)
        event = Event(
            ticker=ticker,
            event_date=ts,
            dividend=Dividend(amount_per_share=amount)
        )
        events.append(event)

    # Fetch stock splits (bonus shares)
    splits = stock.splits
    splits = splits[splits.index >= pd.to_datetime(start_date).tz_localize(splits.index.tz)]
    for index, ratio in splits.items():
        ts = Timestamp()
        ts.FromDatetime(index)
        event = Event(
            ticker=ticker,
            event_date=ts,
            bonus_share=BonusShare(shares_per_share_owned=ratio)
        )
        events.append(event)

    return events
