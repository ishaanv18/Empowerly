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

            return offerLetterRepository.save(offerLetter);

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

            return appointmentLetterRepository.save(appointmentLetter);

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
        String logoBase64 = getLogoBase64();
        String signatureBase64 = getSignatureBase64();

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <style>" +
                "        @page { margin: 0; }" +
                "        body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; line-height: 1.6; color: #1a1a1a; background: white; }"
                +
                "        .document { background: white; padding: 50px; }" +
                "        .header { text-align: center; margin-bottom: 40px; padding-bottom: 30px; border-bottom: 2px solid #e5e7eb; padding: 30px; }"
                +
                "        .logo { max-width: 200px; margin-bottom: 15px; }" +
                "        .company-name { font-size: 32px; font-weight: 800; color: #1a1a1a; margin: 10px 0; }" +
                "        .company-tagline { font-size: 14px; color: #6B7280; font-style: italic; }" +
                "        .doc-title { text-align: center; font-size: 24px; font-weight: 700; color: #1a1a1a; margin: 30px 0; text-transform: uppercase; letter-spacing: 1px; }"
                +
                "        .date { text-align: right; margin-bottom: 30px; color: #6B7280; font-size: 14px; }" +
                "        .content { margin: 30px 0; }" +
                "        .greeting { font-size: 18px; margin-bottom: 20px; }" +
                "        .intro { font-size: 16px; line-height: 1.8; margin-bottom: 30px; }" +
                "        .details-box { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 30px 0; border: 1px solid #e5e7eb; }"
                +
                "        .details-box h3 { margin-top: 0; color: #1a1a1a; font-size: 18px; margin-bottom: 20px; }" +
                "        .detail-row { margin: 15px 0; display: flex; align-items: center; }" +
                "        .detail-label { font-weight: 700; color: #374151; min-width: 180px; }" +
                "        .detail-value { color: #1a1a1a; font-weight: 500; }" +
                "        .highlight { color: #1a1a1a; font-weight: 700; }" +
                "        .benefits-section { background: #f9fafb; padding: 30px; border-radius: 8px; margin: 30px 0; border: 1px solid #e5e7eb; }"
                +
                "        .benefits-section h3 { color: #1a1a1a; margin-top: 0; font-size: 18px; margin-bottom: 20px; }"
                +
                "        .benefits-section ul { margin: 0; padding-left: 25px; }" +
                "        .benefits-section li { margin: 12px 0; color: #1a1a1a; }" +
                "        .account-box { background: #f9fafb; padding: 25px; border-radius: 8px; margin: 30px 0; border: 1px solid #e5e7eb; }"
                +
                "        .account-box h3 { color: #1a1a1a; margin-top: 0; font-size: 18px; margin-bottom: 15px; }" +
                "        .account-box p { margin: 8px 0; color: #1a1a1a; }" +
                "        .important-note { background: #fef3c7; padding: 20px; border-radius: 8px; border: 1px solid #fbbf24; margin: 25px 0; }"
                +
                "        .important-note strong { color: #92400e; }" +
                "        .signature-section { margin-top: 50px; }" +
                "        .signature-img { max-width: 150px; margin: 10px 0; }" +
                "        .signer-info { margin-top: 10px; }" +
                "        .signer-name { font-weight: 700; font-size: 16px; color: #1a1a1a; }" +
                "        .signer-title { color: #6B7280; font-size: 14px; }" +
                "        .footer { margin-top: 60px; padding-top: 30px; border-top: 3px solid #e5e7eb; text-align: center; }"
                +
                "        .footer-contact { color: #6B7280; font-size: 13px; margin: 8px 0; }" +
                "        .footer-note { color: #9ca3af; font-size: 11px; margin-top: 15px; font-style: italic; }" +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='document'>" +
                "        <div class='header'>" +
                (logoBase64.isEmpty() ? ""
                        : "            <img src='" + logoBase64 + "' class='logo' alt='Empowerly Logo' />")
                +
                "            <div class='company-name'>EMPOWERLY</div>" +
                "            <div class='company-tagline'>Empowering Your Workforce, Elevating Your Future</div>" +
                "        </div>" +
                "        <div class='doc-title'>Offer of Employment</div>" +
                "        <div class='date'>Date: " + currentDate + "</div>" +
                "        <div class='content'>" +
                "            <div class='greeting'>Dear <strong>" + dto.getEmployeeName() + "</strong>,</div>" +
                "            <div class='intro'>" +
                "                We are absolutely delighted to extend this formal offer of employment to you for the position of <span class='highlight'>"
                + dto.getPosition() + "</span> at Empowerly. " +
                "                After careful consideration of your qualifications and experience, we believe you will be an invaluable addition to our team."
                +
                "            </div>" +
                "            <div class='details-box'>" +
                "                <h3>📋 Position Details</h3>" +
                "                <div class='detail-row'><span class='detail-label'>Position:</span><span class='detail-value'>"
                + dto.getPosition() + "</span></div>" +
                "                <div class='detail-row'><span class='detail-label'>Department:</span><span class='detail-value'>"
                + dto.getDepartment() + "</span></div>" +
                "                <div class='detail-row'><span class='detail-label'>Annual Salary:</span><span class='detail-value highlight'>₹"
                + String.format("%,.2f", dto.getSalary()) + "</span></div>" +
                "                <div class='detail-row'><span class='detail-label'>Joining Date:</span><span class='detail-value'>"
                + joiningDate + "</span></div>" +
                "                <div class='detail-row'><span class='detail-label'>Employment Type:</span><span class='detail-value'>Full-time, Permanent</span></div>"
                +
                "            </div>" +
                "            <div class='benefits-section'>" +
                "                <h3>🎁 Benefits & Perks</h3>" +
                "                <ul>" +
                "                    <li><strong>Health Insurance:</strong> Comprehensive medical coverage for you and your family</li>"
                +
                "                    <li><strong>Paid Time Off:</strong> 24 days annual leave + 12 public holidays</li>"
                +
                "                    <li><strong>Professional Development:</strong> Annual learning budget and conference attendance</li>"
                +
                "                    <li><strong>Flexible Work:</strong> Hybrid work model with remote options</li>" +
                "                    <li><strong>Performance Bonus:</strong> Annual performance-based incentives</li>" +
                "                    <li><strong>Wellness Programs:</strong> Gym membership and mental health support</li>"
                +
                "                </ul>" +
                "            </div>" +
                "            <div class='account-box'>" +
                "                <h3>🔐 Your Empowerly Account</h3>" +
                "                <p>Upon joining, you will receive your personalized Empowerly account credentials via email. This account will provide you access to:</p>"
                +
                "                <ul style='margin: 10px 0; padding-left: 25px;'>" +
                "                    <li>Employee portal and dashboard</li>" +
                "                    <li>Attendance and leave management</li>" +
                "                    <li>Payroll and tax documents</li>" +
                "                    <li>Internal communication tools</li>" +
                "                    <li>Learning and development resources</li>" +
                "                </ul>" +
                "            </div>" +
                "            <div class='important-note'>" +
                "                <p><strong>⚠️ Important:</strong> This offer is contingent upon successful completion of background verification, reference checks, and submission of required documents. "
                +
                "                Please confirm your acceptance by signing and returning this letter by <strong>"
                + dto.getJoiningDate().minusDays(7).format(DATE_FORMATTER) + "</strong>.</p>" +
                "            </div>" +
                "            <p style='margin-top: 30px; font-size: 16px;'>We are excited about the prospect of you joining our team and contributing to Empowerly's continued success. Welcome aboard!</p>"
                +
                "            <div class='signature-section'>" +
                "                <p style='margin-bottom: 5px;'>Warm regards,</p>" +
                (signatureBase64.isEmpty() ? ""
                        : "                <img src='" + signatureBase64 + "' class='signature-img' alt='Signature' />")
                +
                "                <div class='signer-info'>" +
                "                    <div class='signer-name'>" + currentUser.getName() + "</div>" +
                "                    <div class='signer-title'>HR Manager</div>" +
                "                    <div class='signer-title'>Empowerly</div>" +
                "                </div>" +
                "            </div>" +
                "        </div>" +
                "        <div class='footer'>" +
                "            <div class='footer-contact'><strong>Empowerly</strong> | Email: hr@empowerly.com | Phone: +91-XXXXXXXXXX</div>"
                +
                "            <div class='footer-contact'>Address: [Company Address]</div>" +
                "            <div class='footer-note'>This is a system-generated document. For any queries, please contact HR department.</div>"
                +
                "        </div>" +
                "    </div>" +
                "</body>" +
                "</html>";
    }

    private String getAppointmentLetterHtml(AppointmentLetterDTO dto, User currentUser) {
        String currentDate = LocalDateTime.now().format(DATE_FORMATTER);
        String joiningDate = dto.getJoiningDate().format(DATE_FORMATTER);
        String logoBase64 = getLogoBase64();

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "    <meta charset='UTF-8'>" +
                "    <style>" +
                "        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }" +
                "        .header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #4F46E5; padding-bottom: 20px; }"
                +
                "        .logo { max-width: 180px; margin-bottom: 10px; }" +
                "        .company-name { font-size: 28px; font-weight: bold; color: #4F46E5; margin-bottom: 5px; }" +
                "        .company-tagline { font-size: 14px; color: #6B7280; }" +
                "        .title { text-align: center; font-size: 22px; font-weight: bold; margin: 30px 0; color: #1F2937; }"
                +
                "        .date { text-align: right; margin-bottom: 30px; color: #6B7280; }" +
                "        .content { margin: 30px 0; }" +
                "        .details-box { background: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0; }" +
                "        .details-box h3 { margin-top: 0; color: #4F46E5; }" +
                "        .detail-row { margin: 10px 0; }" +
                "        .detail-label { font-weight: bold; color: #374151; display: inline-block; width: 150px; }" +
                "        .terms { margin: 20px 0; padding: 15px; background: #FEF3C7; border-left: 4px solid #F59E0B; }"
                +
                "        .signature { margin-top: 50px; }" +
                "        .signature-section { display: flex; justify-content: space-between; margin-top: 60px; }" +
                "        .signature-box { width: 45%; }" +
                "        .signature-line { border-top: 1px solid #000; margin-top: 50px; padding-top: 5px; }" +
                "        .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #E5E7EB; text-align: center; color: #6B7280; font-size: 12px; }"
                +
                "    </style>" +
                "</head>" +
                "<body>" +
                "    <div class='header'>" +
                (logoBase64.isEmpty() ? ""
                        : "        <img src='" + logoBase64 + "' class='logo' alt='Empowerly Logo' />")
                +
                "        <div class='company-name'>EMPOWERLY</div>" +
                "        <div class='company-tagline'>Empowering Your Workforce</div>" +
                "    </div>" +
                "    <div class='title'>APPOINTMENT LETTER</div>" +
                "    <div class='date'>Date: " + currentDate + "</div>" +
                "    <div class='content'>" +
                "        <p>Dear <strong>" + dto.getEmployeeName() + "</strong>,</p>" +
                "        <p>Further to your acceptance of our offer letter, we are pleased to confirm your appointment as <strong>"
                + dto.getPosition() + "</strong> at Empowerly.</p>" +
                "        <div class='details-box'>" +
                "            <h3>Employment Details</h3>" +
                "            <div class='detail-row'><span class='detail-label'>Position:</span> " + dto.getPosition()
                + "</div>" +
                "            <div class='detail-row'><span class='detail-label'>Department:</span> "
                + dto.getDepartment() + "</div>" +
                "            <div class='detail-row'><span class='detail-label'>Annual Salary:</span> ₹"
                + String.format("%,.2f", dto.getSalary()) + "</div>" +
                "            <div class='detail-row'><span class='detail-label'>Joining Date:</span> " + joiningDate
                + "</div>" +
                "            <div class='detail-row'><span class='detail-label'>Work Location:</span> "
                + dto.getWorkLocation() + "</div>" +
                "            <div class='detail-row'><span class='detail-label'>Reporting To:</span> "
                + dto.getReportingTo() + "</div>" +
                "        </div>" +
                "        <div class='terms'>" +
                "            <h3 style='margin-top: 0;'>Terms and Conditions</h3>" +
                "            <ul>" +
                "                <li>Your employment is subject to satisfactory completion of probation period of 3 months.</li>"
                +
                "                <li>You will be entitled to leave as per company policy.</li>" +
                "                <li>You are required to maintain confidentiality of company information.</li>" +
                "                <li>Either party may terminate employment with 30 days notice.</li>" +
                "            </ul>" +
                "        </div>" +
                "        <p>Please sign and return a copy of this letter as acceptance of the terms mentioned above.</p>"
                +
                "        <p>We welcome you to Empowerly and wish you a successful career with us!</p>" +
                "        <div class='signature-section'>" +
                "            <div class='signature-box'>" +
                "                <p><strong>For Empowerly:</strong></p>" +
                "                <div class='signature-line'>" +
                "                    <p><strong>" + currentUser.getName() + "</strong><br>" +
                "                    HR Manager</p>" +
                "                </div>" +
                "            </div>" +
                "            <div class='signature-box'>" +
                "                <p><strong>Employee Acceptance:</strong></p>" +
                "                <div class='signature-line'>" +
                "                    <p>Signature<br>" +
                "                    Date: __________</p>" +
                "                </div>" +
                "            </div>" +
                "        </div>" +
                "    </div>" +
                "    <div class='footer'>" +
                "        <p>Empowerly | Email: hr@empowerly.com | Phone: +91-XXXXXXXXXX</p>" +
                "        <p>This is a system-generated document</p>" +
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
}
