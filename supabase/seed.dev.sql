-- Dev-only sample content. Do not apply this file to production.
insert into public.announcements (title, body, created_at)
values
  (
    'Kuliah Maghrib mingguan',
    'Kuliah Maghrib akan diadakan setiap malam Jumaat selepas solat Maghrib di ruang utama masjid. Semua jemaah dijemput hadir.',
    now() - interval '2 days'
  ),
  (
    'Gotong-royong perdana',
    'Gotong-royong membersihkan kawasan masjid akan diadakan pada hujung minggu ini. Sila bawa peralatan yang sesuai jika ada.',
    now() - interval '6 days'
  ),
  (
    'Kelas tadarus Al-Quran',
    'Kelas tadarus untuk dewasa dibuka setiap Sabtu pagi. Pendaftaran boleh dibuat di pejabat masjid.',
    now() - interval '12 days'
  );

insert into public.events (title, description, starts_at, ends_at, location)
values
  (
    'Majlis ilmu bulanan',
    'Ceramah dan sesi soal jawab bersama penceramah jemputan.',
    (date_trunc('day', now() at time zone 'Asia/Kuala_Lumpur') + interval '3 days 20 hours') at time zone 'Asia/Kuala_Lumpur',
    (date_trunc('day', now() at time zone 'Asia/Kuala_Lumpur') + interval '3 days 22 hours') at time zone 'Asia/Kuala_Lumpur',
    'Ruang utama masjid'
  ),
  (
    'Program tadarus keluarga',
    'Sesi tadarus dan tilawah bersama ahli keluarga.',
    (date_trunc('day', now() at time zone 'Asia/Kuala_Lumpur') + interval '10 days 9 hours') at time zone 'Asia/Kuala_Lumpur',
    (date_trunc('day', now() at time zone 'Asia/Kuala_Lumpur') + interval '10 days 11 hours') at time zone 'Asia/Kuala_Lumpur',
    'Dewan serbaguna'
  ),
  (
    'Gotong-royong kawasan masjid',
    'Kerja-kerja pembersihan dan penyelenggaraan kecil kawasan masjid.',
    (date_trunc('day', now() at time zone 'Asia/Kuala_Lumpur') + interval '17 days 8 hours') at time zone 'Asia/Kuala_Lumpur',
    (date_trunc('day', now() at time zone 'Asia/Kuala_Lumpur') + interval '17 days 12 hours') at time zone 'Asia/Kuala_Lumpur',
    'Perkarangan masjid'
  ),
  (
    'Majlis bacaan Yasin',
    'Majlis bacaan Yasin bersama jemaah kampung.',
    (date_trunc('day', now() at time zone 'Asia/Kuala_Lumpur') - interval '7 days' + interval '20 hours') at time zone 'Asia/Kuala_Lumpur',
    (date_trunc('day', now() at time zone 'Asia/Kuala_Lumpur') - interval '7 days' + interval '22 hours') at time zone 'Asia/Kuala_Lumpur',
    'Ruang utama masjid'
  );
