import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWeb3 } from '../contexts/Web3Context';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Card from '../components/common/Card';
import Loader from '../components/common/Loader';

const CreateIdentity = () => {
    const navigate = useNavigate();
    const { web3, contract } = useWeb3();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        nationality: '',
        governmentId: ''
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            // Call the backend API to create DID
            const response = await fetch('/api/did', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user.token}`
                },
                body: JSON.stringify({
                    userId: user.id,
                    ...formData
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create identity');
            }

            // Store DID information in local storage
            localStorage.setItem('userDID', data.data.did);

            setSuccess(true);
            setTimeout(() => {
                navigate('/dashboard');
            }, 2000);

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
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
            <Card className="max-w-lg mx-auto">
                <h1 className="text-3xl font-bold text-center mb-8">Create Your Digital Identity</h1>
                
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        Identity created successfully! Redirecting to dashboard...
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Full Name"
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your full name"
                    />

                    <Input
                        label="Date of Birth"
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        required
                    />

                    <Input
                        label="Nationality"
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your nationality"
                    />

                    <Input
                        label="Government ID"
                        type="text"
                        name="governmentId"
                        value={formData.governmentId}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter your government ID number"
                    />

                    <div className="flex justify-center">
                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full"
                        >
                            {loading ? 'Creating...' : 'Create Identity'}
                        </Button>
                    </div>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        By creating your digital identity, you agree to our{' '}
                        <a href="/terms" className="text-blue-600 hover:text-blue-800">
                            Terms of Service
                        </a>{' '}
                        and{' '}
                        <a href="/privacy" className="text-blue-600 hover:text-blue-800">
                            Privacy Policy
                        </a>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default CreateIdentity;
