import { useState } from "react";
import { auth } from "../firebase";
import { confirmPasswordReset } from "firebase/auth";
import { Logo } from "./Logo";

// --- İKONLAR ---
const EyeOpenIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
    <circle cx="12" cy="12" r="3"></circle>
  </svg>
);

const EyeClosedIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
    <line x1="1" y1="1" x2="23" y2="23"></line>
  </svg>
);

// --- STİL ---
const inputStyle = {
  width: "100%",
  padding: "12px 15px",
  borderRadius: "12px",
  border: "1px solid #ddd",
  background: "#f3f4f6",
  color: "#333",
  fontSize: "1rem",
  outline: "none",
  boxSizing: "border-box" as const,
};

interface Props {
  oobCode: string; // URL'den gelen özel kod
  onSuccess: () => void; // Başarılı olursa ana ekrana dönmek için
}

export const PasswordResetConfirm = ({ oobCode, onSuccess }: Props) => {
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (newPassword.length < 6) {
        setError("Şifre en az 6 karakter olmalı.");
        return;
    }
    
    setIsLoading(true);

    try {
      // 1. Firebase ile şifreyi onayla ve değiştir
      await confirmPasswordReset(auth, oobCode, newPassword);

      // 2. ÖNEMLİ: URL'deki reset kodlarını temizle
      // Bu sayede kullanıcı sayfayı yenilerse tekrar şifre değiştirme ekranı açılmaz.
      window.history.replaceState(null, "", window.location.pathname);

      setSuccessMessage("Şifren başarıyla değiştirildi! Giriş ekranına yönlendiriliyorsun...");
      
      // 3. Kullanıcıyı 2.5 saniye sonra giriş ekranına at
      setTimeout(() => {
          onSuccess(); 
      }, 2500);

    } catch (err: any) {
      if (err.message.includes("invalid-action-code")) {
        setError("Bu bağlantının süresi dolmuş veya daha önce kullanılmış. Lütfen tekrar şifre sıfırlama isteği gönder.");
      } else if (err.message.includes("weak-password")) {
        setError("Şifre çok zayıf. Daha güçlü bir şifre seç.");
      } else {
        setError("Bir hata oluştu: " + err.message);
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="app-root">
        <div className="game-card" style={{ textAlign: "center", maxWidth: "400px", margin: "0 auto" }}>
        
        {/* LOGO */}
        <div style={{display: "flex", justifyContent: "center", marginBottom: "20px"}}>
            <Logo style={{ width: "180px", height: "auto" }} />
        </div>

        <h2 style={{ color: "#3b82f6", marginBottom: "20px" }}>YENİ ŞİFRE BELİRLE</h2>
        
        {/* HATA MESAJI */}
        {error && (
            <div style={{ background: "#fee2e2", color: "#dc2626", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "0.9rem", fontWeight: "bold" }}>
                ⚠️ {error}
            </div>
        )}
        
        {/* BAŞARI MESAJI */}
        {successMessage && (
            <div style={{ background: "#dcfce7", color: "#166534", padding: "10px", borderRadius: "8px", marginBottom: "15px", fontSize: "0.9rem", fontWeight: "bold" }}>
                ✅ {successMessage}
            </div>
        )}

        {/* FORM (Başarılı olduysa gizle) */}
        {!successMessage && (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ position: "relative", width: "100%" }}>
                    <input 
                        type={showPassword ? "text" : "password"} 
                        placeholder="Yeni Şifre" 
                        style={{...inputStyle, paddingRight: "40px"}} 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        required 
                        disabled={isLoading} 
                    />
                    <span 
                        onClick={() => setShowPassword(!showPassword)} 
                        style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", cursor: "pointer", display: "flex" }}
                    >
                        {showPassword ? <EyeOpenIcon /> : <EyeClosedIcon />}
                    </span>
                </div>

                <button 
                    type="submit" 
                    className="universal-btn btn-primary" 
                    style={{marginTop: "5px", opacity: isLoading ? 0.7 : 1}} 
                    disabled={isLoading}
                >
                    {isLoading ? "Şifre Güncelleniyor..." : "ŞİFREYİ KAYDET"}
                </button>
            </form>
        )}
        
        {/* İPTAL BUTONU */}
        {!isLoading && !successMessage && (
            <p style={{ marginTop: "20px", fontSize: "0.9rem" }}>
                <span onClick={onSuccess} style={{ color: "#666", cursor: "pointer", textDecoration: "underline" }}>
                İptal et ve giriş ekranına dön
                </span>
            </p>
        )}
        </div>
    </div>
  );
};