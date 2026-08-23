(() => {
  const container = document.querySelector("[data-community-overview]");
  if (!container) return;

  const communities = container.dataset.communityOverview.split(",").map(name => name.trim()).filter(Boolean);
  const map = L.map(container, {
    zoomControl: false,
    attributionControl: false,
    dragging: false,
    scrollWheelZoom: false,
    doubleClickZoom: false,
    boxZoom: false,
    keyboard: false,
    touchZoom: false,
    zoomSnap: 0.1
  });

  Promise.all([
    fetch("../data/nishinomiya-towns.topojson").then(response => {
      if (!response.ok) throw Error("境界データ");
      return response.json();
    }),
    fetch("../data/community-town-map.json").then(response => {
      if (!response.ok) throw Error("割り当てデータ");
      return response.json();
    })
  ]).then(([topology, mapping]) => {
    const geometries = topology.objects.town.geometries;
    const features = communities.map(community => {
      const members = geometries.filter(item => mapping.towns[item.properties.S_NAME]?.community === community);
      const merged = topojson.merge(topology, members);
      merged.properties = { community };
      return merged;
    });
    container.querySelector(".map-status")?.remove();
    const layer = L.geoJSON({ type: "FeatureCollection", features }, {
      interactive: false,
      style: { color: "#fff", weight: 3, fillColor: "#5f87d8", fillOpacity: .92 },
      onEachFeature(feature, shape) {
        const offset = feature.properties.community === "上ヶ原" ? L.point(15, 10) : L.point(0, 0);
        shape.bindTooltip(feature.properties.community, {
          permanent: true,
          direction: "center",
          offset,
          className: "community-label",
          interactive: false
        });
      }
    }).addTo(map);
    map.fitBounds(layer.getBounds(), { padding: [2, 2], animate: false });
    setTimeout(() => map.invalidateSize({ animate: false }), 0);
  }).catch(error => {
    container.querySelector(".map-status").textContent = "地図を読み込めませんでした。データファイルを確認してください。";
    console.error(error);
  });
})();
