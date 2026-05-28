import { useEffect, useState } from 'react';

export default function Splash() {
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setGone(true), 600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={`splash${gone ? ' gone' : ''}`}>
      <div className="logo">B<em>B</em>B</div>
      <div>ESTABLISHING SECURE UPLINK</div>
    </div>
  );
}
