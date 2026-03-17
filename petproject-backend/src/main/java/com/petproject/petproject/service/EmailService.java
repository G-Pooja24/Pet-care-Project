package com.petproject.petproject.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendOtpEmail(String to, String otp) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject("Welcome to Pet care app");
        msg.setText("Your Pet care OTP is: " + otp);

        mailSender.send(msg);
    }

    public void sendSimpleEmail(String to, String subject, String body) {
        SimpleMailMessage msg = new SimpleMailMessage();
        msg.setTo(to);
        msg.setSubject(subject);
        msg.setText(body);

        mailSender.send(msg);
    }

    public void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            jakarta.mail.internet.MimeMessage message = mailSender.createMimeMessage();
            org.springframework.mail.javamail.MimeMessageHelper helper = 
                new org.springframework.mail.javamail.MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true); // true = isHtml
            
            mailSender.send(message);
        } catch (jakarta.mail.MessagingException e) {
            throw new RuntimeException("Failed to send HTML email", e);
        }
    }

    public void sendBookingConfirmation(String to, String ownerName, String petName, String date, String time, String vetName, String mode, String meetingLink) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Appointment Confirmed! - PetCare");
        
        StringBuilder body = new StringBuilder();
        body.append("Dear ").append(ownerName).append(",\n\n");
        body.append("Your appointment has been successfully confirmed.\n\n");
        body.append("Appointment Details:\n");
        body.append("--------------------------------------------------\n");
        body.append("Pet Name: ").append(petName).append("\n");
        body.append("Doctor: Dr. ").append(vetName).append("\n");
        body.append("Date: ").append(date).append("\n");
        body.append("Time: ").append(time).append("\n");
        body.append("Mode: ").append(mode).append("\n");
        
        if ("ONLINE".equalsIgnoreCase(mode) && meetingLink != null && !meetingLink.isEmpty()) {
            body.append("Meeting Link: ").append(meetingLink).append("\n");
        }
        
        body.append("--------------------------------------------------\n\n");
        body.append("Please join/arrive 5 minutes early.\n\n");
        body.append("Thank you,\n");
        body.append("PetCare Team");

        message.setText(body.toString());
        mailSender.send(message);
    }

    public void sendReminder(String to, String type) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(to);
        message.setSubject("Appointment Reminder - PetCare");
        message.setText("Hello,\n\nThis is a reminder that your appointment is in " + type + ".\n\nThank you!");
        mailSender.send(message);
    }
}



