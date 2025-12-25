# MATH RUN PROJESİ - OYUN KURALLARI VE MANTIK

Bu proje React, TypeScript ve Vite ile geliştirilmiş, mobil uyumlu bir matematik koşu oyunudur.
Sürükle-bırak mantığı için `@dnd-kit/core` kütüphanesi kullanılır.

## 🎮 Oyun Modları

### 1. Normal Mod
- **Süre:** Sınır yok. Sadece geçen süre istatistik olarak tutulur.
- **Amaç:** Stres olmadan pratik yapmak.

### 2. Zamana Karşı (Time Attack)
Bu modda oyuncu süreyle yarışır. 3 farklı zorluk seçeneği vardır:

* **🟢 Kolay Süre:**
    * Başlangıç: 10 saniye
    * Bonus: Her doğru cevapta +10 saniye
    * Puan Çarpanı: x1
* **🟠 Orta Süre:**
    * Başlangıç: 15 saniye
    * Bonus: Her doğru cevapta +10 saniye
    * Puan Çarpanı: x3
* **🔴 Zor Süre:**
    * Başlangıç: 15 saniye
    * Bonus: Her doğru cevapta +10 saniye
    * Puan Çarpanı: x5

> **Oyun Sonu Bonusu:** Zamana karşı modunda oyun kazanılırsa, kalan süre puan çarpanı ile çarpılarak skora eklenir.

## 📊 Seviye Sistemi (Level Config)

Oyun 3 aşamadan oluşur:

1.  **1. Seviye (Easy):**
    * Soru Sayısı: 10
    * Geçme Puanı: 40
    * Puanlama: Doğru +5, Yanlış 0 puan.
2.  **2. Seviye (Medium):**
    * Soru Sayısı: 20
    * Geçme Puanı: 160
    * Puanlama: Doğru +7, Yanlış -3 puan.
3.  **3. Seviye (Hard):**
    * Soru Sayısı: 30
    * Geçme Puanı: 450
    * Puanlama: Doğru +10, Yanlış -5 puan.

## 🛠️ Önemli Mekanikler

* **Pas Hakkı:** Oyuncu zorlandığı soruyu pas geçebilir. Seviye sonuna gelindiğinde pas geçilen sorular tekrar sorulur (Revisiting Phase).
* **Tek Cevap Hakkı:** Bir soruya cevap verildiğinde sistem kilitlenir (`isProcessing` ref'i ile) ve 1 saniye sonra otomatik ilerler.
* **Süre Dondurma (Freeze Time):** Cevap verildiğinde veya animasyonlar sırasında süre sayacı durdurulur (`isTransitioning` state'i ile), haksız süre kaybı önlenir.
* **Rekor Sistemi:** Zamana karşı modunda her zorluk seviyesi için ayrı rekor (High Score) `localStorage` üzerinde tutulur.