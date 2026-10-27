"use client";

import {
  Camera,
  Check,
  EnvelopeSimple,
  Key,
  Trash,
  WarningCircle,
  X,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";

import type { DashboardData } from "@/components/app/types";

export type IdentityInput = {
  fullName: string;
  avatarFile: File | null;
  removeAvatar: boolean;
};

type BusyAction = "identity" | "password" | "delete" | null;

function initials(name: string) {
  return (
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0])
      .join("") || "M"
  ).toUpperCase();
}

export function ProfileModal({
  open,
  profile,
  onClose,
  onSaveIdentity,
  onChangePassword,
  onDeleteAccount,
}: {
  open: boolean;
  profile: DashboardData["profile"];
  onClose: () => void;
  onSaveIdentity: (input: IdentityInput) => Promise<void>;
  onChangePassword: (currentPassword: string, password: string) => Promise<void>;
  onDeleteAccount: (password: string) => Promise<void>;
}) {
  return (
    <AnimatePresence>
      {open && (
        <ProfileModalPanel
          key={profile.id}
          profile={profile}
          onClose={onClose}
          onSaveIdentity={onSaveIdentity}
          onChangePassword={onChangePassword}
          onDeleteAccount={onDeleteAccount}
        />
      )}
    </AnimatePresence>
  );
}

function ProfileModalPanel({
  profile,
  onClose,
  onSaveIdentity,
  onChangePassword,
  onDeleteAccount,
}: {
  profile: DashboardData["profile"];
  onClose: () => void;
  onSaveIdentity: (input: IdentityInput) => Promise<void>;
  onChangePassword: (currentPassword: string, password: string) => Promise<void>;
  onDeleteAccount: (password: string) => Promise<void>;
}) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [busy, setBusy] = useState<BusyAction>(null);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletePassword, setDeletePassword] = useState("");

  useEffect(() => {
    return () => {
      if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    };
  }, [avatarPreview]);

  function setFeedback(text: string, error = false) {
    setMessage(text);
    setIsError(error);
  }

  function selectAvatar(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setFeedback("Yalnız JPG, PNG və ya WebP şəkli seç.", true);
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setFeedback("Profil şəkli 5 MB-dan kiçik olmalıdır.", true);
      return;
    }

    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
    setFeedback("");
  }

  function clearAvatar() {
    if (avatarPreview) URL.revokeObjectURL(avatarPreview);
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(true);
    setFeedback("");
  }

  async function saveIdentity(event: FormEvent) {
    event.preventDefault();
    const name = fullName.trim();
    if (name.length < 2 || name.length > 80) {
      setFeedback("Ad və soyad 2–80 simvol arasında olmalıdır.", true);
      return;
    }

    setBusy("identity");
    setFeedback("");
    try {
      await onSaveIdentity({ fullName: name, avatarFile, removeAvatar });
      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);
      setFeedback("Profil məlumatların yeniləndi.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Profil yenilənmədi.",
        true,
      );
    } finally {
      setBusy(null);
    }
  }

  async function changePassword(event: FormEvent) {
    event.preventDefault();
    if (!currentPassword) {
      setFeedback("Cari şifrəni yaz.", true);
      return;
    }
    if (password.length < 8) {
      setFeedback("Yeni şifrə ən azı 8 simvol olmalıdır.", true);
      return;
    }
    if (password !== passwordConfirm) {
      setFeedback("Şifrə təsdiqi uyğun gəlmir.", true);
      return;
    }

    setBusy("password");
    setFeedback("");
    try {
      await onChangePassword(currentPassword, password);
      setCurrentPassword("");
      setPassword("");
      setPasswordConfirm("");
      setFeedback("Şifrən yeniləndi.");
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Şifrə yenilənmədi.",
        true,
      );
    } finally {
      setBusy(null);
    }
  }

  async function deleteAccount() {
    if (deleteConfirm !== "SİL" || !deletePassword) return;
    setBusy("delete");
    setFeedback("");
    try {
      await onDeleteAccount(deletePassword);
    } catch (error) {
      setFeedback(
        error instanceof Error ? error.message : "Hesab silinmədi.",
        true,
      );
      setBusy(null);
    }
  }

  const displayedAvatar = removeAvatar
    ? null
    : avatarPreview || profile.avatarUrl;

  return (
    <motion.div
      className="modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !busy) onClose();
      }}
    >
      <motion.div
        className="profile-modal"
        initial={{ y: 26, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 18, opacity: 0, scale: 0.98 }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="profile-modal-title"
      >
        <div className="modal-heading profile-modal-heading">
          <div>
            <h2 id="profile-modal-title">Profilini düzənlə</h2>
            <p>Hesabın və Minima-da necə göründüyün burada idarə olunur.</p>
          </div>
          <button type="button" onClick={onClose} disabled={Boolean(busy)} aria-label="Bağla">
            <X size={20} weight="bold" />
          </button>
        </div>

        {message && (
          <div className={`profile-feedback ${isError ? "is-error" : ""}`}>
            {isError ? <WarningCircle size={18} /> : <Check size={18} weight="bold" />}
            {message}
          </div>
        )}

        <form className="profile-section identity-section" onSubmit={saveIdentity}>
          <div className="profile-section-heading">
            <span>Şəxsi məlumatlar</span>
            <small>Ad və profil şəkli</small>
          </div>
          <div className="profile-photo-row">
            <div
              className={`profile-photo ${displayedAvatar ? "has-image" : ""}`}
              style={
                displayedAvatar
                  ? { backgroundImage: `url(${JSON.stringify(displayedAvatar)})` }
                  : undefined
              }
              role="img"
              aria-label="Profil şəkli"
            >
              {!displayedAvatar && initials(fullName)}
            </div>
            <div className="profile-photo-actions">
              <label>
                <Camera size={17} weight="duotone" /> Şəkil seç
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={selectAvatar}
                  disabled={Boolean(busy)}
                />
              </label>
              {(profile.avatarUrl || avatarPreview) && !removeAvatar && (
                <button type="button" onClick={clearAvatar} disabled={Boolean(busy)}>
                  Sil
                </button>
              )}
              <small>JPG, PNG və ya WebP · maksimum 5 MB</small>
            </div>
          </div>
          <label className="profile-field">
            <span>Ad və soyad</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              autoComplete="name"
              maxLength={80}
              disabled={Boolean(busy)}
            />
          </label>
          <button className="profile-save-button" type="submit" disabled={Boolean(busy)}>
            {busy === "identity" ? "Saxlanılır…" : "Profili yadda saxla"}
          </button>
        </form>

        <div className="profile-settings-grid">
          <div className="profile-section">
            <div className="profile-section-icon is-email">
              <EnvelopeSimple size={20} weight="duotone" />
            </div>
            <div className="profile-section-heading">
              <span>E-poçt</span>
              <small>Hələlik dəyişdirilə bilmir</small>
            </div>
            <label className="profile-field">
              <span>Hesab e-poçtu</span>
              <input type="email" value={profile.email} readOnly />
            </label>
          </div>

          <form className="profile-section" onSubmit={changePassword}>
            <div className="profile-section-icon is-password">
              <Key size={20} weight="duotone" />
            </div>
            <div className="profile-section-heading">
              <span>Şifrə</span>
              <small>Ən azı 8 simvol</small>
            </div>
            <label className="profile-field">
              <span>Cari şifrə</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={Boolean(busy)}
              />
            </label>
            <label className="profile-field">
              <span>Yeni şifrə</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={Boolean(busy)}
              />
            </label>
            <label className="profile-field">
              <span>Şifrəni təsdiqlə</span>
              <input
                type="password"
                value={passwordConfirm}
                onChange={(event) => setPasswordConfirm(event.target.value)}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={Boolean(busy)}
              />
            </label>
            <button className="profile-secondary-button" type="submit" disabled={Boolean(busy)}>
              {busy === "password" ? "Yenilənir…" : "Şifrəni yenilə"}
            </button>
          </form>
        </div>

        <section className={`profile-danger ${deleteOpen ? "is-open" : ""}`}>
          <div>
            <span>
              <Trash size={19} weight="duotone" />
            </span>
            <div>
              <strong>Hesabı sil</strong>
              <p>Bütün profil, vərdiş, əhval və tamamlanma məlumatların silinəcək.</p>
            </div>
          </div>
          {deleteOpen ? (
            <div className="profile-delete-confirm">
              <label className="profile-field">
                <span>Cari şifrən</span>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(event) => setDeletePassword(event.target.value)}
                  autoComplete="current-password"
                  disabled={Boolean(busy)}
                />
              </label>
              <label className="profile-field">
                <span>Təsdiq üçün SİL yaz</span>
                <input
                  value={deleteConfirm}
                  onChange={(event) => setDeleteConfirm(event.target.value)}
                  autoComplete="off"
                  disabled={Boolean(busy)}
                />
              </label>
              <div>
                <button type="button" onClick={() => setDeleteOpen(false)} disabled={Boolean(busy)}>
                  Ləğv et
                </button>
                <button
                  type="button"
                  className="confirm-delete-button"
                  onClick={deleteAccount}
                  disabled={deleteConfirm !== "SİL" || !deletePassword || Boolean(busy)}
                >
                  {busy === "delete" ? "Silinir…" : "Hesabı birdəfəlik sil"}
                </button>
              </div>
            </div>
          ) : (
            <button type="button" onClick={() => setDeleteOpen(true)} disabled={Boolean(busy)}>
              Silmə seçimlərini aç
            </button>
          )}
        </section>
      </motion.div>
    </motion.div>
  );
}
