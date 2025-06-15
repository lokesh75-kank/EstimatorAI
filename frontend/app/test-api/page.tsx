'use client';

import { useEffect, useState } from 'react';
import { apiService } from '@/services/api';

export default function TestApi() {
  const [projects, setProjects] = useState<any[]>([]);
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    const testApi = async () => {
      try {
        // Log environment variables and API configuration
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        setDebugInfo(`API URL: ${apiUrl}\nBase URL: ${apiService['api'].defaults.baseURL}`);
        
        // Test the health endpoint first
        const healthResponse = await fetch('http://localhost:3001/api/health');
        const healthData = await healthResponse.json();
        setHealthStatus(healthData.status);
        
        // Then test the projects endpoint
        const projectsData = await apiService.getProjects();
        setProjects(projectsData);
        setError('');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error('API Error:', err);
      } finally {
        setLoading(false);
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">API Communication Test</h1>
      
      <div className="mb-4 p-4 bg-gray-100 rounded">
        <h2 className="text-lg font-semibold mb-2">Debug Information:</h2>
        <pre className="whitespace-pre-wrap">{debugInfo}</pre>
      </div>
      
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <div className="text-red-500">
          <p>Error: {error}</p>
          <p className="mt-2">Please check if:</p>
          <ul className="list-disc pl-5 mt-1">
            <li>Backend server is running on port 3001</li>
            <li>Backend server is accessible</li>
            <li>API endpoints are properly configured</li>
          </ul>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-semibold mb-2">Health Status:</h2>
            <p className="text-green-500">{healthStatus}</p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-2">Projects:</h2>
            {projects.length === 0 ? (
              <p>No projects found</p>
            ) : (
              <ul className="list-disc pl-5">
                {projects.map((project) => (
                  <li key={project.id}>{project.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 