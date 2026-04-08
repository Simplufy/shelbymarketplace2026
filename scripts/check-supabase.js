const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://stpliwgecckyjknkqenl.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cGxpd2dlY2NreWprbmtxZW5sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU2MDk1MzgsImV4cCI6MjA5MTE4NTUzOH0.UhrPZIhrWJ0psBUldP6ly-jZ-oYTjY8ohZ2jsuTTtgU';

const supabase = createClient(supabaseUrl, supabaseKey);

// Note: The anon key cannot create tables or run DDL
// You need to run this SQL manually in the Supabase Dashboard SQL Editor
// OR use a service role key

console.log('Supabase client initialized');
console.log('URL:', supabaseUrl);
console.log('');
console.log('⚠️  IMPORTANT: To set up the database, you need to run the SQL manually.');
console.log('');
console.log('Go to: https://supabase.com/dashboard/project/stpliwgecckyjknkqenl/sql');
console.log('');
console.log('The anon key (which I have) does not have permissions to:');
console.log('  - Create tables');
console.log('  - Create policies');
console.log('  - Run DDL statements');
console.log('');
console.log('You need either:');
console.log('  1. Run the SQL in the Dashboard (easiest)');
console.log('  2. Use the Service Role Key (requires your permission)');
console.log('  3. Generate a Personal Access Token from Supabase Dashboard');
