import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

const supabaseUrl = "https://fdfhaowqqbpiyghpdrgj.supabase.co"
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkZmhhb3dxcWJwaXlnaHBkcmdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUwNTc2NTMsImV4cCI6MjA5MDYzMzY1M30.mWAM_Rs7KKCiWwB4MRJBFJcpS_VYbOCLyzPl285fyN4"

// Inicjalizacja klienta
export const supabase = createClient(supabaseUrl, supabaseKey)