export type PrayerZone = {
  code: string;
  state: string;
  district: string;
};

export const FALLBACK_ZONE = "SBH07";

export const prayerZones: PrayerZone[] = [
  { code: "JHR01", state: "Johor", district: "Pulau Aur dan Pulau Pemanggil" },
  { code: "JHR02", state: "Johor", district: "Johor Bahru, Kota Tinggi, Mersing, Kulai" },
  { code: "JHR03", state: "Johor", district: "Kluang, Pontian" },
  { code: "JHR04", state: "Johor", district: "Batu Pahat, Muar, Segamat, Gemas Johor, Tangkak" },
  { code: "KDH01", state: "Kedah", district: "Kota Setar, Kubang Pasu, Pokok Sena (Daerah Kecil)" },
  { code: "KDH02", state: "Kedah", district: "Kuala Muda, Yan, Pendang" },
  { code: "KDH03", state: "Kedah", district: "Padang Terap, Sik" },
  { code: "KDH04", state: "Kedah", district: "Baling" },
  { code: "KDH05", state: "Kedah", district: "Bandar Baharu, Kulim" },
  { code: "KDH06", state: "Kedah", district: "Langkawi" },
  { code: "KDH07", state: "Kedah", district: "Puncak Gunung Jerai" },
  { code: "KTN01", state: "Kelantan", district: "Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai, Mukim Chiku" },
  { code: "KTN02", state: "Kelantan", district: "Gua Musang (Daerah Galas dan Bertam), Jeli, Jajahan Kecil Lojing" },
  { code: "MLK01", state: "Melaka", district: "Seluruh negeri Melaka" },
  { code: "NGS01", state: "Negeri Sembilan", district: "Tampin, Jempol" },
  { code: "NGS02", state: "Negeri Sembilan", district: "Jelebu, Kuala Pilah, Rembau" },
  { code: "NGS03", state: "Negeri Sembilan", district: "Port Dickson, Seremban" },
  { code: "PHG01", state: "Pahang", district: "Pulau Tioman" },
  { code: "PHG02", state: "Pahang", district: "Kuantan, Pekan, Muadzam Shah" },
  { code: "PHG03", state: "Pahang", district: "Jerantut, Temerloh, Maran, Bera, Chenor, Jengka" },
  { code: "PHG04", state: "Pahang", district: "Bentong, Lipis, Raub" },
  { code: "PHG05", state: "Pahang", district: "Genting Sempah, Janda Baik, Bukit Tinggi" },
  { code: "PHG06", state: "Pahang", district: "Cameron Highlands, Genting Highlands, Bukit Fraser" },
  { code: "PHG07", state: "Pahang", district: "Zon khas Daerah Rompin (Mukim Rompin, Mukim Endau, Mukim Pontian)" },
  { code: "PRK01", state: "Perak", district: "Tapah, Slim River, Tanjung Malim" },
  { code: "PRK02", state: "Perak", district: "Kuala Kangsar, Sg. Siput, Ipoh, Batu Gajah, Kampar" },
  { code: "PRK03", state: "Perak", district: "Lenggong, Pengkalan Hulu, Grik" },
  { code: "PRK04", state: "Perak", district: "Temengor, Belum" },
  { code: "PRK05", state: "Perak", district: "Kampung Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor" },
  { code: "PRK06", state: "Perak", district: "Selama, Taiping, Bagan Serai, Parit Buntar" },
  { code: "PRK07", state: "Perak", district: "Bukit Larut" },
  { code: "PLS01", state: "Perlis", district: "Seluruh negeri Perlis" },
  { code: "PNG01", state: "Pulau Pinang", district: "Seluruh negeri Pulau Pinang" },
  { code: "SBH01", state: "Sabah", district: "Bahagian Sandakan (Timur), Bukit Garam, Semawang, Temanggong, Tambisan, Bandar Sandakan, Sukau" },
  { code: "SBH02", state: "Sabah", district: "Beluran, Telupid, Pinangah, Terusan, Kuamut, Bahagian Sandakan (Barat)" },
  { code: "SBH03", state: "Sabah", district: "Lahad Datu, Silabukan, Kunak, Sahabat, Semporna, Tungku, Bahagian Tawau (Timur)" },
  { code: "SBH04", state: "Sabah", district: "Bandar Tawau, Balong, Merotai, Kalabakan, Bahagian Tawau (Barat)" },
  { code: "SBH05", state: "Sabah", district: "Kudat, Kota Marudu, Pitas, Pulau Banggi, Bahagian Kudat" },
  { code: "SBH06", state: "Sabah", district: "Gunung Kinabalu" },
  { code: "SBH07", state: "Sabah", district: "Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan, Bahagian Pantai Barat" },
  { code: "SBH08", state: "Sabah", district: "Pensiangan, Keningau, Tambunan, Nabawan, Bahagian Pendalaman (Atas)" },
  { code: "SBH09", state: "Sabah", district: "Beaufort, Kuala Penyu, Sipitang, Tenom, Long Pasia, Membakut, Weston, Bahagian Pendalaman (Bawah)" },
  { code: "SWK01", state: "Sarawak", district: "Limbang, Lawas, Sundar, Trusan" },
  { code: "SWK02", state: "Sarawak", district: "Miri, Niah, Bekenu, Sibuti, Marudi" },
  { code: "SWK03", state: "Sarawak", district: "Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu" },
  { code: "SWK04", state: "Sarawak", district: "Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit" },
  { code: "SWK05", state: "Sarawak", district: "Sarikei, Matu, Julau, Rajang, Daro, Bintangor, Belawai" },
  { code: "SWK06", state: "Sarawak", district: "Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkelili, Betong, Spaoh, Pusa, Saratok" },
  { code: "SWK07", state: "Sarawak", district: "Serian, Simunjan, Samarahan, Sebuyau, Meludam" },
  { code: "SWK08", state: "Sarawak", district: "Kuching, Bau, Lundu, Sematan" },
  { code: "SWK09", state: "Sarawak", district: "Zon khas (Kampung Patarikan)" },
  { code: "SGR01", state: "Selangor", district: "Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Shah Alam" },
  { code: "SGR02", state: "Selangor", district: "Kuala Selangor, Sabak Bernam" },
  { code: "SGR03", state: "Selangor", district: "Klang, Kuala Langat" },
  { code: "TRG01", state: "Terengganu", district: "Kuala Terengganu, Marang, Kuala Nerus" },
  { code: "TRG02", state: "Terengganu", district: "Besut, Setiu" },
  { code: "TRG03", state: "Terengganu", district: "Hulu Terengganu" },
  { code: "TRG04", state: "Terengganu", district: "Dungun, Kemaman" },
  { code: "WLY01", state: "Wilayah Persekutuan", district: "Kuala Lumpur, Putrajaya" },
  { code: "WLY02", state: "Wilayah Persekutuan", district: "Labuan" },
];

export const zonesByState = prayerZones.reduce<
  { state: string; zones: PrayerZone[] }[]
>((groups, zone) => {
  const group = groups.find((item) => item.state === zone.state);

  if (group) {
    group.zones.push(zone);
  } else {
    groups.push({ state: zone.state, zones: [zone] });
  }

  return groups;
}, []);

export function findZone(code: string | undefined | null) {
  return prayerZones.find((zone) => zone.code === code) ?? null;
}

export function zoneLabel(zone: PrayerZone) {
  return `${zone.district} (${zone.code})`;
}
