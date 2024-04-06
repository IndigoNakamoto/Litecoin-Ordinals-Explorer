import React from 'react';
import Markdown from 'markdown-to-jsx';

const markdownContent = `

# Privacy Policy

This Privacy Policy ("Policy") applies to [www.OrdLite.io](https://www.OrdLite.io), and OrdLite.io ("Company") and governs data collection and usage. For the purposes of this Privacy Policy, unless otherwise noted, all references to the Company include [www.OrdLite.io](https://www.OrdLite.io). The Company's website is a platform for users to explore and interact with Ordinals inscribed on the Litecoin blockchain. By using the Company website, you consent to the data practices described in this statement.

## Collection of your Personal Information

We do not collect any personal information about you unless you voluntarily provide it to us. However, you may be required to provide certain personal information to us when you elect to use certain products or services. These may include:
- Registering for an account
- Entering a sweepstakes or contest sponsored by us or one of our partners
- Signing up for special offers from selected third parties
- Sending us an email message
- Submitting your credit card or other payment information when ordering and purchasing products and services.

To wit, we will use your information for, but not limited to, communicating with you in relation to services and/or products you have requested from us. We also may gather additional personal or non-personal information in the future.

## Sharing Information with Third Parties

The Company does not sell, rent, or lease its customer lists to third parties.

The Company may share data with trusted partners to help perform statistical analysis, send you email or postal mail, provide customer support, or arrange for deliveries. All such third parties are prohibited from using your personal information except to provide these services to the Company, and they are required to maintain the confidentiality of your information.

The Company may disclose your personal information, without notice, if required to do so by law or in the good faith belief that such action is necessary to:
- Conform to the edicts of the law or comply with legal process served on the Company or the site
- Protect and defend the rights or property of the Company
- Act under exigent circumstances to protect the personal safety of users of the Company, or the public.

## Automatically Collected Information

The Company may automatically collect information about your computer hardware and software. This information can include your IP address, browser type, domain names, access times, and referring website addresses. This information is used for the operation of the service, to maintain quality of the service, and to provide general statistics regarding the use of the Company's website.

## Use of Cookies

The Company's website may use "cookies" to help you personalize your online experience. A cookie is a text file that is placed on your hard disk by a web page server. Cookies cannot be used to run programs or deliver viruses to your computer. Cookies are uniquely assigned to you, and can only be read by a web server in the domain that issued the cookie to you.

One of the primary purposes of cookies is to provide a convenience feature to save you time. The purpose of a cookie is to tell the web server that you have returned to a specific page. For example, if you personalize the Company's pages, or register with Company's site or services, a cookie helps the Company to recall your specific information on subsequent visits. This simplifies the process of recording your personal information, such as billing addresses, shipping addresses, and so on. When you return to the same website, the information you previously provided can be retrieved, so you can easily use the Company's features that you customized.

You have the ability to accept or decline cookies. Most web browsers automatically accept cookies, but you can usually modify your browser settings to decline cookies if you prefer. If you choose to decline cookies, you may not be able to fully experience the interactive features of the Company's services or websites you visit.

## Links

This website contains links to other sites. Please be aware that we are not responsible for the content or privacy practices of such other sites. We encourage our users to be aware when they leave our site and to read the privacy statements of any other site that collects personally identifiable information.

## Security of your Personal Information

The Company secures your personal information from unauthorized access, use, or disclosure. The Company uses the following methods for this purpose:
- SSL Protocol

When personal information (such as a credit card number) is transmitted to other websites, it is protected through the use of encryption, such as the Secure Sockets Layer (SSL) protocol.

We strive to take appropriate security measures to protect against unauthorized access to or alteration of your personal information. Unfortunately, no data transmission over the Internet or any wireless network can be guaranteed to be 100% secure. As a result, while we strive to protect your personal information, you acknowledge that:
- There are security and privacy limitations inherent to the Internet that are beyond our control
- The security, integrity, and privacy of any and all information and data exchanged between you and us through this site cannot be guaranteed.

## Right to Deletion

Subject to certain exceptions set out below, on receipt of a verifiable request from you, we will:
- Delete your personal information from our records
- Direct any service providers to delete your personal information from their records.

Please note that we may not be able to comply with requests to delete your personal information if it is necessary to:
- Complete the transaction for which the personal information was collected, fulfill the terms of a written warranty or product recall conducted in accordance with federal law, and provide a good or service requested by you, or reasonably anticipated within the context of our ongoing business relationship with you, or otherwise perform a contract between you and us
- Detect security incidents, protect against malicious, deceptive, fraudulent, or illegal activity; or prosecute those responsible for that activity
- Debug to identify and repair errors that impair existing intended functionality
- Exercise free speech, ensure the right of another consumer to exercise his or her right of free speech, or exercise another right provided for by law
- Comply with the California Electronic Communications Privacy Act
- Engage in public or peer-reviewed scientific, historical, or statistical research in the public interest that adheres to all other applicable ethics and privacy laws, when our deletion of the information is likely to render impossible or seriously impair the achievement of such research, provided we have obtained your informed consent
- Enable solely internal uses that are reasonably aligned with your expectations based on your relationship with us
- Comply with an existing legal obligation
- Otherwise use your personal information, internally, in a lawful manner that is compatible with the context in which you provided the information.

## Children Under Thirteen

The Company does not knowingly collect personally identifiable information from children under the age of 13. If you are under the age of 13, you must ask your parent or guardian for permission to use this website.

## Changes to This Statement

The Company reserves the right to change this Policy from time to time. For example, when there are changes in our services, changes in our data protection practices, or changes in the law. When changes to this Policy are significant, we will inform you. You may receive a notice by sending an email to the primary email address specified in your account, by placing a prominent notice on our OrdLite.io, and/or by updating any privacy information. Your continued use of the website and/or services available after such modifications will constitute your:
- Acknowledgment of the modified Policy
- Agreement to abide and be bound by that Policy.

## Contact Information

The Company welcomes your questions or comments regarding this Policy. If you believe that the Company has not adhered to this Policy, please contact the Company at:

[OrdLite.io](https://www.x.com/ordlite)

Effective as of April 01, 2024

`;

const Privacy = () => {


    return (
        <div className="max-w-screen-3xl mx-auto px-4 py-8 bg-gray-200 text-black">
            <Markdown options={{
                overrides: {
                    h1: {
                        component: 'h1',
                        props: {
                            className: 'text-4xl font-bold text-center text-gray-900 mb-6'
                        }
                    },
                    h2: {
                        component: 'h2',
                        props: {
                            className: 'text-3xl font-semibold text-gray-800 mb-4'
                        }
                    },
                    h3: {
                        component: 'h3',
                        props: {
                            className: 'text-xl font-semibold text-gray-800 mb-3'
                        }
                    },
                    p: {
                        component: 'p',
                        props: {
                            className: 'text-base text-gray-800 leading-relaxed mb-4'
                        }
                    },
                    li: {
                        component: 'li',
                        props: {
                            className: 'text-gray-800 mb-2'
                        }
                    },
                    a: {
                        component: 'a',
                        props: {
                            className: 'text-blue-600 hover:text-blue-700 transition-colors'
                        }
                    },
                    ul: {
                        component: 'ul',
                        props: {
                            className: 'text-gray-800 list-disc list-inside mb-4'
                        }
                    }
                }
            }} className='max-w-screen-2xl mx-auto'>{markdownContent}</Markdown>
        </div>
    );
};

export default Privacy;