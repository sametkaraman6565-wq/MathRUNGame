import { useEffect, useState, useRef } from "react";
import { 
  DndContext, 
  useSensor, 
  useSensors, 
  MouseSensor, 
  TouchSensor 
} from "@dnd-kit/core"; 
import type { DragEndEvent } from "@dnd-kit/core";
import { generateEquation } from "./utils/generateEquation";
import type { Difficulty, Equation } from "./types";
import { EquationView } from "./components/EquationView";
import { NumberTile } from "./components/NumberTile";
import { Logo } from "./components/Logo";
import { saveScoreToFirebase } from "./utils/firebaseUtils";
import { Auth } from "./components/Auth";
import { GlobalLeaderboard } from "./components/GlobalLeaderboard";
import { PasswordResetConfirm } from "./components/PasswordResetConfirm";
import { auth, db } from "./firebase";
import { onAuthStateChanged, signOut, sendEmailVerification, updateProfile } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
// HATA ÇÖZÜMÜ: Süslü parantez eklendi { Filter }
import { Filter } from 'bad-words'; 
// HATA ÇÖZÜMÜ: Dosya ismini game.css olarak güncelledik (Vercel için)
import "./styles/game.css"; 

// --- TİP TANIMLAMALARI ---
type TimeDifficulty = "easy" | "medium" | "hard";

const ADMIN_EMAIL = "sametkaraman0102@gmail.com"; 

// --- FİLTRE AYARLARI ---
const filter = new Filter();
// Türkçe kötü kelimeleri buraya ekleyebilirsin
filter.addWords("küfür1", "küfür2","yönetici", "system"); 

const REGIONS = [
  { code: "GLOBAL", flag: "🌍" },
  { code: "TR", flag: "🇹🇷" },
  { code: "AZ", flag: "🇦🇿" },
  { code: "US", flag: "🇺🇸" },
  { code: "DE", flag: "🇩🇪" },
  { code: "FR", flag: "🇫🇷" },
  { code: "GB", flag: "🇬🇧" },
  { code: "JP", flag: "🇯🇵" },
  { code: "KR", flag: "🇰🇷" },
  { code: "CN", flag: "🇨🇳" },
  { code: "RU", flag: "🇷🇺" },
  { code: "BR", flag: "🇧🇷" },
  { code: "IT", flag: "🇮🇹" },
  { code: "ES", flag: "🇪🇸" },
  { code: "NL", flag: "🇳🇱" },
  { code: "CA", flag: "🇨🇦" },
  { code: "IN", flag: "🇮🇳" },
  { code: "SA", flag: "🇸🇦" },
  { code: "MX", flag: "🇲🇽" },
  { code: "AR", flag: "🇦🇷" },
  { code: "ID", flag: "🇮🇩" },
  { code: "PT", flag: "🇵🇹" },
];

const AVATARS = [
  "🧑‍🚀", "🦸", "🥷", "🧙‍♂️", "🧚‍♀️", "🧛", "🧞‍♂️", "🧟", 
  "🤖", "👽", "👻", "🤡", "💩", "💀", "👺", "🦄",
  "🐶", "🐱", "🦁", "🐯", "🐻", "🐨", "🐼", "🐸",
  "🧠", "⚡", "🔥", "💎", "🏆", "⚽", "🏀", "🎮",
  "🕵️‍♂️", "👮‍♀️", "👷‍♂️", "🤴", "👸", "👳‍♂️", "👲", "🧔",
  "🦊", "🐲", "🦖", "🐙", "🦋", "🦉", "🍄", "🌹"
];

const TRANSLATIONS = {
  tr: {
    title: "MATH RUN",
    leaderboard: "REKOR TABLOSU",
    local: "Yerel",
    menuSubtitle: "Matematik Koşusuna Hazır mısın?",
    modes: { normal: "PRATİK", normalDesc: "Süre yok, Puan yok, Sadece Pratik", timeAttack: "ZAMANA KARŞI", timeAttackDesc: "Süreyle Yarış!" },
    buttons: { exit: "ÇIKIŞ", back: "Geri Dön", mainMenu: "Ana Menü", pass: "PAS GEÇ", next: "SONRAKİ SORU", passRights: "Hakkın Var", debugOn: "Gizli Bilgi: AÇIK 🔓", debugOff: "Gizli Bilgi: KAPALI 🔒", confirmExitTitle: "Çıkış Yapılsın Mı?", confirmExitDesc: "Oyun sonlandırılacak ve puanın kaydedilecek.", confirmYes: "EVET, ÇIK", confirmNo: "HAYIR, DEVAM ET", globalLeaderboard: "DÜNYA SIRALAMASI 🌍", logout: "OTURUMU KAPAT", resendMail: "Doğrulama Mailini Tekrar Gönder", mailSent: "Mail gönderildi!", selectRegion: "Bölge Seç", editProfile: "Profili Düzenle", save: "KAYDET", saving: "KAYDEDİLİYOR..." },
    warnings: { emailNotVerified: "⚠️ E-posta adresin doğrulanmamış." },
    normalDiff: { title: "Pratik Seviyesi Seç", subtitle: "Hangi zorlukta çalışmak istersin?", easy: "1. SEVİYE", easyDesc: "Kolay işlemler", medium: "2. SEVİYE", mediumDesc: "Orta zorluk", hard: "3. SEVİYE", hardDesc: "Zorlu işlemler" },
    timeDiff: { title: "Süre Zorluğunu Seç", subtitle: "Zorluk arttıkça süre azalır, puan artar!", easy: "KOLAY SÜRE", easyDesc: "Bol vakit, x1 Puan", medium: "ORTA SÜRE", mediumDesc: "Dengeli, x3 Puan", hard: "ZOR SÜRE", hardDesc: "Çok Hızlı, x5 Puan" },
    game: { level: "Seviye", question: "Soru", repeat: "Tekrar", remaining: "Kalan", score: "Skor", passScore: "Hedef", timeElapsed: "Geçen Süre", timeLeft: "KALAN SÜRE", secret: "Gizli Bilgi: Cevap", shouldBe: "olmalı", endless: "Sonsuz" },
    messages: { correct: "Doğru!", wrong: "Yanlış!", timeBonus: "Süre Bonusu", passUsed: "Soru Pas Geçildi", skipped: "Soru Geçildi", points: "Puan", sn: "Sn", insufficient: "Puanın yetersiz. Hedef:", congratsEasy: "Tebrikler! 2. Seviyeye Geçildi 🚀", congratsMedium: "Harika! 3. Seviyeye Geçildi 🔥", won: "ŞAMPİYON!", wonDesc: "Tüm seviyeleri başarıyla tamamladın.", lost: "OYUN BİTTİ", timeUp: "Süre Doldu! ⌛", revisiting: "Pas geçilen sorulara dönülüyor! 🔄" },
    highScores: { easy: "Kolay", medium: "Orta", hard: "Zor" },
    timeModeTitles: { easy: "Rahat Zaman", medium: "Dengeli Zaman", hard: "Kaos Zamanı" },
    profile: { title: "PROFİL AYARLARI", selectAvatar: "Avatar Seç", selectRegion: "Bölge Seç", selectName: "İsim Değiştir", current: "Seçili" },
    regions: {
      GLOBAL: "Dünya", TR: "Türkiye", AZ: "Azerbaycan", US: "ABD", DE: "Almanya",
      FR: "Fransa", GB: "İngiltere", JP: "Japonya", KR: "Güney Kore", CN: "Çin",
      RU: "Rusya", BR: "Brezilya", IT: "İtalya", ES: "İspanya", NL: "Hollanda",
      CA: "Kanada", IN: "Hindistan", SA: "S. Arabistan", MX: "Meksika", AR: "Arjantin",
      ID: "Endonezya", PT: "Portekiz"
    }
  },
  en: {
    title: "MATH RUN",
    leaderboard: "HIGH SCORES",
    local: "Local",
    menuSubtitle: "Are you ready for the Math Run?",
    modes: { normal: "PRACTICE", normalDesc: "No Timer, No Score, Just Practice", timeAttack: "TIME ATTACK", timeAttackDesc: "Race against time!" },
    buttons: { exit: "EXIT", back: "Go Back", mainMenu: "Main Menu", pass: "PASS", next: "NEXT QUESTION", passRights: "Left", debugOn: "Secret Info: ON 🔓", debugOff: "Secret Info: OFF 🔒", confirmExitTitle: "Exit Game?", confirmExitDesc: "The game will end and your score will be saved.", confirmYes: "YES, EXIT", confirmNo: "NO, RESUME", globalLeaderboard: "WORLD LEADERBOARD 🌍", logout: "LOGOUT", resendMail: "Resend Verification Email", mailSent: "Email sent!", selectRegion: "Select Region", editProfile: "Edit Profile", save: "SAVE", saving: "SAVING..." },
    warnings: { emailNotVerified: "⚠️ Your email is not verified." },
    normalDiff: { title: "Select Practice Level", subtitle: "Choose your difficulty", easy: "LEVEL 1", easyDesc: "Easy operations", medium: "LEVEL 2", mediumDesc: "Medium difficulty", hard: "LEVEL 3", hardDesc: "Hard operations" },
    timeDiff: { title: "Select Time Difficulty", subtitle: "Harder difficulty means less time, more points!", easy: "EASY TIME", easyDesc: "Plenty of time, x1 Points", medium: "MEDIUM TIME", mediumDesc: "Balanced, x3 Points", hard: "HARD TIME", hardDesc: "Very Fast, x5 Points" },
    game: { level: "Level", question: "Q", repeat: "Revisit", remaining: "Left", score: "Score", passScore: "Target", timeElapsed: "Time Elapsed", timeLeft: "TIME LEFT", secret: "Secret Info: Answer should be", shouldBe: "", endless: "Endless" },
    messages: { correct: "Correct!", wrong: "Wrong!", timeBonus: "Time Bonus", passUsed: "Question Passed", skipped: "Question Skipped", points: "Pts", sn: "s", insufficient: "Insufficient score. Target:", congratsEasy: "Congrats! Moving to Level 2 🚀", congratsMedium: "Awesome! Moving to Level 3 🔥", won: "CHAMPION!", wonDesc: "You successfully completed all levels.", lost: "GAME OVER", timeUp: "Time's Up! ⌛", revisiting: "Revisiting passed questions! 🔄" },
    highScores: { easy: "Easy", medium: "Medium", hard: "Hard" },
    timeModeTitles: { easy: "Chill Time", medium: "Balanced Time", hard: "Chaos Time" },
    profile: { title: "PROFILE SETTINGS", selectAvatar: "Select Avatar", selectRegion: "Select Region", selectName: "Change Name", current: "Selected" },
    regions: {
      GLOBAL: "World", TR: "Turkey", AZ: "Azerbaijan", US: "USA", DE: "Germany",
      FR: "France", GB: "UK", JP: "Japan", KR: "South Korea", CN: "China",
      RU: "Russia", BR: "Brazil", IT: "Italy", ES: "Spain", NL: "Netherlands",
      CA: "Canada", IN: "India", SA: "Saudi Arabia", MX: "Mexico", AR: "Argentina",
      ID: "Indonesia", PT: "Portekiz"
    }
  }
};

const LEVEL_CONFIG = {
  easy: { id: 1, questionCount: 10, passThreshold: 40, correctPoints: 5, wrongPenalty: 0, passLimit: 2 },
  medium: { id: 2, questionCount: 20, passThreshold: 160, correctPoints: 7, wrongPenalty: 3, passLimit: 5 },
  hard: { id: 3, questionCount: 30, passThreshold: 450, correctPoints: 10, wrongPenalty: 5, passLimit: 7 }
};

const TIME_MODE_RULES: Record<TimeDifficulty, any> = {
  easy: { title: "Rahat Zaman", multiplier: 1, levels: { easy: { start: 10, bonus: 10 }, medium: { start: 20, bonus: 15 }, hard: { start: 30, bonus: 20 } } },
  medium: { title: "Dengeli Zaman", multiplier: 3, levels: { easy: { start: 7, bonus: 7 }, medium: { start: 15, bonus: 10 }, hard: { start: 20, bonus: 15 } } },
  hard: { title: "Kaos Zamanı", multiplier: 5, levels: { easy: { start: 5, bonus: 5 }, medium: { start: 10, bonus: 7 }, hard: { start: 15, bonus: 10 } } }
};

type GameState = "menu" | "timeDiffSelect" | "normalDiffSelect" | "playing" | "won" | "lost";
type QuestionPhase = "normal" | "revisiting"; 
type GameMode = "normal" | "timeAttack"; 
type Language = "tr" | "en"; 

// --- PROFİL DÜZENLEME MODALI ---
const ProfileSettingsModal = ({ 
  currentAvatar, 
  currentRegion, 
  currentName,
  onSave, 
  onClose,
  isLoading,
  t
}: { 
  currentAvatar: string, 
  currentRegion: string, 
  currentName: string,
  onSave: (av: string, reg: string, name: string) => void,
  onClose: () => void,
  isLoading: boolean,
  t: any 
}) => {
  const [tempAvatar, setTempAvatar] = useState(currentAvatar);
  const [tempRegion, setTempRegion] = useState(currentRegion);
  const [tempName, setTempName] = useState(currentName);
  const [activeTab, setActiveTab] = useState<"avatar" | "region" | "name">("avatar");

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", zIndex: 10000,
      display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(8px)"
    }}>
      <div className="game-card" style={{ maxWidth: "500px", width: "95%", padding: "25px", animation: "popIn 0.3s ease", background: "white" }}>
        <h2 style={{ textAlign: "center", color: "#3b82f6", margin: "0 0 20px 0" }}>{t.profile.title}</h2>
        
        <div style={{ display: "flex", gap: "5px", marginBottom: "20px" }}>
          <button onClick={() => setActiveTab("avatar")} className="universal-btn small" style={{ flex: 1, background: activeTab === "avatar" ? "#3b82f6" : "#f3f4f6", color: activeTab === "avatar" ? "white" : "#666" }}>{t.profile.selectAvatar}</button>
          <button onClick={() => setActiveTab("region")} className="universal-btn small" style={{ flex: 1, background: activeTab === "region" ? "#3b82f6" : "#f3f4f6", color: activeTab === "region" ? "white" : "#666" }}>{t.profile.selectRegion}</button>
          <button onClick={() => setActiveTab("name")} className="universal-btn small" style={{ flex: 1, background: activeTab === "name" ? "#3b82f6" : "#f3f4f6", color: activeTab === "name" ? "white" : "#666" }}>{t.profile.selectName}</button>
        </div>

        <div style={{ maxHeight: "40vh", overflowY: "auto", padding: "10px", background: "#f9fafb", borderRadius: "12px", border: "1px solid #eee" }}>
          
          {activeTab === "avatar" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(50px, 1fr))", gap: "10px" }}>
              {AVATARS.map((av) => (
                <button
                  key={av}
                  onClick={() => setTempAvatar(av)}
                  style={{
                    fontSize: "2rem",
                    background: tempAvatar === av ? "#dbeafe" : "white",
                    border: tempAvatar === av ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    cursor: "pointer",
                    padding: "5px",
                    transition: "transform 0.1s"
                  }}
                >
                  {av}
                </button>
              ))}
            </div>
          )}

          {activeTab === "region" && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: "10px" }}>
              {REGIONS.map((reg) => (
                <button
                  key={reg.code}
                  onClick={() => setTempRegion(reg.flag)}
                  style={{
                    display: "flex", flexDirection: "column", alignItems: "center",
                    background: tempRegion === reg.flag ? "#dbeafe" : "white",
                    border: tempRegion === reg.flag ? "2px solid #3b82f6" : "1px solid #e5e7eb",
                    borderRadius: "12px",
                    cursor: "pointer",
                    padding: "10px"
                  }}
                >
                  <span style={{ fontSize: "2rem" }}>{reg.flag}</span>
                  <span style={{ fontSize: "0.8rem", color: "#444", marginTop: "5px", fontWeight: "bold" }}>{t.regions[reg.code]}</span>
                </button>
              ))}
            </div>
          )}

          {activeTab === "name" && (
            <div style={{ padding: "10px", display: "flex", flexDirection: "column", gap: "10px" }}>
               <label style={{fontWeight: "bold", color: "#555"}}>Yeni Kullanıcı Adı:</label>
               <input 
                 type="text" 
                 value={tempName} 
                 onChange={(e) => setTempName(e.target.value)} 
                 placeholder="İsim girin..."
                 maxLength={15}
                 style={{padding: "15px", borderRadius: "10px", border: "1px solid #ccc", fontSize: "1.1rem"}}
               />
               <small style={{color: "#666"}}>En az 3 karakter olmalı. Uygunsuz ifadeler kullanılamaz.</small>
            </div>
          )}
        </div>
        
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: "10px", margin: "20px 0", fontSize: "1.2rem", background: "#fff", padding: "10px", borderRadius: "10px", boxShadow: "0 2px 5px rgba(0,0,0,0.05)" }}>
           <span style={{color: "#333"}}>{t.profile.current}:</span> 
           <span style={{ fontSize: "1.8rem" }}>{tempAvatar}</span>
           <span style={{ fontSize: "1.8rem" }}>{tempRegion}</span>
           <span style={{ fontSize: "1.1rem", fontWeight: "bold", marginLeft: "5px", color: "#3b82f6" }}>{tempName}</span>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button onClick={onClose} className="universal-btn" style={{ background: "#9ca3af", color: "white" }} disabled={isLoading}>
            {t.buttons.back}
          </button>
          <button 
            onClick={() => onSave(tempAvatar, tempRegion, tempName)} 
            className="universal-btn btn-primary"
            style={{ opacity: isLoading ? 0.7 : 1 }}
            disabled={isLoading}
          >
            {isLoading ? t.buttons.saving : t.buttons.save}
          </button>
        </div>

      </div>
    </div>
  );
};


function App() {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [resetCode, setResetCode] = useState<string | null>(null);

  const [language, setLanguage] = useState<Language>("tr");
  const [gameState, setGameState] = useState<GameState>("menu");
  const [gameMode, setGameMode] = useState<GameMode>("normal");
  
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [showGlobalLeaderboard, setShowGlobalLeaderboard] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false); 
  const [isProcessingProfile, setIsProcessingProfile] = useState(false);
  
  const [selectedRegion, setSelectedRegion] = useState(() => localStorage.getItem("mathGameRegion") || "🌍");
  const [showSecret, setShowSecret] = useState<boolean>(() => localStorage.getItem("mathGameShowSecret") === "true");

  const [timeDifficulty, setTimeDifficulty] = useState<TimeDifficulty>("easy");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [score, setScore] = useState(0);
  
  const [highScores, setHighScores] = useState<Record<TimeDifficulty, number>>({ easy: 0, medium: 0, hard: 0 });

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(1);
  const [passRights, setPassRights] = useState(0);
  const [passedQuestions, setPassedQuestions] = useState<Equation[]>([]);
  const [questionPhase, setQuestionPhase] = useState<QuestionPhase>("normal");
  const [equation, setEquation] = useState<Equation | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [options, setOptions] = useState<number[]>([]);
  const [totalTime, setTotalTime] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isProcessing = useRef(false);
  const t = TRANSLATIONS[language];

  // --- PROFİL GÜNCELLEME (İSİM + FİLTRE) ---
  const handleProfileUpdate = async (newAvatar: string, newRegion: string, newName: string) => {
    setIsProcessingProfile(true);
    try {
      if (newName.length < 3) {
          alert("İsim en az 3 karakter olmalı.");
          setIsProcessingProfile(false);
          return;
      }

      if (filter.isProfane(newName)) {
          alert("Bu kullanıcı adı uygunsuz kelimeler içeriyor. Lütfen değiştirin.");
          setIsProcessingProfile(false);
          return;
      }

      const currentUser = auth.currentUser;
      if (currentUser) {
        await updateProfile(currentUser, { 
            photoURL: newAvatar,
            displayName: newName 
        });
        
        setUser({ ...currentUser, photoURL: newAvatar, displayName: newName });
        setSelectedRegion(newRegion);
        localStorage.setItem("mathGameRegion", newRegion);
        setShowProfileModal(false);
      }
    } catch (e: any) {
      console.error("Profil güncellenemedi:", e);
      alert("Hata oluştu: " + e.message);
    } finally {
      setIsProcessingProfile(false);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;
    const scoresRef = collection(db, "leaderboard");
    const q = query(scoresRef, where("userId", "==", user.uid), where("mode", "==", "timeAttack"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newScores = { easy: 0, medium: 0, hard: 0 };
      snapshot.forEach((doc) => {
        const data = doc.data();
        if (data.difficulty === "easy") newScores.easy = data.score;
        if (data.difficulty === "medium") newScores.medium = data.score;
        if (data.difficulty === "hard") newScores.hard = data.score;
      });
      setHighScores(newScores);
    });
    return () => unsubscribe();
  }, [user]);

  useEffect(() => {
    const queryParams = new URLSearchParams(window.location.search);
    const mode = queryParams.get('mode');
    const oobCode = queryParams.get('oobCode');
    if ((mode === 'resetPassword' || mode === 'reset') && oobCode) {
      setResetCode(oobCode);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setGameState("menu");
  };

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 0, tolerance: 5 } })
  );
  
  const shuffleArray = (array: number[]) => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  const toggleSecret = () => {
    const newValue = !showSecret;
    setShowSecret(newValue);
    localStorage.setItem("mathGameShowSecret", String(newValue));
  };

  // HATA ÇÖZÜMÜ: Kullanılmayan parametre için _finalScore kullanıldı
  const checkHighScore = (_finalScore: number) => { return false; };

  const handleModeSelect = (mode: GameMode) => {
    setGameMode(mode);
    setGameState(mode === "normal" ? "normalDiffSelect" : "timeDiffSelect");
  };

  const startNormalGame = (diff: Difficulty) => {
    setDifficulty(diff); setGameState("playing"); setScore(0); setTotalTime(0);
    setupLevel(diff, "normal", "easy", false);
  };
  const startTimeAttack = (tDiff: TimeDifficulty) => {
    setTimeDifficulty(tDiff); setGameState("playing"); setScore(0); setTotalTime(0);
    setupLevel("easy", "timeAttack", tDiff, false);
  };

  const setupLevel = (diff: Difficulty, mode: GameMode, tDiff: TimeDifficulty, carryOverTime: boolean) => {
    setDifficulty(diff); setCurrentQuestionIndex(1); setPassedQuestions([]); setQuestionPhase("normal"); setPassRights(LEVEL_CONFIG[diff].passLimit); setMessage(""); isProcessing.current = false; setIsTransitioning(false);
    if (mode === "timeAttack") {
      const rules = TIME_MODE_RULES[tDiff].levels[diff];
      setTimeLeft(carryOverTime ? (prev) => prev + rules.start : rules.start);
    }
    generateNewQuestion(diff);
  };

  const generateNewQuestion = (diff: Difficulty) => {
    const nextEquation = generateEquation(diff);
    setEquation(nextEquation); setSelectedAnswer(null); setMessage(""); isProcessing.current = false; setIsTransitioning(false);
    const newOptions = new Set<number>(); newOptions.add(nextEquation.answer);
    let optionCount = diff === "medium" ? 5 : diff === "hard" ? 7 : 3;
    let rangeMax = nextEquation.answer > 100 ? nextEquation.answer + 50 : 100;
    while (newOptions.size < optionCount) {
      newOptions.add(Math.random() > 0.5 ? Math.max(1, nextEquation.answer + Math.floor(Math.random() * 20) - 10) : Math.floor(Math.random() * rangeMax) + 1);
    }
    setOptions(shuffleArray(Array.from(newOptions)));
  };

  const advanceToNextStep = () => {
    if (gameMode === "normal") { setCurrentQuestionIndex(prev => prev + 1); generateNewQuestion(difficulty); return; }
    const config = LEVEL_CONFIG[difficulty];
    if (questionPhase === "normal") {
      if (currentQuestionIndex < config.questionCount) {
        setCurrentQuestionIndex(prev => prev + 1); generateNewQuestion(difficulty);
      } else {
        if (passedQuestions.length > 0) {
          setQuestionPhase("revisiting"); setMessage(t.messages.revisiting);
          setTimeout(() => { setEquation(passedQuestions[0]); setPassedQuestions(passedQuestions.slice(1)); }, 1500);
        } else finishLevel();
      }
    } else {
      if (passedQuestions.length > 0) { setEquation(passedQuestions[0]); setPassedQuestions(passedQuestions.slice(1)); } else finishLevel();
    }
  };

  const finishLevel = () => {
    if (score > LEVEL_CONFIG[difficulty].passThreshold) {
      setIsTransitioning(true);
      if (difficulty === "easy") { setMessage(t.messages.congratsEasy); setTimeout(() => setupLevel("medium", gameMode, timeDifficulty, true), 2000); }
      else if (difficulty === "medium") { setMessage(t.messages.congratsMedium); setTimeout(() => setupLevel("hard", gameMode, timeDifficulty, true), 2000); }
      else {
        let finalScore = score;
        if (gameMode === "timeAttack") {
           const bonus = timeLeft * TIME_MODE_RULES[timeDifficulty].multiplier;
           finalScore += bonus;
           setScore(finalScore);
           setMessage(`${t.messages.timeBonus} +${bonus}!`);
           saveScoreToFirebase(finalScore, "timeAttack", timeDifficulty, user?.displayName || "Anonim", user?.photoURL, selectedRegion, user.uid);
        }
        checkHighScore(finalScore);
        setTimeout(() => setGameState("won"), 1500);
      }
    } else {
      setGameState("lost");
      setMessage(`${t.messages.insufficient} ${LEVEL_CONFIG[difficulty].passThreshold}`);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    if (isProcessing.current || gameState !== "playing" || !equation) return;
    const { active, over } = event;
    if (!over || over.id !== "drop-zone") return;
    
    isProcessing.current = true; setIsTransitioning(true);
    const value = parseInt(String(active.id).replace("num-", ""), 10);
    if (!options.includes(value)) { setIsTransitioning(false); isProcessing.current = false; return; }
    setSelectedAnswer(value);

    const isCorrect = value === Math.round(equation.answer);
    if (isCorrect) {
      if (gameMode === "timeAttack") {
        setScore(s => s + LEVEL_CONFIG[difficulty].correctPoints);
        const bonus = TIME_MODE_RULES[timeDifficulty].levels[difficulty].bonus;
        setTimeLeft(prev => prev + bonus);
        setMessage(`${t.messages.correct} (+${bonus}sn) 👏`);
      } else setMessage(`${t.messages.correct} 👏`);
    } else {
      if (gameMode === "timeAttack") setScore(s => s - LEVEL_CONFIG[difficulty].wrongPenalty);
      setMessage(`${t.messages.wrong} ❌`);
    }
    setTimeout(advanceToNextStep, 1000);
  };

  const handlePass = () => { if(!isProcessing.current && passRights > 0 && equation) { isProcessing.current = true; setIsTransitioning(true); setPassRights(p => p - 1); setPassedQuestions(prev => [...prev, equation!]); setMessage(`${t.messages.passUsed} ⏩`); setTimeout(advanceToNextStep, 500); } };
  const handleSkip = () => { if(!isProcessing.current) { isProcessing.current = true; setIsTransitioning(true); setMessage(`${t.messages.skipped} ⏭️`); setTimeout(advanceToNextStep, 500); } };

  useEffect(() => { if (gameState === "playing" && gameMode === "normal" && !showExitConfirm) { const i = setInterval(() => setTotalTime(t => t+1), 1000); return () => clearInterval(i); } }, [gameState, gameMode, showExitConfirm]);
  useEffect(() => { if (gameState === "playing" && gameMode === "timeAttack" && !showExitConfirm && !isTransitioning) { const i = setInterval(() => setTimeLeft(prev => { if(prev<=1) { clearInterval(i); setGameState("lost"); setMessage(t.messages.timeUp); return 0; } return prev - 1; }), 1000); return () => clearInterval(i); } }, [gameState, gameMode, isTransitioning, showExitConfirm]);
  useEffect(() => { if (gameState === "lost" && gameMode === "timeAttack" && score > 0) { saveScoreToFirebase(score, "timeAttack", timeDifficulty, user?.displayName || "Anonim", user?.photoURL, selectedRegion, user.uid); checkHighScore(score); } }, [gameState]);

  const handleExitClick = () => setShowExitConfirm(true);
  const confirmExit = () => { 
      if (gameMode === "timeAttack" && score > 0) { 
          saveScoreToFirebase(score, "timeAttack", timeDifficulty, user?.displayName || "Anonim", user?.photoURL, selectedRegion, user.uid); 
          checkHighScore(score); 
      } 
      setShowExitConfirm(false); 
      setGameState("menu"); 
  };

  if (resetCode) return <PasswordResetConfirm oobCode={resetCode} onSuccess={() => setResetCode(null)} />;
  if (loadingAuth) return <div className="app-root"><div className="game-card">Yükleniyor...</div></div>;
  if (!user) return <div className="app-root"><Auth /></div>;
  if (showGlobalLeaderboard) return <GlobalLeaderboard onClose={() => setShowGlobalLeaderboard(false)} isAdmin={user?.email === ADMIN_EMAIL} />;

  if (gameState === "menu") {
    return (
      <div className="app-root">
        
        {/* PROFİL MODALI */}
        {showProfileModal && (
          <ProfileSettingsModal 
             currentAvatar={user.photoURL || "👤"} 
             currentRegion={selectedRegion}
             currentName={user.displayName || "Oyuncu"} 
             onSave={handleProfileUpdate}
             onClose={() => setShowProfileModal(false)}
             isLoading={isProcessingProfile} 
             t={t}
          />
        )}

        {/* Dil Seçimi */}
        <div style={{position: "absolute", top: "20px", left: "20px", display: "flex", gap: "10px", zIndex: 10}}>
          <button onClick={() => setLanguage("tr")} className="universal-btn small select-btn" style={{background: language==="tr"?"#22c55e":"#e5e7eb", color: language==="tr"?"white":"#333", fontWeight: "bold", border: language==="tr" ? "none" : "1px solid #d1d5db"}}>TR</button>
          <button onClick={() => setLanguage("en")} className="universal-btn small select-btn" style={{background: language==="en"?"#3b82f6":"#e5e7eb", color: language==="en"?"white":"#333", fontWeight: "bold", border: language==="en" ? "none" : "1px solid #d1d5db"}}>EN</button>
        </div>
        
        {/* Kullanıcı Profili */}
        <div style={{position: "absolute", top: "20px", right: "20px", zIndex: 10, display: "flex", alignItems: "center", gap: "10px"}}>
             <button 
                onClick={() => setShowProfileModal(true)}
                style={{
                  fontWeight: "bold", color: "#2563eb", background: "white", 
                  padding: "5px 12px", borderRadius: "20px", 
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)", display: "flex", alignItems: "center", gap: "8px",
                  border: "2px solid #eff6ff", cursor: "pointer", transition: "all 0.2s"
                }}
                className="profile-btn"
                title={t.buttons.editProfile}
             >
               <span style={{fontSize: "1.4rem", lineHeight: 1}}>{user.photoURL || "👤"}</span>
               <span style={{fontSize: "1.2rem", lineHeight: 1}}>{selectedRegion}</span>
               <span style={{borderLeft: "1px solid #ddd", paddingLeft: "8px"}}>{user.displayName || "Oyuncu"}</span>
             </button>

             <button onClick={handleLogout} className="universal-btn small btn-danger" style={{fontSize: "0.8rem", padding: "6px 12px"}}>{t.buttons.logout}</button>
        </div>

        <div className="high-score-panel" style={{top: "70px"}}>
           <h3 className="panel-title">🏆 {t.leaderboard} ({t.local})</h3>
           <div className="score-row easy"><span>🟢 {t.highScores.easy}</span><span>{highScores.easy}</span></div>
           <div className="score-row medium"><span>🟠 {t.highScores.medium}</span><span>{highScores.medium}</span></div>
           <div className="score-row hard"><span>🔴 {t.highScores.hard}</span><span>{highScores.hard}</span></div>
        </div>

        {user?.email === ADMIN_EMAIL && (
          <div style={{position: "fixed", bottom: "20px", left: "20px", zIndex: 999}}>
            <button onClick={toggleSecret} className="universal-btn small" style={{background: "#64748b", color: "white"}}>{showSecret ? t.buttons.debugOn : t.buttons.debugOff}</button>
          </div>
        )}

        <div className="game-card mainMenu-card" style={{textAlign: "center", padding: "40px 30px"}}>
          <div style={{display: "flex", justifyContent: "center", marginBottom: "15px"}}><Logo style={{maxWidth: "100%", height: "auto"}} /></div>
          
          {!user.emailVerified && (
            <div style={{background: "#fff7ed", color: "#c2410c", padding: "10px", margin: "10px auto", borderRadius: "10px", fontSize: "0.85rem", maxWidth: "90%"}}>
                {t.warnings.emailNotVerified} <br/>
                <button onClick={async () => { try { await sendEmailVerification(user); alert(t.buttons.mailSent); } catch(e:any) { alert("Hata: " + e.message); } }} style={{border: "none", background: "none", color: "#ea580c", textDecoration: "underline", cursor: "pointer", fontWeight: "bold"}}>{t.buttons.resendMail}</button>
            </div>
          )}

          <p style={{color: "#666", marginBottom: "30px", fontWeight: 500}}>{t.menuSubtitle}</p>
          <div style={{display: "flex", flexDirection: "column", gap: "15px", alignItems: "center", width: "100%"}}>
            <button onClick={() => handleModeSelect("normal")} className="universal-btn btn-primary menu-btn"><strong>{t.modes.normal}</strong><small>{t.modes.normalDesc}</small></button>
            <button onClick={() => handleModeSelect("timeAttack")} className="universal-btn btn-danger menu-btn"><strong>{t.modes.timeAttack}</strong><small>{t.modes.timeAttackDesc}</small></button>
            <button onClick={() => setShowGlobalLeaderboard(true)} className="universal-btn btn-warning menu-btn" style={{marginTop: "10px"}}><strong>{t.buttons.globalLeaderboard}</strong></button>
            
            <button onClick={() => setShowProfileModal(true)} className="universal-btn small" style={{marginTop: "20px", background: "transparent", color: "#666", boxShadow: "none", textDecoration: "underline"}}>
                ✏️ {t.buttons.editProfile}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-root">
      {showExitConfirm && (
        <div style={{position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.6)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)"}}>
          <div style={{background: "white", padding: "30px", borderRadius: "20px", textAlign: "center", maxWidth: "90%", width: "350px"}}>
            <h2 style={{marginTop: 0, color: "#ef4444"}}>{t.buttons.confirmExitTitle}</h2>
            <p style={{color: "#555", marginBottom: "25px"}}>{t.buttons.confirmExitDesc}</p>
            <div style={{display: "flex", flexDirection: "column", gap: "10px"}}>
              <button onClick={confirmExit} className="universal-btn btn-danger small">{t.buttons.confirmYes}</button>
              <button onClick={() => setShowExitConfirm(false)} className="universal-btn small" style={{background: "#f3f4f6", color: "#333"}}>{t.buttons.confirmNo}</button>
            </div>
          </div>
        </div>
      )}

      <div className="game-card">
        {(gameState === "normalDiffSelect" || gameState === "timeDiffSelect") ? (
           <div style={{textAlign: "center", padding: "40px"}}>
             <h2 style={{fontSize: "2rem", marginBottom: "20px"}}>{gameState === "normalDiffSelect" ? t.normalDiff.title : t.timeDiff.title}</h2>
             <div style={{display: "flex", flexDirection: "column", gap: "15px", alignItems: "center"}}>
                <button onClick={() => gameState === "normalDiffSelect" ? startNormalGame("easy") : startTimeAttack("easy")} className="universal-btn btn-success"><strong>{gameState === "normalDiffSelect" ? t.normalDiff.easy : t.timeDiff.easy}</strong></button>
                <button onClick={() => gameState === "normalDiffSelect" ? startNormalGame("medium") : startTimeAttack("medium")} className="universal-btn btn-warning"><strong>{gameState === "normalDiffSelect" ? t.normalDiff.medium : t.timeDiff.medium}</strong></button>
                <button onClick={() => gameState === "normalDiffSelect" ? startNormalGame("hard") : startTimeAttack("hard")} className="universal-btn btn-danger"><strong>{gameState === "normalDiffSelect" ? t.normalDiff.hard : t.timeDiff.hard}</strong></button>
                <button onClick={() => setGameState("menu")} className="universal-btn" style={{marginTop: "10px", background: "transparent", color: "#666", boxShadow: "none"}}>⬅️ {t.buttons.back}</button>
             </div>
           </div>
        ) : (gameState === "won" || gameState === "lost") ? (
           <div style={{textAlign: "center", padding: "40px"}}>
             <h1 style={{fontSize: "3rem", marginBottom: "10px"}}>{gameState === "won" ? "🏆 " + t.messages.won : "❌ " + t.messages.lost}</h1>
             <p style={{color: gameState === "won" ? "#22c55e" : "#ef4444"}}>{message || t.messages.wonDesc}</p>
             {gameMode === 'timeAttack' && <div style={{fontSize: "2rem", fontWeight: "bold", margin: "20px 0"}}>{t.game.score}: {score}</div>}
             <button onClick={() => setGameState("menu")} className="universal-btn btn-primary" style={{width: "auto", padding: "12px 40px"}}>{t.buttons.mainMenu}</button>
           </div>
        ) : (
           <>
             <button onClick={handleExitClick} className="universal-btn btn-danger" style={{position: "absolute", top: "15px", left: "15px", padding: "8px 15px", fontSize: "0.8rem", width: "auto", minWidth: "auto"}}>{t.buttons.exit}</button>
             {showSecret && user?.email === ADMIN_EMAIL && <div style={{fontSize: "12px", color: "#ccc", textAlign: "center", marginBottom: "5px"}}>({t.game.secret} {equation?.answer} {t.game.shouldBe})</div>}
             <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px", alignItems: "center", marginTop: "25px" }}>
               <div><span className={`badge badge-${difficulty}`}>{language === 'tr' ? `${LEVEL_CONFIG[difficulty].id}. ${t.game.level}` : `${t.game.level} ${LEVEL_CONFIG[difficulty].id}`}</span><span style={{marginLeft: "10px", fontSize: "0.9rem", color: "#555"}}>{gameMode === 'normal' ? `${t.game.question}: ${currentQuestionIndex}` : questionPhase === "normal" ? `${t.game.question}: ${currentQuestionIndex} / ${LEVEL_CONFIG[difficulty].questionCount}` : `🔄 ${t.game.repeat}`}</span></div>
               {gameMode === 'timeAttack' && <div style={{textAlign: "right"}}><div style={{fontSize: "1.2rem", fontWeight: "bold"}}>{t.game.score}: {score}</div><div style={{fontSize: "0.8rem", color: "#666"}}>{t.game.passScore}: {LEVEL_CONFIG[difficulty].passThreshold}</div></div>}
             </div>
             <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
               {equation && <EquationView equation={equation} filledValue={selectedAnswer} />}
               <div className="message" style={{ marginTop: "20px", minHeight: "30px", color: message.includes(t.messages.correct) || message.includes("Bonus") ? "#22c55e" : "#ef4444", fontWeight: "bold", fontSize: "1.1rem", textAlign: "center" }}>{message}</div>
               <div className="numbers-grid">{options.map((num) => (<NumberTile key={`${currentQuestionIndex}-${num}`} value={num} />))}</div>
             </DndContext>
             <div style={{marginTop: "25px", display: "flex", justifyContent: "center", alignItems: "center", gap: "20px"}}>
               {gameMode === "timeAttack" && questionPhase === "normal" && <button onClick={handlePass} disabled={passRights <= 0} className="universal-btn btn-warning" style={{width: "auto", opacity: passRights > 0 ? 1 : 0.5}}>{t.buttons.pass} ({passRights}) ⏩</button>}
               {gameMode === "normal" && <button onClick={handleSkip} className="universal-btn btn-primary" style={{ width: "auto" }}>{t.buttons.next} ⏭️</button>}
             </div>
             <div style={{marginTop: "15px", textAlign: "center", fontSize: "1.1rem", fontWeight: "bold", color: gameMode === "timeAttack" ? "#ef4444" : "#666"}}>{gameMode === "normal" ? `${t.game.timeElapsed}: ${totalTime} ${t.messages.sn}` : `⏳ ${t.game.timeLeft}: ${timeLeft} ${t.messages.sn}`}</div>
           </>
        )}
      </div>
    </div>
  );
}

export default App;