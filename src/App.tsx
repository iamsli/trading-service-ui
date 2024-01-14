import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Trade {
  user_id: string;
  ticker: string;
  side: string;
  price: number;
  volume: number;
}

const TradingApp: React.FC = () => {
  const [trade, setTrade] = useState<Trade>({
    user_id: '',
    ticker: '',
    side: '',
    price: 0,
    volume: 0,
  });

  const [userId, setUserId] = useState<string>('');
  const [stats, setStats] = useState<any>(null);
  const [historicalTrades, setHistoricalTrades] = useState<any[]>([]);
  const [confirmationMessage, setConfirmationMessage] = useState<string>('');

  useEffect(() => {
    // Fetch initial stats and historical trades on component mount
    fetchStats();
    fetchHistoricalTrades();
  }, [userId]);

  const submitTrade = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/submit_trade', {
        ...trade,
        user_id: userId,
      });
      // Update stats and historical trades after submitting a trade
      fetchStats();
      fetchHistoricalTrades();
      setConfirmationMessage('Trade submitted successfully!');
    } catch (error) {
      console.error('Error submitting trade:', error);
    }
  };

  const handleUserIdChange = (newUserId: string) => {
    setUserId(newUserId);

    // reset page with newUserId info
    setConfirmationMessage(''); 
    fetchStats();
    fetchHistoricalTrades();
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/get_stats?user_id=${userId}`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchHistoricalTrades = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/get_historical_trades?user_id=${userId}`);
      setHistoricalTrades(response.data.historical_trades || []);
    } catch (error) {
      setHistoricalTrades([])
      console.error('Error fetching historical trades:', error);
    }
  };

  return (
    <div>
      <h1>Trading App</h1>
      <label>User ID: </label>
      <input type="text" value={userId} onChange={(e) => handleUserIdChange(e.target.value)} />
      <br />
      <h2>Submit Trade</h2>
      <label>Ticker: </label>
      <input type="text" value={trade.ticker} onChange={(e) => setTrade({ ...trade, ticker: e.target.value })} />
      <br />
      <label>Side: </label>
      <select value={trade.side} onChange={(e) => setTrade({ ...trade, side: e.target.value })}>
        <option value="">Select Side</option>
        <option value="buy">Buy</option>
        <option value="sell">Sell</option>
      </select>
      <br />
      <label>Price: </label>
      <input type="number" value={trade.price} onChange={(e) => setTrade({ ...trade, price: parseFloat(e.target.value) || 0 })} />
      <br />
      <label>Volume: </label>
      <input type="number" value={trade.volume} onChange={(e) => setTrade({ ...trade, volume: parseInt(e.target.value) || 0 })} />
      <br />
      <button onClick={submitTrade}>Submit Trade</button>
      {confirmationMessage && <p style={{ color: 'green' }}>{confirmationMessage}</p>}
      <br />
      <h2>Trading Stats</h2>
      {stats && Object.keys(stats).length > 0 ? (
        <div>
          {Object.keys(stats).map((ticker) => (
            <div key={ticker}>
              <h3>{ticker}</h3>
              <p>Highest Price: {stats[ticker].highest_price}</p>
              <p>Lowest Price: {stats[ticker].lowest_price}</p>
              <p>Total Value: {stats[ticker].total_value}</p>
              <p>Total Volume: {stats[ticker].total_volume}</p>
              <p>VWAP: {stats[ticker].vwap}</p>
              <p> -------------------------------------------- </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No trading stats available</p>
      )}


      <p><b>================================================</b></p>

      <h2>Historical Trades</h2>
      {historicalTrades && historicalTrades.length > 0 ? (
        <div>
          {historicalTrades.map((trade) => (
            <div key={trade.timestamp}>
              <p>Timestamp: {trade.timestamp}</p>
              <p>Ticker: {trade.ticker}</p>
              <p>Side: {trade.side}</p>
              <p>Price: {trade.price}</p>
              <p>Volume: {trade.volume}</p>
              <p>Status: {trade.status}</p>
              <p> -------------------------- </p>
            </div>
          ))}
        </div>
      ) : (
        <p>No historical trades available</p>
      )}

    </div>
  );
};

export default TradingApp;
