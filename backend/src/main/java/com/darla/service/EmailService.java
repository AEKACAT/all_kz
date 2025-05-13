package com.darla.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender javaMailSender;

    public String sendEmailWithHtmlTemplate(String to, String subject, String htmlContent) throws MessagingException {
        // MimeMessage құру
        MimeMessage message = javaMailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);

        try {
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true); // HTML мазмұнын жіберу үшін true деп орнату
            javaMailSender.send(message);
        } catch (MessagingException e) {
            e.printStackTrace();
            return "Электрондық поштаны жіберу кезінде қате болды: " + e.getMessage();
        }
        return "Электрондық пошта сәтті жіберілді: " + to;
    }
}
