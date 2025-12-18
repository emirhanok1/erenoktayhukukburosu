/**
 * İNFAZ HESAPLAMA MODÜLÜ - 2026 GÜNCEL - 11. YARGI PAKETİ
 * Profesyonel Kullanım İçin Hukuki İnfaz Hesaplama Sistemi
 * 
 * AYAR OBJESİ: Avukat oranları elle düzenleyebilir
 */

const INFAZ_AYARLARI = {
    oranlar: {
        // 1/2 Oranı
        adiSuclar: 1 / 2,

        // 2/3 Oranı
        kastenOldurme: 2 / 3,
        neticesiAgirYaralama: 2 / 3,
        eseYaralama: 2 / 3,
        basitCinselSaldiri: 2 / 3,
        cinselTaciz: 2 / 3,
        ozelHayataSuclar: 2 / 3,
        uyusturucuTicareti: 2 / 3,  // Varsayılan, örgüt varsa değişebilir
        orgutSuclari: 2 / 3,
        resitOlmayanCinsel: 2 / 3,

        // 3/4 Oranı
        iskence: 3 / 4,
        nitelikliCinselSaldiri: 3 / 4,
        cocukCinselIstismar: 3 / 4,
        terorSuclari: 3 / 4,
        devletGuvenlik: 3 / 4,
        resitOlmayanNitelikli: 3 / 4,
        mitKanunu: 3 / 4,

        // Özel Durumlar
        tekerrurNormal: 2 / 3,
        tekerrurAgir: 3 / 4
    },
    denetimliSerbestlik: {
        standart: 1,                    // 1 Yıl
        kadinCocuk: 2,                  // 0-6 yaş çocuğu olan kadın: 2 yıl
        kadinCocuk2020: 4,              // 30.03.2020 öncesi + 0-6 yaş çocuk: 4 yıl
        yargipaketi_31_07_2023: 3      // 3 Yıl (31.07.2023 öncesi - 11. Yargı Paketi)
    },
    muebbet: {
        muebbet: 24 * 365,              // Müebbet: 24 yıl = 8760 gün
        agMuebbet: 30 * 365             // Ağırlaştırılmış Müebbet: 30 yıl = 10950 gün
    }
};

/**
 * Sayfa yüklendiğinde event listener'ları ekle
 */
document.addEventListener('DOMContentLoaded', function () {
    // Ceza türü değiştiğinde süre alanını göster/gizle
    document.querySelectorAll('input[name="cezaTuru"]').forEach(radio => {
        radio.addEventListener('change', function () {
            const suresiAlani = document.getElementById('cezaSuresiAlani');
            suresiAlani.style.display = (this.value === 'sureli') ? 'block' : 'none';
        });
    });

    // Mahsup checkbox değiştiğinde mahsup alanını göster/gizle
    document.getElementById('mahsupVar').addEventListener('change', function () {
        const mahsupAlani = document.getElementById('mahsupAlani');
        mahsupAlani.style.display = this.checked ? 'block' : 'none';
    });
});

/**
 * Ana Hesaplama Fonksiyonu
 */
function hesaplaInfaz() {
    try {
        // ===============================
        // 1. FORM VERİLERİNİ AL
        // ===============================
        const cezaTuru = document.querySelector('input[name="cezaTuru"]:checked').value;

        let toplamCezaGun = 0;

        if (cezaTuru === 'sureli') {
            const cezaYil = parseInt(document.getElementById('cezaYil').value) || 0;
            const cezaAy = parseInt(document.getElementById('cezaAy').value) || 0;
            const cezaGun = parseInt(document.getElementById('cezaGun').value) || 0;
            toplamCezaGun = (cezaYil * 365) + (cezaAy * 30) + cezaGun;

            if (toplamCezaGun <= 0) {
                showError('Lütfen geçerli bir ceza süresi giriniz.');
                return;
            }
        } else if (cezaTuru === 'muebbet') {
            toplamCezaGun = INFAZ_AYARLARI.muebbet.muebbet;
        } else if (cezaTuru === 'agMuebbet') {
            toplamCezaGun = INFAZ_AYARLARI.muebbet.agMuebbet;
        }

        // Mahsup (Tutukluluk süresi)
        let mahsupGun = 0;
        if (document.getElementById('mahsupVar').checked) {
            const mahsupYil = parseInt(document.getElementById('mahsupYil').value) || 0;
            const mahsupAy = parseInt(document.getElementById('mahsupAy').value) || 0;
            const mahsupGunInput = parseInt(document.getElementById('mahsupGun').value) || 0;
            mahsupGun = (mahsupYil * 365) + (mahsupAy * 30) + mahsupGunInput;
        }

        // Net ceza (mahsup düşülmüş)
        const netCezaGun = toplamCezaGun - mahsupGun;

        if (netCezaGun <= 0) {
            showError('Mahsup süresi toplam cezadan fazla olamaz.');
            return;
        }

        const sucTarihiStr = document.getElementById('sucTarihi').value;
        if (!sucTarihiStr) {
            showError('Lütfen suç tarihini giriniz.');
            return;
        }

        // HTML date input'u ISO formatında (YYYY-MM-DD) döndürür
        const sucTarihi = new Date(sucTarihiStr);

        if (isNaN(sucTarihi.getTime())) {
            showError('Lütfen geçerli bir suç tarihi giriniz.');
            return;
        }

        const sucTipi = document.querySelector('input[name="sucTipi"]:checked')?.value || 'adiSuclar';
        const orgutFaaliyeti = document.getElementById('orgutFaaliyeti')?.checked || false;
        const tekerrurKaydi = document.querySelector('input[name="tekerrurKaydi"]:checked')?.value === 'var';
        const kadinHukumlu = document.getElementById('kadinHukumlu')?.checked || false;
        const agirHastalik = document.getElementById('agirHastalik')?.checked || false;

        // ===============================
        // 4. İNFAZ ORANINI BELİRLE
        // ===============================
        let infazOrani = INFAZ_AYARLARI.oranlar[sucTipi] || INFAZ_AYARLARI.oranlar.adiSuclar;
        let oranAciklama = getOranAciklama(sucTipi, infazOrani);

        // Örgüt faaliyeti etkisi
        if (orgutFaaliyeti) {
            infazOrani = Math.max(infazOrani, 3 / 4);
            oranAciklama += " + Örgüt Faaliyeti";
        }


        // Tekerrür etkisi
        if (tekerrurKaydi) {
            if (sucTipi === 'terorSuclari' || orgutFaaliyeti) {
                infazOrani = Math.max(infazOrani, INFAZ_AYARLARI.oranlar.tekerrurAgir);
                oranAciklama += " + Tekerrür (3/4)";
            } else {
                infazOrani = Math.max(infazOrani, INFAZ_AYARLARI.oranlar.tekerrurNormal);
                oranAciklama += " + Tekerrür (2/3)";
            }
        }

        // ===============================
        // 5. DENETİMLİ SERBESTLİK SÜRESİNİ BELİRLE (11. YARGI PAKETİ)
        // ===============================
        const TARIH_2020_03_30 = new Date(2020, 2, 30);
        const TARIH_2023_07_31 = new Date(2023, 6, 31);

        let denetimliSerbestlikYil = INFAZ_AYARLARI.denetimliSerbestlik.standart;
        let denetimliAciklama = "1 Yıl (Standart)";

        // İstisna suçlar listesi
        const istisnaSuclar = ['terorSuclari', 'nitelikliCinselSaldiri', 'cocukCinselIstismar',
            'kastenOldurme', 'iskence', 'devletGuvenlik', 'mitKanunu', 'resitOlmayanNitelikli'];
        const isIstisnaSuc = istisnaSuclar.includes(sucTipi) || orgutFaaliyeti;

        // 0-6 yaş çocuğu olan kadın hükümlü
        if (kadinHukumlu && !isIstisnaSuc) {
            if (sucTarihi < TARIH_2020_03_30) {
                denetimliSerbestlikYil = INFAZ_AYARLARI.denetimliSerbestlik.kadinCocuk2020;
                denetimliAciklama = "4 Yıl (0-6 yaş çocuklu kadın + 30.03.2020 öncesi)";
            } else {
                denetimliSerbestlikYil = INFAZ_AYARLARI.denetimliSerbestlik.kadinCocuk;
                denetimliAciklama = "2 Yıl (0-6 yaş çocuklu kadın)";
            }
        }
        // 11. Yargı Paketi - 31.07.2023 öncesi
        else if (sucTarihi < TARIH_2023_07_31 && !isIstisnaSuc) {
            denetimliSerbestlikYil = INFAZ_AYARLARI.denetimliSerbestlik.yargipaketi_31_07_2023;
            denetimliAciklama = "3 Yıl (31.07.2023 öncesi - 11. Yargı Paketi)";
        }
        // İstisna suçlar
        else if (isIstisnaSuc) {
            denetimliSerbestlikYil = INFAZ_AYARLARI.denetimliSerbestlik.standart;
            denetimliAciklama = "1 Yıl (İstisna Suç)";
        }

        const denetimliSerbestlikGun = denetimliSerbestlikYil * 365;

        // ===============================
        // 6. ÇIKTI HESAPLARI
        // ===============================
        const yatarGun = Math.ceil(netCezaGun * infazOrani);
        let kapaliKalmaGun = yatarGun - denetimliSerbestlikGun;

        if (kapaliKalmaGun < 0) {
            kapaliKalmaGun = 0;
        }

        // Bihakkın Tahliye Tarihi
        const bugun = new Date();
        const bihakkinTahliye = new Date(bugun);
        bihakkinTahliye.setDate(bihakkinTahliye.getDate() + toplamCezaGun);

        // ===============================
        // 7. SONUÇLARI EKRANA YAZ
        // ===============================
        displayResults({
            toplamCezaGun,
            netCezaGun,
            mahsupGun,
            yatarGun,
            kapaliKalmaGun,
            denetimliSerbestlikGun,
            denetimliAciklama,
            infazOrani,
            oranAciklama,
            bihakkinTahliye,
            cezaTuru,
            sucTipi,
            tekerrurKaydi,
            orgutFaaliyeti,
            kadinHukumlu,
            agirHastalik
        });

    } catch (error) {
        console.error('Hesaplama Hatası:', error);
        showError('Hesaplama sırasında bir hata oluştu. Lütfen tüm alanları kontrol ediniz.');
    }
}

/**
 * Oran Açıklaması Getir
 */
function getOranAciklama(sucTipi, oran) {
    const oranYuzde = Math.round(oran * 100);
    const oranMetin = oran === 1 / 2 ? "1/2" : (oran === 2 / 3 ? "2/3" : "3/4");

    const sucAdlari = {
        adiSuclar: "Adi Suç",
        kastenOldurme: "Kasten Öldürme",
        neticesiAgirYaralama: "Ağırlaşmış Yaralama",
        eseYaralama: "Eşe/Soya Yaralama",
        iskence: "İşkence/Eziyet",
        basitCinselSaldiri: "Basit Cinsel Saldırı",
        nitelikliCinselSaldiri: "Nitelikli Cinsel Saldırı",
        cocukCinselIstismar: "Çocuk Cinsel İstismarı",
        cinselTaciz: "Cinsel Taciz",
        terorSuclari: "Terör Suçu",
        ozelHayataSuclar: "Özel Hayata Karşı Suç",
        uyusturucuTicareti: "Uyuşturucu Ticareti",
        orgutSuclari: "Örgüt Suçları",
        devletGuvenlik: "Devlet Güvenliği Suçu",
        resitOlmayanCinsel: "Reşit Olmayan ile Cinsel İlişki",
        resitOlmayanNitelikli: "Reşit Olmayan ile Cinsel İlişki (Nitelikli)",
        mitKanunu: "MİT Kanunu Suçu"
    };

    return `${oranMetin} (${sucAdlari[sucTipi] || "Genel"}) - ${oranYuzde}%`;
}

/**
 * Türkçe Tarih Parse (GG.AA.YYYY)
 */
function parseTurkishDate(dateStr) {
    if (!dateStr) return null;

    const parts = dateStr.split('.');
    if (parts.length !== 3) return null;

    const gun = parseInt(parts[0]);
    const ay = parseInt(parts[1]);
    const yil = parseInt(parts[2]);

    if (isNaN(gun) || isNaN(ay) || isNaN(yil)) return null;

    return new Date(yil, ay - 1, gun);
}

/**
 * Günü Yıl/Ay/Gün'e Çevir
 */
function gunToYilAyGun(toplamGun) {
    const yil = Math.floor(toplamGun / 365);
    const kalanGun = toplamGun % 365;
    const ay = Math.floor(kalanGun / 30);
    const gun = kalanGun % 30;

    return { yil, ay, gun };
}

/**
 * Sonuçları Ekrana Bas
 */
function displayResults(data) {
    const { toplamCezaGun, netCezaGun, mahsupGun, yatarGun, kapaliKalmaGun, denetimliSerbestlikGun,
        denetimliAciklama, infazOrani, oranAciklama, bihakkinTahliye, cezaTuru, agirHastalik } = data;

    // Dönüşümler
    const toplamCeza = gunToYilAyGun(toplamCezaGun);
    const mahsup = gunToYilAyGun(mahsupGun);
    const netCeza = gunToYilAyGun(netCezaGun);
    const yatar = gunToYilAyGun(yatarGun);
    const kapali = gunToYilAyGun(kapaliKalmaGun);
    const denetimli = gunToYilAyGun(denetimliSerbestlikGun);

    // Yüzdeye Çevir
    const yuzde = Math.round(infazOrani * 100);

    // Ceza Türü Açıklaması
    const cezaTuruMetin = cezaTuru === 'sureli' ? 'Süreli Hapis Cezası' :
        (cezaTuru === 'muebbet' ? 'Müebbet Hapis Cezası (24 yıl)' :
            'Ağırlaştırılmış Müebbet Hapis Cezası (30 yıl)');

    let resultHTML = `
        <div class="alert alert-info">
            <h4 class="alert-heading"><i class="fa fa-gavel"></i> Hesaplama Sonuçları</h4>
            <hr>
            
            <!-- Ceza Türü -->
            <div class="row mb-3">
                <div class="col-12">
                    <h6><i class="fa fa-info-circle"></i> Ceza Türü</h6>
                    <p class="lead">${cezaTuruMetin}</p>
                </div>
            </div>
            
            <hr>
            
            <!-- Oran Bilgisi -->
            <div class="row mb-3">
                <div class="col-12">
                    <h5 class="text-primary"><i class="fa fa-percent"></i> Uygulanan İnfaz Oranı</h5>
                    <p class="h3 text-dark">${oranAciklama} <span class="badge badge-warning">${yuzde}%</span></p>
                </div>
            </div>

            <hr>

            <!-- Toplam Ceza ve Mahsup -->
            <div class="row mb-3">
                <div class="col-md-4">
                    <h6><i class="fa fa-balance-scale"></i> Toplam Ceza Süresi</h6>
                    <p class="lead"><strong>${toplamCeza.yil}</strong> Yıl <strong>${toplamCeza.ay}</strong> Ay <strong>${toplamCeza.gun}</strong> Gün</p>
                </div>`;

    if (mahsupGun > 0) {
        resultHTML += `
                <div class="col-md-4">
                    <h6><i class="fa fa-minus-circle"></i> Mahsup (Düşülen)</h6>
                    <p class="lead text-danger"><strong>${mahsup.yil}</strong> Yıl <strong>${mahsup.ay}</strong> Ay <strong>${mahsup.gun}</strong> Gün</p>
                </div>
                <div class="col-md-4">
                    <h6><i class="fa fa-equals"></i> Net Ceza</h6>
                    <p class="lead text-success"><strong>${netCeza.yil}</strong> Yıl <strong>${netCeza.ay}</strong> Ay <strong>${netCeza.gun}</strong> Gün</p>
                </div>`;
    } else {
        resultHTML += `
                <div class="col-md-4">
                    <h6><i class="fa fa-calendar-alt"></i> Bihakkın Tahliye Tarihi</h6>
                    <p class="lead">${formatDate(bihakkinTahliye)}</p>
                </div>`;
    }

    resultHTML += `
            </div>

            <hr>

            <!-- Yatar Süresi -->
            <div class="row mb-3">
                <div class="col-md-6 text-center">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6 class="card-title text-muted">Koşullu Salıverilme Süresi (Yatar)</h6>
                            <p class="display-4" style="font-size: 1.8rem; color: #aa9166;">
                                <strong>${yatar.yil}</strong> Yıl 
                                <strong>${yatar.ay}</strong> Ay 
                                <strong>${yatar.gun}</strong> Gün
                            </p>
                            <small class="text-muted">(Toplam: ${yatarGun} gün)</small>
                        </div>
                    </div>
                </div>
                <div class="col-md-6 text-center">
                    <div class="card bg-light">
                        <div class="card-body">
                            <h6 class="card-title text-muted">Kapalıda Kalınacak Süre</h6>
                            <p class="display-4" style="font-size: 1.8rem; color: #c0392b;">
                                <strong>${kapali.yil}</strong> Yıl 
                                <strong>${kapali.ay}</strong> Ay 
                                <strong>${kapali.gun}</strong> Gün
                            </p>
                            <small class="text-muted">(Denetimli Serbestlik Düşülmüş)</small>
                        </div>
                    </div>
                </div>
            </div>

            <hr>

            <!-- Denetimli Serbestlik -->
            <div class="row mb-3">
                <div class="col-12">
                    <h6><i class="fa fa-user-shield"></i> Denetimli Serbestlik Süresi</h6>
                    <p class="lead"><strong>${denetimli.yil}</strong> Yıl <strong>${denetimli.ay}</strong> Ay <strong>${denetimli.gun}</strong> Gün</p>
                    <small class="text-muted">${denetimliAciklama}</small>
                </div>
            </div>

            <hr>`;

    // Ağır hastalık uyarısı
    if (agirHastalik) {
        resultHTML += `
            <div class="alert alert-info mb-3">
                <h6><i class="fa fa-medkit"></i> Özel Durum: Ağır Hastalık/Engellilik</h6>
                <p class="mb-0">Koşullu salıverilmeye 3 yıl veya daha az süre kaldığında denetimli serbestlikten yararlanabilirsiniz. 
                Bu durum Adli Tıp Kurumu veya yetkili Sağlık Kurulu raporu ile belgelenmelidir.</p>
            </div>`;
    }

    resultHTML += `
            <!-- Profesyonel Danışmanlık -->
            <div class="alert alert-warning mb-3">
                <h5 class="mb-2"><i class="fa fa-info-circle"></i> Profesyonel Danışmanlık</h5>
                <p class="mb-3">Daha doğru sonuç için bir uzmana başvurmalısınız. 
                Profesyonel hukuki danışmanlık almak için bizimle iletişime geçebilirsiniz.</p>
                <div class="text-center">
                    <a href="contact.html" class="btn btn-primary btn-lg">
                        <i class="fa fa-phone"></i> Bizimle İletişime Geçin
                    </a>
                </div>
            </div>
            
            <!-- Sorumluluk Reddi -->
            <div class="alert alert-secondary mb-0">
                <p class="mb-0 small">
                    <i class="fa fa-exclamation-triangle"></i> <strong>Sorumluluk Reddi:</strong> 
                    Bu hesaplama bilgilendirme amaçlıdır ve resmi bağlayıcılığı yoktur. 
                    Kesin infaz süresi için mahkeme kararı ve infaz hakimliği değerlendirmesi esastır.
                </p>
            </div>
        </div>
    `;

    document.getElementById('sonucAlani').innerHTML = resultHTML;
    document.getElementById('sonucAlani').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hata Göster
 */
function showError(message) {
    const errorHTML = `
        <div class="alert alert-danger">
            <i class="fa fa-times-circle"></i> <strong>Hata:</strong> ${message}
        </div>
    `;
    document.getElementById('sonucAlani').innerHTML = errorHTML;
}

/**
 * Tarih Formatla (GG.AA.YYYY)
 */
function formatDate(date) {
    const gun = String(date.getDate()).padStart(2, '0');
    const ay = String(date.getMonth() + 1).padStart(2, '0');
    const yil = date.getFullYear();
    return `${gun}.${ay}.${yil}`;
}

/**
 * Form Temizle
 */
function formuTemizle() {
    document.getElementById('infazForm').reset();
    document.getElementById('sonucAlani').innerHTML = '';
    document.getElementById('cezaSuresiAlani').style.display = 'block';
    document.getElementById('mahsupAlani').style.display = 'none';
}
