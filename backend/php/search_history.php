<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

if (!$input || empty($input['query'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid payload. Expected "query".']);
    exit;
}

$dataDir = realpath(__DIR__ . '/../data');
if ($dataDir === false) {
    $dataDir = __DIR__ . '/../data';
}

if (!file_exists($dataDir)) {
    mkdir($dataDir, 0755, true);
}

$historyFile = $dataDir . '/search_history.json';

if (!file_exists($historyFile)) {
    file_put_contents($historyFile, json_encode([]));
}

$existingData = json_decode(file_get_contents($historyFile), true);
if (!is_array($existingData)) {
    $existingData = [];
}

$entry = [
    'query' => $input['query'],
    'entityType' => $input['entityType'] ?? null,
    'candidate' => $input['candidate'] ?? null,
    'language' => $input['language'] ?? null,
    'userEmail' => $input['userEmail'] ?? null,
    'timestamp' => gmdate('c')
];

$existingData[] = $entry;

file_put_contents($historyFile, json_encode($existingData, JSON_PRETTY_PRINT));

echo json_encode(['status' => 'ok', 'entry' => $entry]);





