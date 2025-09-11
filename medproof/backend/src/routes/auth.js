const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY;

// Create admin client with service role key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Create user profile (bypasses RLS)
router.post('/create-profile', async (req, res) => {
  try {
    const { userId, email, metadata } = req.body;

    if (!userId || !email) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    console.log('🔧 Creating user profile for:', userId, email);

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .insert({
        id: userId,
        email: email,
        role: 'public',
        credentials: metadata || {},
        settings: {},
        is_active: true,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Error creating user profile:', error);
      return res.status(500).json({ error: error.message });
    }

    console.log('✅ User profile created successfully:', data);
    res.json({ data });
  } catch (error) {
    console.error('❌ Unexpected error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;