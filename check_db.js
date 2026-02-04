
import { supabase } from './src/supabaseClient.js';

async function checkTables() {
  const tables = ['fichajes', 'fichajes_pausas', 'fichajes_codigos', 'fichajes_auditoria'];
  const results = {};
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('id').limit(1);
    results[table] = !error;
    if (error) console.log(`Error checking ${table}:`, error.message);
  }
  
  console.log('Table existence check:', results);
}

checkTables();
