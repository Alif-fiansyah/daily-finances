<?php
// Daily Finances - Smart Financial Assistant (PHP + Tailwind Neubrutalism + Supabase + React)
session_start();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Finances · Smart Financial Assistant</title>
    <!-- Tailwind CSS CDN -->
    <script src="https://cdn.tailwindcss.com"></script>
    <!-- Google Fonts -->
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;700;800&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
    <!-- Chart.js & Lucide Icons & Supabase SDK -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/lucide@latest"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <!-- React & Babel for Browser JSX Transformation -->
    <script src="https://unpkg.com/react@18/umd/react.development.js" crossorigin></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.development.js" crossorigin></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    fontFamily: { sans: ['"Plus Jakarta Sans"', 'sans-serif'], display: ['"Space Grotesk"', 'sans-serif'] },
                    colors: { neoyellow: '#FFDE59', neopink: '#FF70A6', neocyan: '#70D6FF', neogreen: '#9BF6FF', neolime: '#CAFFBF', neoorange: '#FF9770', neopurple: '#BDB2FF', neored: '#FF595E' },
                    boxShadow: { 'neo': '4px 4px 0px 0px #000000', 'neo-sm': '2px 2px 0px 0px #000000', 'neo-lg': '6px 6px 0px 0px #000000' }
                }
            }
        }
    </script>
    <link rel="stylesheet" href="assets/css/style.css">
</head>
<body class="min-h-screen text-black flex flex-col selection:bg-neoyellow selection:text-black">
    <div id="root"></div>
    <script type="text/babel" src="frontend/App.jsx"></script>
    <script>lucide.createIcons();</script>
</body>
</html>
