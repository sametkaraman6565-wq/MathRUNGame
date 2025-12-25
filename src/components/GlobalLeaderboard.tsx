import { useEffect, useState } from "react";
import { getGlobalLeaderboard, deleteScoreFromFirebase } from "../utils/firebaseUtils";

interface ScoreEntry {
  id: string;
  playerName: string;
  score: number;
  difficulty: string;
  avatar?: string;
  region?: string; // YENİ
}

export const GlobalLeaderboard = ({ onClose, isAdmin }: { onClose: () => void, isAdmin: boolean }) => {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"easy" | "medium" | "hard">("easy");

  const fetchScores = async () => {
    setLoading(true);
    const data = await getGlobalLeaderboard(tab);
    setScores(data as ScoreEntry[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchScores();
  }, [tab]);

  const handleDelete = async (docId: string) => {
      if(window.confirm("Bu skoru silmek istediğine emin misin?")) {
          const success = await deleteScoreFromFirebase(docId);
          if(success) {
              setScores(prev => prev.filter(s => s.id !== docId));
          } else {
              alert("Silinirken hata oluştu.");
          }
      }
  };

  return (
    <div style={{
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(0,0,0,0.8)", zIndex: 9999,
      display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(5px)"
    }}>
      <div className="game-card" style={{ maxWidth: "600px", width: "95%", maxHeight: "85vh", overflowY: "auto", padding: "20px" }}>
        <h2 style={{ textAlign: "center", color: "#f59e0b", marginBottom: "15px" }}>🌍 DÜNYA SIRALAMASI</h2>
        
        <div style={{display: "flex", gap: "10px", marginBottom: "15px", justifyContent: "center"}}>
            <button onClick={() => setTab("easy")} className={`universal-btn small ${tab==="easy"?"btn-success":""}`} style={{flex:1, opacity: tab==="easy"?1:0.6}}>Kolay</button>
            <button onClick={() => setTab("medium")} className={`universal-btn small ${tab==="medium"?"btn-warning":""}`} style={{flex:1, opacity: tab==="medium"?1:0.6}}>Orta</button>
            <button onClick={() => setTab("hard")} className={`universal-btn small ${tab==="hard"?"btn-danger":""}`} style={{flex:1, opacity: tab==="hard"?1:0.6}}>Zor</button>
        </div>

        {loading ? (
          <p style={{textAlign: "center", padding: "20px"}}>Veriler Yükleniyor...</p>
        ) : scores.length === 0 ? (
          <p style={{textAlign: "center", padding: "20px", color: "#666"}}>Bu zorlukta henüz skor yok. İlk sen ol!</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f3f4f6", textAlign: "left", fontSize: "0.9rem" }}>
                <th style={{ padding: "8px", width: "40px" }}>#</th>
                <th style={{ padding: "8px" }}>Oyuncu</th>
                <th style={{ padding: "8px", textAlign: "center" }}>Bölge</th>
                <th style={{ padding: "8px", textAlign: "right" }}>Puan</th>
                {isAdmin && <th style={{ padding: "8px", textAlign: "center" }}>Sil</th>}
              </tr>
            </thead>
            <tbody>
              {scores.map((s, index) => (
                <tr key={s.id} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "10px", fontWeight: "bold" }}>
                    {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : index + 1}
                  </td>
                  <td style={{ padding: "10px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{fontSize: "1.3rem"}}>{s.avatar || "👤"}</span>
                    <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "120px" }}>
                        {s.playerName || "Anonim"}
                    </span>
                  </td>
                  {/* BÖLGE GÖSTERİMİ */}
                  <td style={{ padding: "10px", textAlign: "center", fontSize: "1.5rem" }}>
                    {s.region || "🌍"}
                  </td>
                  <td style={{ padding: "10px", textAlign: "right", fontWeight: "bold", color: "#2563eb" }}>
                    {s.score}
                  </td>
                  {isAdmin && (
                      <td style={{textAlign: "center"}}>
                          <button onClick={() => handleDelete(s.id)} style={{background: "none", border: "none", cursor: "pointer", fontSize: "1.2rem"}} title="Sil">🗑️</button>
                      </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <button onClick={onClose} className="universal-btn btn-primary small" style={{ marginTop: "20px", width: "100%" }}>KAPAT</button>
      </div>
    </div>
  );
};