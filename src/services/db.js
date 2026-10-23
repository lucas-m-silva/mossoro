/**
 * Database & Persistence Service - Supabase Cloud Database (PostgreSQL)
 * Project: Concurso Câmara de Mossoró (COMPERVE)
 */

import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://knxiketttiukrzvrqhsv.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtueGlrZXR0dGl1a3J6dnJxaHN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI3MjgwODYsImV4cCI6MjEwODMwNDA4Nn0.2zFbR2aGKi_c688G3EqbtYaAQIs3nb4dLvD04UKLVUM';

export const TABLE_NAME = 'mossoro_study_progress';

// Single Supabase client instance
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const LOCAL_STORAGE_PREFIX = 'mossoro_study_progress_';
const FINANCE_STORAGE_PREFIX = 'mossoro_finance_plan_';

/**
 * SQL script needed to create the table and public access in Supabase SQL Editor
 */
export const SUPABASE_SETUP_SQL = `-- Cole e execute este script no SQL Editor do Supabase (1 clique em Run):
CREATE TABLE IF NOT EXISTS public.mossoro_study_progress (
  username text PRIMARY KEY,
  data jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.mossoro_study_progress ENABLE ROW LEVEL SECURITY;

-- Permitir leitura e escrita para o app
CREATE POLICY "Acesso publico ao progresso do concurso"
ON public.mossoro_study_progress
FOR ALL
USING (true)
WITH CHECK (true);
`;

/**
 * Load Study Progress for a specific user directly from Supabase Cloud
 */
export async function loadStudyProgress(username) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('data')
      .eq('username', username)
      .maybeSingle();

    if (!error && data?.data) {
      const studyData = {
        completedTopics: data.data.completedTopics || [],
        notes: data.data.notes || {},
        updatedAt: data.data.updatedAt || new Date().toISOString()
      };
      // Optimistic browser cache
      localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${username}`, JSON.stringify(studyData));
      return studyData;
    }

    if (error) {
      console.warn('[Supabase Cloud] Erro ao buscar progresso:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase Cloud] Conexão indisponível:', err);
  }

  // Fallback to cache if cloud fails or table not yet created
  try {
    const cached = localStorage.getItem(`${LOCAL_STORAGE_PREFIX}${username}`);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  return { completedTopics: [], notes: {}, updatedAt: new Date().toISOString() };
}

/**
 * Save Study Progress for a specific user directly to Supabase Cloud
 */
export async function saveStudyProgress(username, studyData) {
  const payload = {
    completedTopics: studyData.completedTopics || [],
    notes: studyData.notes || {},
    updatedAt: new Date().toISOString()
  };

  // Immediate optimistic local cache
  try {
    localStorage.setItem(`${LOCAL_STORAGE_PREFIX}${username}`, JSON.stringify(payload));
  } catch (e) {}

  try {
    // 1. Fetch current row to preserve finance data if exists
    const { data: existingRow } = await supabase
      .from(TABLE_NAME)
      .select('data')
      .eq('username', username)
      .maybeSingle();

    const mergedData = {
      ...(existingRow?.data || {}),
      ...payload
    };

    // 2. Upsert to Supabase
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(
        {
          username,
          data: mergedData,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'username' }
      );

    if (error) {
      console.error('[Supabase Cloud] Erro ao salvar progresso:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true, data: mergedData };
  } catch (err) {
    console.error('[Supabase Cloud] Erro de rede ao salvar:', err);
    return { success: false, error: err.message };
  }
}

/**
 * Load Financial Plan for travel directly from Supabase Cloud
 */
export async function loadFinancePlan(username) {
  try {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select('data')
      .eq('username', username)
      .maybeSingle();

    if (!error && data?.data?.finance) {
      const fin = { ...data.data.finance };
      if (!fin.roundTripDistanceKm || fin.roundTripDistanceKm === 560) {
        fin.roundTripDistanceKm = 1578;
      }
      localStorage.setItem(`${FINANCE_STORAGE_PREFIX}${username}`, JSON.stringify(fin));
      return fin;
    }

    if (error) {
      console.warn('[Supabase Cloud] Erro ao buscar financeiro:', error.message);
    }
  } catch (err) {
    console.warn('[Supabase Cloud] Falha de conexão:', err);
  }

  // Fallback to cache if cloud fails or table not yet created
  try {
    const cached = localStorage.getItem(`${FINANCE_STORAGE_PREFIX}${username}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (parsed) {
        if (!parsed.roundTripDistanceKm || parsed.roundTripDistanceKm === 560) {
          parsed.roundTripDistanceKm = 1578;
        }
        return parsed;
      }
    }
  } catch (e) {}

  return null;
}

/**
 * Save Financial Plan for travel directly to Supabase Cloud
 */
export async function saveFinancePlan(username, financeData) {
  // Immediate optimistic local cache
  try {
    localStorage.setItem(`${FINANCE_STORAGE_PREFIX}${username}`, JSON.stringify(financeData));
  } catch (e) {}

  try {
    // 1. Fetch current row to preserve study progress
    const { data: existingRow } = await supabase
      .from(TABLE_NAME)
      .select('data')
      .eq('username', username)
      .maybeSingle();

    const mergedData = {
      ...(existingRow?.data || {}),
      finance: financeData,
      updatedAt: new Date().toISOString()
    };

    // 2. Upsert to Supabase
    const { error } = await supabase
      .from(TABLE_NAME)
      .upsert(
        {
          username,
          data: mergedData,
          updated_at: new Date().toISOString()
        },
        { onConflict: 'username' }
      );

    if (error) {
      console.error('[Supabase Cloud] Erro ao salvar financeiro:', error.message);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    console.error('[Supabase Cloud] Erro de rede ao salvar financeiro:', err);
    return { success: false, error: err.message };
  }
}

// Backward compatibility helper if needed
export function getCloudConfig() {
  return {
    provider: 'supabase',
    supabase: {
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      table: TABLE_NAME
    }
  };
}

export function saveCloudConfig() {
  return true;
}
