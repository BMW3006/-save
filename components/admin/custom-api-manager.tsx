'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import {
  Plus,
  Trash2,
  Edit2,
  TestTube,
  CheckCircle,
  AlertCircle,
  Loader2,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  CustomAPI,
  saveCustomAPI,
  updateCustomAPI,
  deleteCustomAPI,
  getCustomAPIs,
  testAPIConnection,
} from '@/lib/api-manager'

export function CustomAPIManager() {
  const [apis, setAPIs] = useState<CustomAPI[]>([])
  const [loading, setLoading] = useState(false)
  const [testingId, setTestingId] = useState<string | null>(null)
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({})
  const [editingId, setEditingId] = useState<string | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [showApiKey, setShowApiKey] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState<Partial<CustomAPI>>({
    name: '',
    baseUrl: '',
    apiKey: '',
    headers: {},
    description: '',
    isActive: true,
  })

  useEffect(() => {
    loadAPIs()
  }, [])

  const loadAPIs = () => {
    const stored = getCustomAPIs()
    setAPIs(stored)
  }

  const resetForm = () => {
    setFormData({
      name: '',
      baseUrl: '',
      apiKey: '',
      headers: {},
      description: '',
      isActive: true,
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleSave = async () => {
    if (!formData.name?.trim() || !formData.baseUrl?.trim()) {
      alert('Please fill in Name and Base URL')
      return
    }

    setLoading(true)
    try {
      let newAPI: CustomAPI
      if (editingId) {
        newAPI = updateCustomAPI(editingId, formData as any) as CustomAPI
      } else {
        newAPI = saveCustomAPI(formData as any)
      }

      loadAPIs()
      resetForm()
    } catch (error) {
      alert('Error saving API')
      console.error('[v0] Error saving API:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this API?')) {
      deleteCustomAPI(id)
      loadAPIs()
    }
  }

  const handleEdit = (api: CustomAPI) => {
    setFormData(api)
    setEditingId(api.id)
    setShowForm(true)
  }

  const handleTest = async (api: CustomAPI) => {
    setTestingId(api.id)
    try {
      const result = await testAPIConnection(api)
      setTestResults(prev => ({
        ...prev,
        [api.id]: result,
      }))
    } catch (error: any) {
      setTestResults(prev => ({
        ...prev,
        [api.id]: {
          success: false,
          message: error.message,
        },
      }))
    } finally {
      setTestingId(null)
    }
  }

  const toggleApiKeyVisibility = (id: string) => {
    setShowApiKey(prev => ({
      ...prev,
      [id]: !prev[id],
    }))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Custom API Management</h3>
        <Button
          onClick={() => {
            if (showForm) {
              resetForm()
            } else {
              setShowForm(true)
            }
          }}
          className="gap-2"
        >
          <Plus className="w-4 h-4" />
          {showForm ? 'Cancel' : 'Add API'}
        </Button>
      </div>

      {showForm && (
        <Card className="p-6 space-y-4 border-primary/20 bg-primary/5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">API Name *</label>
              <Input
                placeholder="e.g., Music API"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium">Base URL *</label>
              <Input
                placeholder="https://api.example.com"
                value={formData.baseUrl || ''}
                onChange={(e) => setFormData({ ...formData, baseUrl: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Input
                placeholder="Describe this API's purpose"
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-sm font-medium">API Key (if required)</label>
              <Input
                type="password"
                placeholder="Enter API key"
                value={formData.apiKey || ''}
                onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
              />
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {editingId ? 'Update API' : 'Add API'}
                </>
              )}
            </Button>
            <Button
              onClick={resetForm}
              variant="outline"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <div className="grid gap-4">
        {apis.length === 0 ? (
          <Card className="p-6 text-center text-muted-foreground">
            <p>No custom APIs added yet. Click "Add API" to get started.</p>
          </Card>
        ) : (
          apis.map((api) => {
            const testResult = testResults[api.id]
            return (
              <Card key={api.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold">{api.name}</h4>
                      <div
                        className={`w-2 h-2 rounded-full ${
                          api.isActive ? 'bg-green-500' : 'bg-gray-500'
                        }`}
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">{api.baseUrl}</p>
                    {api.description && (
                      <p className="text-sm mt-1">{api.description}</p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleTest(api)}
                      disabled={testingId === api.id}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                    >
                      {testingId === api.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <TestTube className="w-3 h-3" />
                      )}
                      Test
                    </Button>
                    <Button
                      onClick={() => handleEdit(api)}
                      variant="outline"
                      size="sm"
                    >
                      <Edit2 className="w-3 h-3" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(api.id)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {api.apiKey && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>API Key:</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs flex-1">
                      {showApiKey[api.id] ? api.apiKey : '*'.repeat(20)}
                    </code>
                    <Button
                      onClick={() => toggleApiKeyVisibility(api.id)}
                      variant="ghost"
                      size="sm"
                    >
                      {showApiKey[api.id] ? (
                        <EyeOff className="w-3 h-3" />
                      ) : (
                        <Eye className="w-3 h-3" />
                      )}
                    </Button>
                  </div>
                )}

                {testResult && (
                  <div
                    className={`flex items-center gap-2 text-sm p-2 rounded ${
                      testResult.success
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {testResult.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <AlertCircle className="w-4 h-4" />
                    )}
                    {testResult.message}
                  </div>
                )}

                <div className="text-xs text-muted-foreground pt-2 border-t">
                  <p>Created: {new Date(api.createdAt).toLocaleString()}</p>
                  <p>Updated: {new Date(api.updatedAt).toLocaleString()}</p>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
