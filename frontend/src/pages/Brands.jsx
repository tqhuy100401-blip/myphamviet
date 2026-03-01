import React from "react";

const BRANDS = [
  { name: "Maybelline", logo: "/brands/maybelline.svg" },
  { name: "L'Oreal", logo: "/brands/loreal.svg" },
  { name: "Innisfree", logo: "/brands/innisfree.svg" },
  { name: "The Face Shop", logo: "/brands/thefaceshop.svg" },
  { name: "La Roche-Posay", logo: "/brands/larocheposay.svg" },
  { name: "Vichy", logo: "/brands/vichy.svg" }
];

export default function Brands() {
  return (
    <div className="container mt-4">
      <h2 className="mb-4">🏷️ Thương hiệu nổi bật</h2>
      <div className="row g-4">
        {BRANDS.map((b, idx) => (
          <div className="col-6 col-md-4 col-lg-2 d-flex flex-column align-items-center" key={idx}>
            <div style={{background:'#f8f9ff',borderRadius:12,boxShadow:'0 1px 6px rgba(33,140,84,0.06)',padding:16,marginBottom:10,width:64,height:64,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <img src={b.logo} alt={b.name} style={{maxWidth:44,maxHeight:44,objectFit:'contain'}} />
            </div>
            <span style={{fontWeight:700,fontSize:15}}>{b.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
