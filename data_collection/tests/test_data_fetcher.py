import pandas as pd
import pytest
from service.data_fetcher import get_monthly_ohlc

TEST_TICKERS = ["D05.SI", "C6L.SI", "S58.SI", "ME8U.SI", "M44U.SI", "BN4.SI", "A7RU.SI"]

@pytest.mark.parametrize("ticker", TEST_TICKERS)
def test_get_monthly_ohlc_returns_dataframe(ticker):
    """Tests if get_monthly_ohlc returns a pandas DataFrame."""
    data = get_monthly_ohlc(ticker)
    assert isinstance(data, pd.DataFrame)

@pytest.mark.parametrize("ticker", TEST_TICKERS)
def test_get_monthly_ohlc_not_empty(ticker):
    """Tests if the returned DataFrame is not empty."""
    data = get_monthly_ohlc(ticker)
    assert not data.empty

@pytest.mark.parametrize("ticker", TEST_TICKERS)
def test_get_monthly_ohlc_has_expected_columns(ticker):
    """Tests if the DataFrame has the expected columns."""
    data = get_monthly_ohlc(ticker)
    expected_columns = ['Open', 'High', 'Low', 'Close']
    assert all(col in data.columns for col in expected_columns)

def test_get_monthly_ohlc_handles_invalid_ticker():
    """Tests if the function handles an invalid ticker gracefully."""
    invalid_ticker = "INVALIDTICKER"
    data = get_monthly_ohlc(invalid_ticker)
    assert data.empty