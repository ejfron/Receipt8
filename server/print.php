<?php

declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Mike42\Escpos\Printer;
use Mike42\Escpos\PrintConnectors\NetworkPrintConnector;

header('Content-Type: application/json');

$receipt = json_decode(file_get_contents('php://input'), true);
if (!is_array($receipt) || !isset($receipt['elements'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Send the receipt JSON exported from the editor.']);
    exit;
}

$width = ($receipt['paper'] ?? 58) === 80 ? 48 : 32;
$items = $receipt['items'] ?? [];

function row(string $left, string $right, int $width): string
{
    $gap = max(1, $width - strlen($left) - strlen($right));
    return $left . str_repeat(' ', $gap) . $right . "\n";
}

try {
    $printer = new Printer(new NetworkPrintConnector($receipt['host'] ?? '192.168.1.100', 9100));

    foreach ($receipt['elements'] as $el) {
        switch ($el['type']) {
            case 'text':
                $just = ['left' => Printer::JUSTIFY_LEFT, 'center' => Printer::JUSTIFY_CENTER, 'right' => Printer::JUSTIFY_RIGHT];
                $printer->setJustification($just[$el['align'] ?? 'left']);
                $printer->setEmphasis((bool)($el['bold'] ?? false));
                $printer->selectPrintMode(!empty($el['double'])
                    ? Printer::MODE_DOUBLE_HEIGHT | Printer::MODE_DOUBLE_WIDTH
                    : Printer::MODE_FONT_A);
                $printer->text($el['value'] . "\n");
                break;

            case 'line':
                $printer->setJustification(Printer::JUSTIFY_LEFT);
                $printer->selectPrintMode(Printer::MODE_FONT_A);
                $printer->text(str_repeat($el['char'] ?? '-', $width) . "\n");
                break;

            case 'row':
                $printer->setJustification(Printer::JUSTIFY_LEFT);
                $printer->setEmphasis((bool)($el['bold'] ?? false));
                $printer->text(row($el['left'], $el['right'], $width));
                break;

            case 'items':
                $printer->setEmphasis(false);
                foreach ($items as $it) {
                    $printer->text(row($it['qty'] . 'x ' . $it['name'], number_format((float)$it['price'], 2), $width));
                }
                break;

            case 'qr':
                $printer->setJustification(Printer::JUSTIFY_CENTER);
                $printer->qrCode($el['value'], Printer::QR_ECLEVEL_M, 6);
                break;

            case 'barcode':
                $printer->setJustification(Printer::JUSTIFY_CENTER);
                $printer->barcode($el['value'], Printer::BARCODE_CODE39);
                break;

            case 'feed':
                $printer->feed((int)$el['lines']);
                break;

            case 'cut':
                $printer->cut();
                break;
        }
    }

    $printer->close();
    echo json_encode(['printed' => true]);
} catch (Throwable $e) {
    http_response_code(502);
    echo json_encode(['error' => 'The printer did not accept the job: ' . $e->getMessage()]);
}
