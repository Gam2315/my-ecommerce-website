"use client";

export default function BrandsSection() {
  const brands = [
    {
      id: 1,
      name: "International Mega Standard",
      logo: (
        <svg viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 text-[#333]">
          <rect x="10" y="10" width="140" height="30" rx="15" stroke="currentColor" strokeWidth="2.5"/>
          <ellipse cx="80" cy="25" rx="60" ry="15" stroke="currentColor" strokeWidth="2"/>
          <line x1="80" y1="10" x2="80" y2="40" stroke="currentColor" strokeWidth="2"/>
          <line x1="40" y1="10" x2="40" y2="40" stroke="currentColor" strokeWidth="2"/>
          <line x1="120" y1="10" x2="120" y2="40" stroke="currentColor" strokeWidth="2"/>
          <line x1="10" y1="25" x2="150" y2="25" stroke="currentColor" strokeWidth="2"/>
          <text x="80" y="21" fontSize="5" fontWeight="bold" textAnchor="middle" fill="currentColor">INTERNATIONAL</text>
          <text x="80" y="28" fontSize="6" fontWeight="900" textAnchor="middle" fill="currentColor">MEGA</text>
          <text x="80" y="34" fontSize="5" fontWeight="bold" textAnchor="middle" fill="currentColor">STANDARD</text>
        </svg>
      ),
    },
    {
      id: 2,
      name: "Logoipsum 1",
      logo: (
        <svg viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-8 text-[#333]">
          <path d="M40 15H25V35H40C45.5 35 50 30.5 50 25C50 19.5 45.5 15 40 15Z" stroke="currentColor" strokeWidth="4"/>
          <circle cx="35" cy="25" r="4" fill="currentColor"/>
          <text x="55" y="32" fontSize="20" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">logoipsum</text>
        </svg>
      ),
    },
    {
      id: 3,
      name: "Logoipsum 2",
      logo: (
        <svg viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 text-[#333]">
          <circle cx="30" cy="25" r="14" stroke="currentColor" strokeWidth="2"/>
          <ellipse cx="30" cy="25" rx="6" ry="14" stroke="currentColor" strokeWidth="2"/>
          <line x1="16" y1="25" x2="44" y2="25" stroke="currentColor" strokeWidth="2"/>
          <line x1="30" y1="11" x2="30" y2="39" stroke="currentColor" strokeWidth="2"/>
          <text x="50" y="28" fontSize="18" fontWeight="bold" fill="currentColor" fontFamily="sans-serif">logo</text>
          <text x="50" y="38" fontSize="12" fill="currentColor" fontFamily="sans-serif">ipsum</text>
        </svg>
      ),
    },
    {
      id: 4,
      name: "N Logo",
      logo: (
        <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-10 text-[#333]">
          <path d="M25 10L50 40H70V10H55V30L30 5H10V40H25V10Z" fill="currentColor"/>
        </svg>
      ),
    },
    {
      id: 5,
      name: "Logoipsum 3",
      logo: (
        <svg viewBox="0 0 160 50" fill="none" xmlns="http://www.w3.org/2000/svg" className="h-6 text-[#888]">
          <text x="80" y="35" fontSize="24" fontWeight="900" textAnchor="middle" fill="none" stroke="currentColor" strokeWidth="1" letterSpacing="2">LOGOIPSUM</text>
        </svg>
      ),
    }
  ];

  return (
    <section className="py-12 bg-white pb-24">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap justify-center gap-6 md:gap-0 md:justify-between items-center">
          {brands.map((brand) => (
            <div 
              key={brand.id} 
              className="flex items-center justify-center border border-gray-100 hover:border-gray-200 transition-colors w-full sm:w-[45%] md:w-[18%] h-24"
            >
              {brand.logo}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
