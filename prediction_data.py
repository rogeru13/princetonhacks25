from supabase import create_client, Client

SUPABASE_URL = "https://your-supabase-url.supabase.co"
SUPABASE_KEY = "your-anon-key"


supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
response = supabase.table('prediction_data').select('*').execute()
print(response.data)