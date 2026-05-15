// =====================================================================
// Organ module: LUNGS (Paru-paru)
// ---------------------------------------------------------------------
// Kontrak module sama dengan heart.js — lihat dokumentasi di sana.
// =====================================================================

const PARTS = {
  leftSuperiorLobe: {
    title: 'Lobus Superior Kiri',
    desc: 'Lobus atas paru-paru kiri. Paru kiri hanya punya 2 lobus (superior & inferior) karena berbagi rongga dada dengan jantung.',
    color: 0xffeb3b,
  },
  leftInferiorLobe: {
    title: 'Lobus Inferior Kiri',
    desc: 'Lobus bawah paru-paru kiri. Bertanggung jawab atas sebagian besar pertukaran gas di sisi kiri tubuh.',
    color: 0xffeb3b,
  },
  rightSuperiorLobe: {
    title: 'Lobus Superior Kanan',
    desc: 'Lobus atas paru-paru kanan. Paru kanan punya 3 lobus (superior, medius, inferior) dan sedikit lebih besar dari paru kiri.',
    color: 0x4ade80,
  },
  rightMiddleLobe: {
    title: 'Lobus Medius Kanan',
    desc: 'Lobus tengah paru-paru kanan. Hanya ada di sisi kanan; dipisahkan dari lobus superior oleh fisura horizontal.',
    color: 0x4ade80,
  },
  rightInferiorLobe: {
    title: 'Lobus Inferior Kanan',
    desc: 'Lobus bawah paru-paru kanan. Volume terbesar di antara lobus paru kanan.',
    color: 0x4ade80,
  },
  trachea: {
    title: 'Trakea',
    desc: 'Saluran napas utama yang menghubungkan laring dengan bronkus. Dilengkapi cincin tulang rawan agar tetap terbuka saat bernapas.',
    color: 0xff6b9d,
  },
  bronchus: {
    title: 'Bronkus',
    desc: 'Cabang utama trakea yang masuk ke masing-masing paru, lalu bercabang lagi jadi bronkiolus sebelum berakhir di alveoli.',
    color: 0xff6b9d,
  },
  diaphragm: {
    title: 'Diafragma',
    desc: 'Otot kubah di bawah paru-paru. Berkontraksi (mendatar) saat inhalasi untuk menarik udara masuk, dan rileks saat ekshalasi.',
    color: 0x60a5fa,
  },
};

// Procedural lungs: dua lobus paru (kiri 2 lobus, kanan 3 lobus) dengan
// trakea & bronkus di tengah, dan diafragma kubah di bawah. Geometri
// sederhana berbasis Sphere yang di-scale agar lonjong vertikal.
function build({ THREE, tagPart }) {
  const g = new THREE.Group();

  const makeLungTissue = (hue) => new THREE.MeshStandardMaterial({
    color: hue,
    roughness: 0.7,
    metalness: 0.02,
    emissive: 0x000000,
    emissiveIntensity: 1,
  });
  const makeAirway = () => new THREE.MeshStandardMaterial({
    color: 0xddc8b3,
    roughness: 0.5,
    metalness: 0.1,
    emissive: 0x000000,
  });
  const makeMuscle = () => new THREE.MeshStandardMaterial({
    color: 0x9c4a4a,
    roughness: 0.65,
    metalness: 0.05,
    emissive: 0x000000,
  });

  // ===== Paru kiri (2 lobus) — agak lebih kecil karena ada jantung
  const leftSup = new THREE.Mesh(new THREE.SphereGeometry(0.26, 24, 18), makeLungTissue(0xe89aa0));
  leftSup.scale.set(0.95, 1.0, 0.85);
  leftSup.position.set(-0.32, 0.15, 0);
  tagPart(leftSup, 'leftSuperiorLobe');
  g.add(leftSup);

  const leftInf = new THREE.Mesh(new THREE.SphereGeometry(0.28, 24, 18), makeLungTissue(0xd97a82));
  leftInf.scale.set(0.95, 1.0, 0.9);
  leftInf.position.set(-0.32, -0.28, 0);
  tagPart(leftInf, 'leftInferiorLobe');
  g.add(leftInf);

  // ===== Paru kanan (3 lobus) — sedikit lebih besar
  const rightSup = new THREE.Mesh(new THREE.SphereGeometry(0.25, 24, 18), makeLungTissue(0xe89aa0));
  rightSup.scale.set(0.95, 0.85, 0.9);
  rightSup.position.set(0.32, 0.22, 0);
  tagPart(rightSup, 'rightSuperiorLobe');
  g.add(rightSup);

  const rightMid = new THREE.Mesh(new THREE.SphereGeometry(0.22, 24, 18), makeLungTissue(0xd9858c));
  rightMid.scale.set(1.0, 0.7, 0.9);
  rightMid.position.set(0.34, -0.05, 0.02);
  tagPart(rightMid, 'rightMiddleLobe');
  g.add(rightMid);

  const rightInf = new THREE.Mesh(new THREE.SphereGeometry(0.30, 24, 18), makeLungTissue(0xd97a82));
  rightInf.scale.set(0.95, 1.0, 0.9);
  rightInf.position.set(0.32, -0.32, 0);
  tagPart(rightInf, 'rightInferiorLobe');
  g.add(rightInf);

  // ===== Trakea (tabung vertikal di tengah-atas)
  const trachea = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.05, 0.35, 16), makeAirway());
  trachea.position.set(0, 0.42, 0);
  tagPart(trachea, 'trachea');
  g.add(trachea);

  // ===== Bronkus kiri & kanan (Y-shape dari ujung trakea)
  const bronchusL = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.25, 12), makeAirway());
  bronchusL.position.set(-0.14, 0.22, 0);
  bronchusL.rotation.z = Math.PI * 0.22;
  tagPart(bronchusL, 'bronchus');
  g.add(bronchusL);

  const bronchusR = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.25, 12), makeAirway());
  bronchusR.position.set(0.14, 0.22, 0);
  bronchusR.rotation.z = -Math.PI * 0.22;
  tagPart(bronchusR, 'bronchus');
  g.add(bronchusR);

  // Cabang sekunder bronkus (di dalam paru, hanya visual)
  const bronchioleL = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.18, 10), makeAirway());
  bronchioleL.position.set(-0.25, 0.05, 0);
  bronchioleL.rotation.z = Math.PI * 0.3;
  tagPart(bronchioleL, 'bronchus');
  g.add(bronchioleL);

  const bronchioleR = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.028, 0.18, 10), makeAirway());
  bronchioleR.position.set(0.25, 0.05, 0);
  bronchioleR.rotation.z = -Math.PI * 0.3;
  tagPart(bronchioleR, 'bronchus');
  g.add(bronchioleR);

  // ===== Diafragma (kubah otot di bawah paru) — half-sphere terbalik.
  // Dibuat lebih pipih dan diturunkan lebih jauh dari lobus inferior
  // supaya bounding box-nya tidak overlap dengan lobus saat picker
  // melakukan hit-test (sebelumnya pick lobus inferior sering jadi
  // diafragma karena bbox keduanya bersentuhan).
  const diaGeo = new THREE.SphereGeometry(0.5, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
  const diaphragm = new THREE.Mesh(diaGeo, makeMuscle());
  diaphragm.scale.set(1.0, 0.22, 0.85);
  diaphragm.position.set(0, -0.72, 0);
  diaphragm.rotation.x = Math.PI; // flip jadi kubah menghadap ke atas
  tagPart(diaphragm, 'diaphragm');
  g.add(diaphragm);

  return g;
}

// Visual breathing: ~15 napas/menit ≈ 0.25 Hz, amplitudo lebih besar
// dari heart pulse untuk efek inhale-exhale yang jelas.
function pulse(nowMs) {
  const t = nowMs * 0.001 * 0.25 * Math.PI * 2;
  return 1 + Math.sin(t) * 0.06;
}

export default {
  key: 'lungs',
  title: 'Paru-paru',
  icon: '🫁',
  color: 0xff8fa3,
  parts: PARTS,
  glbPath: 'assets/lungs.glb',
  audioPath: 'assets/lungs.mp3',
  build,
  pulse,
};
