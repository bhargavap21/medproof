# Supabase MCP Server Setup Guide

## Current Status ✅
Your Supabase MCP server is configured and should be working with the updated `.vscode/mcp.json` file.

## Configuration Overview

### Project Details
- **Project Reference**: `xewjbkmcvihgypwsfrxc`
- **Supabase URL**: `https://xewjbkmcvihgypwsfrxc.supabase.co`
- **Region**: `us-east-1`

### MCP Server Configuration
The MCP server is configured in `.vscode/mcp.json` with all necessary environment variables:
- ✅ Access Token (for management API)
- ✅ Project Reference
- ✅ Supabase URL
- ✅ Anonymous Key (for client operations)
- ✅ Service Role Key (for admin operations)

## Available Tools

Once connected, your MCP server provides these capabilities:

### Database Operations
- `get_db_schemas` - List all database schemas with sizes and table counts
- `get_tables` - List all tables in a schema with metadata
- `get_table_schema` - Get detailed table structure including columns and keys
- `execute_sql_query` - Execute SQL queries (read-only by default)

### Management API
- `send_management_api_request` - Send requests to Supabase Management API
- `get_management_api_spec` - Get API specification with safety information
- `get_management_api_safety_rules` - Get safety rules for operations

### Auth Admin
- `get_auth_admin_methods_spec` - Get documentation for Auth Admin methods
- `call_auth_admin_method` - Call Auth Admin methods (create users, generate links, etc.)

### Safety Features
- `live_dangerously` - Switch between safe and unsafe modes for write operations

## Database Schema Overview

Your database includes these key tables:
- **hospitals** - Hospital institutions in the network
- **user_profiles** - Extended user profiles with roles and hospital associations
- **researcher_applications** - Applications from researchers to join hospitals
- **hospital_authorizations** - Active authorizations for researchers
- **medical_studies** - Medical research studies with privacy-preserving proofs
- **study_collaborations** - Multi-hospital study collaborations
- **authorization_audit_log** - Audit trail for all authorization actions

## Usage Examples

### Query Database Schema
```
Ask: "Show me all tables in the public schema"
The MCP server will use get_tables to list all tables with metadata.
```

### Execute Queries
```
Ask: "How many hospitals are in the database?"
The MCP server will execute: SELECT COUNT(*) FROM hospitals;
```

### Manage Users
```
Ask: "Create a new user with email test@example.com"
The MCP server will use auth admin methods to create the user.
```

## Security Notes

- **Read-Only by Default**: SQL queries are read-only unless you explicitly enable write mode
- **Row Level Security**: Your database has comprehensive RLS policies
- **Service Role Access**: The MCP server uses service role key for admin operations
- **Audit Trail**: All authorization actions are logged

## Troubleshooting

If the MCP server isn't working:

1. **Check Cursor Settings**: Go to Settings → Features → MCP Servers and ensure the server shows as connected (green dot)

2. **Refresh MCP Servers**: In Cursor settings, try refreshing the MCP servers

3. **Check Logs**: If available, check MCP server logs for connection issues

4. **Test Connection**: Try asking "What tables are in my database?" to test the connection

5. **Verify Credentials**: Ensure all tokens in the configuration are valid and not expired

## Alternative MCP Servers

If you encounter issues with `@supabase/mcp-server-supabase`, consider these alternatives:
- **supabase-mcp-server** (Python-based, more mature)
- **Community Supabase MCP servers** with different feature sets

## Environment Variables Reference

These are already configured in your `.vscode/mcp.json`:

```bash
SUPABASE_PROJECT_REF=xewjbkmcvihgypwsfrxc
SUPABASE_URL=https://xewjbkmcvihgypwsfrxc.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_ACCESS_TOKEN=sbp_bf335643b37656581270dc1839543c8a0c8fec91
SUPABASE_REGION=us-east-1
```

## Next Steps

1. **Restart Cursor** if it's currently open to pick up the new MCP configuration
2. **Test the connection** by asking questions about your database
3. **Explore your data** using natural language queries through the MCP server
4. **Use admin functions** to manage users and permissions as needed

Your Supabase MCP server should now be fully configured and ready to use! 🚀 