import type { Difficulty, Equation, Operation } from "../types";

// Yardımcı fonksiyon: Belirli aralıkta rastgele tam sayı üretir
function getRandom(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateEquation(difficulty: Difficulty): Equation {
  const operations: Operation[] = ["+", "-", "×", "÷"];

  while (true) {
    // Rastgele bir işlem seç
    const op = operations[Math.floor(Math.random() * operations.length)];
    
    let a = 0;
    let b = 0;
    let result = 0;
    let left = 0;
    let right = 0;

    // --- SENİN BELİRLEDİĞİN ÖZEL ARALIKLAR ---
    
    // 1. ÇARPMA (×)
    if (op === "×") {
      let min = 1, max = 9; // Kolay varsayılan
      
      if (difficulty === "medium") { min = 9; max = 49; }
      if (difficulty === "hard")   { min = 49; max = 199; }

      a = getRandom(min, max);
      b = getRandom(min, max);
      
      left = a;
      right = b;
      result = a * b;
    } 
    
    // 2. BÖLME (÷)
    else if (op === "÷") {
      let minDiv = 1, maxDiv = 49; // Kolay varsayılan (Bölünen sayı aralığı)
      
      if (difficulty === "medium") { minDiv = 19; maxDiv = 499; }
      if (difficulty === "hard")   { minDiv = 99; maxDiv = 4999; }

      // Bölme mantığı: 
      // Önce "Bölünen" sayıyı (left) senin aralığından seçiyoruz.
      left = getRandom(minDiv, maxDiv);

      // Sonra bu sayının bölenlerini buluyoruz ki sonuç tam sayı çıksın.
      // (Asal sayı gelirse veya sadece 1'e bölünüyorsa tekrar denesin diye döngü başa döner)
      const factors = [];
      for (let i = 2; i <= Math.sqrt(left); i++) {
        if (left % i === 0) {
          factors.push(i);
          if (i !== left / i) factors.push(left / i);
        }
      }

      // Eğer hiç böleni yoksa (asal sayıysa) veya sayı çok küçükse bu soruyu geç
      if (factors.length === 0) continue;

      // Rastgele bir bölen seç
      right = factors[Math.floor(Math.random() * factors.length)];
      result = left / right;
    } 
    
    // 3. TOPLAMA (+) ve ÇIKARMA (-)
    else {
      let min = 1, max = 199; // Kolay varsayılan
      
      if (difficulty === "medium") { min = 199; max = 1999; }
      if (difficulty === "hard")   { min = 1999; max = 19999; }

      a = getRandom(min, max);
      b = getRandom(min, max);

      if (op === "+") {
        left = a;
        right = b;
        result = a + b;
      } else { // op === "-"
        // Negatif sonuç çıkmaması için büyüğü öne al
        if (a < b) [a, b] = [b, a];
        
        // Çıkarma işleminde sonucun 0 olmasını veya çok küçük kalmasını (örn: 1999 - 1998 = 1) 
        // istemiyorsan buraya küçük bir kontrol ekleyebiliriz.
        // Şimdilik senin aralıklarına sadık kalıyoruz.
        left = a;
        right = b;
        result = a - b;
      }
    }

    // --- SONUÇ KONTROLÜ VE DÖNÜŞ ---
    
    // Bölme işleminde bazen sonuç 1 çıkabilir (Sayı kendisine bölünürse).
    // Bu çok kolaysa engelleyebiliriz.
    if (op === "÷" && result === 1) continue;

    // Her zaman sağ tarafı (ikinci sayıyı) soruyoruz
    const rightMissing = true; 
    
    return {
      left: left,
      op: op,
      rightMissing: rightMissing,
      result: result,
      answer: rightMissing ? right : left,
      difficulty: difficulty
    };
  }
}