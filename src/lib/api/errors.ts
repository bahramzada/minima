const messages: Record<string, string> = {
  network_error: "Şəbəkəyə qoşulmaq mümkün olmadı. Bağlantını yoxla.",
  api_unreachable: "Server hazırda əlçatan deyil. Bir az sonra yenidən yoxla.",
  invalid_credentials: "E-poçt və ya şifrə yanlışdır.",
  email_not_verified:
    "E-poçtunu hələ təsdiqləməmisən. Gələn məktubdakı linkə toxun.",
  account_locked: "Çox sayda uğursuz cəhd. Bir az sonra yenidən yoxla.",
  rate_limited: "Çox sorğu göndərildi. Bir az sonra yenidən yoxla.",
  invalid_token: "Link etibarsızdır və ya vaxtı keçib.",
  no_session: "Sessiyanın vaxtı bitib. Yenidən daxil ol.",
  validation_error: "Məlumat yanlışdır. Sahələri yoxlayıb yenidən cəhd et.",
  invalid_image: "Yalnız JPG, PNG və ya WebP şəkli seç.",
  payload_too_large: "Fayl çox böyükdür.",
  date_out_of_range: "Bu tarix üçün dəyişiklik edilə bilməz.",
  not_found: "Tapılmadı.",
};

/** User-facing Azerbaijani text for an API error code. */
export function localizedMessage(code: string) {
  return messages[code] ?? "Xəta baş verdi. Yenidən cəhd et.";
}
