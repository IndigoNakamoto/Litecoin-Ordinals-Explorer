
import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  inscriptionNumber?: string; // Add this prop for dynamic meta titles
}

const InscriptionLayout: React.FC<LayoutProps> = ({ children, inscriptionNumber }) => {
  return (
    <>
      <article className="mx-auto p-4 max-w-[700px] pb-16">
        {children}
      </article>
    </>
  );
};

export default InscriptionLayout;


// import type { Metadata, ResolvingMetadata } from 'next'
 
// type Props = {
//   params: { id: string }
//   searchParams: { [key: string]: string | string[] | undefined }
//   inscriptionNumber:
// }
 
// export async function generateMetadata(
//   { params, searchParams }: Props,
//   parent: ResolvingMetadata
// ): Promise<Metadata> {
//   // read route params
//   const id = params.id
 
//   // fetch data
//   const product = await fetch(`https://.../${id}`).then((res) => res.json())
 
//   // optionally access and extend (rather than replace) parent metadata
//   const previousImages = (await parent).openGraph?.images || []
 
//   return {
//     title: product.title,
//     openGraph: {
//       images: ['/some-specific-page-image.jpg', ...previousImages],
//     },
//   }
// }
 
// export default function Page({ params, searchParams }: Props) {}