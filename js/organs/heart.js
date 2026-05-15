// =====================================================================
// Organ module: HEART (Jantung)
// ---------------------------------------------------------------------
// Export satu objek dengan kontrak:
//   - key, title, icon, color  : metadata untuk selector & UI
//   - parts                    : map partId → { title, desc, color }
//   - glbPath                  : path GLB optional, kalau ada akan di-load
//                                duluan; gagal/404 → fallback build()
//   - audioPath                : MP3 yang diloop saat organ aktif
//   - pulse(now)               : kembalikan scale multiplier (visual beat)
//                                untuk animate loop
//   - build(deps)              : factory THREE.Group berisi mesh yang
//                                sudah di-tag userData.partId
// `deps` berisi { THREE, tagPart } supaya module tidak perlu import three
// langsung — three sudah di-import di HTML utama lewat importmap.
// =====================================================================

const PARTS = {
  leftVentricle: {
    title: 'Ventrikel Kiri',
    desc: 'Bilik kiri jantung — pemompa utama yang mendorong darah kaya oksigen ke seluruh tubuh melalui aorta. Memiliki dinding otot paling tebal.',
    color: 0xffeb3b,
  },
  rightVentricle: {
    title: 'Ventrikel Kanan',
    desc: 'Bilik kanan jantung — memompa darah miskin oksigen ke paru-paru melalui arteri pulmonalis untuk dioksigenasi.',
    color: 0xffeb3b,
  },
  leftAtrium: {
    title: 'Atrium Kiri',
    desc: 'Serambi kiri — menerima darah kaya oksigen dari paru-paru melalui vena pulmonalis, lalu menyalurkannya ke ventrikel kiri.',
    color: 0x4ade80,
  },
  rightAtrium: {
    title: 'Atrium Kanan',
    desc: 'Serambi kanan — menerima darah miskin oksigen dari seluruh tubuh melalui vena cava, lalu menyalurkannya ke ventrikel kanan.',
    color: 0x4ade80,
  },
  aorta: {
    title: 'Aorta',
    desc: 'Pembuluh arteri terbesar dalam tubuh. Membawa darah kaya oksigen dari ventrikel kiri ke seluruh organ tubuh.',
    color: 0xff6b9d,
  },
  pulmonaryArtery: {
    title: 'Arteri Pulmonalis',
    desc: 'Pembuluh arteri yang membawa darah miskin oksigen dari ventrikel kanan menuju paru-paru. Satu-satunya arteri yang membawa darah miskin oksigen.',
    color: 0xff6b9d,
  },
  venaCava: {
    title: 'Vena Cava',
    desc: 'Vena terbesar dalam tubuh. Vena cava superior membawa darah dari kepala/lengan, vena cava inferior dari tubuh bagian bawah, keduanya menuju atrium kanan.',
    color: 0x60a5fa,
  },
  pulmonaryVein: {
    title: 'Vena Pulmonalis',
    desc: 'Pembuluh vena yang membawa darah kaya oksigen dari paru-paru kembali ke atrium kiri. Satu-satunya vena yang membawa darah kaya oksigen.',
    color: 0x60a5fa,
  },
};

// Procedural heart: gabungan beberapa shape merah/pink/biru menyerupai
// jantung anatomis dasar (ventrikel kiri/kanan, atrium, aorta, vena cava,
// arteri pulmonalis). Bukan akurasi medis — visualisasi edukatif.
// Setiap bagian di-tag userData.partId agar bisa di-pick.
function build({ THREE, tagPart }) {
  const g = new THREE.Group();

  // Material per-part agar highlight (emissive boost) tidak mempengaruhi
  // bagian lain yang share material yang sama.
  const makeMuscle = (dark = false) => new THREE.MeshStandardMaterial({
    color: dark ? 0x7a1418 : 0xa31e23,
    roughness: dark ? 0.6 : 0.55,
    metalness: 0.05,
    emissive: 0x000000,
    emissiveIntensity: 1,
  });
  const makeArtery = () => new THREE.MeshStandardMaterial({
    color: 0xc94545,
    roughness: 0.5,
    metalness: 0.1,
    emissive: 0x000000,
  });
  const makeVein = () => new THREE.MeshStandardMaterial({
    color: 0x3a5fb8,
    roughness: 0.55,
    metalness: 0.1,
    emissive: 0x000000,
  });
  const makePulmonary = () => new THREE.MeshStandardMaterial({
    color: 0x6b8acc,
    roughness: 0.55,
    metalness: 0.1,
    emissive: 0x000000,
  });
  const makePulmVein = () => new THREE.MeshStandardMaterial({
    color: 0xa83a6a,
    roughness: 0.55,
    metalness: 0.1,
    emissive: 0x000000,
  });

  // Ventrikel kiri (bulb besar)
  const leftVent = new THREE.Mesh(new THREE.SphereGeometry(0.35, 32, 24), makeMuscle(false));
  leftVent.scale.set(1.0, 1.3, 0.95);
  leftVent.position.set(-0.05, -0.15, 0);
  tagPart(leftVent, 'leftVentricle');
  g.add(leftVent);

  // Ventrikel kanan (bulb lebih kecil, sedikit ke depan)
  const rightVent = new THREE.Mesh(new THREE.SphereGeometry(0.28, 32, 24), makeMuscle(true));
  rightVent.scale.set(0.9, 1.15, 0.95);
  rightVent.position.set(0.22, -0.1, 0.05);
  tagPart(rightVent, 'rightVentricle');
  g.add(rightVent);

  // Atrium kiri (atas kiri)
  const leftAtr = new THREE.Mesh(new THREE.SphereGeometry(0.18, 24, 18), makeMuscle(false));
  leftAtr.scale.set(1.0, 0.9, 1.0);
  leftAtr.position.set(-0.1, 0.22, -0.05);
  tagPart(leftAtr, 'leftAtrium');
  g.add(leftAtr);

  // Atrium kanan
  const rightAtr = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 18), makeMuscle(true));
  rightAtr.scale.set(1.0, 0.9, 1.0);
  rightAtr.position.set(0.2, 0.22, 0.0);
  tagPart(rightAtr, 'rightAtrium');
  g.add(rightAtr);

  // Aorta (lengkung besar di atas)
  const aortaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.05, 0.25, 0.0),
    new THREE.Vector3(-0.05, 0.55, 0.0),
    new THREE.Vector3(0.05, 0.7, -0.1),
    new THREE.Vector3(0.2, 0.65, -0.2),
    new THREE.Vector3(0.25, 0.45, -0.25),
  ]);
  const aorta = new THREE.Mesh(
    new THREE.TubeGeometry(aortaCurve, 32, 0.06, 12, false),
    makeArtery()
  );
  tagPart(aorta, 'aorta');
  g.add(aorta);

  // Arteri pulmonalis (di samping aorta)
  const pulmCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.18, 0.25, 0.05),
    new THREE.Vector3(0.18, 0.5, 0.05),
    new THREE.Vector3(0.08, 0.62, 0.0),
  ]);
  const pulm = new THREE.Mesh(
    new THREE.TubeGeometry(pulmCurve, 24, 0.05, 12, false),
    makePulmonary()
  );
  tagPart(pulm, 'pulmonaryArtery');
  g.add(pulm);

  // Vena cava superior (vena biru atas)
  const svcCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.3, 0.3, 0.0),
    new THREE.Vector3(0.32, 0.55, 0.0),
    new THREE.Vector3(0.3, 0.7, 0.05),
  ]);
  const svc = new THREE.Mesh(
    new THREE.TubeGeometry(svcCurve, 20, 0.045, 12, false),
    makeVein()
  );
  tagPart(svc, 'venaCava');
  g.add(svc);

  // Vena cava inferior (vena biru bawah)
  const ivc = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.2, 16), makeVein());
  ivc.position.set(0.28, -0.4, 0.0);
  tagPart(ivc, 'venaCava');
  g.add(ivc);

  // Vena pulmonalis (4 cabang dari belakang menuju atrium kiri)
  // Disederhanakan jadi 2 tube di kiri-belakang atrium kiri.
  const pv1Curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25, 0.28, -0.15),
    new THREE.Vector3(-0.18, 0.25, -0.1),
    new THREE.Vector3(-0.1, 0.22, -0.05),
  ]);
  const pv1 = new THREE.Mesh(new THREE.TubeGeometry(pv1Curve, 16, 0.035, 10, false), makePulmVein());
  tagPart(pv1, 'pulmonaryVein');
  g.add(pv1);
  const pv2Curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.25, 0.15, -0.15),
    new THREE.Vector3(-0.18, 0.18, -0.1),
    new THREE.Vector3(-0.1, 0.2, -0.05),
  ]);
  const pv2 = new THREE.Mesh(new THREE.TubeGeometry(pv2Curve, 16, 0.035, 10, false), makePulmVein());
  tagPart(pv2, 'pulmonaryVein');
  g.add(pv2);

  // Arteri koroner sekunder (detail permukaan, tidak bisa di-pick)
  const coronaryCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.0, 0.15, 0.32),
    new THREE.Vector3(0.15, 0.05, 0.3),
    new THREE.Vector3(0.18, -0.15, 0.22),
    new THREE.Vector3(0.1, -0.3, 0.15),
  ]);
  const coronary = new THREE.Mesh(
    new THREE.TubeGeometry(coronaryCurve, 32, 0.018, 8, false),
    makeArtery()
  );
  g.add(coronary);

  // Apex (ujung bawah jantung) — bagian dari ventrikel kiri
  const apex = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.18, 24), makeMuscle(false));
  apex.position.set(0.05, -0.42, 0.0);
  apex.rotation.z = 0.3;
  tagPart(apex, 'leftVentricle');
  g.add(apex);

  return g;
}

// Visual beat (heartbeat): 70 BPM ≈ 1.17 Hz dengan sub-pulse untuk efek
// "lub-dub" dua tahap. Return scale multiplier.
function pulse(nowMs) {
  const t = nowMs * 0.001 * 1.0 * Math.PI * 2;
  return 1 + Math.sin(t) * 0.04 + Math.max(0, Math.sin(t * 2)) * 0.03;
}

export default {
  key: 'heart',
  title: 'Jantung',
  icon: '❤',
  color: 0xe94560,
  parts: PARTS,
  glbPath: 'assets/heart.glb',
  audioPath: 'assets/heart.mp3',
  build,
  pulse,
};
