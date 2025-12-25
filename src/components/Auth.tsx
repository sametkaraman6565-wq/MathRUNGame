import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from "firebase/auth";
import { auth } from "../firebase";
import { Logo } from "./Logo";

// Varsayılan Avatar
const DEFAULT_AVATAR = "👤";
// Varsayılan İsim (Google ismi yerine bu yazacak)
const DEFAULT_NAME = "Oyuncu";

const GoogleIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M23.52 12.29C23.52 11.43 23.44 10.61 23.3 9.82H12V14.46H18.46C18.18 15.93 17.33 17.18 16.06 18.04V21.01H19.93C22.19 18.93 23.52 15.87 23.52 12.29Z" fill="#4285F4"/>
    <path d="M12 24C15.24 24 17.96 22.93 19.93 21.01L16.06 18.04C14.99 18.76 13.62 19.19 12 19.19C8.87 19.19 6.22 17.08 5.27 14.23H1.27V17.33C3.25 21.27 7.31 24 12 24Z" fill="#34A853"/>
    <path d="M5.27 14.23C5.03 13.51 4.9 12.76 4.9 12C4.9 11.24 5.03 10.49 5.27 9.77V6.67H1.27C0.46 8.28 0 10.09 0 12C0 13.91 0.46 15.72 1.27 17.33L5.27 14.23Z" fill="#FBBC05"/>
    <path d="M12 4.81C13.76 4.81 15.34 5.42 16.58 6.61L20.04 3.15C17.95 1.2 15.24 0 12 0C7.31 0 3.25 2.73 1.27 6.67L5.27 9.77C6.22 6.92 8.87 4.81 12 4.81Z" fill="#EA4335"/>
  </svg>
);

type AuthView = "login" | "register" | "reset";

export const Auth = () => {
  const [view, setView] = useState<AuthView>("login");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState(""); 
  const [username, setUsername] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const [error, setError] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isGoogleHover, setIsGoogleHover] = useState(false);

  // --- KAYIT OL ---
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== passwordConfirm) {
        setError("Şifreler eşleşmiyor.");
        setLoading(false);
        return;
    }

    if (username.length < 3) {
        setError("Kullanıcı adı en az 3 karakter olmalı.");
        setLoading(false);
        return;
    }

    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Varsayılan avatar ve girilen isim atanır
      await updateProfile(userCredential.user, {
        displayName: username,
        photoURL: DEFAULT_AVATAR
      });
    } catch (err: any) {
      console.error(err);
      setError("Kayıt hatası: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // --- GİRİŞ YAP ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err: any) {
      console.error(err);
      setError("Giriş başarısız. Bilgilerini kontrol et.");
    } finally {
      setLoading(false);
    }
  };

  // --- ŞİFRE SIFIRLA ---
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResetMessage("");
    setLoading(true);
    if (!email) {
        setError("Lütfen e-posta adresini gir.");
        setLoading(false);
        return;
    }
    try {
        await sendPasswordResetEmail(auth, email);
        setResetMessage("Sıfırlama bağlantısı e-postana gönderildi!");
    } catch (err: any) {
        console.error(err);
        setError("Hata: " + err.message);
    } finally {
        setLoading(false);
    }
  };

  // --- GOOGLE GİRİŞ (ÖZELLEŞTİRİLMİŞ) ---
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // KONTROL: Eğer kullanıcının resmi bir "http" linki ise (yani Google resmiyse)
      // veya ismi Google'dan geliyorsa, bunları BİZİM formatımıza çeviriyoruz.
      const isGooglePhoto = user.photoURL?.startsWith("http");
      
      // Eğer profil resmi Google linki ise veya hiç ismi yoksa, oyuna uygun hale getir.
      // Bu sayede Google adı ve resmi asla görünmez.
      if (isGooglePhoto || !user.displayName) {
          await updateProfile(user, {
              displayName: DEFAULT_NAME, // "Oyuncu" yapar
              photoURL: DEFAULT_AVATAR   // "👤" yapar
          });
          // Sayfayı yenilemeye gerek yok, App.tsx'teki listener bunu yakalayacak
      }

    } catch (error: any) {
      console.error(error);
      setError("Google ile giriş yapılamadı.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
      if (view === "login") handleLogin(e);
      else if (view === "register") handleRegister(e);
      else if (view === "reset") handlePasswordReset(e);
  };

  return (
    <div className="game-card" style={{ maxWidth: "420px", padding: "40px 30px", textAlign: "center" }}>
      
      <div style={{display: "flex", justifyContent: "center", marginBottom: "20px"}}>
        <Logo style={{maxWidth: "180px", height: "auto"}} />
      </div>

      <h2 style={{ marginBottom: "20px", color: "#333", fontSize: "1.5rem", fontWeight: "800", textTransform: "uppercase", letterSpacing: "1px" }}>
        {view === "login" && "GİRİŞ YAP"}
        {view === "register" && "KAYIT OL"}
        {view === "reset" && "ŞİFRE SIFIRLA"}
      </h2>

      {error && <div style={{ color: "white", background: "#ef4444", padding: "12px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.9rem", fontWeight: "bold" }}>{error}</div>}
      {resetMessage && <div style={{ color: "#166534", background: "#dcfce7", padding: "12px", borderRadius: "10px", marginBottom: "20px", fontSize: "0.9rem", fontWeight: "bold" }}>{resetMessage}</div>}

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        {view === "register" && (
          <input
            type="text"
            placeholder="Kullanıcı Adı"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={{ padding: "15px", borderRadius: "50px", border: "1px solid #e5e7eb", fontSize: "1rem", outline: "none", background: "#f9fafb", color: "#333" }}
          />
        )}

        <input
          type="email"
          placeholder={view === "reset" ? "Kayıtlı E-posta Adresi" : "E-posta Adresi"}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: "15px", borderRadius: "50px", border: "1px solid #e5e7eb", fontSize: "1rem", outline: "none", background: "#f9fafb", color: "#333" }}
        />

        {view !== "reset" && (
            <input
            type="password"
            placeholder="Şifre"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ padding: "15px", borderRadius: "50px", border: "1px solid #e5e7eb", fontSize: "1rem", outline: "none", background: "#f9fafb", color: "#333" }}
            />
        )}

        {view === "register" && (
             <input
             type="password"
             placeholder="Şifre Tekrar"
             value={passwordConfirm}
             onChange={(e) => setPasswordConfirm(e.target.value)}
             required
             style={{ padding: "15px", borderRadius: "50px", border: "1px solid #e5e7eb", fontSize: "1rem", outline: "none", background: "#f9fafb", color: "#333" }}
           />
        )}

        {view !== "reset" && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", paddingLeft: "10px", fontSize: "0.9rem", color: "#555" }}>
                <input 
                    type="checkbox" 
                    id="rememberMe" 
                    checked={rememberMe} 
                    onChange={(e) => setRememberMe(e.target.checked)}
                    style={{ width: "18px", height: "18px", cursor: "pointer", accentColor: "#3b82f6" }}
                />
                <label htmlFor="rememberMe" style={{ cursor: "pointer" }}>Cihazı Hatırla</label>
            </div>
        )}

        <button 
            type="submit" 
            className="universal-btn btn-primary"
            disabled={loading}
            style={{ marginTop: "5px", padding: "15px", borderRadius: "50px", fontSize: "1rem", fontWeight: "bold" }}
        >
          {loading ? "İŞLENİYOR..." : view === "login" ? "GİRİŞ YAP" : view === "register" ? "KAYIT OL" : "MAİL GÖNDER"}
        </button>
      </form>

      {(view === "login" || view === "register") && (
          <button 
            type="button"
            onClick={handleGoogleLogin} 
            onMouseEnter={() => setIsGoogleHover(true)}
            onMouseLeave={() => setIsGoogleHover(false)}
            style={{ 
                width: "100%",
                marginTop: "15px",
                padding: "12px",
                borderRadius: "50px",
                border: "1px solid #d1d5db", 
                background: isGoogleHover ? "#f9fafb" : "white",
                display: "flex", 
                alignItems: "center", 
                justifyContent: "center", 
                gap: "12px", 
                cursor: "pointer",
                transition: "all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)",
                transform: isGoogleHover ? "translateY(-4px)" : "none",
                boxShadow: isGoogleHover ? "0 12px 25px rgba(0,0,0,0.1)" : "0 2px 5px rgba(0,0,0,0.05)"
            }}
          >
            <GoogleIcon />
            <span style={{ 
                color: "#4b5563", 
                fontWeight: "bold", 
                fontSize: "1rem",
                fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
            }}>
                Google ile {view === "register" ? "Kayıt Ol" : "Giriş Yap"}
            </span>
          </button>
      )}

      <div style={{ marginTop: "25px", fontSize: "0.9rem", display: "flex", flexDirection: "column", gap: "12px", color: "#666" }}>
        
        {view === "login" && (
            <>
                <button 
                    onClick={() => setView("reset")} 
                    style={{ background: "none", border: "none", color: "#666", cursor: "pointer", textDecoration: "underline", fontSize: "0.9rem" }}
                >
                    Şifremi Unuttum
                </button>
                
                <div>
                    Hesabın yok mu? <button onClick={() => setView("register")} style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: "bold", cursor: "pointer", fontSize: "0.95rem" }}>Kayıt Ol</button>
                </div>
            </>
        )}

        {view === "register" && (
            <div>
                Zaten hesabın var mı? <button onClick={() => setView("login")} style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: "bold", cursor: "pointer", fontSize: "0.95rem" }}>Giriş Yap</button>
            </div>
        )}

        {view === "reset" && (
            <button onClick={() => setView("login")} style={{ background: "none", border: "none", color: "#3b82f6", fontWeight: "bold", cursor: "pointer", fontSize: "0.95rem" }}>
                Giriş Ekranına Dön
            </button>
        )}

      </div>
    </div>
  );
};