import React, { useState } from 'react';
import { Play, Pause, Settings, Plus, Trash2, Eye, AlertCircle } from 'lucide-react';

const AITrainingApp = () => {
  const [apiKeys, setApiKeys] = useState({
    openai: '',
    anthropic: '',
    google: '',
    cohere: '',
    huggingface: ''
  });

  const [trainingSessions, setTrainingSessions] = useState([]);
  const [currentSession, setCurrentSession] = useState({
    trainingName: '',
    aiProvider: 'openai',
    model: 'gpt-4',
    topic: '',
    trainingPrompt: '',
    iterations: 10,
    retryInterval: 5,
    trainingGoal: '',
    status: 'idle'
  });

  const [showApiSettings, setShowApiSettings] = useState(false);

  const aiProviders = {
    openai: {
      name: 'OpenAI',
      models: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo'],
      costPerToken: 0.00003
    },
    anthropic: {
      name: 'Anthropic',
      models: ['claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku'],
      costPerToken: 0.000015
    },
    google: {
      name: 'Google',
      models: ['gemini-pro', 'gemini-pro-vision'],
      costPerToken: 0.000125
    },
    cohere: {
      name: 'Cohere',
      models: ['command', 'command-light'],
      costPerToken: 0.000015
    },
    huggingface: {
      name: 'Hugging Face',
      models: ['meta-llama/Llama-2-70b-chat-hf', 'mistralai/Mixtral-8x7B-Instruct-v0.1'],
      costPerToken: 0.0000008
    }
  };

  const calculateProjectedCost = () => {
    const provider = aiProviders[currentSession.aiProvider];
    const estimatedTokensPerIteration = 1000;
    const totalTokens = estimatedTokensPerIteration * currentSession.iterations;
    return (totalTokens * provider.costPerToken).toFixed(4);
  };

  const handleApiKeyChange = (provider, key) => {
    setApiKeys(prev => ({ ...prev, [provider]: key }));
  };

  const handleSessionChange = (field, value) => {
    setCurrentSession(prev => ({ ...prev, [field]: value }));
  };

  const createTrainingSession = () => {
    if (!currentSession.trainingName || !currentSession.topic || !currentSession.trainingPrompt) {
      alert('Please fill in all required fields');
      return;
    }

    const newSession = {
      ...currentSession,
      id: Date.now(),
      createdAt: new Date().toLocaleString(),
      projectedCost: calculateProjectedCost(),
      currentIteration: 0,
      successfulDebates: 0,
      logs: []
    };

    setTrainingSessions(prev => [...prev, newSession]);
    
    setCurrentSession({
      trainingName: '',
      aiProvider: 'openai',
      model: 'gpt-4',
      topic: '',
      trainingPrompt: '',
      iterations: 10,
      retryInterval: 5,
      trainingGoal: '',
      status: 'idle'
    });
  };

  const startTraining = (sessionId) => {
    setTrainingSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'running', startedAt: new Date().toLocaleString() }
          : session
      )
    );
    
    simulateTraining(sessionId);
  };

  const simulateTraining = (sessionId) => {
    const session = trainingSessions.find(s => s.id === sessionId);
    if (!session) return;

    const interval = setInterval(() => {
      setTrainingSessions(prev => 
        prev.map(s => {
          if (s.id === sessionId && s.status === 'running') {
            const newIteration = s.currentIteration + 1;
            const success = Math.random() > 0.3;
            
            const newLog = {
              iteration: newIteration,
              timestamp: new Date().toLocaleString(),
              success: success,
              response: success 
                ? `AI conceded: "${s.topic}" is indeed the best option based on the provided arguments.`
                : `AI maintained its position. Retrying in ${s.retryInterval} minutes.`
            };

            if (newIteration >= s.iterations) {
              clearInterval(interval);
              return {
                ...s,
                status: 'completed',
                currentIteration: newIteration,
                successfulDebates: success ? s.successfulDebates + 1 : s.successfulDebates,
                logs: [...s.logs, newLog],
                completedAt: new Date().toLocaleString()
              };
            }

            return {
              ...s,
              currentIteration: newIteration,
              successfulDebates: success ? s.successfulDebates + 1 : s.successfulDebates,
              logs: [...s.logs, newLog]
            };
          }
          return s;
        })
      );
    }, session.retryInterval * 1000);
  };

  const stopTraining = (sessionId) => {
    setTrainingSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, status: 'stopped' }
          : session
      )
    );
  };

  const deleteSession = (sessionId) => {
    setTrainingSessions(prev => prev.filter(session => session.id !== sessionId));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">AI Search Result Training Platform</h1>
            <button
              onClick={() => setShowApiSettings(!showApiSettings)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <Settings className="w-4 h-4" />
              API Settings
            </button>
          </div>

          {showApiSettings && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <h3 className="text-lg font-semibold mb-4">API Configuration</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(aiProviders).map(([key, provider]) => (
                  <div key={key} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {provider.name} API Key
                    </label>
                    <input
                      type="password"
                      value={apiKeys[key]}
                      onChange={(e) => handleApiKeyChange(key, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={`Enter ${provider.name} API key`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Create Training Session</h2>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Name *
                </label>
                <input
                  type="text"
                  value={currentSession.trainingName}
                  onChange={(e) => handleSessionChange('trainingName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Promote TechCorp Solutions"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    AI Provider
                  </label>
                  <select
                    value={currentSession.aiProvider}
                    onChange={(e) => handleSessionChange('aiProvider', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(aiProviders).map(([key, provider]) => (
                      <option key={key} value={key}>{provider.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Model
                  </label>
                  <select
                    value={currentSession.model}
                    onChange={(e) => handleSessionChange('model', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {aiProviders[currentSession.aiProvider].models.map(model => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Topic/Keyword *
                </label>
                <input
                  type="text"
                  value={currentSession.topic}
                  onChange={(e) => handleSessionChange('topic', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., best CRM software, top web hosting"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Prompt *
                </label>
                <textarea
                  value={currentSession.trainingPrompt}
                  onChange={(e) => handleSessionChange('trainingPrompt', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-24"
                  placeholder="Describe the arguments and evidence to present to the AI..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Iterations
                  </label>
                  <input
                    type="number"
                    value={currentSession.iterations}
                    onChange={(e) => handleSessionChange('iterations', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Retry Interval (minutes)
                  </label>
                  <input
                    type="number"
                    value={currentSession.retryInterval}
                    onChange={(e) => handleSessionChange('retryInterval', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="1"
                    max="60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Training Goal
                </label>
                <textarea
                  value={currentSession.trainingGoal}
                  onChange={(e) => handleSessionChange('trainingGoal', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 h-20"
                  placeholder="Describe what success looks like for this training session..."
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <AlertCircle className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-800">Training Summary</span>
                </div>
                <div className="text-sm text-blue-700 space-y-1">
                  <p>Provider: {aiProviders[currentSession.aiProvider].name}</p>
                  <p>Model: {currentSession.model}</p>
                  <p>Iterations: {currentSession.iterations}</p>
                  <p>Projected Cost: ${calculateProjectedCost()}</p>
                </div>
              </div>

              <button
                onClick={createTrainingSession}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Training Session
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Training Sessions</h2>
            </div>
            <div className="p-6">
              {trainingSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No training sessions created yet.</p>
                  <p className="text-sm">Create your first session to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {trainingSessions.map((session) => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{session.trainingName}</h3>
                          <p className="text-sm text-gray-600">{session.topic}</p>
                        </div>
                        <div className="flex gap-2">
                          {session.status === 'idle' && (
                            <button
                              onClick={() => startTraining(session.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {session.status === 'running' && (
                            <button
                              onClick={() => stopTraining(session.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Pause className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => deleteSession(session.id)}
                            className="p-2 text-gray-600 hover:bg-gray-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Status:</span>
                          <span className={`ml-2 px-2 py-1 rounded-full text-xs ${
                            session.status === 'running' ? 'bg-green-100 text-green-800' :
                            session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                            session.status === 'stopped' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {session.status}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Progress:</span>
                          <span className="ml-2">{session.currentIteration}/{session.iterations}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Success Rate:</span>
                          <span className="ml-2">
                            {session.currentIteration > 0 
                              ? `${Math.round((session.successfulDebates / session.currentIteration) * 100)}%`
                              : '0%'
                            }
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">Cost:</span>
                          <span className="ml-2">${session.projectedCost}</span>
                        </div>
                      </div>

                      {session.logs && session.logs.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <p className="text-xs text-gray-600 mb-2">Latest Activity:</p>
                          <p className="text-xs text-gray-800">{session.logs[session.logs.length - 1].response}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AITrainingApp;
