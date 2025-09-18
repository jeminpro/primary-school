import { Outlet } from "react-router";
import { BookOpen } from "lucide-react";

export default function SpellingsLayout() {
  // Background SVGs
  const bottomIllustration = `url('data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="799.403" height="441.595" viewBox="0 0 799.403 441.595" xmlns:xlink="http://www.w3.org/1999/xlink" opacity="0.85" role="img" artist="Katerina Limpitsouni" source="https://undraw.co/"><g transform="translate(-864.885 -546.821)"><g transform="translate(1484.002 636.904)"><path d="M426.536,420.89a.845.845,0,0,1-.6-.248l-40.791-40.763a.847.847,0,1,1,1.2-1.2l40.791,40.763a.847.847,0,0,1-.6,1.446Z" transform="translate(-294.63 -280.644)" fill="#d6d6e3"/><path d="M218.052,303.8c0-49.785,40.358-167.923,90.143-167.923S398.339,254.019,398.339,303.8a90.143,90.143,0,1,1-180.286,0Z" transform="translate(-218.052 -135.882)" fill="#f2f2f2"/><path d="M339.407,549.284a.741.741,0,0,1-.741-.741V237.757a.741.741,0,0,1,1.482,0V548.543A.741.741,0,0,1,339.407,549.284Z" transform="translate(-249.265 -230.507)" fill="#d6d6e3"/><path d="M326.951,305.988a.739.739,0,0,1-.524-.217l-35.679-35.679a.741.741,0,1,1,1.048-1.048l35.678,35.679a.741.741,0,0,1-.524,1.265Z" transform="translate(-236.809 -170.285)" fill="#d6d6e3"/><path d="M339.407,380.915a.741.741,0,0,1-.524-1.265l59.75-59.751a.741.741,0,1,1,1.048,1.048L339.931,380.7a.739.739,0,0,1-.524.217Z" transform="translate(-249.265 -183.442)" fill="#d6d6e3"/></g><g transform="translate(864.885 546.821)"><path d="M218.052,353.275c0-64.452,52.249-217.394,116.7-217.394s116.7,152.942,116.7,217.394a116.7,116.7,0,1,1-233.4,0Z" transform="translate(-218.052 -135.882)" fill="#f2f2f2"/><path d="M339.626,641.281a.96.96,0,0,1-.96-.96V237.975a.96.96,0,0,1,1.919,0V640.321A.96.96,0,0,1,339.626,641.281Z" transform="translate(-222.925 -228.588)" fill="#d6d6e3"/><path d="M337.681,316.936a.956.956,0,0,1-.678-.281l-46.19-46.19a.96.96,0,1,1,1.357-1.357l46.19,46.19a.96.96,0,0,1-.679,1.638Z" transform="translate(-220.981 -141.252)" fill="#d6d6e3"/><path d="M339.626,398.954a.96.96,0,0,1-.679-1.638L416.3,319.962a.96.96,0,0,1,1.357,1.357L340.3,398.673A.957.957,0,0,1,339.626,398.954Z" transform="translate(-222.925 -143.307)" fill="#d6d6e3"/></g><path d="M964.46,660.877H237.926c-.54,0-.978-.858-.978-1.917s.438-1.916.978-1.916H964.46c.54,0,.978.858.978,1.916S965,660.877,964.46,660.877Z" transform="translate(644.968 298.636)" fill="#e6e6e6"/></g></svg>
  `)}')`;

  const topIllustration = `url('data:image/svg+xml;utf8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="200" height="120" viewBox="0 0 200 120" opacity="0.15">
      <g transform="translate(20,10)">
        <path d="M10,10 h120 v20 h-120 z" fill="#6c63ff"/>
        <path d="M20,15 h100 v10 h-100 z" fill="#fff"/>
        <g transform="translate(40,40)">
          <circle cx="10" cy="10" r="8" fill="#6c63ff"/>
          <path d="M25,10 h40" stroke="#6c63ff" stroke-width="2"/>
          <circle cx="10" cy="30" r="8" fill="#6c63ff"/>
          <path d="M25,30 h40" stroke="#6c63ff" stroke-width="2"/>
          <circle cx="10" cy="50" r="8" fill="#6c63ff"/>
          <path d="M25,50 h40" stroke="#6c63ff" stroke-width="2"/>
        </g>
      </g>
    </svg>
  `)}')`;

  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: '#fdf6e3',
        backgroundImage: `${topIllustration}, ${bottomIllustration}`,
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundPosition: 'top left, bottom right',
        backgroundSize: '300px auto, contain'
      }}
    >
      <div className="max-w-3xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-extrabold mb-6 text-center text-primary flex items-center justify-center gap-3">
          <span className="flex items-center"><BookOpen size={32} /></span>
          <span className="flex items-center">Spellings</span>
        </h1>
        <Outlet />
      </div>
    </div>
  );
}