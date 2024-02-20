import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { Inscription } from '../../types'; // Ensure this path matches your project structure
import { NextPage } from 'next';

const InscriptionPage: NextPage = () => {
  const [inscription, setInscription] = useState<Inscription | null>(null);
  const router = useRouter();
  const { slug } = router.query;

  useEffect(() => {
    // Attempt to retrieve the inscription data from local storage
    const storedInscription = localStorage.getItem('currentInscription');
    if (storedInscription) {
      const localInscription: Inscription = JSON.parse(storedInscription);
      // Check if the local storage data matches the current slug
      if (localInscription.inscription_id === slug) {
        setInscription(localInscription);
      } else {
        // Handle the case where the inscription does not match the slug
        console.error('Inscription data does not match the URL parameter.');
        // Optional: Redirect to a default page or show an error message
      }
    } else {
      // Handle the case where no inscription data is found in local storage
      console.error('No inscription data found in local storage.');
      // Optional: Redirect to a default page or show an error message
    }
  }, [slug]);

  if (!inscription) {
    // Render a loading state or a message indicating that the inscription data is being loaded
    return <div>Loading inscription data...</div>;
  }

  // Render the inscription page content
  return (
    <div className="flex flex-wrap md:flex-nowrap">
      <div className="w-full md:w-1/2">
        {/* Left Half: Preview of the content */}
        <div className="p-4">
          <p>Preview Content Here...</p>
        </div>
      </div>
      
      <div className="w-full md:w-1/2">
        {/* Right Half: Inscription Details */}
        <div className="p-4">
          <h2>Inscription #{inscription.inscription_number}</h2>
          <table className="min-w-full">
            <tbody>
              <tr><td>Inscription Id</td><td>{inscription.inscription_id}</td></tr>
              <tr><td>File Type</td><td>{inscription.content_type}</td></tr>
              <tr><td>Content Size</td><td>{inscription.content_length} bytes</td></tr>
              <tr><td>Created</td><td>{new Date(inscription.timestamp).toLocaleString()}</td></tr>
              {/* Add more details as needed */}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InscriptionPage;
