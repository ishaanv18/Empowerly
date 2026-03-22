package com.empowerly.service;

import com.empowerly.dto.AppointmentLetterDTO;
import com.empowerly.dto.OfferLetterDTO;
import com.empowerly.model.AppointmentLetter;
import com.empowerly.model.OfferLetter;
import com.empowerly.model.User;
import com.empowerly.repository.AppointmentLetterRepository;
import com.empowerly.repository.OfferLetterRepository;
import com.itextpdf.html2pdf.HtmlConverter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileOutputStream;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DocumentGenerationService {

    private final OfferLetterRepository offerLetterRepository;
    private final AppointmentLetterRepository appointmentLetterRepository;
    private final AuditLogService auditLogService;

    private static final String DOCUMENTS_DIR = "generated_documents";
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMMM yyyy");

    public OfferLetter generateOfferLetter(OfferLetterDTO dto, User currentUser) {
        try {
            // Create documents directory if it doesn't exist
            Path documentsPath = Paths.get(DOCUMENTS_DIR);
            if (!Files.exists(documentsPath)) {
                Files.createDirectories(documentsPath);
            }

            // Generate HTML content
            String html = getOfferLetterHtml(dto, currentUser);

            // Generate PDF filename
            String fileName = "Offer_Letter_" + dto.getEmployeeName().replaceAll("\\s+", "_") + "_" +
                    System.currentTimeMillis() + ".pdf";
            String filePath = DOCUMENTS_DIR + File.separator + fileName;

            // Convert HTML to PDF
            HtmlConverter.convertToPdf(html, new FileOutputStream(filePath));

            // Save to database
            OfferLetter offerLetter = new OfferLetter();
            offerLetter.setEmployeeName(dto.getEmployeeName());
            offerLetter.setEmail(dto.getEmail());
            offerLetter.setPosition(dto.getPosition());
            offerLetter.setSalary(dto.getSalary());
            offerLetter.setDepartment(dto.getDepartment());
            offerLetter.setJoiningDate(dto.getJoiningDate());
            offerLetter.setGeneratedBy(currentUser.getName());
            offerLetter.setGeneratedById(currentUser.getId());
            offerLetter.setGeneratedAt(LocalDateTime.now());
            offerLetter.setPdfPath(filePath);
            offerLetter.setPdfFileName(fileName);

            OfferLetter saved = offerLetterRepository.save(offerLetter);

            auditLogService.logAction(
                    currentUser.getId(),
                    "DOCUMENT_GENERATE",
                    "DOCUMENT",
                    saved.getId(),
                    "Offer letter generated for: " + dto.getEmployeeName(),
                    Map.of("type", "OFFER_LETTER", "role", dto.getPosition()),
                    null,
                    null);

            return saved;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate offer letter: " + e.getMessage(), e);
        }
    }

    public AppointmentLetter generateAppointmentLetter(AppointmentLetterDTO dto, User currentUser) {
        try {
            // Create documents directory if it doesn't exist
            Path documentsPath = Paths.get(DOCUMENTS_DIR);
            if (!Files.exists(documentsPath)) {
                Files.createDirectories(documentsPath);
            }

            // Generate HTML content
            String html = getAppointmentLetterHtml(dto, currentUser);

            // Generate PDF filename
            String fileName = "Appointment_Letter_" + dto.getEmployeeName().replaceAll("\\s+", "_") + "_" +
                    System.currentTimeMillis() + ".pdf";
            String filePath = DOCUMENTS_DIR + File.separator + fileName;

            // Convert HTML to PDF
            HtmlConverter.convertToPdf(html, new FileOutputStream(filePath));

            // Save to database
            AppointmentLetter appointmentLetter = new AppointmentLetter();
            appointmentLetter.setEmployeeName(dto.getEmployeeName());
            appointmentLetter.setEmail(dto.getEmail());
            appointmentLetter.setPosition(dto.getPosition());
            appointmentLetter.setSalary(dto.getSalary());
            appointmentLetter.setDepartment(dto.getDepartment());
            appointmentLetter.setJoiningDate(dto.getJoiningDate());
            appointmentLetter.setWorkLocation(dto.getWorkLocation());
            appointmentLetter.setReportingTo(dto.getReportingTo());
            appointmentLetter.setGeneratedBy(currentUser.getName());
            appointmentLetter.setGeneratedById(currentUser.getId());
            appointmentLetter.setGeneratedAt(LocalDateTime.now());
            appointmentLetter.setPdfPath(filePath);
            appointmentLetter.setPdfFileName(fileName);

            AppointmentLetter saved = appointmentLetterRepository.save(appointmentLetter);

            auditLogService.logAction(
                    currentUser.getId(),
                    "DOCUMENT_GENERATE",
                    "DOCUMENT",
                    saved.getId(),
                    "Appointment letter generated for: " + dto.getEmployeeName(),
                    Map.of("type", "APPOINTMENT_LETTER", "role", dto.getPosition()),
                    null,
                    null);

            return saved;

        } catch (Exception e) {
            throw new RuntimeException("Failed to generate appointment letter: " + e.getMessage(), e);
        }
    }

    private String getLogoBase64() {
        try {
            InputStream logoStream = getClass().getResourceAsStream("/static/images/empowerly-logo.png");
            if (logoStream != null) {
                byte[] logoBytes = logoStream.readAllBytes();
                String base64Logo = Base64.getEncoder().encodeToString(logoBytes);
                return "data:image/png;base64," + base64Logo;
            }
        } catch (Exception e) {
            // Logo loading failed, return empty string
        }
        return "";
    }

    private String getSignatureBase64() {
        try {
            InputStream signatureStream = getClass().getResourceAsStream("/static/images/signature.png");
            if (signatureStream != null) {
                byte[] signatureBytes = signatureStream.readAllBytes();
                String base64Signature = Base64.getEncoder().encodeToString(signatureBytes);
                return "data:image/png;base64," + base64Signature;
            }
        } catch (Exception e) {
            // Signature loading failed, return empty string
        }
        return "";
    }

    private String getOfferLetterHtml(OfferLetterDTO dto, User currentUser) {
        String currentDate = LocalDateTime.now().format(DATE_FORMATTER);
        String joiningDate = dto.getJoiningDate().format(DATE_FORMATTER);
        String acceptanceDeadline = dto.getJoiningDate().minusDays(7).format(DATE_FORMATTER);
        String logoBase64 = getLogoBase64();
        String signatureBase64 = getSignatureBase64();

        String formattedSalary = String.format("%,.0f", dto.getSalary());
        String salaryInWords = convertNumberToWords(dto.getSalary() != null ? dto.getSalary().longValue() : 0);

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <style>" +
                "        @page { margin: 20mm; size: A4; }" +
                "        * { box-sizing: border-box; }" +
                "        body { margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fff; color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 11pt; line-height: 1.4; }"
                +
                "        .page-container { max-width: 210mm; margin: 0 auto; background: #ffffff; }" +
                "        .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px 40px; margin: -20px -20px 30px -20px; border-radius: 0; display: flex; align-items: center; justify-content: space-between; min-height: 80px; }"
                +
                "        .logo-container { flex-shrink: 0; background: white; padding: 8px 16px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }"
                +
                "        .logo { height: 50px; width: auto; display: block; }" +
                "        .header-title { color: #ffffff; font-size: 22px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; text-align: right; flex-grow: 1; margin-left: 20px; }"
                +
                "        .meta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }"
                +
                "        .meta-group { }" +
                "        .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 4px; font-weight: 600; }"
                +
                "        .meta-value { font-size: 13px; color: #111827; font-weight: 600; }" +
                "        .meta-group-right { text-align: right; }" +
                "        .recipient-section { margin-bottom: 25px; }" +
                "        .recipient-name { font-size: 16px; font-weight: 700; color: #111827; margin: 5px 0; }" +
                "        .recipient-details { font-size: 12px; color: #4b5563; }" +
                "        .greeting { font-size: 13px; margin-bottom: 15px; color: #111827; font-weight: 600; }" +
                "        .text-body { font-size: 11pt; line-height: 1.5; color: #374151; margin-bottom: 15px; text-align: justify; }"
                +
                "        .section-card { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; page-break-inside: avoid; }"
                +
                "        .section-title { font-size: 13px; font-weight: 700; color: #1e40af; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }"
                +
                "        .data-grid { margin: 10px 0; }" +
                "        .data-row { display: grid; grid-template-columns: 180px 1fr; gap: 15px; padding: 6px 0; border-bottom: 1px solid #e5e7eb; }"
                +
                "        .data-row:last-child { border-bottom: none; }" +
                "        .data-label { font-size: 11pt; color: #6b7280; font-weight: 600; }" +
                "        .data-value { font-size: 11pt; color: #111827; font-weight: 500; }" +
                "        .list-container { margin: 10px 0; padding-left: 25px; }" +
                "        .list-item { font-size: 11pt; color: #374151; margin-bottom: 8px; line-height: 1.5; }" +
                "        .salary-highlight { color: #059669; font-weight: 700; font-size: 14px; }" +
                "        .salary-words { display: block; font-size: 10px; color: #6b7280; font-style: italic; margin-top: 3px; }"
                +
                "        .signature-section { margin-top: 40px; page-break-inside: avoid; }" +
                "        .signature-block { margin-top: 20px; page-break-inside: avoid; }" +
                "        .sign-img { height: 50px; margin-bottom: 10px; display: block; }" +
                "        .sign-name { font-weight: 700; color: #111827; font-size: 13px; margin: 3px 0; }" +
                "        .sign-role { font-size: 11px; color: #6b7280; margin: 2px 0; }" +
                "        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; page-break-inside: avoid; }"
                +
                "        .footer-logo-text { font-weight: 700; color: #1e40af; margin-bottom: 8px; font-size: 14px; }" +
                "        .footer-info { font-size: 10px; color: #6b7280; margin: 3px 0; }" +
                "        .disclaimer { font-size: 9px; color: #9ca3af; margin-top: 15px; font-style: italic; line-height: 1.3; }"
                +
                "        .keep-together { page-break-inside: avoid; }" +
                "        @media print { .page-container { margin: 0; padding: 0; } body { padding: 0; } }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='page-container'>" +
                "        <div class='header'>" +
                (logoBase64.isEmpty() ? ""
                        : "<div class='logo-container'><img src='" + logoBase64
                                + "' class='logo' alt='Empowerly'/></div>")
                +
                "            <div class='header-title'>Offer of Employment</div>" +
                "        </div>" +
                "        <div class='meta-row'>" +
                "            <div class='meta-group'>" +
                "                <div class='meta-label'>Date</div>" +
                "                <div class='meta-value'>" + currentDate + "</div>" +
                "            </div>" +
                "            <div class='meta-group meta-group-right'>" +
                "                <div class='meta-label'>Offer Reference</div>" +
                "                <div class='meta-value'>EMP/" + java.time.Year.now().getValue() + "/"
                + System.currentTimeMillis() % 10000 + "</div>" +
                "            </div>" +
                "        </div>" +
                "        <div class='recipient-section'>" +
                "            <div class='meta-label'>To</div>" +
                "            <div class='recipient-name'>" + dto.getEmployeeName() + "</div>" +
                "            <div class='recipient-details'>Email: " + dto.getEmail() + "</div>" +
                "        </div>" +
                "        <div class='greeting'>Dear " + dto.getEmployeeName() + ",</div>" +
                "        <div class='text-body'>" +
                "            We are pleased to formally extend this Offer of Employment to you for the position of <strong>"
                + dto.getPosition() + "</strong> in the <strong>" + dto.getDepartment()
                + "</strong> department at Empowerly. After careful evaluation of your qualifications, skills, and overall potential, we believe that you will be a strong addition to our organization."
                +
                "        </div>" +
                "        <div class='section-card'>" +
                "            <div class='section-title'>1. Position & Employment Details</div>" +
                "            <div class='text-body'>You are being offered employment under the following terms:</div>" +
                "            <div class='data-grid'>" +
                "                <div class='data-row'><div class='data-label'>Job Title</div><div class='data-value'>"
                + dto.getPosition() + "</div></div>" +
                "                <div class='data-row'><div class='data-label'>Department</div><div class='data-value'>"
                + dto.getDepartment() + "</div></div>" +
                "                <div class='data-row'><div class='data-label'>Employment Type</div><div class='data-value'>Full-time, Permanent</div></div>"
                +
                "                <div class='data-row'><div class='data-label'>Work Arrangement</div><div class='data-value'>Hybrid / Flexible</div></div>"
                +
                "                <div class='data-row'><div class='data-label'>Reporting To</div><div class='data-value'>Department Head</div></div>"
                +
                "                <div class='data-row'><div class='data-label'>Joining Date</div><div class='data-value'>"
                + joiningDate + "</div></div>" +
                "            </div>" +
                "        </div>" +
                "        <div class='section-title'>2. Roles & Responsibilities</div>" +
                "        <div class='text-body'>In your role as " + dto.getPosition()
                + ", you will be responsible for:</div>" +
                "        <ul class='list-container'>" +
                "            <li class='list-item'>Designing, developing, testing, and maintaining reliable software solutions</li>"
                +
                "            <li class='list-item'>Collaborating with cross-functional teams</li>" +
                "            <li class='list-item'>Writing clean, secure, and maintainable code</li>" +
                "            <li class='list-item'>Participating in code reviews and technical planning</li>" +
                "            <li class='list-item'>Ensuring data integrity and system security</li>" +
                "        </ul>" +
                "        <div class='section-card'>" +
                "            <div class='section-title'>3. Compensation</div>" +
                "            <div class='text-body'>Your compensation structure:</div>" +
                "            <div class='data-grid'>" +
                "                <div class='data-row'>" +
                "                    <div class='data-label'>Annual CTC</div>" +
                "                    <div class='data-value'>" +
                "                        <span class='salary-highlight'>₹" + formattedSalary + "</span>" +
                "                            <span class='salary-words'>(Rupees " + salaryInWords + " Only)</span>" +
                "                        </div>" +
                "                    </div>" +
                "                </div>" +
                "            </div>" +
                "            <div class='text-body' style='margin-top: 10px;'>The salary will be paid monthly and subject to applicable statutory deductions.</div>"
                +
                "        </div>" +
                "        <div class='section-title'>4. Benefits & Compliance</div>" +
                "        <div class='text-body'>As a full-time employee, you will be eligible for:</div>" +
                "        <ul class='list-container'>" +
                "            <li class='list-item'>Health insurance coverage</li>" +
                "            <li class='list-item'>Paid time off and public holidays</li>" +
                "            <li class='list-item'>Performance-based bonuses</li>" +
                "            <li class='list-item'>Professional development opportunities</li>" +
                "        </ul>" +
                "        <div class='text-body'>You are required to maintain confidentiality of proprietary information. This offer is contingent upon successful background verification and document submission.</div>"
                +
                "        <div class='section-card' style='border-left-color: #f59e0b; margin-top: 15px;'>" +
                "            <div class='section-title' style='color: #d97706;'>5. Acceptance</div>" +
                "            <div class='text-body'>Please confirm your acceptance by signing and returning this letter on or before <strong>"
                + acceptanceDeadline + "</strong>.</div>" +
                "        </div>" +
                "        <div class='text-body'>We are excited about you joining Empowerly and look forward to your contributions.</div>"
                +
                "            <div class='text-body'>We wish you great success and welcome you to the Empowerly team.</div>"
                +
                "            <div class='signature-section'>" +
                "                <div class='signature-block'>" +
                "                    <div class='text-body'>Warm regards,</div>" +
                (signatureBase64.isEmpty() ? ""
                        : "<img src='" + signatureBase64 + "' class='sign-img' alt='Signature'/>")
                +
                "                    <div class='sign-name'>" + currentUser.getName() + "</div>" +
                "                    <div class='sign-role'>HR Manager</div>" +
                "                    <div class='sign-role'>Empowerly</div>" +
                "                </div>" +
                "                <div class='footer'>" +
                "                    <div class='footer-logo-text'>Empowerly</div>" +
                "                    <div class='footer-info'>Contact: hr@empowerly.com | +91-XXXXXXXXXX</div>" +
                "                    <div class='footer-info'>Empowerly HQ, Noida, India</div>" +
                "                    <div class='disclaimer'>This is a system-generated offer letter and does not constitute an employment contract. Terms and conditions are subject to company policies.</div>"
                +
                "                </div>" +
                "            </div>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    private String convertNumberToWords(long number) {
        if (number == 0)
            return "Zero";

        final String[] units = { "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
                "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen" };
        final String[] tens = { "", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety" };

        if (number < 0) {
            return "Minus " + convertNumberToWords(-number);
        }

        if (number < 20) {
            return units[(int) number];
        }

        if (number < 100) {
            return tens[(int) (number / 10)] + ((number % 10 != 0) ? " " + units[(int) (number % 10)] : "");
        }

        if (number < 1000) {
            return units[(int) (number / 100)] + " Hundred"
                    + ((number % 100 != 0) ? " " + convertNumberToWords(number % 100) : "");
        }

        if (number < 100000) {
            return convertNumberToWords(number / 1000) + " Thousand"
                    + ((number % 1000 != 0) ? " " + convertNumberToWords(number % 1000) : "");
        }

        if (number < 10000000) {
            return convertNumberToWords(number / 100000) + " Lakh"
                    + ((number % 100000 != 0) ? " " + convertNumberToWords(number % 100000) : "");
        }

        return convertNumberToWords(number / 10000000) + " Crore"
                + ((number % 10000000 != 0) ? " " + convertNumberToWords(number % 10000000) : "");
    }

    private String getAppointmentLetterHtml(AppointmentLetterDTO dto, User currentUser) {
        String currentDate = LocalDateTime.now().format(DATE_FORMATTER);
        String joiningDate = dto.getJoiningDate().format(DATE_FORMATTER);
        String logoBase64 = getLogoBase64();
        String signatureBase64 = getSignatureBase64();

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <style>" +
                "        @page { margin: 20mm; size: A4; }" +
                "        * { box-sizing: border-box; }" +
                "        body { margin: 0; padding: 20px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #fff; color: #1a1a1a; -webkit-print-color-adjust: exact; print-color-adjust: exact; font-size: 11pt; line-height: 1.4; }"
                +
                "        .page-container { max-width: 210mm; margin: 0 auto; background: #ffffff; }" +
                "        .header { background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%); padding: 30px 40px; margin: -20px -20px 30px -20px; border-radius: 0; display: flex; align-items: center; justify-content: space-between; min-height: 80px; }"
                +
                "        .logo-container { flex-shrink: 0; background: white; padding: 8px 16px; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }"
                +
                "        .logo { height: 50px; width: auto; display: block; }" +
                "        .header-title { color: #ffffff; font-size: 22px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; text-align: right; flex-grow: 1; margin-left: 20px; }"
                +
                "        .meta-row { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 2px solid #e5e7eb; }"
                +
                "        .meta-group { }" +
                "        .meta-label { font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; color: #6b7280; margin-bottom: 4px; font-weight: 600; }"
                +
                "        .meta-value { font-size: 13px; color: #111827; font-weight: 600; }" +
                "        .meta-group-right { text-align: right; }" +
                "        .recipient-section { margin-bottom: 25px; }" +
                "        .recipient-name { font-size: 16px; font-weight: 700; color: #111827; margin: 5px 0; }" +
                "        .recipient-details { font-size: 12px; color: #4b5563; }" +
                "        .greeting { font-size: 13px; margin-bottom: 15px; color: #111827; font-weight: 600; }" +
                "        .text-body { font-size: 11pt; line-height: 1.5; color: #374151; margin-bottom: 15px; text-align: justify; }"
                +
                "        .section-card { background: #f8fafc; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; page-break-inside: avoid; }"
                +
                "        .section-title { font-size: 13px; font-weight: 700; color: #1e40af; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 0.5px; }"
                +
                "        .data-grid { margin: 10px 0; }" +
                "        .data-row { display: grid; grid-template-columns: 180px 1fr; gap: 15px; padding: 6px 0; border-bottom: 1px solid #e5e7eb; }"
                +
                "        .data-row:last-child { border-bottom: none; }" +
                "        .data-label { font-size: 11pt; color: #6b7280; font-weight: 600; }" +
                "        .data-value { font-size: 11pt; color: #111827; font-weight: 500; }" +
                "        .list-container { margin: 10px 0; padding-left: 25px; }" +
                "        .list-item { font-size: 11pt; color: #374151; margin-bottom: 8px; line-height: 1.5; }" +
                "        .salary-highlight { color: #059669; font-weight: 700; font-size: 14px; }" +
                "        .signature-section { margin-top: 40px; page-break-inside: avoid; }" +
                "        .signature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-top: 20px; page-break-inside: avoid; }"
                +
                "        .signature-box { }" +
                "        .signature-box-title { font-weight: 700; color: #111827; font-size: 12px; margin-bottom: 40px; }"
                +
                "        .sign-img { height: 50px; margin-bottom: 10px; display: block; }" +
                "        .sign-name { font-weight: 700; color: #111827; font-size: 13px; margin: 3px 0; }" +
                "        .sign-role { font-size: 11px; color: #6b7280; margin: 2px 0; }" +
                "        .sign-line { border-top: 1px solid #9ca3af; padding-top: 8px; margin-top: 40px; }" +
                "        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #e5e7eb; text-align: center; page-break-inside: avoid; }"
                +
                "        .footer-logo-text { font-weight: 700; color: #1e40af; margin-bottom: 8px; font-size: 14px; }" +
                "        .footer-info { font-size: 10px; color: #6b7280; margin: 3px 0; }" +
                "        .disclaimer { font-size: 9px; color: #9ca3af; margin-top: 15px; font-style: italic; line-height: 1.3; }"
                +
                "        @media print { .page-container { margin: 0; padding: 0; } body { padding: 0; } }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='page-container'>" +
                "        <div class='header'>" +
                (logoBase64.isEmpty() ? ""
                        : "<div class='logo-container'><img src='" + logoBase64
                                + "' class='logo' alt='Empowerly'/></div>")
                +
                "            <div class='header-title'>Appointment Letter</div>" +
                "        </div>" +
                "        <div class='meta-row'>" +
                "            <div class='meta-group'>" +
                "                <div class='meta-label'>Date</div>" +
                "                <div class='meta-value'>" + currentDate + "</div>" +
                "            </div>" +
                "            <div class='meta-group meta-group-right'>" +
                "                <div class='meta-label'>Reference No.</div>" +
                "                <div class='meta-value'>APT/" + java.time.Year.now().getValue() + "/"
                + System.currentTimeMillis() % 10000 + "</div>" +
                "            </div>" +
                "        </div>" +
                "        <div class='recipient-section'>" +
                "            <div class='meta-label'>To</div>" +
                "            <div class='recipient-name'>" + dto.getEmployeeName() + "</div>" +
                "            <div class='recipient-details'>Email: " + dto.getEmail() + "</div>" +
                "        </div>" +
                "        <div class='greeting'>Dear " + dto.getEmployeeName() + ",</div>" +
                "        <div class='text-body'>" +
                "            Further to your acceptance of our Offer Letter, we are pleased to formally confirm your appointment as <strong>"
                + dto.getPosition() + "</strong> with Empowerly, effective from <strong>" + joiningDate
                + "</strong>. We are delighted to welcome you to our organization." +
                "        </div>" +
                "        <div class='section-card'>" +
                "            <div class='section-title'>1. Employment Details</div>" +
                "            <div class='text-body'>Your appointment is governed by the following terms:</div>" +
                "            <div class='data-grid'>" +
                "                <div class='data-row'><div class='data-label'>Job Title</div><div class='data-value'>"
                + dto.getPosition() + "</div></div>" +
                "                <div class='data-row'><div class='data-label'>Department</div><div class='data-value'>"
                + dto.getDepartment() + "</div></div>" +
                "                <div class='data-row'><div class='data-label'>Employment Type</div><div class='data-value'>Full-time, Permanent</div></div>"
                +
                "                <div class='data-row'><div class='data-label'>Date of Joining</div><div class='data-value'>"
                + joiningDate + "</div></div>" +
                "                <div class='data-row'><div class='data-label'>Work Location</div><div class='data-value'>"
                + dto.getWorkLocation() + "</div></div>" +
                "                <div class='data-row'><div class='data-label'>Reporting To</div><div class='data-value'>"
                + dto.getReportingTo() + "</div></div>" +
                "            </div>" +
                "        </div>" +
                "        <div class='section-card'>" +
                "            <div class='section-title'>2. Compensation</div>" +
                "            <div class='data-grid'>" +
                "                <div class='data-row'>" +
                "                    <div class='data-label'>Annual CTC</div>" +
                "                    <div class='data-value'><span class='salary-highlight'>₹"
                + String.format("%,.0f", dto.getSalary()) + "</span></div>" +
                "                </div>" +
                "            </div>" +
                "            <div class='text-body' style='margin-top: 10px;'>Your salary shall be paid monthly, subject to statutory deductions as per applicable laws.</div>"
                +
                "        </div>" +
                "        <div class='section-card'>" +
                "            <div class='section-title'>3. Roles & Responsibilities</div>" +
                "            <div class='text-body'>You will be required to perform the following duties:</div>" +
                "            <ul class='list-container'>" +
                "                <li class='list-item'>Design, develop, and maintain software solutions aligned with project requirements</li>"
                +
                "                <li class='list-item'>Collaborate with cross-functional teams to deliver high-quality products</li>"
                +
                "                <li class='list-item'>Participate in code reviews, technical discussions, and knowledge sharing</li>"
                +
                "                <li class='list-item'>Ensure adherence to coding standards, security protocols, and best practices</li>"
                +
                "                <li class='list-item'>Contribute to continuous improvement of development processes</li>"
                +
                "            </ul>" +
                "        </div>" +
                "        <div class='section-title'>4. Probation Period</div>" +
                "        <div class='text-body'>You will be on probation for a period of <strong>3 months</strong> from your date of joining. During this period, your performance, conduct, and suitability for the role will be reviewed. Upon successful completion, your employment shall be confirmed in writing.</div>"
                +
                "        <div class='section-title'>5. Working Hours & Leave Policy</div>" +
                "        <div class='text-body'>Your working hours will be as per company policy and project requirements. You will be entitled to leaves and holidays in accordance with the company's leave policy, which may be amended from time to time.</div>"
                +
                "        <div class='section-title'>6. Benefits & Perquisites</div>" +
                "        <ul class='list-container'>" +
                "            <li class='list-item'>Health insurance coverage for you and eligible dependents</li>" +
                "            <li class='list-item'>Paid time off including annual leave, sick leave, and public holidays</li>"
                +
                "            <li class='list-item'>Performance-based incentives and bonuses</li>" +
                "            <li class='list-item'>Professional development and training opportunities</li>" +
                "            <li class='list-item'>Flexible work environment supporting work-life balance</li>" +
                "        </ul>" +
                "        <div class='section-title'>7. Confidentiality & Data Protection</div>" +
                "        <div class='text-body'>During the course of your employment, you may have access to confidential and proprietary information. You are required to maintain strict confidentiality and shall not disclose such information to any unauthorized person during or after your employment. Any violation may result in disciplinary action, including termination.</div>"
                +
                "        <div class='section-title'>8. Intellectual Property</div>" +
                "        <div class='text-body'>Any work, invention, design, software, documentation, or intellectual property created by you during the course of your employment shall be the sole and exclusive property of Empowerly.</div>"
                +
                "        <div class='section-title'>9. Code of Conduct & Policies</div>" +
                "        <div class='text-body'>You are required to comply with all company rules, regulations, and policies, including but not limited to Code of Conduct, Information Security Policy, IT & Data Usage Policy, and Workplace Ethics & Behavior Policy. Failure to comply may result in disciplinary action.</div>"
                +
                "        <div class='section-title'>10. Termination of Employment</div>" +
                "        <div class='text-body'>Either party may terminate this employment by providing <strong>30 days</strong> written notice or salary in lieu thereof. The company reserves the right to terminate employment without notice in case of misconduct, breach of trust, or policy violations.</div>"
                +
                "        <div class='text-body' style='margin-top: 20px;'>Please sign and return a copy of this letter as acceptance of the above terms and conditions.</div>"
                +
                "        <div class='text-body'>We welcome you to Empowerly and wish you a successful and fulfilling career with us. We are confident that your association with the company will be both rewarding and impactful.</div>"
                +
                "        <div class='signature-section'>" +
                "            <div class='signature-grid'>" +
                "                <div class='signature-box'>" +
                "                    <div class='signature-box-title'>For Empowerly:</div>" +
                (signatureBase64.isEmpty() ? ""
                        : "<img src='" + signatureBase64 + "' class='sign-img' alt='Signature'/>")
                +
                "                    <div class='sign-line'>" +
                "                        <div class='sign-name'>" + currentUser.getName() + "</div>" +
                "                        <div class='sign-role'>HR Manager</div>" +
                "                        <div class='sign-role'>Empowerly</div>" +
                "                    </div>" +
                "                </div>" +
                "                <div class='signature-box'>" +
                "                    <div class='signature-box-title'>Employee Acceptance:</div>" +
                "                    <div class='sign-line'>" +
                "                        <div class='sign-name'>" + dto.getEmployeeName() + "</div>" +
                "                        <div class='sign-role'>Signature: _________________</div>" +
                "                        <div class='sign-role'>Date: _________________</div>" +
                "                    </div>" +
                "                </div>" +
                "            </div>" +
                "            <div class='footer'>" +
                "                <div class='footer-logo-text'>Empowerly</div>" +
                "                <div class='footer-info'>📧 Email: hr@empowerly.com | 📞 Phone: +91-XXXXXXXXXX</div>" +
                "                <div class='footer-info'>Empowerly HQ, Noida, India</div>" +
                "                <div class='disclaimer'>This is a system-generated appointment letter and does not require a physical seal.</div>"
                +
                "            </div>" +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    public List<Map<String, Object>> getAllDocuments() {
        List<Map<String, Object>> allDocuments = new ArrayList<>();

        // Get all offer letters
        List<OfferLetter> offerLetters = offerLetterRepository.findAllByOrderByGeneratedAtDesc();
        for (OfferLetter letter : offerLetters) {
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", letter.getId());
            doc.put("type", "OFFER_LETTER");
            doc.put("employeeName", letter.getEmployeeName());
            doc.put("position", letter.getPosition());
            doc.put("generatedBy", letter.getGeneratedBy());
            doc.put("generatedAt", letter.getGeneratedAt());
            doc.put("fileName", letter.getPdfFileName());
            allDocuments.add(doc);
        }

        // Get all appointment letters
        List<AppointmentLetter> appointmentLetters = appointmentLetterRepository.findAllByOrderByGeneratedAtDesc();
        for (AppointmentLetter letter : appointmentLetters) {
            Map<String, Object> doc = new HashMap<>();
            doc.put("id", letter.getId());
            doc.put("type", "APPOINTMENT_LETTER");
            doc.put("employeeName", letter.getEmployeeName());
            doc.put("position", letter.getPosition());
            doc.put("generatedBy", letter.getGeneratedBy());
            doc.put("generatedAt", letter.getGeneratedAt());
            doc.put("fileName", letter.getPdfFileName());
            allDocuments.add(doc);
        }

        // Sort by generated date descending
        allDocuments
                .sort((a, b) -> ((LocalDateTime) b.get("generatedAt")).compareTo((LocalDateTime) a.get("generatedAt")));

        return allDocuments;
    }

    public byte[] getOfferLetterPdf(String id) {
        try {
            OfferLetter letter = offerLetterRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Offer letter not found"));
            Path path = Paths.get(letter.getPdfPath());
            return Files.readAllBytes(path);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read offer letter PDF: " + e.getMessage(), e);
        }
    }

    public byte[] getAppointmentLetterPdf(String id) {
        try {
            AppointmentLetter letter = appointmentLetterRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Appointment letter not found"));
            Path path = Paths.get(letter.getPdfPath());
            return Files.readAllBytes(path);
        } catch (Exception e) {
            throw new RuntimeException("Failed to read appointment letter PDF: " + e.getMessage(), e);
        }
    }

    /**
     * Delete a specific document (offer letter or appointment letter)
     */
    public void deleteDocument(String id, String type) throws Exception {
        if ("OFFER_LETTER".equals(type)) {
            if (!offerLetterRepository.existsById(id)) {
                throw new Exception("Offer letter not found");
            }
            offerLetterRepository.deleteById(id);
        } else if ("APPOINTMENT_LETTER".equals(type)) {
            if (!appointmentLetterRepository.existsById(id)) {
                throw new Exception("Appointment letter not found");
            }
            appointmentLetterRepository.deleteById(id);
        } else {
            throw new Exception("Invalid document type");
        }

        auditLogService.logAction(
                "HR", // Assuming HR context as ID isn't passed
                "DOCUMENT_DELETE",
                "DOCUMENT",
                id,
                type + " deleted",
                Map.of("documentType", type),
                null,
                null);
    }

    /**
     * Delete all documents (both offer letters and appointment letters)
     */
    public int deleteAllDocuments() {
        long offerCount = offerLetterRepository.count();
        long appointmentCount = appointmentLetterRepository.count();

        offerLetterRepository.deleteAll();
        appointmentLetterRepository.deleteAll();

        return (int) (offerCount + appointmentCount);
    }

    // Helper method to propagate current user ID for actions like deleteAll from
    // controller
    public void deleteAllDocuments(String userId) {
        int count = deleteAllDocuments();
        auditLogService.logAction(
                userId,
                "DOCUMENT_DELETE_ALL",
                "DOCUMENT",
                "ALL",
                "All documents deleted",
                Map.of("count", count),
                null,
                null);
    }
}
