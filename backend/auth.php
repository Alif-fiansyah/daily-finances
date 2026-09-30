<?php
require_once 'config.php';
$method =$_SERVER['REQUEST_METHOD'];

if ($method === 'POST') {$data = json_decode(file_get_contents("php://input"), true);
    $username =$data['username'] ?? '';
    $password =$data['password'] ?? '';

    if (!empty($username) && !empty($password)) {
        echo json_encode(["status" => "success", "message" => "Autentikasi berhasil untuk user: " . $username]);
    } else {
        echo json_encode(["status" => "error", "message" => "Username dan password wajib diisi!"]);
    }
}
