import React from 'react';
import { Helmet } from 'react-helmet-async';

export default function CanvaClone() {
  return (
    <div style={{ width: '100%', height: '100vh', margin: 0, padding: 0, overflow: 'hidden' }}>
      <Helmet>
        <title>Canva Viagem Elite (Clone HTML)</title>
      </Helmet>
      <iframe 
        src="/canva_inicio.html" 
        style={{ width: '100%', height: '100%', border: 'none' }} 
        title="Canva Viagem Elite Clone"
      />
    </div>
  );
}
