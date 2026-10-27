insert into public.site_settings (
  id,
  mosque_name,
  prayer_zone,
  donation_note
)
values (
  true,
  'Masjid Al-Amin',
  'SBH07',
  'Sumbangan anda membantu operasi masjid dan program komuniti.'
)
on conflict (id) do nothing;
