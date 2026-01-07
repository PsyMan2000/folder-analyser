import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { Folder, HardDrive, RefreshCw, AlertCircle } from 'lucide-react';

const FolderSizeAnalyzer = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalSize, setTotalSize] = useState(0);
  const [viewMode, setViewMode] = useState('bar');
  const [scanPath] = useState('/data');

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#06b6d4', '#6366f1', '#14b8a6'];

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const fetchFolderData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/scan?path=${encodeURIComponent(scanPath)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      const sortedFolders = result.folders.sort((a, b) => b.size - a.size);
      const total = result.totalSize;
      
      setData(sortedFolders.map(folder => ({
        ...folder,
        percentage: ((folder.size / total) * 100).toFixed(1)
      })));
      setTotalSize(total);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFolderData();
  }, []);

  const refreshData = () => {
    fetchFolderData();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="text-center">
          <RefreshCw className="w-16 h-16 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-300 text-lg">Scanning folders...</p>
          <p className="text-slate-500 text-sm mt-2">This may take a moment for large directories</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
        <div className="bg-slate-800 border border-red-500 rounded-xl p-8 max-w-md">
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
            <h2 className="text-xl font-bold text-white">Error</h2>
          </div>
          <p className="text-slate-300 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <HardDrive className="w-10 h-10 text-blue-500" />
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Folder Size Analyzer</h1>
                <p className="text-slate-400">Mounted Volume: {scanPath}</p>
              </div>
            </div>
            <button
              onClick={refreshData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Refresh
            </button>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-slate-400">Total Size:</span>
            <span className="text-2xl font-bold text-white">{formatBytes(totalSize)}</span>
            <span className="text-slate-500 ml-2">({data.length} folders)</span>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setViewMode('bar')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'bar' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Bar Chart
          </button>
          <button
            onClick={() => setViewMode('pie')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              viewMode === 'pie' ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
            }`}
          >
            Pie Chart
          </button>
        </div>

        {data.length > 0 ? (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 mb-6 border border-slate-700">
            {viewMode === 'bar' ? (
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis tickFormatter={formatBytes} stroke="#94a3b8" />
                  <Tooltip 
                    formatter={(value) => formatBytes(value)}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#e2e8f0' }}
                  />
                  <Bar dataKey="size" fill="#3b82f6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name} (${percentage}%)`}
                    outerRadius={130}
                    fill="#8884d8"
                    dataKey="size"
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => formatBytes(value)}
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                  />
                  <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        ) : (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-8 mb-6 border border-slate-700 text-center">
            <Folder className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400">No folders found in the mounted volume</p>
          </div>
        )}

        {data.length > 0 && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden">
            <div className="p-4 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white">Folder Details</h2>
            </div>
            <div className="divide-y divide-slate-700">
              {data.map((folder, index) => (
                <div key={folder.name} className="p-4 hover:bg-slate-700/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      <Folder className="w-6 h-6" style={{ color: COLORS[index % COLORS.length] }} />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-white font-medium">{folder.name}</span>
                          <span className="text-slate-400 text-sm">{folder.percentage}%</span>
                        </div>
                        <div className="mt-2 w-full bg-slate-700 rounded-full h-2">
                          <div
                            className="h-2 rounded-full transition-all duration-500"
                            style={{
                              width: `${folder.percentage}%`,
                              backgroundColor: COLORS[index % COLORS.length]
                            }}
                          />
                        </div>
                      </div>
                    </div>
                    <span className="text-white font-bold ml-4">{formatBytes(folder.size)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FolderSizeAnalyzer;
