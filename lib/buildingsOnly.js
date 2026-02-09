// lib/buildingsOnly.js
module.exports = function buildingsOnly(scene, opts = {}) {
  // İstersen endpoint'i buradan override edebilirsin:
  // opts.overpassUrl = 'https://z.overpass-api.de/api/interpreter'

  // city-roads'ta genelde global overpassUrl var. Varsa değiştiriyoruz:
  if (opts.overpassUrl && typeof overpassUrl !== 'undefined') {
    overpassUrl = opts.overpassUrl;
  }

  // areaId al
  var areaId = scene.queryLayer().getQueryBounds().areaId;

  // Buildings query (senin çalıştırdığın formatın aynısı, daha stabil string)
  var q =
    '[out:json][timeout:500];\n' +
    'area(' + areaId + '); (._;)->.a;\n' +
    '(\n' +
    '  way["building"](area.a);\n' +
    '  relation["building"](area.a);\n' +
    ');\n' +
    'out body;\n' +
    '>;\n' +
    'out skel qt;';

  var buildings = scene.load('Buildings', {
    layer: scene.queryLayer(),
    raw: q
  });

  // Görünürlük ayarları (isteğe bağlı)
  if (opts.lineWidth) buildings.lineWidth = opts.lineWidth;

  // Roads’u kaldırmak city-roads sürümüne göre değişebiliyor.
  // O yüzden "gizleme" için güvenli bir deneme yapıyoruz:
  try {
    var base = scene.queryLayer();
    if (base) {
      // bazı sürümlerde isVisible işe yarar
      if (typeof base.isVisible !== 'undefined') base.isVisible = false;
      // bazı sürümlerde hide() olabilir
      if (typeof base.hide === 'function') base.hide();
    }
  } catch (e) { /* no-op */ }

  // Script'in temizleyicisi (istersen sonradan kaldırmak için)
  return function cleanup() {
