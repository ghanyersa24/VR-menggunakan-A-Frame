// =====================================================================
// Organ module: LUNGS (Paru-paru)
// Teknik: LatheGeometry per lobus (profil organik), TubeGeometry rekursif
// untuk bronkus bercabang, MeshPhysicalMaterial jaringan spons.
// =====================================================================

const PARTS = {
  leftSuperiorLobe: {
    title: 'Lobus Superior Kiri',
    desc: 'Lobus atas paru-paru kiri. Paru kiri hanya punya 2 lobus (superior & inferior) karena berbagi rongga dada dengan jantung. Lobus ini berada di bagian atas dan depan rongga pleura kiri.',
    color: 0xff6680,
  },
  leftInferiorLobe: {
    title: 'Lobus Inferior Kiri',
    desc: 'Lobus bawah paru-paru kiri. Bertanggung jawab atas sebagian besar pertukaran gas di sisi kiri tubuh. Dipisahkan dari lobus superior oleh fisura obliqua.',
    color: 0xee4466,
  },
  rightSuperiorLobe: {
    title: 'Lobus Superior Kanan',
    desc: 'Lobus atas paru-paru kanan. Paru kanan punya 3 lobus dan sedikit lebih besar dari paru kiri. Dipisahkan dari lobus medius oleh fisura horizontal.',
    color: 0xff8866,
  },
  rightMiddleLobe: {
    title: 'Lobus Medius Kanan',
    desc: 'Lobus tengah paru-paru kanan — hanya ada di sisi kanan. Merupakan lobus terkecil, dipisahkan dari lobus superior oleh fisura horizontal dan dari lobus inferior oleh fisura obliqua.',
    color: 0xffaa44,
  },
  rightInferiorLobe: {
    title: 'Lobus Inferior Kanan',
    desc: 'Lobus bawah paru-paru kanan. Volume terbesar di antara lobus paru kanan, berperan penting dalam pertukaran oksigen dan CO₂.',
    color: 0xff7744,
  },
  trachea: {
    title: 'Trakea',
    desc: 'Saluran napas utama sepanjang ±12 cm yang menghubungkan laring dengan bronkus utama. Diperkuat oleh 16-20 cincin tulang rawan berbentuk C agar tetap terbuka saat bernapas.',
    color: 0xddccaa,
  },
  bronchus: {
    title: 'Bronkus',
    desc: 'Cabang utama trakea yang masuk ke masing-masing paru. Bronkus primer bercabang menjadi bronkus sekunder (per lobus), lalu tersier (per segmen), hingga bronkiolus dan alveoli tempat pertukaran gas.',
    color: 0xccbb99,
  },
  diaphragm: {
    title: 'Diafragma',
    desc: 'Otot kubah di bawah paru-paru yang merupakan otot pernapasan utama. Saat inhalasi, diafragma berkontraksi dan mendatar sehingga volume dada meningkat dan udara masuk. Saat ekshalasi, diafragma rileks kembali ke posisi kubah.',
    color: 0xcc7766,
  },
  pleura: {
    title: 'Pleura',
    desc: 'Lapisan tipis ganda (viseral & parietal) yang membungkus paru-paru dan melapisi dinding rongga dada. Di antara keduanya terdapat cairan pleura yang mengurangi gesekan saat paru mengembang dan mengempis.',
    color: 0xffccdd,
  },
};

// ---------------------------------------------------------------------
// BUILD — factory utama. Semua helper didefinisikan di dalam agar
// THREE dari parameter tersedia di seluruh fungsi.
// ---------------------------------------------------------------------
function build({ THREE, tagPart }) {
  const g = new THREE.Group();

  // ── Helpers (inner — akses THREE dari closure) ──
  const matLung = (color) => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.82, metalness: 0.0,
    clearcoat: 0.15, clearcoatRoughness: 0.6,
    emissive: 0x000000, emissiveIntensity: 0,
  });
  const matAirway = (color) => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.55, metalness: 0.0,
    clearcoat: 0.35, clearcoatRoughness: 0.4,
    emissive: 0x000000, emissiveIntensity: 0,
  });
  const matPleura = () => new THREE.MeshPhysicalMaterial({
    color: 0xffccdd, roughness: 0.3, metalness: 0.0,
    clearcoat: 0.8, clearcoatRoughness: 0.2,
    transparent: true, opacity: 0.22,
    side: THREE.DoubleSide,
    emissive: 0x000000, emissiveIntensity: 0,
  });
  const makeTube = (points, radius, seg = 20, radSeg = 10) => {
    const curve = new THREE.CatmullRomCurve3(
      points.map(([x, y, z]) => new THREE.Vector3(x, y, z))
    );
    return new THREE.TubeGeometry(curve, seg, radius, radSeg, false);
  };
  const makeLobeProfile = (pts) => new THREE.LatheGeometry(
    pts.map(([x, y]) => new THREE.Vector2(x, y)), 36
  );

  // Bronkus rekursif — bercabang Y seperti pohon terbalik
  const addBronchTree = (parentEnd, dir, radius, depth, side) => {
    if (depth <= 0 || radius < 0.008) return;
    const len = 0.10 + depth * 0.04;
    const spread = (Math.PI / 5) + (depth * 0.04);
    for (const angle of [spread, -spread]) {
      const rotDir = dir.clone().applyAxisAngle(new THREE.Vector3(0, 0, 1), angle * side);
      const endPt = parentEnd.clone().addScaledVector(rotDir, len);
      const mesh = new THREE.Mesh(
        makeTube([[parentEnd.x, parentEnd.y, parentEnd.z], [endPt.x, endPt.y, endPt.z]], radius, 8, 8),
        matAirway(depth > 2 ? 0xccbb99 : 0xbbaa88)
      );
      tagPart(mesh, 'bronchus');
      g.add(mesh);
      addBronchTree(endPt, rotDir, radius * 0.68, depth - 1, side);
    }
  };

  // ══════════════════════════════════════════════
  // PARU KIRI (2 lobus) — sedikit lebih kecil
  // ══════════════════════════════════════════════

  // Lobus superior kiri — dome memanjang ke atas
  const lsGeo = makeLobeProfile([
    [0.01, -0.02],
    [0.10,  0.00],
    [0.20,  0.06],
    [0.26,  0.16],
    [0.27,  0.26],
    [0.24,  0.36],
    [0.18,  0.44],
    [0.10,  0.48],
    [0.03,  0.50],
  ]);
  const lsLobe = new THREE.Mesh(lsGeo, matLung(0xd45070));
  lsLobe.scale.set(0.88, 1.0, 0.80);
  lsLobe.position.set(-0.34, 0.08, 0);
  tagPart(lsLobe, 'leftSuperiorLobe');
  g.add(lsLobe);

  // Lobus inferior kiri — lebih bulat ke bawah
  const liGeo = makeLobeProfile([
    [0.01, -0.02],
    [0.14,  0.00],
    [0.25,  0.08],
    [0.30,  0.20],
    [0.30,  0.32],
    [0.26,  0.42],
    [0.18,  0.46],
    [0.08,  0.46],
    [0.02,  0.44],
  ]);
  const liLobe = new THREE.Mesh(liGeo, matLung(0xc03858));
  liLobe.scale.set(0.88, 1.0, 0.82);
  liLobe.rotation.x = Math.PI; // flip ke bawah
  liLobe.position.set(-0.34, -0.08, 0);
  tagPart(liLobe, 'leftInferiorLobe');
  g.add(liLobe);

  // Fisura obliqua kiri (lekukan tipis antara dua lobus, detail visual)
  const fissureL = new THREE.Mesh(
    makeTube([
      [-0.34,  0.04, 0.22],
      [-0.42, -0.02, 0.10],
      [-0.46, -0.10, 0.00],
      [-0.42, -0.18,-0.06],
    ], 0.012, 12, 6),
    new THREE.MeshPhysicalMaterial({ color: 0x993344, roughness: 0.9, metalness: 0 })
  );
  g.add(fissureL);

  // Pleura kiri (selubung transparan)
  const plGeo = makeLobeProfile([
    [0.01, -0.02],
    [0.16,  0.00],
    [0.30,  0.10],
    [0.36,  0.24],
    [0.35,  0.42],
    [0.28,  0.56],
    [0.16,  0.62],
    [0.04,  0.63],
  ]);
  const pleuraL = new THREE.Mesh(plGeo, matPleura());
  pleuraL.scale.set(0.92, 1.08, 0.86);
  pleuraL.position.set(-0.34, -0.30, 0);
  tagPart(pleuraL, 'pleura');
  g.add(pleuraL);

  // ══════════════════════════════════════════════
  // PARU KANAN (3 lobus) — sedikit lebih besar
  // ══════════════════════════════════════════════

  // Lobus superior kanan
  const rsGeo = makeLobeProfile([
    [0.01, -0.02],
    [0.10,  0.00],
    [0.20,  0.06],
    [0.25,  0.15],
    [0.24,  0.25],
    [0.19,  0.32],
    [0.11,  0.35],
    [0.03,  0.35],
  ]);
  const rsLobe = new THREE.Mesh(rsGeo, matLung(0xdd7744));
  rsLobe.scale.set(0.95, 1.0, 0.85);
  rsLobe.position.set(0.34, 0.22, 0);
  tagPart(rsLobe, 'rightSuperiorLobe');
  g.add(rsLobe);

  // Lobus medius kanan — lensa horizontal
  const rmGeo = makeLobeProfile([
    [0.01, -0.02],
    [0.14,  0.00],
    [0.24,  0.06],
    [0.26,  0.13],
    [0.22,  0.20],
    [0.12,  0.22],
    [0.03,  0.22],
  ]);
  const rmLobe = new THREE.Mesh(rmGeo, matLung(0xee9922));
  rmLobe.scale.set(0.88, 0.75, 0.80);
  rmLobe.position.set(0.36, -0.06, 0.02);
  tagPart(rmLobe, 'rightMiddleLobe');
  g.add(rmLobe);

  // Lobus inferior kanan — terbesar
  const riGeo = makeLobeProfile([
    [0.01, -0.02],
    [0.16,  0.00],
    [0.28,  0.10],
    [0.34,  0.22],
    [0.34,  0.36],
    [0.28,  0.46],
    [0.18,  0.50],
    [0.07,  0.50],
    [0.02,  0.48],
  ]);
  const riLobe = new THREE.Mesh(riGeo, matLung(0xcc6633));
  riLobe.scale.set(0.95, 1.0, 0.85);
  riLobe.rotation.x = Math.PI;
  riLobe.position.set(0.34, -0.08, 0);
  tagPart(riLobe, 'rightInferiorLobe');
  g.add(riLobe);

  // Fisura horizontal kanan (antara superior & medius)
  const fissureRH = new THREE.Mesh(
    makeTube([
      [ 0.34,  0.14, 0.22],
      [ 0.42,  0.10, 0.10],
      [ 0.44,  0.06, 0.00],
    ], 0.010, 8, 6),
    new THREE.MeshPhysicalMaterial({ color: 0x995522, roughness: 0.9, metalness: 0 })
  );
  g.add(fissureRH);

  // Fisura obliqua kanan (antara medius+superior & inferior)
  const fissureRO = new THREE.Mesh(
    makeTube([
      [ 0.34,  0.08, 0.24],
      [ 0.44,  0.00, 0.12],
      [ 0.46, -0.12, 0.00],
      [ 0.42, -0.22,-0.06],
    ], 0.011, 12, 6),
    new THREE.MeshPhysicalMaterial({ color: 0x995522, roughness: 0.9, metalness: 0 })
  );
  g.add(fissureRO);

  // Pleura kanan
  const prGeo = makeLobeProfile([
    [0.01, -0.02],
    [0.18,  0.00],
    [0.32,  0.12],
    [0.38,  0.28],
    [0.37,  0.46],
    [0.30,  0.58],
    [0.18,  0.64],
    [0.05,  0.65],
  ]);
  const pleuraR = new THREE.Mesh(prGeo, matPleura());
  pleuraR.scale.set(0.96, 1.08, 0.88);
  pleuraR.position.set(0.34, -0.32, 0);
  tagPart(pleuraR, 'pleura');
  g.add(pleuraR);

  // ══════════════════════════════════════════════
  // TRAKEA & BRONKUS
  // ══════════════════════════════════════════════

  // Trakea — tabung vertikal dengan profil sedikit elips (lebih lebar dari depan ke belakang)
  const tracheaMesh = new THREE.Mesh(
    makeTube([
      [ 0.00,  0.76,  0.00],
      [ 0.00,  0.64,  0.00],
      [ 0.00,  0.52, -0.02],
      [ 0.00,  0.38, -0.02],
    ], 0.052, 20, 14),
    matAirway(0xddd0b0)
  );
  tagPart(tracheaMesh, 'trachea');
  g.add(tracheaMesh);

  // Cincin trakea (detail visual — 6 cincin)
  for (let i = 0; i < 6; i++) {
    const y = 0.72 - i * 0.07;
    const ringGeo = new THREE.TorusGeometry(0.054, 0.010, 8, 24);
    const ring = new THREE.Mesh(ringGeo,
      new THREE.MeshPhysicalMaterial({ color: 0xeee0c0, roughness: 0.6, metalness: 0 })
    );
    ring.position.set(0, y, -0.01);
    ring.rotation.x = Math.PI / 2;
    g.add(ring); // tidak di-tag — detail visual
  }

  // Karina (percabangan trakea → dua bronkus primer)
  const karinaL = new THREE.Mesh(
    makeTube([
      [ 0.00,  0.38, -0.02],
      [-0.08,  0.30, -0.02],
      [-0.18,  0.22, -0.01],
      [-0.26,  0.16,  0.00],
    ], 0.044, 14, 12),
    matAirway(0xccc0a0)
  );
  tagPart(karinaL, 'bronchus');
  g.add(karinaL);

  const karinaR = new THREE.Mesh(
    makeTube([
      [ 0.00,  0.38, -0.02],
      [ 0.10,  0.30, -0.01],
      [ 0.20,  0.22,  0.00],
      [ 0.28,  0.16,  0.01],
    ], 0.046, 14, 12),
    matAirway(0xccc0a0)
  );
  tagPart(karinaR, 'bronchus');
  g.add(karinaR);

  // Bronkus sekunder kiri (ke lobus superior & inferior)
  const bLSup = new THREE.Mesh(
    makeTube([
      [-0.26,  0.16,  0.00],
      [-0.30,  0.22,  0.02],
      [-0.34,  0.28,  0.02],
    ], 0.034, 10, 10),
    matAirway(0xbbaa88)
  );
  tagPart(bLSup, 'bronchus');
  g.add(bLSup);

  const bLInf = new THREE.Mesh(
    makeTube([
      [-0.26,  0.16,  0.00],
      [-0.30,  0.08,  0.00],
      [-0.34, -0.02,  0.00],
    ], 0.032, 10, 10),
    matAirway(0xbbaa88)
  );
  tagPart(bLInf, 'bronchus');
  g.add(bLInf);

  // Bronkus sekunder kanan (ke 3 lobus)
  const bRSup = new THREE.Mesh(
    makeTube([
      [ 0.28,  0.16,  0.01],
      [ 0.32,  0.24,  0.02],
      [ 0.36,  0.30,  0.02],
    ], 0.034, 10, 10),
    matAirway(0xbbaa88)
  );
  tagPart(bRSup, 'bronchus');
  g.add(bRSup);

  const bRMid = new THREE.Mesh(
    makeTube([
      [ 0.28,  0.16,  0.01],
      [ 0.33,  0.12,  0.02],
      [ 0.36,  0.06,  0.02],
    ], 0.030, 10, 10),
    matAirway(0xbbaa88)
  );
  tagPart(bRMid, 'bronchus');
  g.add(bRMid);

  const bRInf = new THREE.Mesh(
    makeTube([
      [ 0.28,  0.16,  0.01],
      [ 0.32,  0.06,  0.01],
      [ 0.34, -0.04,  0.00],
    ], 0.036, 10, 10),
    matAirway(0xbbaa88)
  );
  tagPart(bRInf, 'bronchus');
  g.add(bRInf);

  // Pohon bronkus rekursif (bronkiolus) — kiri & kanan, 3 level
  addBronchTree(new THREE.Vector3(-0.30, 0.08, 0.00), new THREE.Vector3(-0.6, -0.7, 0.1).normalize(), 0.022, 3, -1);
  addBronchTree(new THREE.Vector3( 0.30, 0.08, 0.01), new THREE.Vector3( 0.6, -0.7, 0.1).normalize(), 0.024, 3,  1);

  // ══════════════════════════════════════════════
  // DIAFRAGMA — kubah otot di bawah paru
  // ══════════════════════════════════════════════
  const diaGeo = new THREE.SphereGeometry(0.52, 36, 18, 0, Math.PI * 2, 0, Math.PI / 2);
  const diaphragm = new THREE.Mesh(diaGeo, new THREE.MeshPhysicalMaterial({
    color: 0xb05848,
    roughness: 0.72,
    metalness: 0.0,
    clearcoat: 0.2,
    clearcoatRoughness: 0.5,
    emissive: 0x000000,
    emissiveIntensity: 0,
  }));
  diaphragm.scale.set(1.05, 0.24, 0.90);
  diaphragm.position.set(0, -0.56, 0);
  diaphragm.rotation.x = Math.PI;
  tagPart(diaphragm, 'diaphragm');
  g.add(diaphragm);

  return g;
}

// Visual breathing: ~15 napas/menit ≈ 0.25 Hz
// Scale Y lebih untuk efek expand rongga dada
function pulse(nowMs) {
  const t = nowMs * 0.001 * 0.25 * Math.PI * 2;
  const inhale = Math.sin(t);
  return 1 + inhale * 0.07;
}

export default {
  key: 'lungs',
  title: 'Paru-paru',
  icon: '🫁',
  color: 0xff8fa3,
  parts: PARTS,
  glbPath: null,
  audioPath: 'assets/lungs.mp3',
  build,
  pulse,
};
