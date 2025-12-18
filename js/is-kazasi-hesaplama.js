/**
 * İş Kazası Maddi Tazminat Hesaplama Motoru
 * Yargıtay Standartları ve TRH-2010 Yaşam Tablosu Kullanılarak
 * Progresif Rant Yöntemi ile Hesaplama
 */

// ==========================================
// 1. TRH-2010 YAŞAM TABLOSU (Bakiye Ömür)
// ==========================================

const TRH2010_ERKEK = {
    18: 56.32, 19: 55.42, 20: 54.51, 21: 53.60, 22: 52.69, 23: 51.78, 24: 50.87,
    25: 49.58, 26: 49.05, 27: 48.13, 28: 47.22, 29: 46.31, 30: 45.40, 31: 44.49,
    32: 43.58, 33: 42.67, 34: 41.76, 35: 40.07, 36: 40.94, 37: 38.17, 38: 38.11,
    39: 37.20, 40: 35.39, 41: 35.48, 42: 34.57, 43: 33.66, 44: 32.76, 45: 31.86,
    46: 30.96, 47: 30.06, 48: 29.17, 49: 28.28, 50: 26.32, 51: 27.51, 52: 26.62,
    53: 25.74, 54: 24.87, 55: 24.00, 56: 23.14, 57: 22.28, 58: 21.43, 59: 20.58,
    60: 18.08, 61: 18.91, 62: 18.16, 63: 17.41, 64: 16.67, 65: 15.94, 66: 15.21,
    67: 14.50, 68: 13.79, 69: 13.09, 70: 12.40, 71: 11.72, 72: 11.05, 73: 10.39,
    74: 9.75, 75: 9.12, 76: 8.50, 77: 7.90, 78: 7.32, 79: 6.76, 80: 6.22,
    81: 5.70, 82: 5.20, 83: 4.73, 84: 4.29, 85: 3.87, 86: 3.47, 87: 3.10,
    88: 2.76, 89: 2.44, 90: 2.15, 91: 1.88, 92: 1.64, 93: 1.43, 94: 1.24,
    95: 1.07, 96: 0.92, 97: 0.79, 98: 0.68, 99: 0.59, 100: 0.50
};

const TRH2010_KADIN = {
    18: 61.25, 19: 60.33, 20: 59.40, 21: 58.48, 22: 57.55, 23: 56.62, 24: 55.70,
    25: 54.40, 26: 54.85, 27: 53.92, 28: 52.99, 29: 52.06, 30: 51.14, 31: 50.21,
    32: 49.28, 33: 48.36, 34: 47.43, 35: 44.68, 36: 45.58, 37: 42.75, 38: 43.68,
    39: 42.75, 40: 39.87, 41: 40.95, 42: 40.02, 43: 39.10, 44: 38.18, 45: 37.26,
    46: 36.34, 47: 35.42, 48: 34.51, 49: 33.60, 50: 30.50, 51: 32.79, 52: 31.89,
    53: 30.99, 54: 30.10, 55: 29.21, 56: 28.33, 57: 27.45, 58: 26.57, 59: 25.70,
    60: 21.68, 61: 22.96, 62: 22.10, 63: 21.25, 64: 20.41, 65: 19.57, 66: 18.74,
    67: 17.92, 68: 17.11, 69: 16.31, 70: 15.52, 71: 14.74, 72: 13.97, 73: 13.21,
    74: 12.47, 75: 11.74, 76: 11.03, 77: 10.34, 78: 9.67, 79: 9.02, 80: 8.39,
    81: 7.78, 82: 7.20, 83: 6.65, 84: 6.12, 85: 5.62, 86: 5.14, 87: 4.69,
    88: 4.27, 89: 3.87, 90: 3.50, 91: 3.16, 92: 2.85, 93: 2.57, 94: 2.31,
    95: 2.07, 96: 1.86, 97: 1.67, 98: 1.49, 99: 1.34, 100: 1.20
};

/**
 * TRH-2010 tablosundan bakiye ömrü getir
 * @param {number} yas - Kişinin yaşı
 * @param {string} cinsiyet - 'erkek' veya 'kadin'
 * @returns {number} Bakiye ömür (yıl)
 */
function getBakiyeOmur(yas, cinsiyet) {
    const tablo = cinsiyet.toLowerCase() === 'erkek' ? TRH2010_ERKEK : TRH2010_KADIN;
    const yuvarlanmisYas = Math.floor(yas);

    // Tabloda yoksa en yakın değeri kullan
    if (tablo[yuvarlanmisYas]) {
        return tablo[yuvarlanmisYas];
    }

    // 18 yaşından küçükse 18 yaş değerini kullan
    if (yuvarlanmisYas < 18) {
        return tablo[18];
    }

    // 100 yaşından büyükse 100 yaş değerini kullan
    if (yuvarlanmisYas > 100) {
        return tablo[100];
    }

    return 0;
}

// ==========================================
// 2. ASGARİ ÜCRET VERİTABANI (NET)
// ==========================================

// ==========================================
// 2. ASGARİ ÜCRET VERİTABANI (DİNAMİK)
// ==========================================

let MINIMUM_WAGES = [];
let WAGES_LOADED = false;

/**
 * Supabase'den asgari ücret verilerini çek
 */
async function fetchMinimumWages() {
    try {
        if (typeof supabaseClient === 'undefined') {
            console.error('Supabase client not initialized!');
            return;
        }

        const { data, error } = await supabaseClient
            .from('minimum_wages')
            .select('*')
            .order('start_date', { ascending: false });

        if (error) throw error;

        // Verileri uygun formata dönüştür
        MINIMUM_WAGES = data.map(item => ({
            baslangic: item.start_date,
            bitis: item.end_date,
            netAylik: parseFloat(item.net_amount),
            brutAylik: item.brut_amount ? parseFloat(item.brut_amount) : 0
        }));

        WAGES_LOADED = true;
        console.log('Asgari ücret verileri yüklendi:', MINIMUM_WAGES.length, 'adet');

    } catch (err) {
        console.error('Asgari ücret verileri çekilemedi:', err);
        alert('Veritabanı bağlantı hatası: Asgari ücret verileri yüklenemedi.');
    }
}

// Sayfa yüklendiğinde verileri çek
document.addEventListener('DOMContentLoaded', fetchMinimumWages);

/**
 * Belirli bir tarihteki asgari ücreti getir
 * @param {Date} tarih 
 * @returns {number} Net aylık asgari ücret
 */
function getAsgariUcret(tarih) {
    if (!WAGES_LOADED || MINIMUM_WAGES.length === 0) {
        // Fallback: Veri henüz yüklenmediyse veya hata varsa statik bir değer döndür
        // Ancak ideal olan kullanıcıyı uyarmaktır.
        console.warn('Asgari ücret verileri henüz yüklenmedi veya boş!');
        // Eğer kullanıcı hesapla'ya çok hızlı bastıysa:
        if (!WAGES_LOADED) throw new Error("Veriler yükleniyor, lütfen bekleyiniz...");
    }

    const tarihStr = tarih.toISOString().split('T')[0];

    for (let ucret of MINIMUM_WAGES) {
        if (tarihStr >= ucret.baslangic && tarihStr <= ucret.bitis) {
            return ucret.netAylik;
        }
    }

    // Eğer tarih aralığı bulunamazsa (örneğin çok eski veya çok yeni)
    // En yakın tarihi döndür (listenin başı en yeni, sonu en eski)
    if (tarihStr > MINIMUM_WAGES[0].baslangic) return MINIMUM_WAGES[0].netAylik; // Gelecek
    return MINIMUM_WAGES[MINIMUM_WAGES.length - 1].netAylik; // Geçmiş
}

/**
 * İki tarih arasındaki yıl, ay, gün farkını hesapla
 * @param {Date} baslangic 
 * @param {Date} bitis 
 * @returns {Object} {yil, ay, gun, toplamGun}
 */
function tarihFarki(baslangic, bitis) {
    let yil = bitis.getFullYear() - baslangic.getFullYear();
    let ay = bitis.getMonth() - baslangic.getMonth();
    let gun = bitis.getDate() - baslangic.getDate();

    if (gun < 0) {
        ay--;
        const oncekiAy = new Date(bitis.getFullYear(), bitis.getMonth(), 0);
        gun += oncekiAy.getDate();
    }

    if (ay < 0) {
        yil--;
        ay += 12;
    }

    const toplamGun = Math.floor((bitis - baslangic) / (1000 * 60 * 60 * 24));

    return { yil, ay, gun, toplamGun };
}

/**
 * Yaş hesapla
 * @param {Date} dogumTarihi 
 * @param {Date} referansTarih 
 * @returns {number} Yaş (ondalıklı)
 */
function yasHesapla(dogumTarihi, referansTarih) {
    const fark = tarihFarki(dogumTarihi, referansTarih);
    return fark.yil + (fark.ay / 12) + (fark.gun / 365);
}

// ==========================================
// 3. ANA HESAPLAMA FONKSİYONU
// ==========================================

/**
 * İş kazası maddi tazminat hesapla
 * @param {Object} formData - Form verileri
 * @returns {Object} Detaylı hesaplama sonucu
 */
function hesaplaTazminat(formData) {
    try {
        // Form verilerini parse et
        const dogumTarihi = new Date(formData.dogumTarihi);
        const kazaTarihi = new Date(formData.kazaTarihi);
        const hukumTarihi = new Date(formData.hukumTarihi || new Date());
        const cinsiyet = formData.cinsiyet;
        const maluliyetOrani = parseFloat(formData.maluliyetOrani) / 100; // %20 -> 0.20
        const isciKusuru = parseFloat(formData.isciKusuru) / 100;
        const isverenKusuru = parseFloat(formData.isverenKusuru) / 100;

        // Maaş belirleme
        let netAylikMaas;
        if (formData.asgariUcretKullan) {
            netAylikMaas = getAsgariUcret(hukumTarihi);
        } else {
            netAylikMaas = parseFloat(formData.netMaas);
        }

        // SGK geliri (opsiyonel)
        const sgkPSD = formData.sgkPSD ? parseFloat(formData.sgkPSD) : 0;

        // Yaş hesaplamaları
        const kazadakiYas = yasHesapla(dogumTarihi, kazaTarihi);
        const hukumdekiYas = yasHesapla(dogumTarihi, hukumTarihi);
        const bakiyeOmur = getBakiyeOmur(hukumdekiYas, cinsiyet);

        // ===== 1. BİLİNEN DÖNEM (İşlemiş Zarar) =====
        const bilinenDonemSonuc = hesaplaBilinenDonem(
            kazaTarihi,
            hukumTarihi,
            netAylikMaas,
            maluliyetOrani,
            formData.asgariUcretKullan
        );

        // ===== 2. AKTİF DÖNEM (60 yaşa kadar) =====
        const aktifYasSiniri = 60;
        const aktifDonemYil = Math.max(0, aktifYasSiniri - hukumdekiYas);
        const aktifDonemZarar = hesaplaAktifDonem(
            netAylikMaas,
            aktifDonemYil,
            maluliyetOrani
        );

        // ===== 3. PASİF DÖNEM (60 yaş sonrası) =====
        const pasifDonemYil = Math.max(0, bakiyeOmur - aktifDonemYil);
        const pasifDonemZarar = hesaplaPasifDonem(
            pasifDonemYil,
            maluliyetOrani,
            hukumTarihi
        );

        // ===== TOPLAM BRÜT ZARAR =====
        const toplamBrutZarar = bilinenDonemSonuc.toplamZarar + aktifDonemZarar + pasifDonemZarar;

        // ===== 4. KUSUR İNDİRİMİ =====
        // Yargıtay standardı: Önce işçi kusuru indirilir
        const kusurSonrasiZarar = toplamBrutZarar * (1 - isciKusuru);

        // ===== 5. SGK RÜCU TENCİSİ =====
        // SGK'nın rücu edebileceği miktar: SGK PSD x İşveren Kusur Oranı
        const sgkRucuMiktari = sgkPSD * isverenKusuru;
        const netTazminat = Math.max(0, kusurSonrasiZarar - sgkRucuMiktari);

        // Sonuç objesi
        return {
            basarili: true,
            kisiselBilgiler: {
                kazadakiYas: kazadakiYas.toFixed(2),
                hukumdekiYas: hukumdekiYas.toFixed(2),
                bakiyeOmur: bakiyeOmur.toFixed(2),
                cinsiyet: cinsiyet
            },
            ekonomikBilgiler: {
                netAylikMaas: netAylikMaas.toFixed(2),
                maluliyetOrani: (maluliyetOrani * 100).toFixed(0) + '%',
                isciKusuru: (isciKusuru * 100).toFixed(0) + '%',
                isverenKusuru: (isverenKusuru * 100).toFixed(0) + '%'
            },
            donemler: {
                bilinenDonem: {
                    baslik: 'Bilinen Dönem (İşlemiş Zarar)',
                    sure: bilinenDonemSonuc.sure,
                    aciklama: bilinenDonemSonuc.aciklama,
                    zarar: bilinenDonemSonuc.toplamZarar
                },
                aktifDonem: {
                    baslik: 'Aktif Dönem (Fiili Çalışma)',
                    sure: aktifDonemYil.toFixed(2) + ' yıl',
                    aciklama: `Hüküm tarihinden 60 yaşına kadar (Progresif Rant: %10 artış, %10 iskonto = net 0)`,
                    zarar: aktifDonemZarar
                },
                pasifDonem: {
                    baslik: 'Pasif Dönem (Emeklilik)',
                    sure: pasifDonemYil.toFixed(2) + ' yıl',
                    aciklama: `60 yaşından itibaren (Asgari ücret üzerinden)`,
                    zarar: pasifDonemZarar
                }
            },
            hesapOzeti: {
                toplamBrutZarar: toplamBrutZarar,
                isciKusuruIndirimi: toplamBrutZarar * isciKusuru,
                kusurSonrasiZarar: kusurSonrasiZarar,
                sgkRucuMiktari: sgkRucuMiktari,
                netTahsilEdilecekTazminat: netTazminat
            }
        };

    } catch (error) {
        return {
            basarili: false,
            hata: error.message
        };
    }
}

/**
 * Bilinen dönem (işlemiş zarar) hesapla
 */
function hesaplaBilinenDonem(kazaTarihi, hukumTarihi, sonMaas, maluliyetOrani, asgariUcretMi) {
    const fark = tarihFarki(kazaTarihi, hukumTarihi);
    let toplamZarar = 0;

    if (asgariUcretMi) {
        // Asgari ücret kullanıyorsa, her dönem için o dönemin asgari ücretini kullan
        const yilSayisi = fark.yil + (fark.ay / 12) + (fark.gun / 365);
        const yillikZarar = sonMaas * 12 * maluliyetOrani;
        toplamZarar = yillikZarar * yilSayisi;
    } else {
        // Gerçek maaş kullanıyorsa, sabit maaş üzerinden hesapla
        const yilSayisi = fark.yil + (fark.ay / 12) + (fark.gun / 365);
        const yillikZarar = sonMaas * 12 * maluliyetOrani;
        toplamZarar = yillikZarar * yilSayisi;
    }

    return {
        sure: `${fark.yil} yıl ${fark.ay} ay ${fark.gun} gün`,
        aciklama: 'Kaza tarihinden hüküm tarihine kadar geçmiş dönem (İskonto uygulanmaz)',
        toplamZarar: toplamZarar
    };
}

/**
 * Aktif dönem hesapla (Progresif Rant)
 */
function hesaplaAktifDonem(netAylikMaas, yilSayisi, maluliyetOrani) {
    // Progresif Rant: %10 artış ve %10 iskonto birbirini nötrlediği için
    // Yıllık zarar sabit kabul edilir ve yıl sayısı ile çarpılır
    const yillikZarar = netAylikMaas * 12 * maluliyetOrani;
    return yillikZarar * yilSayisi;
}

/**
 * Pasif dönem hesapla (Emeklilik dönemi)
 */
function hesaplaPasifDonem(yilSayisi, maluliyetOrani, hukumTarihi) {
    // Pasif dönemde HERKES asgari ücret üzerinden hesaplanır
    const asgariUcret = getAsgariUcret(hukumTarihi);
    const yillikZarar = asgariUcret * 12 * maluliyetOrani;
    return yillikZarar * yilSayisi;
}

/**
 * Para formatla (Türk Lirası)
 */
function paraFormatlaTL(sayi) {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(sayi);
}
