import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useWeb3 } from '../../hooks/useWeb3';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';
import Loader from '../common/Loader';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { web3 } = useWeb3();
    
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [admins, setAdmins] = useState([]);
    const [issuers, setIssuers] = useState([]);
    const [newAddress, setNewAddress] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            const [statsRes, adminsRes, issuersRes] = await Promise.all([
                fetch('/api/admin/stats', {
                    headers: { Authorization: `Bearer ${user.token}` }
                }),
                fetch('/api/admin/admins', {
                    headers: { Authorization: `Bearer ${user.token}` }
                }),
                fetch('/api/admin/issuers', {
                    headers: { Authorization: `Bearer ${user.token}` }
                })
            ]);

            const [statsData, adminsData, issuersData] = await Promise.all([
                statsRes.json(),
                adminsRes.json(),
                issuersRes.json()
            ]);

            if (statsData.success) setStats(statsData.data);
            if (adminsData.success) setAdmins(adminsData.data);
            if (issuersData.success) setIssuers(issuersData.data);

        } catch (error) {
            setError('Failed to load dashboard data');
            console.error('Dashboard loading error:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAdmin = async (e) => {
        e.preventDefault();
        try {
            if (!web3.utils.isAddress(newAddress)) {
                setError('Invalid Ethereum address');
                return;
            }

            const response = await fetch('/api/admin/admins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ address: newAddress })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Admin added successfully');
                setNewAddress('');
                loadDashboardData();
            } else {
                setError(data.error || 'Failed to add admin');
            }
        } catch (error) {
            setError('Failed to add admin');
            console.error('Add admin error:', error);
        }
    };

    const handleRemoveAdmin = async (address) => {
        try {
            const response = await fetch(`/api/admin/admins/${address}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Admin removed successfully');
                loadDashboardData();
            } else {
                setError(data.error || 'Failed to remove admin');
            }
        } catch (error) {
            setError('Failed to remove admin');
            console.error('Remove admin error:', error);
        }
    };

    const handleAddIssuer = async (e) => {
        e.preventDefault();
        try {
            if (!web3.utils.isAddress(newAddress)) {
                setError('Invalid Ethereum address');
                return;
            }

            const response = await fetch('/api/admin/issuers', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${user.token}`
                },
                body: JSON.stringify({ address: newAddress })
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Issuer added successfully');
                setNewAddress('');
                loadDashboardData();
            } else {
                setError(data.error || 'Failed to add issuer');
            }
        } catch (error) {
            setError('Failed to add issuer');
            console.error('Add issuer error:', error);
        }
    };

    const handleRemoveIssuer = async (address) => {
        try {
            const response = await fetch(`/api/admin/issuers/${address}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${user.token}` }
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Issuer removed successfully');
                loadDashboardData();
            } else {
                setError(data.error || 'Failed to remove issuer');
            }
        } catch (error) {
            setError('Failed to remove issuer');
            console.error('Remove issuer error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <Loader />
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            {success && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}

            {/* System Statistics */}
            <Card className="mb-8">
                <h2 className="text-xl font-semibold mb-4">System Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded">
                        <h3 className="font-medium">Users</h3>
                        <p className="text-2xl">{stats?.users.total || 0}</p>
                        <div className="text-sm text-gray-600">
                            <p>Admins: {stats?.users.admins || 0}</p>
                            <p>Issuers: {stats?.users.issuers || 0}</p>
                        </div>
                    </div>
                    <div className="bg-green-50 p-4 rounded">
                        <h3 className="font-medium">DIDs</h3>
                        <p className="text-2xl">{stats?.dids.total || 0}</p>
                        <div className="text-sm text-gray-600">
                            <p>Active: {stats?.dids.active || 0}</p>
                            <p>Inactive: {stats?.dids.inactive || 0}</p>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Admin Management */}
            <Card className="mb-8">
                <h2 className="text-xl font-semibold mb-4">Admin Management</h2>
                <form onSubmit={handleAddAdmin} className="mb-4">
                    <div className="flex gap-4">
                        <Input
                            type="text"
                            placeholder="Ethereum Address"
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit">Add Admin</Button>
                    </div>
                </form>
                <div className="space-y-2">
                    {admins.map((admin) => (
                        <div key={admin.walletAddress} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                                <p className="font-medium">{admin.username}</p>
                                <p className="text-sm text-gray-600">{admin.walletAddress}</p>
                            </div>
                            <Button
                                onClick={() => handleRemoveAdmin(admin.walletAddress)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Issuer Management */}
            <Card>
                <h2 className="text-xl font-semibold mb-4">Issuer Management</h2>
                <form onSubmit={handleAddIssuer} className="mb-4">
                    <div className="flex gap-4">
                        <Input
                            type="text"
                            placeholder="Ethereum Address"
                            value={newAddress}
                            onChange={(e) => setNewAddress(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit">Add Issuer</Button>
                    </div>
                </form>
                <div className="space-y-2">
                    {issuers.map((issuer) => (
                        <div key={issuer.walletAddress} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                            <div>
                                <p className="font-medium">{issuer.username}</p>
                                <p className="text-sm text-gray-600">{issuer.walletAddress}</p>
                            </div>
                            <Button
                                onClick={() => handleRemoveIssuer(issuer.walletAddress)}
                                className="bg-red-600 hover:bg-red-700"
                            >
                                Remove
                            </Button>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default AdminDashboard; 