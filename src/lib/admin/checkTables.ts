import { createClient } from '@/lib/supabase/server';

export async function checkTables() {
  const supabase = await createClient();
  
  const tables = ['site_content', 'site_settings'];
  const results: Record<string, boolean> = {};
  
  for (const table of tables) {
    try {
      const { error } = await supabase
        .from(table)
        .select('id')
        .limit(1);
      
      results[table] = !error || !error.message.includes('does not exist');
    } catch {
      results[table] = false;
    }
  }
  
  return results;
}
