import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import './PrivacyPolicy.css';

function PrivacyPolicy() {
  const navigate = useNavigate();

  return (
    <motion.div
      className="privacy-policy-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="privacy-container">
        <motion.button
          className="back-button"
          onClick={() => navigate('/')}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft size={20} />
          Back to Home
        </motion.button>

        <motion.div
          className="privacy-content"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last Updated: January 19, 2026</p>

          <section>
            <h2>1. Introduction</h2>
            <p>
              Welcome to the Meeting Agenda Builder. We are committed to protecting your privacy and ensuring
              the security of your personal information. This Privacy Policy explains how we collect, use,
              disclose, and safeguard your information when you use our application.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <h3>2.1 Information You Provide</h3>
            <p>When you use our application, you may provide:</p>
            <ul>
              <li>Meeting details (title, date, time, location)</li>
              <li>Participant information (facilitator, note taker)</li>
              <li>Meeting objectives and agenda items</li>
              <li>Uploaded documents and files</li>
            </ul>

            <h3>2.2 Automatically Collected Information</h3>
            <p>We may automatically collect:</p>
            <ul>
              <li>Browser type and version</li>
              <li>Operating system information</li>
              <li>Language preferences</li>
              <li>Usage statistics and interaction data</li>
            </ul>
          </section>

          <section>
            <h2>3. How We Use Your Information</h2>
            <p>We use the collected information to:</p>
            <ul>
              <li>Generate AI-powered meeting agendas based on your input</li>
              <li>Provide, maintain, and improve our services</li>
              <li>Personalize your experience with language preferences</li>
              <li>Analyze usage patterns to enhance functionality</li>
              <li>Respond to your requests and support needs</li>
            </ul>
          </section>

          <section>
            <h2>4. Data Storage and Security</h2>
            <p>
              Your data is stored securely using industry-standard encryption protocols. We implement
              appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction.
            </p>
            <p>
              Meeting data and uploaded files are processed through secure cloud infrastructure with
              end-to-end encryption to ensure confidentiality.
            </p>
          </section>

          <section>
            <h2>5. AI Processing</h2>
            <p>
              Our application uses artificial intelligence to generate meeting agendas. The data you
              provide may be processed by AI services to:
            </p>
            <ul>
              <li>Analyze meeting objectives and context</li>
              <li>Generate structured agenda items</li>
              <li>Extract relevant information from uploaded documents</li>
              <li>Provide intelligent suggestions and recommendations</li>
            </ul>
            <p>
              All AI processing is performed with strict privacy controls and your data is not used
              to train AI models without your explicit consent.
            </p>
          </section>

          <section>
            <h2>6. Data Sharing and Disclosure</h2>
            <p>We do not sell, trade, or rent your personal information to third parties. We may share
            information only in the following circumstances:</p>
            <ul>
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>To protect our rights and prevent fraud</li>
              <li>With service providers who assist in our operations (under strict confidentiality agreements)</li>
            </ul>
          </section>

          <section>
            <h2>7. Your Rights and Choices</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access the personal information we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Object to processing of your personal information</li>
              <li>Export your data in a portable format</li>
              <li>Withdraw consent at any time</li>
            </ul>
          </section>

          <section>
            <h2>8. Cookies and Local Storage</h2>
            <p>
              We use local storage to save your language preferences and theme settings. This information
              is stored locally on your device and is not transmitted to our servers without your action.
            </p>
          </section>

          <section>
            <h2>9. Children's Privacy</h2>
            <p>
              Our service is not intended for children under the age of 13. We do not knowingly collect
              personal information from children. If you become aware that a child has provided us with
              personal information, please contact us.
            </p>
          </section>

          <section>
            <h2>10. International Data Transfers</h2>
            <p>
              Your information may be transferred to and processed in countries other than your country
              of residence. We ensure appropriate safeguards are in place to protect your information
              in accordance with this Privacy Policy.
            </p>
          </section>

          <section>
            <h2>11. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any changes by
              posting the new Privacy Policy on this page and updating the "Last Updated" date. You are
              advised to review this Privacy Policy periodically for any changes.
            </p>
          </section>

          <section>
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our privacy practices, please contact us at:
            </p>
            <div className="contact-info">
              <p><strong>Kadosh AI</strong></p>
              <p>Email: privacy@kadoshai.com</p>
            </div>
          </section>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default PrivacyPolicy;
