import React from "react";
import LegalPageLayout from "./LegalPageLayout";

const API_HOST = import.meta.env.VITE_API_HOST;

export default function CancellationRefunds() {
  return (
    <LegalPageLayout title="Cancellation & Refunds">
      <p className="text-gray-600 mb-6 text-center">
        Effective Date: 09/09/2026
        <br />
        Last Updated: 09/09/2025
      </p>

      <p className="mb-6">
        This Cancellation & Refund Policy outlines the terms and conditions for
        canceling orders and requesting refunds on the MachMate platform. Please
        read this policy carefully before using our services.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        1. Subscription Cancellations
      </h2>
      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        Vendor Subscriptions:
      </h3>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">
          Vendor subscription plans are billed on a recurring basis (monthly,
          quarterly, or annually).
        </li>
        <li className="mb-2">
          You may cancel your subscription at any time through your account
          settings.
        </li>
        <li className="mb-2">
          Cancellation will take effect at the end of the current billing cycle.
        </li>
        <li className="mb-2">
          No prorated refunds are provided for partial subscription periods.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        Automatic Renewal:
      </h3>
      <p className="mb-6">
        Subscriptions automatically renew until canceled. You will be notified
        via email before each renewal payment is processed.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        2. Project Cancellations
      </h2>
      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        Before Quotation Acceptance:
      </h3>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">
          Customers may cancel a project posting at any time before accepting a
          quotation without penalty.
        </li>
        <li className="mb-2">
          Vendors may withdraw quotations at any time before acceptance by the
          customer.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        After Quotation Acceptance:
      </h3>
      <p className="mb-4">
        Once a quotation is accepted and payment is processed, cancellation
        terms are as follows:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          <strong>Within 24 hours of acceptance:</strong> Full refund minus
          payment processing fees
        </li>
        <li className="mb-2">
          <strong>After 24 hours but before work commences:</strong> 80% refund
        </li>
        <li className="mb-2">
          <strong>After work has commenced:</strong> Refund amount determined
          based on work completed and materials purchased
        </li>
        <li className="mb-2">
          <strong>After completion of work:</strong> No refund available
        </li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        3. Refund Process
      </h2>
      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        Eligibility:
      </h3>
      <ul className="list-disc pl-6 mb-4">
        <li className="mb-2">
          Refunds are only provided for eligible cancellations as outlined in
          this policy.
        </li>
        <li className="mb-2">
          Refunds are processed to the original payment method.
        </li>
        <li className="mb-2">
          Processing times may vary depending on your financial institution.
        </li>
      </ul>

      <h3 className="text-xl font-semibold text-gray-900 mt-6 mb-2">
        How to Request a Refund:
      </h3>
      <ol className="list-decimal pl-6 mb-6">
        <li className="mb-2">
          Submit a refund request through the platform's support system
        </li>
        <li className="mb-2">
          Provide details about the project and reason for cancellation
        </li>
        <li className="mb-2">
          Our team will review the request within 3-5 business days
        </li>
        <li className="mb-2">
          If approved, the refund will be processed within 7-10 business days
        </li>
      </ol>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        4. Non-Refundable Items
      </h2>
      <p className="mb-6">
        The following are not eligible for refunds under any circumstances:
      </p>
      <ul className="list-disc pl-6 mb-6">
        <li className="mb-2">
          Completed projects where deliverables have been accepted
        </li>
        <li className="mb-2">
          Custom-made or personalized items that have entered production
        </li>
        <li className="mb-2">Services already rendered</li>
        <li className="mb-2">
          Subscription fees for the current billing period
        </li>
        <li className="mb-2">Shipping and handling costs</li>
      </ul>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        5. Dispute Resolution
      </h2>
      <p className="mb-6">
        In case of disputes between customers and vendors regarding
        cancellations or refunds, MachMate may provide mediation services. Both
        parties agree to cooperate in good faith to resolve disputes. If
        mediation is unsuccessful, the matter may be escalated to formal dispute
        resolution procedures as outlined in our Terms & Conditions.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        6. Platform Fees
      </h2>
      <p className="mb-6">
        MachMate's platform fees are non-refundable once services have been
        rendered. This includes transaction fees and commission on completed
        projects.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        7. Changes to This Policy
      </h2>
      <p className="mb-6">
        We reserve the right to modify this Cancellation & Refund Policy at any
        time. Changes will be effective upon posting to the platform. Continued
        use of our services after changes constitute acceptance of the modified
        policy.
      </p>

      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
        8. Contact Us
      </h2>
      <p className="mb-6">
        If you have any questions about this Cancellation & Refund Policy,
        please contact us at:
        <br />
        Email: machmate.contact@gmail.com
        <br />
        Phone: +91 9104513411
      </p>
    </LegalPageLayout>
  );
}
