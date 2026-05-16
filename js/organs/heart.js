// =====================================================================
// Organ module: HEART (Jantung)
// Teknik: Shape+LatheGeometry untuk badan, TubeGeometry+CatmullRomCurve3
// untuk pembuluh, MeshPhysicalMaterial per bagian untuk tampilan anatomis.
// Referensi: github.com/MattSchroyer/heart, Three.js discourse #6074
// =====================================================================

const PARTS = {
  leftVentricle: {
    title: 'Ventrikel Kiri',
    desc: 'Bilik kiri jantung yang berfungsi memompa darah kaya oksigen ke seluruh tubuh melalui aorta. Memiliki dinding otot paling tebal karena harus menghasilkan tekanan tinggi untuk mendistribusikan darah ke seluruh organ tubuh.',
    color: 0xff4466,
  },
  rightVentricle: {
    title: 'Ventrikel Kanan',
    desc: 'Bilik kanan jantung yang bertugas memompa darah miskin oksigen menuju paru-paru melalui arteri pulmonalis. Dinding ototnya lebih tipis dibanding ventrikel kiri karena hanya memompa darah ke paru-paru yang letaknya dekat.',
    color: 0xff6644,
  },
  leftAtrium: {
    title: 'Atrium Kiri',
    desc: 'Serambi kiri jantung yang menerima darah kaya oksigen dari paru-paru melalui vena pulmonalis. Darah kemudian dialirkan ke ventrikel kiri melalui katup mitral untuk dipompa ke seluruh tubuh.',
    color: 0x44dd88,
  },
  rightAtrium: {
    title: 'Atrium Kanan',
    desc: 'Serambi kanan jantung yang menerima darah miskin oksigen dari seluruh tubuh melalui vena cava superior dan vena cava inferior. Darah selanjutnya dialirkan ke ventrikel kanan melalui katup trikuspid.',
    color: 0x44bbff,
  },
  aorta: {
    title: 'Aorta',
    desc: 'Arteri terbesar dan utama dalam tubuh yang membawa darah kaya oksigen dari ventrikel kiri menuju seluruh jaringan dan organ tubuh. Aorta bercabang menjadi pembuluh arteri yang lebih kecil untuk mendistribusikan darah.',
    color: 0xff3333,
  },
  pulmonaryArtery: {
    title: 'Arteri Pulmonalis',
    desc: 'Pembuluh arteri yang membawa darah miskin oksigen dari ventrikel kanan menuju paru-paru untuk proses pertukaran gas. Merupakan satu-satunya arteri yang membawa darah miskin oksigen.',
    color: 0x6688ff,
  },
  venaCava: {
    title: 'Vena Cava',
    desc: 'Vena terbesar dalam tubuh yang berfungsi membawa darah miskin oksigen kembali ke jantung. Vena cava superior membawa darah dari kepala dan tubuh bagian atas, sedangkan vena cava inferior membawa darah dari tubuh bagian bawah menuju atrium kanan.',
    color: 0x4455dd,
  },
  pulmonaryVein: {
    title: 'Vena Pulmonalis',
    desc: 'Pembuluh vena yang membawa darah kaya oksigen dari paru-paru kembali ke atrium kiri jantung setelah proses oksigenasi. Merupakan satu-satunya vena yang membawa darah kaya oksigen.',
    color: 0xcc44aa,
  },
  coronaryArtery: {
    title: 'Arteri Koroner',
    desc: 'Pembuluh darah yang memasok oksigen dan nutrisi langsung ke otot jantung. Terdiri dari arteri koroner kiri (LAD & circumflex) dan kanan (RCA). Penyumbatan arteri koroner menyebabkan serangan jantung.',
    color: 0xff8800,
  },
};

// ---------------------------------------------------------------------
// BUILD — factory utama. Semua helper didefinisikan di dalam agar
// THREE dari parameter tersedia di seluruh fungsi.
// ---------------------------------------------------------------------
function build({ THREE, tagPart }) {
  const g = new THREE.Group();

  // ── Helpers (inner functions — akses THREE dari closure) ──
  const matMuscle = (color, dark = false) => new THREE.MeshPhysicalMaterial({
    color: dark ? 0x8b1a1a : color,
    roughness: 0.62, metalness: 0.0,
    clearcoat: 0.3, clearcoatRoughness: 0.4,
    emissive: 0x000000, emissiveIntensity: 0,
  });
  const matArtery = (color) => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.45, metalness: 0.0,
    clearcoat: 0.5, clearcoatRoughness: 0.3,
    emissive: 0x000000, emissiveIntensity: 0,
  });
  const matVein = (color) => new THREE.MeshPhysicalMaterial({
    color, roughness: 0.55, metalness: 0.0,
    clearcoat: 0.4, clearcoatRoughness: 0.35,
    emissive: 0x000000, emissiveIntensity: 0,
  });
  const makeTube = (points, radius, segments = 20, radialSeg = 10) => {
    const curve = new THREE.CatmullRomCurve3(
      points.map(([x, y, z]) => new THREE.Vector3(x, y, z))
    );
    return new THREE.TubeGeometry(curve, segments, radius, radialSeg, false);
  };
  const makeLathe = (pts, segs = 36) => new THREE.LatheGeometry(
    pts.map(([x, y]) => new THREE.Vector2(x, y)), segs
  );

  // Profil lathe badan jantung — apex bawah ke base atas
  const bodyGeo = makeLathe([
    [0.01, -0.42], [0.08, -0.38], [0.18, -0.28],
    [0.28, -0.12], [0.33,  0.02], [0.34,  0.14],
    [0.31,  0.24], [0.24,  0.32], [0.15,  0.36],
    [0.06,  0.38],
  ], 48);

  // ── Badan utama: ventrikel kiri (bulk terbesar, sisi kiri)
  const bodyMesh = new THREE.Mesh(bodyGeo, matMuscle(0xb01830));
  bodyMesh.scale.set(1.0, 1.0, 0.88);
  bodyMesh.position.set(-0.04, -0.08, 0);
  tagPart(bodyMesh, 'leftVentricle');
  g.add(bodyMesh);

  // ── Ventrikel kanan — bulge ke kanan-depan, lebih pipih
  const rvGeo = makeLathe([
    [0.01, -0.34], [0.12, -0.22], [0.22, -0.06],
    [0.26,  0.08], [0.24,  0.20], [0.18,  0.28],
    [0.08,  0.32], [0.02,  0.33],
  ], 36);
  const rv = new THREE.Mesh(rvGeo, matMuscle(0x921525, true));
  rv.scale.set(0.75, 0.92, 0.6);
  rv.position.set(0.20, -0.05, 0.08);
  rv.rotation.y = -0.35;
  tagPart(rv, 'rightVentricle');
  g.add(rv);

  // ── Atrium kiri — dome di atas-kiri belakang
  const laGeo = makeLathe([
    [0.01, 0.0], [0.10, 0.02], [0.18, 0.08],
    [0.20, 0.15], [0.17, 0.22], [0.10, 0.26], [0.02, 0.27],
  ], 32);
  const la = new THREE.Mesh(laGeo, matMuscle(0xb03060));
  la.scale.set(0.9, 1.0, 0.85);
  la.position.set(-0.10, 0.24, -0.06);
  tagPart(la, 'leftAtrium');
  g.add(la);

  // ── Atrium kanan — dome di atas-kanan
  const raGeo = makeLathe([
    [0.01, 0.0], [0.12, 0.03], [0.19, 0.10],
    [0.20, 0.17], [0.16, 0.23], [0.08, 0.26], [0.02, 0.27],
  ], 32);
  const ra = new THREE.Mesh(raGeo, matMuscle(0xa02840));
  ra.scale.set(0.85, 0.95, 0.8);
  ra.position.set(0.18, 0.24, 0.02);
  tagPart(ra, 'rightAtrium');
  g.add(ra);

  // ── Aorta — lengkung besar (aortic arch) dari ventrikel kiri ke belakang
  const aortaMesh = new THREE.Mesh(
    makeTube([
      [-0.06,  0.22,  0.04],
      [-0.06,  0.42,  0.02],
      [-0.02,  0.54, -0.04],
      [ 0.08,  0.60, -0.12],
      [ 0.20,  0.56, -0.18],
      [ 0.26,  0.42, -0.22],
      [ 0.26,  0.28, -0.20],
    ], 0.072, 28, 14),
    matArtery(0xcc2030)
  );
  tagPart(aortaMesh, 'aorta');
  g.add(aortaMesh);

  // Cabang aorta ascendens pendek (sebelum arch)
  const aortaRootMesh = new THREE.Mesh(
    makeTube([
      [-0.06, 0.16,  0.04],
      [-0.06, 0.24,  0.03],
    ], 0.065, 8, 12),
    matArtery(0xcc2030)
  );
  tagPart(aortaRootMesh, 'aorta');
  g.add(aortaRootMesh);

  // ── Arteri pulmonalis — keluar dari ventrikel kanan, menuju kiri-atas
  const paMesh = new THREE.Mesh(
    makeTube([
      [ 0.20,  0.20,  0.10],
      [ 0.18,  0.36,  0.08],
      [ 0.10,  0.48,  0.04],
      [ 0.00,  0.54,  0.00],
      [-0.10,  0.52, -0.04],
    ], 0.058, 24, 12),
    matArtery(0x5577ee)
  );
  tagPart(paMesh, 'pulmonaryArtery');
  g.add(paMesh);

  // Cabang kiri & kanan arteri pulmonalis
  const paLMesh = new THREE.Mesh(
    makeTube([
      [-0.10,  0.52, -0.04],
      [-0.22,  0.50, -0.08],
      [-0.30,  0.44, -0.10],
    ], 0.042, 14, 10),
    matArtery(0x5577ee)
  );
  tagPart(paLMesh, 'pulmonaryArtery');
  g.add(paLMesh);

  const paRMesh = new THREE.Mesh(
    makeTube([
      [-0.10,  0.52, -0.04],
      [ 0.02,  0.54,  0.02],
      [ 0.16,  0.50,  0.06],
    ], 0.040, 12, 10),
    matArtery(0x5577ee)
  );
  tagPart(paRMesh, 'pulmonaryArtery');
  g.add(paRMesh);

  // ── Vena cava superior (biru, dari atas kanan masuk atrium kanan)
  const svcMesh = new THREE.Mesh(
    makeTube([
      [ 0.28,  0.62,  0.02],
      [ 0.28,  0.50,  0.01],
      [ 0.26,  0.40,  0.00],
      [ 0.22,  0.32,  0.00],
    ], 0.050, 16, 12),
    matVein(0x3355cc)
  );
  tagPart(svcMesh, 'venaCava');
  g.add(svcMesh);

  // Vena cava inferior (dari bawah kanan)
  const ivcMesh = new THREE.Mesh(
    makeTube([
      [ 0.26, -0.46,  0.00],
      [ 0.26, -0.28,  0.00],
      [ 0.24,  0.10,  0.00],
      [ 0.20,  0.26,  0.00],
    ], 0.048, 18, 12),
    matVein(0x3355cc)
  );
  tagPart(ivcMesh, 'venaCava');
  g.add(ivcMesh);

  // ── Vena pulmonalis (4 cabang dari belakang menuju atrium kiri)
  const pvPositions = [
    [[-0.30, 0.46, -0.18], [-0.20, 0.40, -0.10], [-0.12, 0.34, -0.06]],
    [[-0.30, 0.34, -0.18], [-0.20, 0.32, -0.10], [-0.12, 0.30, -0.06]],
    [[ 0.06, 0.48, -0.16], [ 0.00, 0.40, -0.10], [-0.08, 0.34, -0.06]],
    [[ 0.06, 0.36, -0.16], [ 0.00, 0.32, -0.10], [-0.08, 0.30, -0.06]],
  ];
  for (const pts of pvPositions) {
    const pvMesh = new THREE.Mesh(
      makeTube(pts, 0.034, 12, 10),
      matVein(0xaa3388)
    );
    tagPart(pvMesh, 'pulmonaryVein');
    g.add(pvMesh);
  }

  // ── Arteri koroner kiri (LAD — turun di depan septum)
  const ladMesh = new THREE.Mesh(
    makeTube([
      [-0.04,  0.18,  0.30],
      [ 0.00,  0.06,  0.32],
      [ 0.02, -0.10,  0.30],
      [ 0.02, -0.26,  0.24],
      [ 0.02, -0.38,  0.14],
    ], 0.020, 24, 8),
    matArtery(0xff7700)
  );
  tagPart(ladMesh, 'coronaryArtery');
  g.add(ladMesh);

  // Arteri koroner kanan (RCA — melingkar di sulkus atrioventrikular kanan)
  const rcaMesh = new THREE.Mesh(
    makeTube([
      [ 0.14,  0.18,  0.22],
      [ 0.28,  0.10,  0.14],
      [ 0.30, -0.04,  0.08],
      [ 0.28, -0.18,  0.04],
      [ 0.22, -0.30,  0.02],
      [ 0.12, -0.38,  0.06],
    ], 0.018, 24, 8),
    matArtery(0xff7700)
  );
  tagPart(rcaMesh, 'coronaryArtery');
  g.add(rcaMesh);

  // Circumflex artery (melingkar di belakang)
  const lcxMesh = new THREE.Mesh(
    makeTube([
      [-0.04,  0.18,  0.30],
      [-0.14,  0.14,  0.20],
      [-0.22,  0.08,  0.10],
      [-0.24, -0.04,  0.04],
      [-0.20, -0.18,  0.00],
    ], 0.016, 20, 8),
    matArtery(0xff8822)
  );
  tagPart(lcxMesh, 'coronaryArtery');
  g.add(lcxMesh);

  // ── Apex (ujung bawah lancip ventrikel kiri)
  const apexGeo = new THREE.ConeGeometry(0.10, 0.16, 24);
  const apex = new THREE.Mesh(apexGeo, matMuscle(0x9a1520));
  apex.position.set(0.01, -0.46, 0.00);
  apex.rotation.z = 0.12;
  tagPart(apex, 'leftVentricle');
  g.add(apex);

  // ── Sulkus interventrikular (lekukan antara dua ventrikel, detail visual)
  const sulcusMesh = new THREE.Mesh(
    makeTube([
      [ 0.06,  0.28,  0.28],
      [ 0.05,  0.10,  0.33],
      [ 0.04, -0.08,  0.32],
      [ 0.03, -0.26,  0.26],
      [ 0.02, -0.40,  0.16],
    ], 0.012, 20, 6),
    new THREE.MeshPhysicalMaterial({ color: 0x6e0e14, roughness: 0.8, metalness: 0 })
  );
  // tidak di-tag — hanya detail visual
  g.add(sulcusMesh);

  return g;
}

// Visual beat: 70 BPM ~1.17 Hz, efek lub-dub dua tahap
function pulse(nowMs) {
  const t = (nowMs * 0.001 * 1.17) * Math.PI * 2;
  const lub = Math.max(0, Math.sin(t)) * 0.05;
  const dub = Math.max(0, Math.sin(t * 2 - 0.8)) * 0.03;
  return 1 + lub + dub;
}

export default {
  key: 'heart',
  title: 'Jantung',
  icon: '❤',
  color: 0xe94560,
  parts: PARTS,
  glbPath: null,
  audioPath: 'assets/heart.mp3',
  build,
  pulse,
};
