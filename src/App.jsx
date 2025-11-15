import React, { useState, useEffect } from 'react';
import { Search, TrendingUp, AlertCircle, MessageCircle, BarChart3, RefreshCw } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const API_URL = 'http://localhost:5000/api';

export default function BrandTracker() {
  const [brand, setBrand] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [mentions, setMentions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('all');

  // Start monitoring
  const startMonitoring = async () => {
    if (!brand.trim()) {
      alert('Please enter a brand name');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/monitor/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brand })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsMonitoring(true);
        fetchData();
      }
    } catch (error) {
      console.error('Error starting monitor:', error);
      alert('Failed to start monitoring. Make sure the backend is running on port 5000.');
    }
    setLoading(false);
  };

  // Fetch data
  const fetchData = async () => {
    try {
      const [mentionsRes, analyticsRes] = await Promise.all([
        fetch(`${API_URL}/mentions?limit=50`),
        fetch(`${API_URL}/analytics`)
      ]);

      const mentionsData = await mentionsRes.json();
      const analyticsData = await analyticsRes.json();

      setMentions(mentionsData.data || []);
      setAnalytics(analyticsData.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  // Auto-refresh every 5 seconds
  useEffect(() => {
    if (isMonitoring) {
      const interval = setInterval(fetchData, 5000);
      return () => clearInterval(interval);
    }
  }, [isMonitoring]);

  // Filter mentions
  const filteredMentions = filter === 'all' 
    ? mentions 
    : mentions.filter(m => m.sentiment === filter);

  // Sentiment colors
  const COLORS = {
    positive: '#10b981',
    negative: '#ef4444',
    neutral: '#6b7280'
  };

  const pieData = analytics ? [
    { name: 'Positive', value: analytics.sentimentBreakdown.positive, color: COLORS.positive },
    { name: 'Negative', value: analytics.sentimentBreakdown.negative, color: COLORS.negative },
    { name: 'Neutral', value: analytics.sentimentBreakdown.neutral, color: COLORS.neutral }
  ] : [];

  // Timeline data (last 10 mentions)
  const timelineData = mentions.slice(-10).map((m, i) => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    mentions: i + 1
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Brand Reputation Tracker
          </h1>
          <p className="text-purple-200">Real-time monitoring across social media, news, and forums</p>
        </div>

        {/* Search Section */}
        {!isMonitoring ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 mb-6 border border-white/20">
            <div className="max-w-2xl mx-auto">
              <label className="block text-white text-sm font-medium mb-3">
                Enter Brand Name to Monitor
              </label>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && startMonitoring()}
                  placeholder="e.g., Apple, Tesla, Nike..."
                  className="flex-1 px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-400"
                />
                <button
                  onClick={startMonitoring}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg font-medium hover:from-purple-600 hover:to-pink-600 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Search className="w-5 h-5" />
                  {loading ? 'Starting...' : 'Start Monitoring'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Active Monitor Header */}
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6 border border-white/20 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                <div>
                  <h2 className="text-xl font-bold text-white">Monitoring: {brand}</h2>
                  <p className="text-purple-200 text-sm">Live updates every 5 seconds</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsMonitoring(false);
                  setBrand('');
                  setMentions([]);
                  setAnalytics(null);
                }}
                className="px-4 py-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-all"
              >
                Stop Monitoring
              </button>
            </div>

            {/* Stats Cards */}
            {analytics && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <MessageCircle className="w-8 h-8 text-purple-300" />
                    <span className="text-2xl font-bold text-white">{analytics.totalMentions}</span>
                  </div>
                  <p className="text-purple-200 text-sm">Total Mentions</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <TrendingUp className="w-8 h-8 text-green-400" />
                    <span className="text-2xl font-bold text-white">{analytics.sentimentBreakdown.positive}</span>
                  </div>
                  <p className="text-purple-200 text-sm">Positive</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                    <span className="text-2xl font-bold text-white">{analytics.sentimentBreakdown.negative}</span>
                  </div>
                  <p className="text-purple-200 text-sm">Negative</p>
                </div>

                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <div className="flex items-center justify-between mb-2">
                    <BarChart3 className="w-8 h-8 text-gray-400" />
                    <span className="text-2xl font-bold text-white">{analytics.sentimentBreakdown.neutral}</span>
                  </div>
                  <p className="text-purple-200 text-sm">Neutral</p>
                </div>
              </div>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Sentiment Distribution */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Sentiment Distribution</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Mentions Timeline */}
              <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                <h3 className="text-lg font-bold text-white mb-4">Mentions Timeline</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <LineChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                    <XAxis dataKey="time" stroke="#ffffff60" />
                    <YAxis stroke="#ffffff60" />
                    <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                    <Line type="monotone" dataKey="mentions" stroke="#a855f7" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Top Topics */}
              {analytics && analytics.topTopics.length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4">Top Topics</h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics.topTopics}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff20" />
                      <XAxis dataKey="topic" stroke="#ffffff60" />
                      <YAxis stroke="#ffffff60" />
                      <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                      <Bar dataKey="count" fill="#a855f7" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Spikes Alert */}
              {analytics && analytics.recentSpikes.length > 0 && (
                <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-orange-400" />
                    Conversation Spikes
                  </h3>
                  {analytics.recentSpikes.map((spike, i) => (
                    <div key={i} className="bg-orange-500/20 border border-orange-400/30 rounded-lg p-4">
                      <p className="text-orange-200 font-medium">
                        Spike detected in "{spike.topic}"
                      </p>
                      <p className="text-orange-300 text-sm mt-1">
                        {spike.count} mentions in the last hour
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mentions List */}
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Recent Mentions</h3>
                <div className="flex gap-2">
                  {['all', 'positive', 'negative', 'neutral'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={`px-3 py-1 rounded-lg text-sm transition-all ${
                        filter === f
                          ? 'bg-purple-500 text-white'
                          : 'bg-white/10 text-purple-200 hover:bg-white/20'
                      }`}
                    >
                      {f.charAt(0).toUpperCase() + f.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filteredMentions.length === 0 ? (
                  <p className="text-purple-200 text-center py-8">No mentions yet...</p>
                ) : (
                  filteredMentions.map((mention) => (
                    <div
                      key={mention.id}
                      className="bg-white/5 rounded-lg p-4 border border-white/10 hover:border-purple-400/50 transition-all"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              mention.sentiment === 'positive'
                                ? 'bg-green-500/20 text-green-300'
                                : mention.sentiment === 'negative'
                                ? 'bg-red-500/20 text-red-300'
                                : 'bg-gray-500/20 text-gray-300'
                            }`}
                          >
                            {mention.sentiment}
                          </span>
                          <span className="text-purple-300 text-xs">{mention.source}</span>
                          <span className="text-purple-400 text-xs">#{mention.topic}</span>
                        </div>
                        <span className="text-purple-300 text-xs">
                          {new Date(mention.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-white mb-2">{mention.text}</p>
                      <div className="flex items-center gap-4 text-xs text-purple-300">
                        <span>@{mention.author}</span>
                        <span>❤️ {mention.engagement}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}