// Buzzed — legal/safety document package (reference drafts).
//
// SOURCE OF TRUTH for the in-app Privacy Policy, Terms of Service, EULA,
// Alcohol & Health Disclaimer, and Age-Gate copy. Faithfully transcribed from
// the legal reference package. Internal "drafting notes" / compliance
// cross-references from the package are intentionally NOT included here — they
// are developer guidance, not user-facing text.
//
// ⚠️ These are reference drafts, NOT legal advice. Fill every placeholder in
// LEGAL_INFO and have a licensed New Jersey attorney review before publishing.
// Placeholders render as visible [BRACKETS] until filled so nothing ships blank.
//
// Placeholders are written as {{token}} in the text and resolved at render time
// via fillLegalTemplate() against LEGAL_INFO — so you fill them in ONE place.

export type LegalDocKey = 'privacy' | 'terms' | 'eula' | 'disclaimer';

export interface LegalSection {
  heading?: string;
  paragraphs: string[];
  /** Conspicuous boxed style — for ALL-CAPS warranty/liability/indemnity clauses
   *  that NJ UCC § 12A:2-316 and the TCCWNA require to be visually distinct. */
  emphasis?: boolean;
}

export interface LegalDocument {
  key: LegalDocKey;
  title: string;
  /** Short label for Settings list rows. */
  shortTitle: string;
  /** Shown under the title when present (e.g. effective date). */
  subtitle?: string;
  sections: LegalSection[];
}

// ---------------------------------------------------------------------------
// Placeholders — FILL THESE IN before App Store / Play submission.
// ---------------------------------------------------------------------------
export const LEGAL_INFO = {
  developerName: 'Kavi Gandham',
  contactEmail: '[CONTACT EMAIL]',
  effectiveDate: '[EFFECTIVE DATE]',
  mailingAddress: '[MAILING ADDRESS]',
  appStoreUrl: '[APP STORE URL]',
  googlePlayUrl: '[GOOGLE PLAY URL]',
  websiteUrl: '[WEBSITE URL]',
} as const;

// Version string recorded with each user's clickwrap acceptance. Bump this
// whenever the document text materially changes so consent records stay dated.
export const LEGAL_VERSION = '2026-06-18';

// Resolve {{token}} placeholders against LEGAL_INFO. Unknown tokens are left
// in place so a typo is visible rather than silently dropped.
export function fillLegalTemplate(text: string): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => {
    const value = (LEGAL_INFO as Record<string, string>)[key];
    return value !== undefined ? value : match;
  });
}

// ---------------------------------------------------------------------------
// 4a. SHORT DISCLAIMER — MainScreen footer.
// ---------------------------------------------------------------------------
export const DISCLAIMER_SHORT =
  'Buzzed is an awareness and tracking tool only. It does not measure ' +
  'intoxication or calculate BAC, and its impairment labels are general ' +
  'estimates — never use Buzzed to decide whether to drive, operate ' +
  "machinery, or make any safety decision. If you've been drinking, do not drive.";

// ---------------------------------------------------------------------------
// 1. PRIVACY POLICY
// ---------------------------------------------------------------------------
const PRIVACY: LegalDocument = {
  key: 'privacy',
  title: 'Privacy Policy',
  shortTitle: 'Privacy Policy',
  subtitle: 'Effective Date: {{effectiveDate}}',
  sections: [
    {
      paragraphs: [
        'This Privacy Policy explains how {{developerName}} ("we," "us," or "our"), a sole proprietorship based in New Jersey, USA, handles information in connection with the Buzzed mobile application ("Buzzed" or the "App").',
        'The short version: Buzzed stores all of your information locally on your own device. We do not have user accounts, we do not collect your personal data, we do not transmit your data to any server we control, and we do not sell or share your data with anyone. Because your data never leaves your device, you are in complete control of it at all times.',
      ],
    },
    {
      heading: '1. Who We Are',
      paragraphs: [
        'Buzzed is owned and operated by {{developerName}}, a sole proprietor located in New Jersey. For any privacy questions, contact us at {{contactEmail}}.',
      ],
    },
    {
      heading: '2. What Information Buzzed Handles',
      paragraphs: [
        'Buzzed lets you record and review information about your own drinking. The information you enter and that the App generates includes:',
        '• Drink logs — the standard drink units you record, including the type of drink and the time logged.',
        '• Profile name — an optional display name you may enter. This is not verified and need not be your real name.',
        '• Calendar history — your day-by-day record of logged drinks.',
        '• User preferences and settings — your in-app choices and configuration.',
        'Buzzed does not ask for or use your body weight, gender, age (beyond the age confirmation described below), email address, phone number, contacts, photos, or precise location. Buzzed does not calculate Blood Alcohol Content (BAC).',
      ],
    },
    {
      heading: '3. How Your Information Is Stored',
      paragraphs: [
        "All information is stored locally on your device only, using your device's on-device storage (in technical terms, the React Native \"AsyncStorage\" mechanism).",
        '• We do not operate accounts, logins, or cloud profiles.',
        '• We do not transmit, upload, back up, or sync your data to any server operated by us or by any third party.',
        '• We have no ability to access, view, or recover the data on your device.',
        'If your device performs its own operating-system-level backup (for example, an iCloud or Google device backup that you have enabled), your Buzzed data may be included in that backup under the terms of your device or operating system provider. That backup is controlled by you and your device provider, not by us.',
      ],
    },
    {
      heading: '4. No Analytics, No Tracking, No Advertising (Currently)',
      paragraphs: [
        "As of the Effective Date, Buzzed contains no analytics, no crash reporting, no advertising identifiers, no tracking technologies, and no third-party software development kits (SDKs) that collect data. We do not engage in cross-app or cross-site tracking, and Buzzed does not use Apple's App Tracking Transparency tracking permission because it performs no tracking.",
      ],
    },
    {
      heading: '5. Future Changes (Analytics or Crash Reporting)',
      paragraphs: [
        "We may, in the future, add limited diagnostic tools such as crash reporting or aggregate, non-personal analytics to improve the App's stability and quality. If we ever do this, we will:",
        '• Update this Privacy Policy and change the Effective Date before or at the time the new practice begins;',
        '• Clearly describe what is collected, who provides the tool, and why;',
        '• Update the Apple App Privacy ("Nutrition Label") disclosures and the Google Play Data Safety section to match; and',
        '• Where required by law, request your consent.',
        'We will not retroactively apply new data practices to data that never left your device.',
      ],
    },
    {
      heading: '6. No Sale or Sharing of Personal Information',
      paragraphs: [
        'We do not sell, rent, share, or disclose your personal information to third parties for money or for any other valuable consideration, and we do not share it for cross-context behavioral advertising. Because your data stays on your device, there is nothing for us to sell or share.',
      ],
    },
    {
      heading: "7. Children's Privacy",
      paragraphs: [
        'Buzzed is intended only for adults of legal drinking age (see the Age Gate and Terms). It is not directed to children, and we do not knowingly collect information from children. Because no data is transmitted to us, we do not knowingly receive any data from any user, including minors.',
      ],
    },
    {
      heading: '8. Your Privacy Rights Generally — Deleting Your Data',
      paragraphs: [
        'Because your data lives only on your device, you can exercise complete control at any time:',
        '• Delete all data: Open Buzzed, go to Settings, and select "Clear All Data." This permanently erases your drink logs, calendar history, profile name, and preferences from your device.',
        '• Delete everything by uninstalling: Removing the App from your device also removes its locally stored data.',
        'We cannot delete, correct, or retrieve your data for you because we never have access to it.',
      ],
    },
    {
      heading: '9. Your Rights Under the GDPR (EU/EEA/UK Users)',
      paragraphs: [
        'If you are located in the European Economic Area, the United Kingdom, or Switzerland, data protection law (including the General Data Protection Regulation, "GDPR") may give you rights over your personal data. Because all processing occurs locally on your device and we never access your data, you generally act as the controller of your own information; we do not process your personal data on our servers. To the extent the GDPR applies to us, you have the rights to: access your data; rectify (correct) it; erase it ("right to be forgotten"); restrict or object to processing; data portability; and to withdraw consent. You can exercise all of these directly within the App: your data is visible to you in the App, editable by you, exportable by you to the extent the App provides export features, and deletable by you via Settings → Clear All Data. Where we rely on a legal basis to process any personal data we might receive in the future, it will typically be your consent or our legitimate interest in maintaining a functioning, stable app; we will identify the basis at that time. You also have the right to lodge a complaint with your local supervisory authority. To contact us about GDPR matters, email {{contactEmail}}.',
      ],
    },
    {
      heading: '10. Your Rights Under the CCPA/CPRA (California Users)',
      paragraphs: [
        'If you are a California resident, the California Consumer Privacy Act, as amended by the California Privacy Rights Act ("CCPA/CPRA"), provides certain rights. These include the right to know what personal information is collected, used, or disclosed; the right to delete; the right to correct; the right to opt out of the sale or sharing of personal information; and the right to limit the use of sensitive personal information, along with the right not to be discriminated against for exercising your rights. Buzzed does not collect personal information on our servers, does not sell or share personal information, and does not use or disclose sensitive personal information. Your information remains on your device under your control, and you may delete it at any time via Settings → Clear All Data. To make a CCPA/CPRA request or ask a question, email {{contactEmail}}. We will not discriminate against you for exercising any privacy right.',
      ],
    },
    {
      heading: '11. Your Rights Under New Jersey Law (NJDPA)',
      paragraphs: [
        'The New Jersey Data Protection Act ("NJDPA"), N.J. Stat. § 56:8-166.4 et seq., which took effect January 15, 2025 (per the New Jersey Division of Consumer Affairs; an enforcement grace period runs until July 1, 2026), gives New Jersey residents rights including the rights to confirm processing and access, correct, delete, and obtain a portable copy of their personal data, and to opt out of targeted advertising, the sale of personal data, and certain profiling. Under the NJDPA, "sale of personal data" means the exchange of personal data for monetary or other valuable consideration to a third party. As our home state, we honor these principles. Because Buzzed stores your data only on your device, does not sell or share personal data, does not engage in targeted advertising, and does not profile you, you can exercise these rights directly in the App at any time. For questions, contact {{contactEmail}}. (Note: the NJDPA does not provide a private right of action; New Jersey residents may also contact the New Jersey Attorney General\'s Division of Consumer Affairs.)',
      ],
    },
    {
      heading: '12. Data Security',
      paragraphs: [
        'No system is perfectly secure, but keeping your data solely on your device and off of any server materially reduces exposure. Protecting your device with a passcode, biometrics, and up-to-date software is the most effective way to protect your Buzzed data. You are responsible for the physical security of your device.',
      ],
    },
    {
      heading: '13. International Users',
      paragraphs: [
        'Buzzed is operated from the United States. If you use the App elsewhere, you do so on your own initiative. Because your data does not leave your device, there is no cross-border transfer of your data to us.',
      ],
    },
    {
      heading: '14. Changes to This Privacy Policy',
      paragraphs: [
        'We may update this Privacy Policy from time to time. When we do, we will revise the Effective Date above and make the updated policy available in the App and/or at {{websiteUrl}}. If changes are material — for example, if we begin collecting any data — we will provide more prominent notice. Your continued use of Buzzed after an update means you accept the revised policy.',
      ],
    },
    {
      heading: '15. Contact Us',
      paragraphs: [
        '{{developerName}}',
        '{{mailingAddress}}',
        'Email: {{contactEmail}}',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 2. TERMS OF SERVICE
// ---------------------------------------------------------------------------
const TERMS: LegalDocument = {
  key: 'terms',
  title: 'Terms of Service',
  shortTitle: 'Terms of Service',
  subtitle: 'Effective Date: {{effectiveDate}}',
  sections: [
    {
      paragraphs: [
        'PLEASE READ THESE TERMS CAREFULLY. THEY CONTAIN IMPORTANT INFORMATION ABOUT YOUR LEGAL RIGHTS, INCLUDING ALCOHOL-RELATED RISK DISCLAIMERS, A LIMITATION OF LIABILITY, AND (WHERE APPLICABLE) A DISPUTE-RESOLUTION PROVISION.',
      ],
    },
    {
      heading: '1. Acceptance of These Terms',
      paragraphs: [
        'These Terms of Service ("Terms") form a binding agreement between you and {{developerName}}, a New Jersey sole proprietorship ("we," "us," or "our"), governing your use of the Buzzed mobile application ("Buzzed" or the "App"). By downloading, installing, accessing, or using Buzzed — including by tapping "I Agree," confirming the age gate, or otherwise using the App — you accept and agree to these Terms, the Buzzed End User License Agreement ("EULA"), the Privacy Policy, and the Alcohol & Health Disclaimer, all of which are incorporated by reference. If you do not agree, do not use Buzzed.',
      ],
    },
    {
      heading: '2. Description of the Service',
      paragraphs: [
        'Buzzed is a personal awareness and self-tracking tool. It lets you log standard drink units you choose to record, view qualitative impairment-awareness labels (ranging from "Sober" through "Danger"), keep a shareable drinking calendar, and browse a built-in library of preloaded drinks. Buzzed stores everything locally on your device.',
        'Buzzed is informational only. It is NOT a safety device, NOT a medical device, and NOT a scientific instrument. Buzzed does not calculate Blood Alcohol Content (BAC), does not use your body weight, gender, or other personal physiology, and cannot measure your actual level of intoxication or impairment.',
      ],
    },
    {
      heading: '3. Alcohol-Specific Acknowledgements and Assumption of Risk',
      paragraphs: [
        'You expressly acknowledge, understand, and agree that:',
        '• The impairment labels shown in Buzzed (e.g., "Sober," "Buzzed," "Danger") are general, qualitative estimates based only on the number of standard drink units you log and the time elapsed. They are not measurements of your actual impairment, intoxication, or BAC.',
        '• Actual impairment depends on many individual factors Buzzed cannot know or account for, including body weight, biological sex, metabolism, food intake, medications, drugs, health conditions, tolerance, hydration, sleep, and the accuracy of what you log.',
        '• You must NEVER use Buzzed to decide whether you are fit or safe to drive a vehicle, operate machinery, perform any task requiring coordination or judgment, or make any other safety-related or health-related decision. The only safe choice after drinking is not to drive or operate machinery.',
        '• You assume all risks associated with consuming alcohol and with any decision you make while using or after using Buzzed. You are solely responsible for your own conduct and choices.',
        '• Buzzed does not encourage, promote, or endorse alcohol consumption, excessive drinking, or any unlawful activity.',
      ],
    },
    {
      heading: '4. Eligibility and Age Requirement',
      paragraphs: [
        'You must be of legal drinking age in your jurisdiction (at least 21 years old in the United States, or the applicable legal drinking age where you are located) to use Buzzed. By using the App you represent and warrant that you meet this requirement and that you are legally able to enter into these Terms. Buzzed is not intended for, and may not be used by, anyone under the legal drinking age.',
      ],
    },
    {
      heading: '5. No Medical Advice',
      paragraphs: [
        'Buzzed does not provide medical, clinical, therapeutic, or professional advice, diagnosis, or treatment, and is not a substitute for the advice of a qualified healthcare professional. Always seek the advice of your physician or other qualified provider with any questions about alcohol use or your health. If you or someone you know struggles with alcohol use, contact the SAMHSA National Helpline at 1-800-662-HELP (4357), or TTY: 1-800-487-4889 — a confidential, free, 24-hour-a-day, 365-day-a-year information service, in English and Spanish — or visit https://www.samhsa.gov. In an emergency, call 911 (or your local emergency number).',
      ],
    },
    {
      heading: '6. User Conduct',
      paragraphs: [
        'You agree to use Buzzed only for lawful, personal, non-commercial purposes and not to:',
        '• Use the App to make safety, driving, or fitness-to-operate decisions;',
        '• Reverse engineer, decompile, disassemble, modify, or create derivative works of the App, except where this restriction is prohibited by law;',
        '• Distribute, resell, sublicense, rent, or lease the App;',
        '• Use the App in any way that violates applicable law or the rights of others; or',
        '• Interfere with or attempt to compromise the integrity or security of the App.',
      ],
    },
    {
      heading: '7. Shareable Content',
      paragraphs: [
        "Buzzed lets you share certain content (such as your calendar) using your device's standard sharing features. You are solely responsible for anything you choose to share and with whom. Think carefully before sharing information about your drinking; once shared, it may be outside your control.",
      ],
    },
    {
      heading: '8. Intellectual Property',
      paragraphs: [
        'Buzzed, including its software, design, text, graphics, the preloaded drink library, and all related content, is owned by {{developerName}} and is protected by copyright, trademark, and other laws. "Buzzed" and associated logos are our trademarks. Except for the limited license granted in the EULA, no rights are transferred to you. You retain ownership of the data you create; that data stays on your device.',
      ],
    },
    {
      heading: '9. Warranty Disclaimer ("AS IS")',
      emphasis: true,
      paragraphs: [
        'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, BUZZED IS PROVIDED "AS IS" AND "AS AVAILABLE," WITH ALL FAULTS AND WITHOUT WARRANTY OF ANY KIND. WE DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, OR STATUTORY, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, ACCURACY, AND NON-INFRINGEMENT. WE DO NOT WARRANT THAT THE APP WILL BE UNINTERRUPTED, ERROR-FREE, OR ACCURATE, OR THAT ANY IMPAIRMENT LABEL OR OTHER OUTPUT IS RELIABLE FOR ANY PURPOSE. SOME JURISDICTIONS DO NOT ALLOW THE EXCLUSION OF CERTAIN WARRANTIES, SO SOME OF THESE EXCLUSIONS MAY NOT APPLY TO YOU; SEE THE NEW JERSEY-SPECIFIC SECTION BELOW.',
      ],
    },
    {
      heading: '10. Limitation of Liability',
      emphasis: true,
      paragraphs: [
        'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT WILL {{developerName}} BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR ANY LOSS OF DATA, PROFITS, OR GOODWILL, OR FOR ANY PERSONAL INJURY, PROPERTY DAMAGE, DEATH, DUI/DWI, ARREST, FINE, OR OTHER LOSS ARISING OUT OF OR RELATING TO YOUR USE OF, OR INABILITY TO USE, BUZZED OR ANY DECISION YOU MAKE BASED ON THE APP, WHETHER BASED ON WARRANTY, CONTRACT, TORT (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.',
        'TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, OUR TOTAL CUMULATIVE LIABILITY FOR ALL CLAIMS RELATING TO BUZZED WILL NOT EXCEED THE GREATER OF (A) THE AMOUNT YOU PAID US FOR THE APP IN THE TWELVE MONTHS BEFORE THE CLAIM, OR (B) TEN U.S. DOLLARS ($10.00).',
      ],
    },
    {
      heading: '11. Indemnification',
      paragraphs: [
        'To the fullest extent permitted by applicable law, you agree to defend, indemnify, and hold harmless {{developerName}} from and against any claims, liabilities, damages, losses, and expenses (including reasonable attorneys\' fees) arising out of or related to: (a) your use or misuse of Buzzed; (b) your violation of these Terms or any law; (c) any safety, driving, or health decision you make in connection with the App; or (d) your violation of the rights of any third party.',
      ],
    },
    {
      heading: '12. New Jersey Consumers — Your Rights Preserved',
      paragraphs: [
        'The following applies to consumers who are residents of the State of New Jersey, and is intended to comply with the New Jersey Truth-in-Consumer Contract, Warranty and Notice Act ("TCCWNA," N.J.S.A. 56:12-14 et seq., enacted in 1981). Under N.J.S.A. 56:12-17, a violator is "liable to the aggrieved consumer for a civil penalty of not less than $100.00 or for actual damages, or both at the election of the consumer, together with reasonable attorney\'s fees and court costs." In addition, N.J.S.A. 56:12-16 provides that "No consumer contract, notice or sign shall state that any of its provisions is or may be void, unenforceable or inapplicable in some jurisdictions without specifying which provisions are or are not void, unenforceable or inapplicable within the State of New Jersey." Accordingly:',
        '(a) Nothing in these Terms limits or waives any right or remedy that may not lawfully be limited or waived under New Jersey law. Specifically, the warranty disclaimers (Section 9), limitation of liability (Section 10), and indemnification (Section 11) provisions do not apply to a New Jersey consumer to the extent they would limit or exclude liability for: (i) personal injury or property damage caused by our own negligence; (ii) our own intentional, willful, reckless, or grossly negligent conduct, or fraud; (iii) any matter that may not be limited under the New Jersey Consumer Fraud Act, Products Liability Act, Punitive Damages Act, or Uniform Commercial Code; or (iv) any other liability or right that may not be limited or excluded under New Jersey law.',
        '(b) To the extent any provision of these Terms would otherwise be void, unenforceable, or inapplicable as to a New Jersey consumer, that provision is void or inapplicable only as to that consumer and only to that extent within the State of New Jersey, while all remaining provisions remain in full force and effect. Nothing in these Terms is intended to, and nothing shall, limit any rights a New Jersey consumer has under the TCCWNA, the New Jersey Consumer Fraud Act, or any other applicable New Jersey law.',
      ],
    },
    {
      heading: '13. Governing Law',
      paragraphs: [
        'These Terms are governed by the laws of the State of New Jersey, without regard to its conflict-of-laws rules, and by applicable U.S. federal law.',
      ],
    },
    {
      heading: '14. Dispute Resolution',
      paragraphs: [
        'We hope to resolve any concern informally first; please contact us at {{contactEmail}} before filing any claim, and we will try in good faith to resolve it. Except where prohibited by applicable law, you and we agree that the state and federal courts located in New Jersey will have exclusive jurisdiction and venue over any dispute not resolved informally, and you consent to personal jurisdiction there. Nothing in this section prevents either party from seeking relief in a small claims court for qualifying claims. This section does not deprive any consumer of protections that cannot be waived under the law of their home jurisdiction.',
      ],
    },
    {
      heading: '15. Modifications to the Terms',
      paragraphs: [
        'We may update these Terms from time to time. When we do, we will revise the Effective Date and make the updated Terms available in the App and/or at {{websiteUrl}}. Material changes will be presented more prominently where practicable. Your continued use of Buzzed after changes take effect constitutes acceptance of the revised Terms.',
      ],
    },
    {
      heading: '16. Termination',
      paragraphs: [
        'You may stop using Buzzed and delete it at any time. We may suspend or terminate your license to use the App if you violate these Terms or if we discontinue the App. Sections that by their nature should survive termination (including Sections 3, 8, 9, 10, 11, 12, 13, and 17) will survive.',
      ],
    },
    {
      heading: '17. Severability; Waiver; Entire Agreement',
      paragraphs: [
        'If any provision of these Terms is held invalid or unenforceable, that provision will be enforced to the maximum extent permissible and the remaining provisions will remain in full force and effect (subject to Section 12 for New Jersey consumers). Our failure to enforce any provision is not a waiver. These Terms, together with the EULA, Privacy Policy, and Alcohol & Health Disclaimer, are the entire agreement between you and us regarding Buzzed and supersede all prior understandings.',
      ],
    },
    {
      heading: '18. Apple and Google Provisions',
      paragraphs: [
        "Your use of Buzzed is also subject to the applicable app store terms. The platform-specific provisions in the EULA (including Apple's required terms and the acknowledgment that Apple and its subsidiaries are third-party beneficiaries) are incorporated into these Terms.",
      ],
    },
    {
      heading: '19. Contact',
      paragraphs: ['{{developerName}}, {{mailingAddress}}, Email: {{contactEmail}}.'],
    },
  ],
};

// ---------------------------------------------------------------------------
// 3. END USER LICENSE AGREEMENT (EULA)
// ---------------------------------------------------------------------------
const EULA: LegalDocument = {
  key: 'eula',
  title: 'End User License Agreement',
  shortTitle: 'End User License Agreement (EULA)',
  subtitle: 'Effective Date: {{effectiveDate}}',
  sections: [
    {
      paragraphs: [
        'This End User License Agreement ("EULA") is a binding agreement between you and {{developerName}}, a New Jersey sole proprietorship (the "Developer," "we," "us," or "our"), for the Buzzed mobile application and all related content and updates (the "Licensed Application"). This EULA is between you and the Developer only, and not with Apple Inc. ("Apple") or Google LLC ("Google"). The Developer, not Apple or Google, is solely responsible for the Licensed Application and its content. By downloading or using Buzzed, you agree to this EULA.',
      ],
    },
    {
      heading: '1. License Grant',
      paragraphs: [
        'Subject to your compliance with this EULA, the Developer grants you a limited, non-exclusive, non-transferable, non-sublicensable, revocable license to download and use one copy of the Licensed Application for your personal, non-commercial use on any Apple-branded or Android device that you own or control, as permitted by the Usage Rules of the applicable app store. On Apple devices, the Licensed Application may also be accessed by other accounts associated with you via Family Sharing or volume purchasing where applicable.',
      ],
    },
    {
      heading: '2. License Restrictions',
      paragraphs: [
        'You may not, and may not permit anyone else to: (a) copy (except as expressly permitted), modify, adapt, translate, or create derivative works of the Licensed Application; (b) reverse engineer, decompile, disassemble, or attempt to derive the source code, except to the extent this restriction is prohibited by applicable law; (c) rent, lease, lend, sell, redistribute, sublicense, or transfer the Licensed Application; (d) remove or alter any proprietary notices; or (e) use the Licensed Application to violate any law or third-party right. If you sell or transfer your device, you must remove the Licensed Application first.',
      ],
    },
    {
      heading: '3. Intellectual Property Ownership',
      paragraphs: [
        'The Licensed Application is licensed, not sold, to you. The Developer retains all right, title, and interest in and to the Licensed Application, including all copyrights, trademarks, trade secrets, the preloaded drink library, and other intellectual property. All rights not expressly granted are reserved by the Developer.',
      ],
    },
    {
      heading: '4. Alcohol-Specific Disclaimers',
      paragraphs: [
        'You acknowledge and agree that:',
        '• The impairment levels displayed by Buzzed (from "Sober" through "Danger") are qualitative, general estimates based solely on the standard drink units you log and the time elapsed. They are NOT medical measurements, clinical assessments, or determinations of actual impairment or intoxication.',
        '• Buzzed does NOT calculate Blood Alcohol Content (BAC) and does not account for individual factors such as body weight, biological sex, metabolism, food, medications, health conditions, tolerance, hydration, or sleep.',
        '• You must NEVER rely on Buzzed to determine fitness or safety to drive, operate machinery, or make any safety or health decision.',
        '• You assume all risk arising from alcohol consumption and from any use of the Licensed Application.',
      ],
    },
    {
      heading: '5. Consent to Use of Technical Data',
      paragraphs: [
        'As of the Effective Date, Buzzed stores all data locally on your device and does not collect or transmit data to us. If, in the future, the Licensed Application collects technical data (for example, crash logs or non-personal diagnostics), you agree that the Developer may collect and use such technical information, in a form that does not personally identify you, to provide updates, support, and improvements, consistent with the Privacy Policy and applicable law.',
      ],
    },
    {
      heading: '6. Maintenance and Support',
      paragraphs: [
        'The Developer is solely responsible for providing any maintenance and support for the Licensed Application, to the extent (if any) specified in this EULA or required by law. You may request support at {{contactEmail}}. You and the Developer acknowledge that Apple and Google have no obligation whatsoever to furnish any maintenance or support services for the Licensed Application.',
      ],
    },
    {
      heading: '7. Warranty Disclaimer',
      emphasis: true,
      paragraphs: [
        'TO THE FULLEST EXTENT PERMITTED BY LAW, THE LICENSED APPLICATION IS PROVIDED "AS IS" AND "AS AVAILABLE," WITHOUT WARRANTY OF ANY KIND, AND THE DEVELOPER DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, INCLUDING MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. In the event of any failure of the Licensed Application to conform to any applicable warranty, you may notify Apple, and (for App Store purchases) Apple may refund the purchase price, if any, to you. To the maximum extent permitted by applicable law, Apple will have no other warranty obligation whatsoever with respect to the Licensed Application. Any remaining warranty claims are the sole responsibility of the Developer. The New Jersey consumer provisions in the Terms of Service apply to this EULA as well.',
      ],
    },
    {
      heading: '8. Limitation of Liability',
      emphasis: true,
      paragraphs: [
        'TO THE FULLEST EXTENT PERMITTED BY LAW, THE DEVELOPER WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR PERSONAL INJURY, PROPERTY DAMAGE, OR DEATH, ARISING OUT OF YOUR USE OF OR INABILITY TO USE THE LICENSED APPLICATION, INCLUDING ANY DECISION MADE BASED ON ITS OUTPUT. THE DEVELOPER\'S TOTAL LIABILITY WILL NOT EXCEED THE GREATER OF THE AMOUNT YOU PAID FOR THE APP OR TEN U.S. DOLLARS ($10.00). This limitation does not apply to the extent prohibited by applicable law, including as described in the New Jersey consumer provisions of the Terms of Service.',
      ],
    },
    {
      heading: '9. Product Claims',
      paragraphs: [
        'You and the Developer acknowledge that the Developer, not Apple or Google, is responsible for addressing any claims by you or any third party relating to the Licensed Application or your possession and/or use of it, including: (a) product liability claims; (b) any claim that the Licensed Application fails to conform to any applicable legal or regulatory requirement; and (c) claims arising under consumer protection, privacy, or similar legislation. This EULA does not limit the Developer\'s liability beyond what applicable law permits.',
      ],
    },
    {
      heading: '10. Intellectual Property Claims',
      paragraphs: [
        'You and the Developer acknowledge that, in the event of any third-party claim that the Licensed Application or your possession and use of it infringes that third party\'s intellectual property rights, the Developer, not Apple or Google, will be solely responsible for the investigation, defense, settlement, and discharge of any such claim.',
      ],
    },
    {
      heading: '11. Legal Compliance (Export and Sanctions)',
      paragraphs: [
        'You represent and warrant that (a) you are not located in a country that is subject to a U.S. Government embargo or designated as a "terrorist supporting" country; and (b) you are not listed on any U.S. Government list of prohibited or restricted parties.',
      ],
    },
    {
      heading: '12. Third-Party Terms',
      paragraphs: [
        'You agree to comply with applicable third-party terms when using the Licensed Application (for example, your wireless data plan terms).',
      ],
    },
    {
      heading: '13. Termination',
      paragraphs: [
        'This EULA is effective until terminated. Your rights terminate automatically, without notice, if you fail to comply with any term. Upon termination, you must stop all use of the Licensed Application and destroy all copies. Sections 3, 4, 7, 8, 9, 10, and 15 survive termination.',
      ],
    },
    {
      heading: '14. Apple and Google as Third-Party Beneficiaries',
      paragraphs: [
        "You and the Developer acknowledge and agree that Apple, and Apple's subsidiaries, are third-party beneficiaries of this EULA, and that upon your acceptance, Apple will have the right (and will be deemed to have accepted the right) to enforce this EULA against you as a third-party beneficiary. Where Buzzed is obtained through Google Play, Google and its affiliates are likewise intended beneficiaries to the extent applicable under Google's Developer Distribution Agreement.",
      ],
    },
    {
      heading: '15. Governing Law',
      paragraphs: [
        'This EULA is governed by the laws of the State of New Jersey, without regard to its conflict-of-laws rules, except as required by the Usage Rules of the applicable app store or by applicable law. The New Jersey consumer provisions in the Terms of Service apply to this EULA.',
      ],
    },
    {
      heading: '16. Developer Name, Address, and Contact',
      paragraphs: [
        '{{developerName}}',
        '{{mailingAddress}}',
        'Email: {{contactEmail}}',
        'Any questions, complaints, or claims regarding the Licensed Application should be directed to the contact above.',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// 4b. ALCOHOL & HEALTH DISCLAIMER — full version.
// ---------------------------------------------------------------------------
const DISCLAIMER: LegalDocument = {
  key: 'disclaimer',
  title: 'Alcohol & Health Disclaimer',
  shortTitle: 'Alcohol & Health Disclaimer',
  sections: [
    {
      paragraphs: ['Please read this carefully before using Buzzed.'],
    },
    {
      heading: 'An awareness tool only.',
      paragraphs: [
        'Buzzed is designed to help you track the standard drinks you log and to build general awareness of your drinking. It is an informational and self-tracking tool — nothing more. It is not a medical device, a safety device, or a scientific instrument.',
      ],
    },
    {
      heading: 'Impairment levels are estimates, not measurements.',
      paragraphs: [
        'The impairment labels shown in Buzzed (from "Sober" through "Danger") are general, qualitative estimates based only on the number of standard drink units you log and the time that has passed. They are NOT medical measurements and do not reflect your actual level of impairment or intoxication. (In the United States, a "standard drink" is any drink containing about 0.6 fluid ounces, or 14 grams, of pure alcohol, per the NIAAA and CDC; actual servings often contain more than one standard drink.)',
      ],
    },
    {
      heading: 'Buzzed does NOT calculate Blood Alcohol Content (BAC).',
      paragraphs: [
        'Buzzed does not measure or estimate your BAC and does not use your body weight, biological sex, or other physiology. The only reliable way to determine BAC is an approved breath, blood, or laboratory test.',
      ],
    },
    {
      heading: 'Never use Buzzed for safety decisions.',
      paragraphs: [
        "NEVER use Buzzed to determine whether you are fit or safe to drive a vehicle, operate machinery, or make any other safety-related decision. The only safe option after drinking is to not drive or operate machinery. If you've been drinking, arrange a sober ride, a taxi, or a rideshare.",
      ],
    },
    {
      heading: 'Everyone is different.',
      paragraphs: [
        'Your actual impairment depends on many individual factors Buzzed cannot know or account for, including body weight, metabolism, food intake, medications, drugs, health conditions, tolerance, hydration, and sleep — as well as the accuracy of what you log. Two people who log the same drinks can be affected very differently.',
      ],
    },
    {
      heading: 'Consult a professional.',
      paragraphs: [
        'Buzzed does not provide medical advice. Consult a qualified medical professional for any health-related decision or question about your alcohol use.',
      ],
    },
    {
      heading: 'Get help if you need it.',
      paragraphs: [
        "If you or someone you know is struggling with alcohol use, help is available. SAMHSA's National Helpline, 1-800-662-HELP (4357) (also known as the Treatment Referral Routing Service), or TTY: 1-800-487-4889, is a confidential, free, 24-hour-a-day, 365-day-a-year information service, in English and Spanish, for individuals and family members facing mental and/or substance use disorders. This service provides referrals to local treatment facilities, support groups, and community-based organizations. Learn more at https://www.samhsa.gov. In an emergency, call 911 (or your local emergency number).",
      ],
    },
    {
      heading: 'No liability.',
      paragraphs: [
        '{{developerName}} assumes no liability for any decision made or action taken based on Buzzed\'s output, to the fullest extent permitted by law.',
      ],
    },
    {
      heading: 'Your acknowledgement.',
      paragraphs: [
        'By continuing to use Buzzed, you acknowledge that you have read, understood, and accepted these limitations, and that you use the App at your own risk.',
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------
export const LEGAL_DOC_ORDER: readonly LegalDocKey[] = [
  'privacy',
  'terms',
  'eula',
  'disclaimer',
];

export const LEGAL_DOCUMENTS: Record<LegalDocKey, LegalDocument> = {
  privacy: PRIVACY,
  terms: TERMS,
  eula: EULA,
  disclaimer: DISCLAIMER,
};

// ---------------------------------------------------------------------------
// 5. AGE GATE copy.
// ---------------------------------------------------------------------------
export const AGE_GATE = {
  title: 'Are you of legal drinking age?',
  body:
    'Buzzed is intended only for adults who are of legal drinking age in their ' +
    'location (at least 21 years old in the United States). Buzzed is an ' +
    'alcohol-tracking awareness tool and is not intended for anyone under the ' +
    'legal drinking age.',
  consent:
    'By tapping "I am of legal drinking age," you confirm that you are at least ' +
    '21 years old (or the legal drinking age where you live) and that you agree ' +
    'to the Buzzed Terms of Service, End User License Agreement, and Privacy ' +
    'Policy, and that you have read the Alcohol & Health Disclaimer.',
  acceptLabel: 'I am of legal drinking age — Enter',
  declineLabel: 'I am not',
  declinedMessage:
    'You must be of legal drinking age to use Buzzed. If you are not of legal ' +
    'drinking age, please do not use this app.',
} as const;
