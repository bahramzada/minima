"use client";

import {
  Check,
  Clock,
  House,
  Lightning,
  PencilSimple,
  Plus,
  SignOut,
  Sparkle,
  TrendUp,
  UserCircle,
} from "@phosphor-icons/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Brand } from "@/components/brand";
import {
  HabitModal,
  type HabitInput,
} from "@/components/app/habit-modal";
import {
  ProfileModal,
  type IdentityInput,
} from "@/components/app/profile-modal";
import { SuccessOverlay } from "@/components/app/success-overlay";
import type { DashboardData, Habit } from "@/components/app/types";
import {
  changePassword as changeAccountPassword,
  logout as signOut,
} from "@/lib/api/client";
import {
  deleteAccount,
  insertHabit,
  patchHabit,
  patchProfile,
  removeAvatar,
  removeHabit,
  saveMoodLog,
  setHabitCompletion,
  uploadAvatar,
} from "@/lib/api/dashboard";
import { dateRange } from "@/lib/utils/date";

type Screen = "home" | "ai" | "profile";

const moodChoices = [
  { emoji: "😴", label: "Yorğun", level: 0 },
  { emoji: "😰", label: "Stresli", level: 1 },
  { emoji: "😐", label: "Həvəssiz", level: 2 },
  { emoji: "🙂", label: "Yaxşı", level: 3 },
  { emoji: "🤩", label: "Əla", level: 4 },
];

const moodColors = ["#e7e6dd", "#d7e0c4", "#b3c795", "#86a262", "#5a6b49"];

const habitTints = ["#eef1e4", "#eef3e2", "#e4eef1", "#f1e9e4"];

const analyticsTargets = {
  completions: 5,
  moodDays: 3,
};

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

export function MinimaApp({ initialData }: { initialData: DashboardData }) {
  const router = useRouter();
  const [data, setData] = useState(initialData);
  const [screen, setScreen] = useState<Screen>("home");
  const [success, setSuccess] = useState({ visible: false, emoji: "🌿" });
  const [notice, setNotice] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
  const [modalBusy, setModalBusy] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const today = data.today;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [screen]);

  function showNotice(message: string) {
    setNotice(message);
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(""), 3200);
  }

  function showSuccess(emoji: string) {
    setSuccess({ visible: true, emoji });
    if (successTimer.current) clearTimeout(successTimer.current);
    successTimer.current = setTimeout(
      () => setSuccess((current) => ({ ...current, visible: false })),
      1500,
    );
  }

  async function toggleHabit(habit: Habit) {
    const nextCompleted = !habit.completedToday;
    const previousData = data;

    setData((current) => ({
      ...current,
      habits: current.habits.map((item) =>
        item.id === habit.id
          ? { ...item, completedToday: nextCompleted }
          : item,
      ),
      stats: {
        ...current.stats,
        completedTotal: Math.max(
          0,
          current.stats.completedTotal + (nextCompleted ? 1 : -1),
        ),
      },
    }));

    if (nextCompleted) showSuccess(habit.emoji);

    try {
      const streakCount = await setHabitCompletion(habit.id, today, nextCompleted);
      setData((current) => ({
        ...current,
        profile: { ...current.profile, streakCount },
      }));
    } catch (error) {
      setData(previousData);
      showNotice(error instanceof Error ? error.message : "Dəyişiklik saxlanmadı.");
    }
  }

  function openCreateModal() {
    setEditingHabit(null);
    setModalOpen(true);
  }

  function openEditModal(habit: Habit) {
    setEditingHabit(habit);
    setModalOpen(true);
  }

  async function saveHabit(input: HabitInput) {
    setModalBusy(true);
    try {
      if (editingHabit) {
        await patchHabit(editingHabit.id, input);
        setData((current) => ({
          ...current,
          habits: current.habits.map((habit) =>
            habit.id === editingHabit.id ? { ...habit, ...input } : habit,
          ),
        }));
        showNotice("Minimal yeniləndi.");
      } else {
        const habit = await insertHabit(input);
        setData((current) => ({
          ...current,
          habits: [...current.habits, habit],
          stats: {
            ...current.stats,
            activeHabits: current.stats.activeHabits + 1,
          },
        }));
        showNotice("Yeni minimal əlavə edildi.");
      }
      setModalOpen(false);
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Dəyişiklik saxlanmadı.");
    } finally {
      setModalBusy(false);
    }
  }

  async function deleteHabit() {
    if (!editingHabit) return;
    setModalBusy(true);
    try {
      await removeHabit(editingHabit.id);
      setData((current) => ({
        ...current,
        habits: current.habits.filter((habit) => habit.id !== editingHabit.id),
        stats: {
          ...current.stats,
          activeHabits: Math.max(0, current.stats.activeHabits - 1),
        },
      }));
      setModalOpen(false);
      showNotice("Minimal silindi.");
    } catch (error) {
      showNotice(error instanceof Error ? error.message : "Minimal silinmədi.");
    } finally {
      setModalBusy(false);
    }
  }

  async function saveMood(emoji: string, level: number) {
    const previous = data.moodLogs;
    setData((current) => ({
      ...current,
      moodLogs: [
        ...current.moodLogs.filter((mood) => mood.date !== today),
        { date: today, emoji, level },
      ],
    }));
    showNotice(`Bugünkü əhvalın ${emoji} kimi yadda saxlandı.`);

    try {
      await saveMoodLog(today, emoji, level);
    } catch (error) {
      setData((current) => ({ ...current, moodLogs: previous }));
      showNotice(error instanceof Error ? error.message : "Əhval saxlanmadı.");
    }
  }

  async function logout() {
    await signOut();
    router.push("/");
  }

  async function saveIdentity(input: IdentityInput) {
    await patchProfile({ fullName: input.fullName });

    let avatarUrl = data.profile.avatarUrl;
    if (input.removeAvatar) {
      await removeAvatar();
      avatarUrl = null;
    } else if (input.avatarFile) {
      avatarUrl = await uploadAvatar(input.avatarFile);
    }

    setData((current) => ({
      ...current,
      profile: { ...current.profile, fullName: input.fullName, avatarUrl },
    }));
  }

  async function deleteProfileAccount(password: string) {
    await deleteAccount(password);
    await signOut();
    router.push("/");
  }

  const regularDone = data.habits.filter((habit) => habit.completedToday).length;
  const allDone = data.habits.length > 0 && regularDone === data.habits.length;
  const firstName = data.profile.fullName.split(" ")[0] || "Dost";
  const activeWeekDays = data.weeklyActivity.filter(Boolean).length;
  const todayMood = data.moodLogs.find((mood) => mood.date === today);
  const moodDaysTracked = new Set(data.moodLogs.map((mood) => mood.date)).size;
  const hasAnalyticsData =
    data.stats.completedTotal >= analyticsTargets.completions &&
    moodDaysTracked >= analyticsTargets.moodDays;
  const analyticsProgress = Math.round(
    ((Math.min(data.stats.completedTotal, analyticsTargets.completions) /
      analyticsTargets.completions +
      Math.min(moodDaysTracked, analyticsTargets.moodDays) /
        analyticsTargets.moodDays) /
      2) *
      100,
  );
  const moodByDate = useMemo(
    () => new Map(data.moodLogs.map((mood) => [mood.date, mood])),
    [data.moodLogs],
  );
  const moodDates = useMemo(() => dateRange(today, 119), [today]);

  const navItems = [
    { key: "home" as const, label: "Əsas", Icon: House },
    { key: "ai" as const, label: "Tapşırıq Tap", short: "Tapşırıq", Icon: Lightning },
    { key: "profile" as const, label: "Profil", Icon: UserCircle },
  ];

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <Brand href="/app" />
        </div>
        <nav aria-label="Əsas naviqasiya">
          {navItems.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={screen === key ? "is-active" : ""}
              onClick={() => setScreen(key)}
            >
              <Icon size={20} weight={screen === key ? "fill" : "regular"} />
              {label}
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="streak-panel">
            <small>Cari seriya</small>
            <div>
              <span>🔥</span>
              <strong>{data.profile.streakCount}</strong>
              <em>gün</em>
            </div>
          </div>
          <div className="sidebar-user">
            <button
              className="sidebar-profile-button"
              onClick={() => setProfileModalOpen(true)}
              aria-label="Profili düzənlə"
            >
              <span
                className={data.profile.avatarUrl ? "has-image" : ""}
                style={
                  data.profile.avatarUrl
                    ? {
                        backgroundImage: `url(${JSON.stringify(data.profile.avatarUrl)})`,
                      }
                    : undefined
                }
              >
                {!data.profile.avatarUrl && initials(data.profile.fullName)}
              </span>
              <div>
                <strong>{data.profile.fullName}</strong>
                <small>Pulsuz plan</small>
              </div>
            </button>
            <button
              className="sidebar-logout-button"
              onClick={logout}
              aria-label="Çıxış et"
              title="Çıxış et"
            >
              <SignOut size={17} />
            </button>
          </div>
        </div>
      </aside>

      <section className="app-main">
        <div className="app-content">
          <header className="app-header">
            <div>
              <h1>Salam, {firstName} 🌿</h1>
              <p>
                <span className="desktop-only">Bu gün · </span>
                {regularDone}/{data.habits.length} tamamlandı
              </p>
            </div>
            <div className="header-badges">
              <span className="streak-badge">🔥 {data.profile.streakCount}</span>
              <button
                className={`avatar-badge ${data.profile.avatarUrl ? "has-image" : ""}`}
                style={
                  data.profile.avatarUrl
                    ? {
                        backgroundImage: `url(${JSON.stringify(data.profile.avatarUrl)})`,
                      }
                    : undefined
                }
                onClick={() => setProfileModalOpen(true)}
                aria-label="Profili düzənlə"
              >
                {!data.profile.avatarUrl && initials(data.profile.fullName)}
              </button>
            </div>
          </header>

          <motion.div
            key={screen}
            initial={{ opacity: 0, y: 7 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.22 }}
          >
            {screen === "home" && (
              <section className="home-screen">
                {allDone ? (
                  <div className="all-done-state">
                    <span>🎉</span>
                    <h2>Bugünü bağladın!</h2>
                    <p>
                      Bütün minimalları tamamladın. Seriyan artdı — sabah yenə
                      görüşərik.
                    </p>
                    <strong>🔥 {data.profile.streakCount} günlük seriya</strong>
                  </div>
                ) : data.habits.length === 0 ? (
                  <div className="empty-state">
                    <span>🌱</span>
                    <h2>İlk minimal vərdişini seç</h2>
                    <p>
                      Gündə cəmi 5–10 dəqiqə. Birini seç, qalanını Minima izləsin.
                    </p>
                    <div>
                      <i>📖 Kitab</i>
                      <i>🚶 Gəzinti</i>
                      <i>💧 Su</i>
                      <i>🧘 Meditasiya</i>
                    </div>
                    <button onClick={openCreateModal}>
                      <Plus size={17} weight="bold" /> Vərdiş əlavə et
                    </button>
                  </div>
                ) : (
                  <div className="home-grid">
                    <div className="habits-column">
                      <div className="section-heading-row">
                        <span>Bu günün minimalları</span>
                        <button onClick={openCreateModal}>
                          <Plus size={15} weight="bold" /> Əlavə et
                        </button>
                      </div>
                      <div className="habit-list">
                        {data.habits.map((habit, index) => (
                          <motion.div
                            layout
                            key={habit.id}
                            className={`habit-row ${habit.completedToday ? "is-done" : ""}`}
                          >
                            <button
                              className="habit-toggle"
                              onClick={() => toggleHabit(habit)}
                              aria-label={`${habit.title} — ${habit.completedToday ? "tamamlanmanı ləğv et" : "tamamla"}`}
                            >
                              <span
                                className="habit-emoji"
                                style={{
                                  backgroundColor: habit.completedToday
                                    ? "#6b7d5a"
                                    : habitTints[index % habitTints.length],
                                }}
                              >
                                {habit.emoji}
                              </span>
                              <span className="habit-copy">
                                <strong>{habit.title}</strong>
                                <small>{habit.subtitle}</small>
                              </span>
                              <span className="habit-check">
                                {habit.completedToday && <Check size={16} weight="bold" />}
                              </span>
                            </button>
                            <button
                              className="habit-edit"
                              onClick={() => openEditModal(habit)}
                              aria-label={`${habit.title} redaktə et`}
                            >
                              <PencilSimple size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <aside className="home-insights">
                      <div className="week-card">
                        <div>
                          <strong>Bu həftə</strong>
                          <span>{activeWeekDays}/7 gün</span>
                        </div>
                        <div className="week-bars">
                          {data.weeklyActivity.map((active, index) => (
                            <div key={index}>
                              <i
                                style={{
                                  height: `${active ? [62, 80, 45, 90, 70, 100, 55][index] : 22}%`,
                                  backgroundColor: index >= 5 ? "#dfe4d4" : "#6b7d5a",
                                  opacity: active ? 1 : 0.45,
                                }}
                              />
                              <small>{["B", "Ç", "Ç", "C", "C", "Ş", "B"][index]}</small>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="tip-card">
                        <small>İpucu</small>
                        <p>
                          Kiçik saxla. Bir minimal — 5 dəqiqədən çox çəkməməlidir.
                          🌱
                        </p>
                      </div>
                    </aside>
                  </div>
                )}
              </section>
            )}

            {screen === "ai" && (
              <section className="ai-screen">
                <div className="chat-card">
                  <header>
                    <span>
                      <Lightning size={22} weight="fill" />
                    </span>
                    <div>
                      <h2>Mənə Tapşırıq Tap</h2>
                      <p>Əhvalını de — sənə 2 dəqiqəlik reaksiya tapım</p>
                    </div>
                  </header>
                  <div className="empty-state">
                    <span>✨</span>
                    <h2>Tezliklə qayıdır</h2>
                    <p>
                      AI köməkçi yeni serverə köçürülür. Hələlik əhvalını qeyd et,
                      vərdişlərini tamamla — seriyan işləyir.
                    </p>
                  </div>
                </div>
              </section>
            )}

            {screen === "profile" && (
              <section className="profile-screen">
                <div className="stats-grid">
                  <article>
                    <strong>{data.profile.streakCount}</strong>
                    <small>Ardıcıl gün</small>
                  </article>
                  <article>
                    <strong>{data.stats.completedTotal}</strong>
                    <small>Tamamlanan</small>
                  </article>
                  <article>
                    <strong className="accent-stat">
                      {data.stats.monthlyConsistency}%
                    </strong>
                    <small>Bu ay ardıcıllıq</small>
                  </article>
                  <article>
                    <strong>{data.stats.activeHabits}</strong>
                    <small>Aktiv vərdiş</small>
                  </article>
                </div>

                <div className="profile-grid">
                  <article className="mood-card">
                    <div className="mood-heading">
                      <div>
                        <h2>Əhval təqvimi</h2>
                        <span>son 17 həftə</span>
                      </div>
                      <div className="today-mood">
                        <small>Bu gün</small>
                        {moodChoices.map((mood) => (
                          <button
                            key={mood.label}
                            className={todayMood?.emoji === mood.emoji ? "is-selected" : ""}
                            onClick={() => saveMood(mood.emoji, mood.level)}
                            aria-pressed={todayMood?.emoji === mood.emoji}
                            aria-label={`Bugünkü əhval: ${mood.label}`}
                            title={mood.label}
                          >
                            {mood.emoji}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="mood-grid" aria-label="17 həftəlik əhval təqvimi">
                      {moodDates.map((date) => {
                        const mood = moodByDate.get(date);
                        return (
                          <span
                            key={date}
                            className={date === today ? "is-today" : ""}
                            style={{
                              backgroundColor: mood
                                ? moodColors[mood.level]
                                : moodColors[0],
                            }}
                            title={`${date}${mood ? ` · ${mood.emoji}` : ""}`}
                          />
                        );
                      })}
                    </div>
                    <div className="mood-legend">
                      Az
                      {moodColors.map((color) => (
                        <i key={color} style={{ backgroundColor: color }} />
                      ))}
                      Çox
                    </div>
                  </article>

                  <aside className="analytics-column">
                    <h2>AI Analitika ✨</h2>
                    {hasAnalyticsData ? (
                      <>
                        <article className="analytics-card">
                          <strong>
                            Bu həftə <span>{activeWeekDays}/7 gün</span> minimal
                            tamamlamısan.
                          </strong>
                          <div aria-label={`${activeWeekDays} aktiv gün`}>
                            {data.weeklyActivity.map((active, index) => (
                              <i
                                key={index}
                                style={{
                                  height: active ? "100%" : "22%",
                                  backgroundColor: active
                                    ? "#dff0c2"
                                    : "rgba(255,255,255,.28)",
                                }}
                              />
                            ))}
                          </div>
                        </article>
                        <article className="timing-card">
                          <span>
                            <Check size={21} weight="bold" />
                          </span>
                          <p>
                            Ümumilikdə <strong>{data.stats.completedTotal} minimal</strong>{" "}
                            tamamlamısan.
                          </p>
                        </article>
                        <article className="progress-insight">
                          <span>
                            <TrendUp size={20} weight="duotone" />
                          </span>
                          <p>
                            Bu ay ardıcıllığın <strong>{data.stats.monthlyConsistency}%</strong>,
                            əhval qeydin isə {moodDaysTracked} gündür.
                          </p>
                        </article>
                      </>
                    ) : (
                      <article className="analytics-empty">
                        <span className="analytics-empty-icon">
                          <Sparkle size={23} weight="fill" />
                        </span>
                        <strong>Şəxsi analiz üçün bir az məlumat lazımdır</strong>
                        <p>
                          Minimallarını tamamla və əhvalını qeyd et. İlk nəticələr
                          avtomatik burada görünəcək.
                        </p>
                        <div className="analytics-requirements">
                          <div
                            className={
                              data.stats.completedTotal >= analyticsTargets.completions
                                ? "is-complete"
                                : ""
                            }
                          >
                            <span>
                              <Check size={16} weight="bold" /> Minimal tamamla
                            </span>
                            <strong>
                              {Math.min(
                                data.stats.completedTotal,
                                analyticsTargets.completions,
                              )}
                              /{analyticsTargets.completions}
                            </strong>
                          </div>
                          <div
                            className={
                              moodDaysTracked >= analyticsTargets.moodDays
                                ? "is-complete"
                                : ""
                            }
                          >
                            <span>
                              <Clock size={16} weight="duotone" /> Əhvalını qeyd et
                            </span>
                            <strong>
                              {Math.min(moodDaysTracked, analyticsTargets.moodDays)}/
                              {analyticsTargets.moodDays} gün
                            </strong>
                          </div>
                        </div>
                        <div
                          className="analytics-progress"
                          aria-label={`Analitika üçün məlumat ${analyticsProgress}% tamamlanıb`}
                        >
                          <i style={{ width: `${analyticsProgress}%` }} />
                        </div>
                      </article>
                    )}
                    <button
                      className="profile-settings-button"
                      onClick={() => setProfileModalOpen(true)}
                    >
                      <PencilSimple size={17} /> Profili düzənlə
                    </button>
                    <button className="logout-button" onClick={logout}>
                      <SignOut size={17} /> Çıxış et
                    </button>
                  </aside>
                </div>
              </section>
            )}
          </motion.div>
        </div>
      </section>

      <nav className="bottom-nav" aria-label="Mobil naviqasiya">
        {navItems.map(({ key, short, label, Icon }) => (
          <button
            key={key}
            className={screen === key ? "is-active" : ""}
            onClick={() => setScreen(key)}
          >
            <span>
              <Icon size={20} weight={screen === key ? "fill" : "regular"} />
            </span>
            {short || label}
          </button>
        ))}
      </nav>

      <HabitModal
        open={modalOpen}
        habit={editingHabit}
        busy={modalBusy}
        onClose={() => setModalOpen(false)}
        onSave={saveHabit}
        onDelete={editingHabit ? deleteHabit : null}
      />
      <ProfileModal
        open={profileModalOpen}
        profile={data.profile}
        onClose={() => setProfileModalOpen(false)}
        onSaveIdentity={saveIdentity}
        onChangePassword={changeAccountPassword}
        onDeleteAccount={deleteProfileAccount}
      />
      <SuccessOverlay emoji={success.emoji} visible={success.visible} />
      {notice && <div className="toast-notice">{notice}</div>}
    </main>
  );
}
