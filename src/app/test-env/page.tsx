'use client';

export default function TestEnv() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Environment Variables Test</h1>
      <div className="space-y-2">
        <p>API URL: {process.env.NEXT_PUBLIC_API_URL}</p>
        <p>OpenAI API Key exists: {process.env.NEXT_PUBLIC_OPENAI_API_KEY ? 'Yes' : 'No'}</p>
        <p>AWS Region: {process.env.NEXT_PUBLIC_AWS_REGION}</p>
      </div>
    </div>
  );
} 