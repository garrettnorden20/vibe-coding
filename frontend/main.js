const html = htm.bind(React.createElement);

function App() {
  const mapRef = React.useRef(null);
  const [location, setLocation] = React.useState(null);
  const [mapReady, setMapReady] = React.useState(false);

  React.useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        // Default to NYC
        setLocation([40.7128, -74.0060]);
        alert('Location access failed. Showing default map.');
      }
    );
  }, []);

  React.useEffect(() => {
    if (location && !mapReady) {
      const map = L.map('map').setView(location, 13);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
      }).addTo(map);
      mapRef.current = map;
      setMapReady(true);
    }
  }, [location, mapReady]);

  React.useEffect(() => {
    if (mapReady && location) {
      const [lat, lng] = location.map((x) => Number(x.toFixed(3)));
      fetch(`/pins?lat=${lat}&lng=${lng}`)
        .then((r) => r.json())
        .then((data) => {
          data.forEach((p) => {
            L.marker([p.lat, p.lng])
              .addTo(mapRef.current)
              .bindPopup(`${p.message}`);
          });
        })
        .catch(() => {});
    }
  }, [mapReady, location]);

  const dropPin = () => {
    if (!mapRef.current) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const msg = prompt('Enter a short message (max 200 chars):');
      if (!msg) return;
      const payload = {
        lat: Number(pos.coords.latitude.toFixed(3)),
        lng: Number(pos.coords.longitude.toFixed(3)),
        message: msg.slice(0, 200)
      };
      // Post to backend (ignored if offline)
      fetch('/pins', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
      L.marker([payload.lat, payload.lng]).addTo(mapRef.current)
        .bindPopup(`${payload.message}`);
    });
  };

  return html`
    <div>
      <button class="drop-pin" onClick=${dropPin}>Drop a Pin</button>
      <div id="map"></div>
    </div>
  `;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
