import { db } from "../firebase";
import { 
  collection, 
  addDoc, 
  deleteDoc, 
  updateDoc, // GÜNCELLEME İÇİN EKLENDİ
  doc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where 
} from "firebase/firestore";

// 1. SKOR KAYDETME (AKILLI GÜNCELLEME)
export const saveScoreToFirebase = async (
  score: number, 
  mode: string, 
  difficulty: string, 
  playerName: string,
  avatar: string | null,
  region: string,
  userId: string // YENİ: Kullanıcıyı tanımak için ID şart
) => {
  try {
    const scoresRef = collection(db, "leaderboard");
    
    // Önce bu kullanıcının bu zorlukta bir skoru var mı kontrol et
    const q = query(
      scoresRef,
      where("userId", "==", userId),
      where("difficulty", "==", difficulty),
      where("mode", "==", mode)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // --- KAYIT VARSA GÜNCELLE ---
      const existingDoc = querySnapshot.docs[0];
      const currentData = existingDoc.data();

      // Sadece yeni skor daha yüksekse güncelle
      if (score > currentData.score) {
        await updateDoc(doc(db, "leaderboard", existingDoc.id), {
          score: score,
          playerName: playerName, // İsim değişmiş olabilir, güncelle
          avatar: avatar || "👤", // Avatar değişmiş olabilir
          region: region || "🌍",
          date: new Date().toISOString()
        });
        console.log("Mevcut rekor güncellendi!");
      } else {
        console.log("Yeni skor rekoru geçemedi, kaydedilmedi.");
      }

    } else {
      // --- KAYIT YOKSA YENİ EKLE ---
      await addDoc(scoresRef, {
        userId: userId, // ID'yi de kaydediyoruz ki sonra bulabilelim
        score: score,
        mode: mode, 
        difficulty: difficulty,
        playerName: playerName,
        avatar: avatar || "👤",
        region: region || "🌍",
        date: new Date().toISOString()
      });
      console.log("Yeni skor tablosuna eklendi!");
    }

  } catch (e) {
    console.error("Skor işlem hatası:", e);
  }
};

// 2. GLOBAL LİDER TABLOSUNU ÇEKME
export const getGlobalLeaderboard = async (difficulty: string) => {
  try {
    const scoresRef = collection(db, "leaderboard");
    
    const q = query(
        scoresRef, 
        where("difficulty", "==", difficulty), 
        orderBy("score", "desc"), 
        limit(50)
    );
    
    const querySnapshot = await getDocs(q);
    const scores: any[] = [];
    
    querySnapshot.forEach((doc) => {
      scores.push({ id: doc.id, ...doc.data() });
    });
    
    return scores;
  } catch (e) {
    console.error("Global liste hatası:", e);
    return [];
  }
};

// 3. SKOR SİLME
export const deleteScoreFromFirebase = async (docId: string) => {
    try {
        await deleteDoc(doc(db, "leaderboard", docId));
        return true;
    } catch (e) {
        console.error("Silme hatası:", e);
        return false;
    }
};