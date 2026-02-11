import React, { useState, useEffect } from 'react';
import { Lock, Shield, Plus, Trash2 } from 'lucide-react';

interface IPEntry {
  ip: string;
  addedBy: string;
  addedAt: string;
  reason?: string;
}

export default function SecurityAdminPanel() {
  const [whitelist, setWhitelist] = useState<IPEntry[]>([]);
  const [blacklist, setBlacklist] = useState<IPEntry[]>([]);
  const [newIP, setNewIP] = useState('');
  const [reason, setReason] = useState('');
  const [activeTab, setActiveTab] = useState<'whitelist' | 'blacklist'>('whitelist');
  const [loading, setLoading] = useState(false);

  // Fetch IP lists on mount
  useEffect(() => {
    fetchIPLists();
  }, []);

  const fetchIPLists = async () => {
    try {
      const [whitelistRes, blacklistRes] = await Promise.all([
        fetch('/api/production/security/whitelist'),
        fetch('/api/production/security/blacklist'),
      ]);

      if (whitelistRes.ok) {
        const whitelistData = await whitelistRes.json();
        setWhitelist(whitelistData);
      }

      if (blacklistRes.ok) {
        const blacklistData = await blacklistRes.json();
        setBlacklist(blacklistData);
      }
    } catch (error) {
      console.error('Failed to fetch IP lists:', error);
    }
  };

  const validateIP = (ip: string): boolean => {
    const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipRegex.test(ip)) return false;

    const parts = ip.split('.');
    return parts.every(part => {
      const num = parseInt(part, 10);
      return num >= 0 && num <= 255;
    });
  };

  const addToWhitelist = async () => {
    if (!validateIP(newIP)) {
      alert('Invalid IP address format');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/production/security/whitelist-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: newIP, reason }),
      });

      if (response.ok) {
        setWhitelist([
          ...whitelist,
          {
            ip: newIP,
            addedBy: 'Current User', // Replace with actual user
            addedAt: new Date().toISOString(),
            reason: reason || undefined,
          },
        ]);
        setNewIP('');
        setReason('');
      } else {
        alert('Failed to add IP to whitelist');
      }
    } catch (error) {
      console.error('Error adding to whitelist:', error);
      alert('Failed to add IP to whitelist');
    } finally {
      setLoading(false);
    }
  };

  const addToBlacklist = async () => {
    if (!validateIP(newIP)) {
      alert('Invalid IP address format');
      return;
    }

    if (!confirm(`Are you sure you want to blacklist ${newIP}? This will block all access from this IP.`)) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/production/security/blacklist-ip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip: newIP, reason }),
      });

      if (response.ok) {
        setBlacklist([
          ...blacklist,
          {
            ip: newIP,
            addedBy: 'Current User', // Replace with actual user
            addedAt: new Date().toISOString(),
            reason: reason || undefined,
          },
        ]);
        setNewIP('');
        setReason('');
      } else {
        alert('Failed to add IP to blacklist');
      }
    } catch (error) {
      console.error('Error adding to blacklist:', error);
      alert('Failed to add IP to blacklist');
    } finally {
      setLoading(false);
    }
  };

  const removeFromList = async (ip: string, listType: 'whitelist' | 'blacklist') => {
    try {
      const endpoint = listType === 'whitelist'
        ? `/api/production/security/whitelist/${encodeURIComponent(ip)}`
        : `/api/production/security/blacklist/${encodeURIComponent(ip)}`;

      const response = await fetch(endpoint, { method: 'DELETE' });

      if (response.ok) {
        if (listType === 'whitelist') {
          setWhitelist(whitelist.filter(entry => entry.ip !== ip));
        } else {
          setBlacklist(blacklist.filter(entry => entry.ip !== ip));
        }
      } else {
        alert(`Failed to remove IP from ${listType}`);
      }
    } catch (error) {
      console.error(`Error removing from ${listType}:`, error);
      alert(`Failed to remove IP from ${listType}`);
    }
  };

  const currentList = activeTab === 'whitelist' ? whitelist : blacklist;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Security Administration</h2>
        <p className="mt-1 text-sm text-gray-600">
          Manage IP whitelists and blacklists for security hardening
        </p>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex gap-3">
          <Shield className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-yellow-800">Security Critical Operations</p>
            <p className="text-sm text-yellow-700 mt-1">
              All IP management actions are logged. Blacklisting an IP will immediately block access.
            </p>
          </div>
        </div>
      </div>

      {/* Add IP Form */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add IP Address</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              IP Address *
            </label>
            <input
              type="text"
              value={newIP}
              onChange={(e) => setNewIP(e.target.value)}
              placeholder="192.168.1.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reason (Optional)
            </label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why this IP is being added..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button
            onClick={addToWhitelist}
            disabled={loading || !newIP}
            className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add to Whitelist
          </button>
          <button
            onClick={addToBlacklist}
            disabled={loading || !newIP}
            className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <Lock className="w-4 h-4" />
            Add to Blacklist
          </button>
        </div>
      </div>

      {/* IP Lists */}
      <div className="bg-white rounded-lg shadow-sm border">
        {/* Tabs */}
        <div className="border-b">
          <div className="flex">
            <button
              onClick={() => setActiveTab('whitelist')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'whitelist'
                ? 'border-green-600 text-green-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Whitelist ({whitelist.length})
            </button>
            <button
              onClick={() => setActiveTab('blacklist')}
              className={`px-6 py-3 text-sm font-medium border-b-2 ${activeTab === 'blacklist'
                ? 'border-red-600 text-red-700'
                : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
            >
              Blacklist ({blacklist.length})
            </button>
          </div>
        </div>

        {/* List Content */}
        <div className="divide-y">
          {currentList.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              No IP addresses in {activeTab}
            </div>
          ) : (
            currentList.map((entry) => (
              <div key={entry.ip} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                <div>
                  <p className="text-sm font-mono font-medium text-gray-900">{entry.ip}</p>
                  <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
                    <span>Added by {entry.addedBy}</span>
                    <span>•</span>
                    <span>{new Date(entry.addedAt).toLocaleString()}</span>
                    {entry.reason && (
                      <>
                        <span>•</span>
                        <span>{entry.reason}</span>
                      </>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => removeFromList(entry.ip, activeTab)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                  title="Remove"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div >
  );
}
