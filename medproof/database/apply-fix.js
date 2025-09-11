const { createClient } = require('@supabase/supabase-js');

// Load environment variables from backend since it has the service role key
const dotenv = require('dotenv');
dotenv.config({ path: '../backend/.env' });

const supabaseUrl = 'https://xewjbkmcvihgypwsfrxc.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseServiceKey) {
    console.error('❌ No service role key found in backend/.env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function addInsertPolicy() {
    console.log('🔧 Adding INSERT policy for user_profiles...');
    
    const { data, error } = await supabase.rpc('execute_sql', {
        sql: `CREATE POLICY "Users can create their own profile" ON user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());`
    });

    if (error) {
        // Try direct SQL execution instead
        console.log('🔄 RPC failed, trying direct query...');
        const { data: queryData, error: queryError } = await supabase
            .from('_supabase_admin')
            .select('*')
            .limit(0);
        
        if (queryError) {
            console.error('❌ Unable to execute SQL. Please run this manually in Supabase dashboard:');
            console.log(`
CREATE POLICY "Users can create their own profile" ON user_profiles
    FOR INSERT WITH CHECK (id = auth.uid());
            `);
            return;
        }
    }

    console.log('✅ INSERT policy added successfully!');
}

addInsertPolicy().catch(console.error);