// Import React and useEffect from React
import React from 'react';

const TermsAndConditions = () => {


  return (
    <div className="max-w-4xl mx-auto px-4 py-8 bg-gray-200 text-black">
      <h1 className="text-3xl font-semibold text-center mb-4">Terms and Conditions</h1>
      <p className="text-lg mb-4">Welcome to Ordlite.io, a Litecoin block explorer service (the &quot;Service&quot;). These Terms and Conditions (&quot;Terms&quot;) govern your use of our Service and any related services provided by Ordlite.io.</p>
      <ol className="list-decimal list-inside">
        <li className="mb-4">
          <strong>Acceptance of Terms</strong><br />
          By using our Service, you agree to be bound by these Terms. If you do not agree to these Terms, please do not use our Service.
        </li>
        <li className="mb-4">
          <strong>Service Description</strong><br />
          Ordlite.io provides users with the ability to explore Litecoin blockchain data, filter and sort files uploaded by users, and upload data (&quot;Inscriptions&quot;) onto the Litecoin blockchain.
        </li>
        <li className="mb-4">
          <strong>User Responsibilities</strong><br />
          Users are responsible for the data they upload to the Service. You warrant that you have the legal right to upload the data and that the data does not infringe on any third party&apos;s rights or violate any laws.
        </li>
        <li className="mb-4">
          <strong>Data Collection and Use</strong><br />
          We collect certain data from our users to enhance the functionality of our Service: IP Address when uploading files and your connected Wallet Information. No other information is collected by our Service.
        </li>
        <li className="mb-4">
          <strong>Data Protection</strong><br />
          We are committed to protecting the privacy and security of our users&apos; information. Please refer to our Privacy Policy for detailed information on how we handle and protect your data.
        </li>
        <li className="mb-4">
          <strong>Limitation of Liability</strong><br />
          Ordlite.io will not be liable for any indirect, incidental, special, consequential, or punitive damages, resulting from your access to or use of or inability to access or use the Service.
        </li>
        <li className="mb-4">
          <strong>Changes to Terms</strong><br />
          We reserve the right, at our sole discretion, to modify or replace these Terms at any time. By continuing to access or use our Service after those revisions become effective, you agree to be bound by the revised terms.
        </li>
        <li className="mb-4">
          <strong>Governing Law</strong><br />
          These Terms shall be governed and construed in accordance with the laws of The United States, without regard to its conflict of law provisions.
        </li>
        <li>
          <strong>Contact Us</strong><br />
          If you have any questions about these Terms, please contact us at https://twitter.com/ordlite.
        </li>
      </ol>
    </div>
  );
};

export default TermsAndConditions;
