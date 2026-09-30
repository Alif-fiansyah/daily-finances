<?php
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

// Konfigurasi Database / Supabase Endpoint PHP Handler
$supabase_url = getenv('SUPABASE_URL') ?: "https://your-project.supabase.co";
$supabase_key = getenv('SUPABASE_KEY') ?: "your-anon-key";
