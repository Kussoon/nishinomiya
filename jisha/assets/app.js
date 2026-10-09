(() => {
  "use strict";

  const sites = Array.isArray(window.NISHINOMIYA_RELIGIOUS_SITES)
    ? window.NISHINOMIYA_RELIGIOUS_SITES
    : [];
  const map = L.map("map", { zoomControl: true, preferCanvas: true });
  L.tileLayer("https://cyberjapandata.gsi.go.jp/xyz/std/{z}/{x}/{y}.png", {
    attribution: '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener">地図：国土地理院</a>',
    maxZoom: 18,
  }).addTo(map);

  const cluster = L.markerClusterGroup({
    showCoverageOnHover: false,
    maxClusterRadius: 42,
    spiderfyOnMaxZoom: true,
  });
  const markers = new Map();
  let filteredSites = [...sites];
  let currentPosition = null;
  let currentMarker = null;

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const routeUrl = (site) => `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${site.lat},${site.lon}`)}`;
  const typeClass = (site) => site.type === "神社" ? "shrine" : "temple";
  const typeSymbol = (site) => site.type === "神社" ? "神" : "寺";
  const iconFor = (site) => L.divIcon({
    className: "site-marker",
    html: `<div class="marker-badge ${typeClass(site)}"><span>${typeSymbol(site)}</span></div>`,
    iconSize: [34, 34],
    iconAnchor: [17, 32],
    popupAnchor: [0, -31],
  });
  const popupFor = (site) => {
    const extra = [site.sect, site.deity].filter(Boolean).join("／");
    return `<div class="popup">
      <h3 class="popup-title">${escapeHtml(site.name)}</h3>
      <span class="popup-type ${typeClass(site)}">${escapeHtml(site.type)}</span>
      <p class="popup-address">${escapeHtml(site.address)}</p>
      ${extra ? `<p class="popup-extra">${escapeHtml(extra)}</p>` : ""}
      <a class="popup-route" href="${routeUrl(site)}" target="_blank" rel="noopener">経路を開く</a>
    </div>`;
  };

  sites.forEach((site) => {
    const marker = L.marker([site.lat, site.lon], { icon: iconFor(site), title: site.name });
    marker.bindPopup(popupFor(site), { maxWidth: 310 });
    marker.site = site;
    markers.set(site.id, marker);
  });
  map.addLayer(cluster);

  const fitTo = (items = sites) => {
    if (!items.length) return;
    const bounds = L.latLngBounds(items.map((site) => [site.lat, site.lon]));
    map.fitBounds(bounds, { padding: [28, 28], maxZoom: 15 });
  };

  const distanceKm = (site) => {
    if (!currentPosition) return Number.POSITIVE_INFINITY;
    return map.distance([currentPosition.lat, currentPosition.lon], [site.lat, site.lon]) / 1000;
  };

  const showSite = (site) => {
    const marker = markers.get(site.id);
    if (!marker) return;
    map.setView(marker.getLatLng(), Math.max(map.getZoom(), 17), { animate: true });
    window.setTimeout(() => marker.openPopup(), 240);
    document.getElementById("mapSection").scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const render = () => {
    const query = document.getElementById("search").value.trim().toLocaleLowerCase("ja");
    const category = document.getElementById("category").value;
    const sort = document.getElementById("sort").value;
    filteredSites = sites.filter((site) => {
      const matchesText = !query || `${site.name} ${site.address} ${site.id}`.toLocaleLowerCase("ja").includes(query);
      const matchesCategory = category === "all" || site.type === category;
      return matchesText && matchesCategory;
    });
    filteredSites.sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name, "ja");
      if (sort === "distance") return distanceKm(a) - distanceKm(b);
      return a.id.localeCompare(b.id, "ja", { numeric: true });
    });

    cluster.clearLayers();
    filteredSites.forEach((site) => cluster.addLayer(markers.get(site.id)));
    document.getElementById("count").textContent = `${filteredSites.length}件`;
    const list = document.getElementById("siteList");
    list.replaceChildren();
    if (!filteredSites.length) {
      const empty = document.createElement("p");
      empty.className = "empty";
      empty.textContent = "該当する寺社はありません。";
      list.append(empty);
      return;
    }
    filteredSites.forEach((site) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "site-card";
      button.innerHTML = `<span class="site-symbol ${typeClass(site)}">${typeSymbol(site)}</span>
        <span>
          <span class="site-name">${escapeHtml(site.name)}</span>
          <span class="site-meta">${escapeHtml(site.type)}・${escapeHtml(site.id)}</span>
          <span class="site-address">${escapeHtml(site.address)}</span>
        </span>`;
      button.addEventListener("click", () => showSite(site));
      list.append(button);
    });
  };

  document.getElementById("search").addEventListener("input", render);
  document.getElementById("category").addEventListener("change", render);
  document.getElementById("sort").addEventListener("change", () => {
    if (document.getElementById("sort").value === "distance" && !currentPosition) {
      document.getElementById("locationStatus").textContent = "現在地を取得すると距離順に並べ替えられます。";
    }
    render();
  });
  document.getElementById("reset").addEventListener("click", () => {
    document.getElementById("search").value = "";
    document.getElementById("category").value = "all";
    document.getElementById("sort").value = "id";
    render();
    fitTo();
  });
  document.getElementById("fit").addEventListener("click", () => fitTo(filteredSites.length ? filteredSites : sites));
  document.getElementById("locate").addEventListener("click", () => {
    const status = document.getElementById("locationStatus");
    if (!navigator.geolocation) {
      status.textContent = "この端末では現在地を利用できません。";
      return;
    }
    status.textContent = "現在地を取得しています…";
    navigator.geolocation.getCurrentPosition((position) => {
      currentPosition = { lat: position.coords.latitude, lon: position.coords.longitude };
      if (currentMarker) map.removeLayer(currentMarker);
      currentMarker = L.circleMarker([currentPosition.lat, currentPosition.lon], {
        radius: 8,
        color: "#ffffff",
        weight: 3,
        fillColor: "#1677c8",
        fillOpacity: 1,
      }).addTo(map).bindPopup("現在地");
      map.setView([currentPosition.lat, currentPosition.lon], 15);
      status.textContent = "現在地を表示しました。";
      if (document.getElementById("sort").value === "distance") render();
    }, () => {
      status.textContent = "現在地を取得できませんでした。端末の位置情報設定をご確認ください。";
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 });
  });

  render();
  fitTo();
})();
