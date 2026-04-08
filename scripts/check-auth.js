const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://stpliwgecckyjknkqenl.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cGxpd2dlY2NreWprbmtxZW5sIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTYwOTUzOCwiZXhwIjoyMDkxMTg1NTM4fQ.7CgLLkngKkeLwL_GWiJSWf2BCHieIvyZ2UDA3PQmFvA';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function checkAuthSetup() {
  console.log('🔍 Checking Supabase Auth Setup...\n');

  try {
    // Get all users
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    
    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    console.log(`📊 Total users in auth system: ${users.length}\n`);

    if (users.length === 0) {
      console.log('⚠️  No users found in the auth system.');
      console.log('   Please create an account first.\n');
      return;
    }

    users.forEach((user, index) => {
      console.log(`👤 User ${index + 1}:`);
      console.log(`   Email: ${user.email}`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Email confirmed: ${user.email_confirmed_at ? '✅ Yes' : '❌ No'}`);
      console.log(`   Created: ${user.created_at}`);
      console.log(`   Last sign in: ${user.last_sign_in_at || 'Never'}`);
      console.log('');
    });

    // Check if email confirmation is required
    console.log('🔧 Checking Auth Settings...');
    console.log('   ℹ️  Note: If "Email confirmed" is false, users cannot log in until they confirm.');
    console.log('   You can disable email confirmation in Supabase Dashboard:');
    console.log('   https://supabase.com/dashboard/project/stpliwgecckyjknkqenl/auth/providers\n');

    // Check profiles
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('*');

    if (profilesError) {
      console.error('❌ Error fetching profiles:', profilesError.message);
    } else {
      console.log(`📊 Total profiles: ${profiles.length}\n`);
      
      profiles.forEach((profile, index) => {
        console.log(`👤 Profile ${index + 1}:`);
        console.log(`   Email: ${profile.email}`);
        console.log(`   Role: ${profile.role}`);
        console.log(`   Name: ${profile.first_name} ${profile.last_name}`);
        console.log('');
      });
    }

    console.log('═══════════════════════════════════════════════════════════');
    console.log('💡 To fix login issues:');
    console.log('');
    console.log('Option 1: Confirm the email manually (as admin)');
    console.log('  - Go to: https://supabase.com/dashboard/project/stpliwgecckyjknkqenl/auth/users');
    console.log('  - Find the user and click "Confirm email"');
    console.log('');
    console.log('Option 2: Disable email confirmation (for development)');
    console.log('  - Go to: https://supabase.com/dashboard/project/stpliwgecckyjknkqenl/auth/providers');
    console.log('  - Toggle OFF "Confirm email"');
    console.log('');
    console.log('Option 3: Send confirmation email');
    console.log('  - Check your email inbox for the confirmation link');
    console.log('  - Click the link to confirm your email');
    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

checkAuthSetup();
