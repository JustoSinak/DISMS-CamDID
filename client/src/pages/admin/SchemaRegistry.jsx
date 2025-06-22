import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MainLayout from '../../layouts/MainLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';

const SchemaRegistry = () => {
  const [schemaURI, setSchemaURI] = useState('');
  const [schemaType, setSchemaType] = useState('');
  const [version, setVersion] = useState('1');
  const [schemas, setSchemas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const fetchSchemas = async () => {
    try {
      const res = await axios.get('/api/credential/schemas');
      setSchemas(res.data.schemas || []);
    } catch (err) {
      setError('Failed to fetch schemas');
    }
  };

  useEffect(() => {
    fetchSchemas();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await axios.post('/api/credential/schemas', {
        schemaURI,
        schemaType,
        version: Number(version)
      });
      setSuccess('Schema registered successfully!');
      setSchemaURI('');
      setSchemaType('');
      setVersion('1');
      fetchSchemas();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to register schema');
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainLayout>
      <div className="max-w-2xl mx-auto py-10">
        <Card>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <h2 className="text-2xl font-bold mb-4">Register Credential Schema</h2>
            {error && <div className="p-2 bg-red-100 text-red-700 rounded">{error}</div>}
            {success && <div className="p-2 bg-green-100 text-green-700 rounded">{success}</div>}
            <Input
              label="Schema URI"
              value={schemaURI}
              onChange={e => setSchemaURI(e.target.value)}
              placeholder="e.g. ipfs://... or https://..."
              required
            />
            <Input
              label="Schema Type"
              value={schemaType}
              onChange={e => setSchemaType(e.target.value)}
              placeholder="e.g. NationalID, Diploma, License"
              required
            />
            <Input
              label="Version"
              type="number"
              min="1"
              value={version}
              onChange={e => setVersion(e.target.value)}
              required
            />
            <Button type="submit" loading={loading} disabled={loading}>
              Register Schema
            </Button>
          </form>
        </Card>
        <Card className="mt-8">
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">Registered Schemas</h3>
            {schemas.length === 0 ? (
              <div className="text-gray-500">No schemas registered yet.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left">Type</th>
                    <th className="text-left">Version</th>
                    <th className="text-left">URI</th>
                    <th className="text-left">Registered By</th>
                  </tr>
                </thead>
                <tbody>
                  {schemas.map(schema => (
                    <tr key={schema.schemaId} className="border-t">
                      <td>{schema.schemaType}</td>
                      <td>{schema.version}</td>
                      <td className="truncate max-w-xs">{schema.schemaURI}</td>
                      <td className="truncate max-w-xs">{schema.registeredBy}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Card>
      </div>
    </MainLayout>
  );
};

export default SchemaRegistry; 