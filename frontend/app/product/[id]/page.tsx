import { Suspense } from 'react';
import ProductDetailClient from './ProductDetailClient';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Lade Produkt...</div>}>
      <ProductDetailClient params={params} />
    </Suspense>
  );
}
