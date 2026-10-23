/**
 * Database & Persistence Service
 * Supports:
 * - Local Database Server (/api/progress and /api/finance -> database/mossoro_db.json)
 * - Browser LocalStorage (offline instant cache)
 * - Supabase Cloud Database (PostgreSQL)
 * - Firebase Firestore (Google NoSQL)
 */

import { createClient } from '@supabase/supabase-js';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const CONFIG_KEY = 'mossoro_concurso_cloud_config';
const LOCAL_STORAGE_PREFIX = 'mossoro_study_progress_';
const FINANCE_STORAGE_PREFIX = 'mossoro_finance_plan_';

export function getCloudConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading cloud config:', e);
  }
  return {
    provider: 'local', // 'local' | 'supabase' | 'firebase'
    supabase: {
      url: import.meta.env.VITE_SUPABASE_URL || '',
      anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
      table: 'mossoro_study_progress'
    },
    firebase: {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      collection: 'mossoro_study_progress'
    }
  };
}

export function saveCloudConfig(newConfig) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify(newConfig));
    supabaseClient = null;
    firestoreDb = null;
    return true;
  } catch (e) {
    console.error('Error saving cloud config:', e);
    return false;
  }
}

let supabaseClient = null;
function getSupabaseClient() {
  if (supabaseClient) return supabaseClient;
  const cfg = getCloudConfig();
  if (cfg.provider === 'supabase' && cfg.supabase?.url && cfg.supabase?.anonKey) {
    try {
      supabaseClient = createClient(cfg.supabase.url, cfg.supabase.anonKey);
      return supabaseClient;
    } catch (e) {
      console.error('Failed to init Supabase:', e);
    }
  }
  return null;
}

let firestoreDb = null;
function getFirestoreInstance() {
  if (firestoreDb) return firestoreDb;
  const cfg = getCloudConfig();
  if (cfg.provider === 'firebase' && cfg.firebase?.apiKey && cfg.firebase?.projectId) {
    try {
      const app = getApps().length > 0 ? getApp() : initializeApp(cfg.firebase);
      firestoreDb = getFirestore(app);
      return firestoreDb;
    } catch (e) {
      console.error('Failed to init Firebase:', e);
    }
  }
  return null;
}

/**
 * Load Study Progress for a specific user
 */
export async function loadStudyProgress(username) {
  const cfg = getCloudConfig();

  // 1. Try Supabase if configured
  if (cfg.provider === 'supabase') {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        const { data, error } = await sb
          .from(cfg.supabase.table || 'mossoro_study_progress')
          .select('data')
          .eq('username', username)
          .single();

        if (!error && data?.data) {
          return data.data;
        }
      } catch (err) {
        console.warn('Supabase fetch error:', err);
      }
    }
  }

  // 2. Try Firebase Firestore if configured
  if (cfg.provider === 'firebase') {
    const db = getFirestoreInstance();
    if (db) {
      try {
        const coll = cfg.firebase.collection || 'mossoro_study_progress';
        const docRef = doc(db, coll, username);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return docSnap.data();
        }
      } catch (err) {
        console.warn('Firebase fetch error:', err);
      }
    }
  }

  // 3. Try Local Server Database API (database/mossoro_db.json)
  try {
    const res = await fetch(`/api/progress?user=${encodeURIComponent(username)}`);
    if (res.ok) {
      const apiData = await res.json();
      if (apiData && (apiData.completedTopics || apiData.notes)) {
        // Cache to localStorage
        localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${username}`, JSON.stringify(apiData));
        return apiData;
      }
    }
  } catch (err) {
    // API not reachable (e.g. static host without server middleware)
  }

  // 4. Fallback to LocalStorage
  try {
    const saved = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${username}`);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('LocalStorage read error:', e);
  }

  return { completedTopics: [], notes: {}, updatedAt: new Date().toISOString() };
}

/**
 * Save Study Progress for a specific user
 */
export async function saveStudyProgress(username, data) {
  const payload = {
    ...data,
    updatedAt: new Date().toISOString()
  };

  // 1. Save to LocalStorage immediately
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${username}`, JSON.stringify(payload));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }

  // 2. Save to Local Server Database API (database/mossoro_db.json)
  try {
    fetch('/api/progress', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username,
        completedTopics: payload.completedTopics,
        notes: payload.notes
      })
    }).catch(() => {});
  } catch (err) {
    // ignore fetch errors on static builds
  }

  const cfg = getCloudConfig();

  // 3. Save to Supabase if configured
  if (cfg.provider === 'supabase') {
    const sb = getSupabaseClient();
    if (sb) {
      try {
        const table = cfg.supabase.table || 'mossoro_study_progress';
        await sb.from(table).upsert({ username, data: payload, updated_at: new Date() }, { onConflict: 'username' });
      } catch (err) {
        console.error('Supabase save error:', err);
      }
    }
  }

  // 4. Save to Firebase if configured
  if (cfg.provider === 'firebase') {
    const db = getFirestoreInstance();
    if (db) {
      try {
        const coll = cfg.firebase.collection || 'mossoro_study_progress';
        const docRef = doc(db, coll, username);
        await setDoc(docRef, payload, { merge: true });
      } catch (err) {
        console.error('Firebase save error:', err);
      }
    }
  }

  return payload;
}

/**
 * Load Financial Plan for travel
 */
export async function loadFinancePlan(username) {
  // Try server API first
  try {
    const res = await fetch(`/api/finance?user=${encodeURIComponent(username)}`);
    if (res.ok) {
      const data = await res.json();
      if (data) {
        localStorage.setItem(`${FINANCE_STORAGE_PREFIX}${username}`, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {}

  // Fallback to localStorage
  try {
    const saved = localStorage.getItem(`${FINANCE_STORAGE_PREFIX}${username}`);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Error reading finance plan:', e);
  }
  return null;
}

/**
 * Save Financial Plan for travel
 */
export async function saveFinancePlan(username, financeData) {
  try {
    localStorage.setItem(`${FINANCE_STORAGE_PREFIX}${username}`, JSON.stringify(financeData));
  } catch (e) {
    console.error('Error saving finance plan:', e);
  }

  try {
    fetch('/api/finance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, finance: financeData })
    }).catch(() => {});
  } catch (err) {}

  return true;
}
