<?php

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require __DIR__ . '/vendor/phpmailer/phpmailer/src/Exception.php';
require __DIR__ . '/vendor/phpmailer/phpmailer/src/PHPMailer.php';
require __DIR__ . '/vendor/phpmailer/phpmailer/src/SMTP.php';



function sendMail($to, $subject, $message) {
    $mail = new PHPMailer(true); // Enable exceptions

    try {
        // SMTP Configuration
        $mail->isSMTP();
        $mail -> CharSet = "utf-8";
        $mail->Host = 'mail.w.dahan.co.kr'; // Your SMTP server
        $mail->SMTPAuth = true;
        $mail->Username = 'dahan_info@dahan.co.kr'; // Your email username
        $mail->Password = '@DAhan2845!!'; // Your email password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS; // TLS encryption
        $mail->Port = 587;

        // SSL 인증서 검증 비활성화 (임시)
        $mail->SMTPOptions = [
            'ssl' => [
                'verify_peer' => false,
                'verify_peer_name' => false,
                'allow_self_signed' => true,
            ],
        ];

        // Sender and recipient settings
        $mail->setFrom('dahan_info@dahan.co.kr', 'Dahan Support');
        $mail->addAddress($to); // 동적으로 받는 사람 설정

        // Sending plain text email
        $mail->isHTML(false); // Set email format to plain text
        $mail->Subject = $subject;
        $mail->Body    = $message;

        $mail->send();
        return true;

    } catch (Exception $e) {
        error_log('Message could not be sent. Mailer Error: ' . $mail->ErrorInfo);
        return false;
    }
}
?>