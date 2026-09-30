<?php
require_once 'config.php';
$method =$_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Simulasi mengambil data transaksi dari database
    echo json_encode([
        ["id" => 1, "date" => "2026-06-25", "merchant" => "Indomaret", "category" => "Belanja Bulanan", "notes" => "Susu & Beras", "amount" => 350000],
        ["id" => 2, "date" => "2026-06-26", "merchant" => "Starbucks", "category" => "Makanan & Minuman", "notes" => "Coffee", "amount" => 85000]
    ]);
} elseif ($method === 'POST') {$input = json_decode(file_get_contents("php://input"), true);
    echo json_encode(["status" => "success", "message" => "Transaksi berhasil disimpan ke server PHP/Supabase!", "data" => $input]);
}
