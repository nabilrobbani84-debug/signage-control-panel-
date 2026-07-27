import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // ── Admin User ─────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('Admin123!', 12);

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@signage.id' },
    update: {},
    create: {
      email: 'admin@signage.id',
      name: 'Super Admin',
      password: hashedPassword,
    },
  });

  console.log(`✅ Admin user created: ${adminUser.email}`);

  // ── Sample Devices ─────────────────────────────────────
  const lobby = await prisma.device.upsert({
    where: { id: 'device-lobby-001' },
    update: {},
    create: {
      id: 'device-lobby-001',
      nama: 'Display Lobby Utama',
      lokasi: 'Lantai 1 - Lobby',
      status: 'OFFLINE',
    },
  });

  const cafeteria = await prisma.device.upsert({
    where: { id: 'device-cafeteria-002' },
    update: {},
    create: {
      id: 'device-cafeteria-002',
      nama: 'Display Kafetaria',
      lokasi: 'Lantai 2 - Kafetaria',
      status: 'OFFLINE',
    },
  });

  console.log(`✅ Sample devices created: ${lobby.nama}, ${cafeteria.nama}`);

  // ── Sample Contents ────────────────────────────────────
  const imageContent = await prisma.content.upsert({
    where: { id: 'content-promo-001' },
    update: {},
    create: {
      id: 'content-promo-001',
      judul: 'Promo Kemerdekaan 2025',
      tipe: 'IMAGE',
      payload: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1920&q=80',
    },
  });

  const videoContent = await prisma.content.upsert({
    where: { id: 'content-video-002' },
    update: {},
    create: {
      id: 'content-video-002',
      judul: 'Company Profile Video',
      tipe: 'VIDEO',
      payload: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    },
  });

  const textContent = await prisma.content.upsert({
    where: { id: 'content-ticker-003' },
    update: {},
    create: {
      id: 'content-ticker-003',
      judul: 'Running Text Pengumuman',
      tipe: 'TEXT',
      payload: 'Selamat datang di PT MJ Solution Indonesia | Kami memberikan solusi terbaik untuk bisnis Anda | Hubungi kami di info@mjsolution.id',
    },
  });

  const webContent = await prisma.content.upsert({
    where: { id: 'content-web-004' },
    update: {},
    create: {
      id: 'content-web-004',
      judul: 'Dashboard Live Website',
      tipe: 'WEB',
      payload: 'https://www.google.com/maps',
    },
  });

  console.log(
    `✅ Sample contents created: ${imageContent.judul}, ${videoContent.judul}, ${textContent.judul}, ${webContent.judul}`
  );

  // ── Attach content to lobby device playlist ─────────────
  await prisma.playlist.upsert({
    where: { device_id_content_id: { device_id: lobby.id, content_id: imageContent.id } },
    update: {},
    create: {
      device_id: lobby.id,
      content_id: imageContent.id,
      urutan: 1,
      durasi: 30,
    },
  });

  await prisma.playlist.upsert({
    where: { device_id_content_id: { device_id: lobby.id, content_id: videoContent.id } },
    update: {},
    create: {
      device_id: lobby.id,
      content_id: videoContent.id,
      urutan: 2,
      durasi: 60,
    },
  });

  await prisma.playlist.upsert({
    where: {
      device_id_content_id: { device_id: cafeteria.id, content_id: textContent.id },
    },
    update: {},
    create: {
      device_id: cafeteria.id,
      content_id: textContent.id,
      urutan: 1,
      durasi: 20,
    },
  });

  console.log('✅ Playlist items attached to devices');
  console.log('\n🎉 Seed completed successfully!');
  console.log('─────────────────────────────────────');
  console.log('  Admin Login:');
  console.log('  Email   : admin@signage.id');
  console.log('  Password: Admin123!');
  console.log('─────────────────────────────────────');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
