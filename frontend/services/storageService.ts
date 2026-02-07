/**
 * Storage Service - Syncs all data with backend instead of localStorage
 * This ensures secure storage of API keys, documents, and configuration
 */

interface UserConfig {
  api_keys?: Record<string, string>;
  custom_instructions?: string;
  context_script?: string;
  custom_context?: string;
  model_preference?: string;
  generation_controls?: Record<string, any>;
  settings?: Record<string, any>;
  mind_maps?: any[];
}

interface Document {
  id?: number;
  doc_id: string;
  filename: string;
  content: string;
  enabled: boolean;
  upload_date?: string;
}

const API_BASE = '/api';

/**
 * Fetch user configuration from backend
 */
export async function fetchUserConfig(authToken: string): Promise<UserConfig> {
  const response = await fetch(`${API_BASE}/config`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    if (response.status === 500 && error.includes('no such column')) {
      throw new Error('Database migration required. Please run: cd backend && python migrate_db.py');
    }
    throw new Error(`Failed to fetch config: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Update user configuration on backend
 */
export async function updateUserConfig(authToken: string, config: UserConfig): Promise<UserConfig> {
  const response = await fetch(`${API_BASE}/config`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(config)
  });
  
  if (!response.ok) {
    const error = await response.text();
    if (response.status === 500 && error.includes('no such column')) {
      throw new Error('Database migration required. Please run: cd backend && python migrate_db.py');
    }
    throw new Error(`Failed to update config: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Fetch all documents from backend
 */
export async function fetchDocuments(authToken: string): Promise<Document[]> {
  const response = await fetch(`${API_BASE}/documents`, {
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (!response.ok) {
    const error = await response.text();
    if (response.status === 500 && error.includes('no such column')) {
      throw new Error('Database migration required. Please run: cd backend && python migrate_db.py');
    }
    throw new Error(`Failed to fetch documents: ${response.statusText}`);
  }
  
  return response.json();
}

/**
 * Create or update a document on backend
 */
export async function saveDocument(authToken: string, doc: Document): Promise<Document> {
  const response = await fetch(`${API_BASE}/documents`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify({
      doc_id: doc.doc_id,
      filename: doc.filename,
      content: doc.content,
      enabled: doc.enabled
    })
  });
  
  if (!response.ok) {
    throw new Error('Failed to save document');
  }
  
  return response.json();
}

/**
 * Update document (toggle enabled status)
 */
export async function updateDocument(authToken: string, docId: string, updates: { enabled?: boolean; content?: string }): Promise<Document> {
  const response = await fetch(`${API_BASE}/documents/${docId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(updates)
  });
  
  if (!response.ok) {
    throw new Error('Failed to update document');
  }
  
  return response.json();
}

/**
 * Delete a document from backend
 */
export async function deleteDocument(authToken: string, docId: string): Promise<void> {
  const response = await fetch(`${API_BASE}/documents/${docId}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${authToken}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to delete document');
  }
}

/**
 * Sync documents from localStorage to backend (migration helper)
 */
export async function migrateDocumentsToBackend(authToken: string): Promise<void> {
  const storedDocs = localStorage.getItem('gemini_rag_docs');
  if (!storedDocs) return;
  
  try {
    const docs = JSON.parse(storedDocs);
    for (const doc of docs) {
      await saveDocument(authToken, {
        doc_id: doc.id,
        filename: doc.name,
        content: doc.content,
        enabled: doc.enabled ?? true
      });
    }
    
    // Clear localStorage after successful migration
    localStorage.removeItem('gemini_rag_docs');
    console.log('Documents migrated to backend successfully');
  } catch (error) {
    console.error('Failed to migrate documents:', error);
  }
}

/**
 * Sync configuration from localStorage to backend (migration helper)
 * Only migrates if there is actual localStorage data to migrate.
 */
export async function migrateConfigToBackend(authToken: string): Promise<void> {
  // Check if there's any localStorage config data to migrate
  const configKeys = [
    'gemini_rag_openrouter_key',
    'gemini_rag_google_key',
    'gemini_rag_xai_key',
    'gemini_rag_openai_key',
    'gemini_rag_mistral_key',
    'gemini_rag_custom_context',
    'gemini_rag_context_script',
    'gemini_rag_selected_model',
    'gemini_rag_settings_v2',
    'gemini_rag_mind_maps'
  ];
  const hasAnyData = configKeys.some(key => localStorage.getItem(key) !== null);
  if (!hasAnyData) return; // Nothing to migrate

  const config: UserConfig = {
    api_keys: {
      openrouter: localStorage.getItem('gemini_rag_openrouter_key') || '',
      google: localStorage.getItem('gemini_rag_google_key') || '',
      xai: localStorage.getItem('gemini_rag_xai_key') || '',
      openai: localStorage.getItem('gemini_rag_openai_key') || '',
      mistral: localStorage.getItem('gemini_rag_mistral_key') || ''
    },
    custom_instructions: localStorage.getItem('gemini_rag_custom_context') || '',
    context_script: localStorage.getItem('gemini_rag_context_script') || '',
    model_preference: localStorage.getItem('gemini_rag_selected_model') || 'gemini-2.0-flash-thinking-exp',
    settings: JSON.parse(localStorage.getItem('gemini_rag_settings_v2') || '{}'),
    mind_maps: JSON.parse(localStorage.getItem('gemini_rag_mind_maps') || '[]')
  };
  
  try {
    await updateUserConfig(authToken, config);
    
    // Clear localStorage after successful migration
    localStorage.removeItem('gemini_rag_openrouter_key');
    localStorage.removeItem('gemini_rag_google_key');
    localStorage.removeItem('gemini_rag_xai_key');
    localStorage.removeItem('gemini_rag_openai_key');
    localStorage.removeItem('gemini_rag_mistral_key');
    localStorage.removeItem('gemini_rag_custom_context');
    localStorage.removeItem('gemini_rag_context_script');
    localStorage.removeItem('gemini_rag_selected_model');
    localStorage.removeItem('gemini_rag_settings_v2');
    localStorage.removeItem('gemini_rag_mind_maps');
    
    console.log('Configuration migrated to backend successfully');
  } catch (error) {
    console.error('Failed to migrate configuration:', error);
  }
}

/**
 * Full migration from localStorage to backend
 */
export async function migrateAllDataToBackend(authToken: string): Promise<void> {
  await Promise.all([
    migrateDocumentsToBackend(authToken),
    migrateConfigToBackend(authToken)
  ]);
}
