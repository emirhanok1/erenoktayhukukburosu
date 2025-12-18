Av. Eren Oktay Hukuk Bürosu Kurumsal Web Sitesi Geliştirme Projesi

Emirhan Oktay
Bilgisayar Teknolojileri Bölümü
Kocaeli Üniversitesi
Kocaeli, Türkiye
[email@protected]

Özet—Bu döküman, TBL303 Web Tasarımı dersi kapsamında geliştirilen "Av. Eren Oktay Hukuk Bürosu" kurumsal web sitesi projesinin teknik detaylarını, tasarım süreçlerini ve geliştirme aşamalarını içermektedir. Proje, HTML5, CSS3, Bootstrap 4 ve JavaScript teknolojileri kullanılarak modern, kullanıcı dostu ve mobil uyumlu (responsive) bir yapıda tasarlanmıştır. Projenin temel amacı, hukuk bürosunun kurumsal kimliğini dijital ortama profesyonel bir şekilde yansıtmak ve müvekkillerin hizmetlere, duyurulara ve iletişim bilgilerine en hızlı şekilde ulaşmasını sağlamaktır. Özellikle dinamik hizmet filtreleme sistemi ve admin paneli simülasyonu, projenin öne çıkan teknik özelliklerindendir.

Anahtar Kelimeler—web tasarımı, bootstrap, javascript, kurumsal kimlik, responsive tasarım, frontend geliştirme

I.	GİRİŞ (INTRODUCTION)
Günümüz dijital çağında, hukuk büroları gibi profesyonel hizmet sağlayıcıların çevrimiçi varlıkları, kurumsal güvenilirlik ve müşteri erişimi açısından kritik bir rol oynamaktadır. Bu proje, "Av. Eren Oktay Hukuk Bürosu" için, modern web standartlarına uygun, estetik ve işlevsel bir web sitesi oluşturmayı hedeflemiştir.

Proje, sadece statik bir bilgi sunumundan öte, kullanıcı etkileşimini artıran modern UI/UX (Kullanıcı Arayüzü / Kullanıcı Deneyimi) prensipleriyle geliştirilmiştir. Kullanıcıların aradıkları uzmanlık alanlarına (Ceza Hukuku, Bilişim Hukuku vb.) saniyeler içinde ulaşabilmesi için özel filtreleme algoritmaları geliştirilmiş, hukuk bürosunun başarılarını somutlaştırmak için dinamik veri grafikleri entegre edilmiştir.

II.	TASARIM VE YAKLAŞIM (DESIGN AND METHODOLOGY)
A.	Tasarım Dili ve Renk Paleti
Projenin görsel tasarımında "Güven" ve "Otorite" kavramları merkeze alınmıştır. Bu bağlamda:
•	Ana Renk: Derin Lacivert (#0e1c36) – Ciddiyet ve profesyonelliği temsil eder.
•	Vurgu Rengi: Altın Sarısı (#aa9166) – Kalite ve başarıyı simgeler.
•	Yazı Tipleri: Başlıklarda "EB Garamond" ve "Cinzel" kullanılarak hukuksal ciddiyet, gövde metinlerinde ise "Roboto" kullanılarak okunabilirlik sağlanmıştır.

B.	Kullanıcı Deneyimi (UX) İyileştirmeleri
Kullanıcıların site içerisindeki dolaşımını kolaylaştırmak adına menü yapısı sadeleştirilmiş ve "Akıllı Filtreleme" özelliği eklenmiştir. "Duyuru Detay" gibi gereksiz menü öğeleri kaldırılarak, kullanıcı doğrudan içeriğe odaklanmıştır.

III.	TEKNİK DETAYLAR VE UYGULAMA (TECHNICAL IMPLEMENTATION)
Proje geliştirme süreci üç ana teknik aşamadan oluşmaktadır: Arayüz Geliştirme (HTML/CSS), Etkileşim Kodlama (JavaScript) ve İçerik Yönetimi Simülasyonu.

A.	Frontend Mimarisi
Proje iskeleti HTML5 etiketleri (header, nav, section, footer) kullanılarak semantik bir yapıda oluşturulmuştur. Stil işlemleri için CSS3 ve Bootstrap 4 framework'ü kullanılmıştır. Bootstrap'in "Grid System" yapısı sayesinde, site tüm cihazlarda (Mobil, Tablet, Masaüstü) kusursuz görüntülenmektedir.

B.	Dinamik Hizmet Filtreleme Sistemi
Projenin en önemli teknik özelliklerinden biri, URL Hash teknolojisi ile çalışan filtreleme sistemidir. Kullanıcı menüden "Bilişim Hukuku" seçeneğine tıkladığında:
1)	Sistem URL'i `service.html#bilisim` olarak günceller.
2)	JavaScript kodu, sayfa yüklendiğinde URL'deki `#bilisim` etiketini yakalar.
3)	DOM manipülasyonu ile diğer tüm hizmet kartlarını gizler (`display: none`).
4)	Sadece ilgili hizmet kartını ve "Tümünü Göster" butonunu aktif eder.

Bu yaklaşım, kullanıcıyı sayfalar arasında kaybolmaktan kurtararak doğrudan aradığı bilgiye ulaştırır.

C.	Yönetim Paneli (Admin Dashboard) Simülasyonu
Site yöneticisinin duyuru ekleyebilmesi ve içerikleri yönetebilmesi için bir Admin Paneli prototipi geliştirilmiştir. Back-end bağlantısı olmamasına rağmen, JavaScript kullanılarak:
•	Form validasyonu (Boş alan kontrolü).
•	Dinamik tablo yönetimi (Yeni satır ekleme/silme).
•	Oturum açma simülasyonu (Login yönlendirmesi)
işlevleri başarıyla simüle edilmiştir.

D. Grafikler ve Veri Görselleştirme
`statistics.html` sayfasında, büronun başarı oranlarını ve dava istatistiklerini göstermek için "Chart.js" kütüphanesi entegre edilmiştir. Statik resimler yerine, sayfa yüklendiğinde animasyonla açılan "Bar Chart" grafikler kullanılarak modern bir sunum elde edilmiştir.

IV.	SONUÇ (CONCLUSION)
Bu proje sonucunda, "Av. Eren Oktay Hukuk Bürosu" için sektör standartlarının üzerinde, hızlı çalışan ve estetik bir web sitesi ortaya çıkarılmıştır. Geliştirilen "Hizmet Filtreleme" ve "Admin Paneli" modülleri, projenin sadece bir tasarım çalışması olmadığını, aynı zamanda fonksiyonel bir web uygulaması prototipi olduğunu kanıtlamaktadır. TBL303 dersinin gereklilikleri olan responsive tasarım, özgün içerik ve teknik yetkinlik kriterleri tam anlamıyla karşılanmıştır.

KAYNAKÇA (REFERENCES)
[1]	Bootstrap Team, "Bootstrap Documentation," v4.4.1. [Online]. Available: https://getbootstrap.com/docs/4.4/
[2]	Chart.js Contributors, "Chart.js Documentation," [Online]. Available: https://www.chartjs.org/
[3]	Google Fonts, "Typography Resources," [Online]. Available: https://fonts.google.com/
[4]	Font Awesome, "Icon Library," v5.10.0.
