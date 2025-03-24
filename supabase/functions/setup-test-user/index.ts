
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Create a Supabase client with the Admin key
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const testUserEmail = "admin@example.com";
    const testUserPassword = "abc123";

    // Check if the test user already exists
    const { data: existingUsers } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("email", testUserEmail);

    if (existingUsers && existingUsers.length > 0) {
      return new Response(
        JSON.stringify({ message: "Test user already exists", userId: existingUsers[0].id }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Create the test user if it doesn't exist
    const { data: user, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: testUserEmail,
      password: testUserPassword,
      email_confirm: true,
      user_metadata: { name: "Test Admin" },
    });

    if (createError) throw createError;

    // Make sure the user has admin role
    if (user) {
      await supabaseAdmin
        .from("profiles")
        .update({ role: "admin" })
        .eq("id", user.user.id);
    }

    return new Response(
      JSON.stringify({ 
        message: "Test user created successfully", 
        userId: user?.user.id 
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
