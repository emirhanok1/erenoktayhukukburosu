Kritik Mobil Web Performansı İyileştirme ve Teknik Mimari Optimizasyon
Raporu: Derinlemesine Analiz ve Uygulama StratejisiYönetici Özeti ve
Durum AnaliziMevcut web platformunun mobil performans verileri, modern
web standartlarının ve kullanıcı beklentilerinin dramatik ölçüde
gerisinde kalmıştır. Largest Contentful Paint (LCP) değerinin 9.5
saniye, Total Blocking Time (TBT - Oluşturma Engelleme Süresi) değerinin
4.010 ms olması ve kümülatif Mobil Skorun 63 seviyesinde seyretmesi,
yalnızca kullanıcı deneyimi (UX) açısından değil, aynı zamanda arama
motoru sıralamaları (SEO) ve dönüşüm oranları (CRO) açısından da kritik
bir risk teşkil etmektedir. Bu rapor, tarayıcının oluşturma döngüsüne
(rendering pipeline) moleküler düzeyde müdahale ederek, Kritik Oluşturma
Yolu (Critical Rendering Path - CRP) üzerindeki yükü hafifletmeyi, ana
iş parçacığı (main thread) tıkanıklıklarını gidermeyi ve kaynak yükleme
önceliklerini (resource prioritization) yeniden yapılandırmayı
hedefleyen, yaklaşık 15.000 kelimelik kapsamlı bir teknik analiz ve
uygulama planı sunmaktadır.Analizimiz, sorunun yüzeysel bir optimizasyon
eksikliğinden ziyade, mimari düzeyde kaynak yönetimi ve iş parçacığı
kullanımındaki verimsizliklerden kaynaklandığını ortaya koymaktadır.
Özellikle 4 saniyeyi aşan TBT, JavaScript yürütme maliyetlerinin mobil
işlemciler üzerinde yarattığı darboğazı işaret ederken, 9.5 saniyelik
LCP, kritik içeriğin ağ üzerinde ve render ağacında (render tree)
önceliklendirilmediğini kanıtlamaktadır. Bu rapor, Chrome V8 motorunun
çalışma prensipleri, TCP/IP protokolünün darboğazları ve modern tarayıcı
API\'leri (Speculation Rules, Fetch Priority) ışığında, mevcut altyapıyı
\"instant-loading\" (anlık yükleme) seviyesine taşıyacak yol haritasını
çizecektir.1. Kritik Oluşturma Yolu (Critical Rendering Path - CRP) ve
CSS MimarisiTarayıcının bir web sayfasını ekrana çizmesi için geçirdiği
evreler bütününe Kritik Oluşturma Yolu (CRP) adı verilir. LCP\'nin 9.5
saniye olması, bu yolun ciddi şekilde tıkalı olduğunu, tarayıcının ilk
pikseli boyamak (First Paint) için gereken asgari veri setine ulaşmakta
zorlandığını göstermektedir. Bu bölümde, CRP\'yi tıkayan unsurları
ortadan kaldırmak için CSS Nesne Modeli (CSSOM) inşasının nasıl optimize
edileceği detaylandırılacaktır.1.1. CSSOM İnşası ve Render-Blocking
DoğasıTarayıcılar HTML belgesini ayrıştırırken (parsing) bir \<link
rel=\"stylesheet\"\> etiketiyle karşılaştıklarında, bu kaynağın
indirilmesi ve ayrıştırılması tamamlanana kadar oluşturma (rendering)
işlemini durdururlar.1 Bu, CSS\'in varsayılan olarak \"oluşturma
engelleyici\" (render-blocking) bir kaynak olmasından kaynaklanır.
Mevcut sitemizde, muhtemelen sayfanın tamamı için gereken (ve hatta
kullanılmayan) tüm stiller tek bir büyük dosyada veya render engelleyici
birden fazla dosyada sunulmaktadır. Bu durum, kullanıcının 9.5 saniye
boyunca boş bir ekran veya tam yüklenmemiş bir içerik görmesine neden
olmaktadır.CSSOM (CSS Object Model), DOM (Document Object Model) ile
birleşerek \"Render Tree\"yi oluşturur. Render Tree, yalnızca ekranda
görünür olan elementleri içerir (display: none olan elementler Render
Tree\'ye dahil edilmez). Dolayısıyla, optimizasyon stratejimizin temeli,
Render Tree\'nin inşasını engelleyen gereksiz CSS yükünü kaldırmak
üzerine kurulmalıdır.11.2. Kritik CSS (Critical CSS) Mimarisi: Teoriden
PratiğeKritik CSS, kullanıcının sayfayı ilk açtığında kaydırma yapmadan
gördüğü alan (Above-the-Fold) için gereken minimum stil setidir. Bu
stratejinin amacı, bu minimum seti harici bir dosya olarak değil,
doğrudan HTML belgesinin \<head\> bölümüne inline (satır içi) \<style\>
bloğu olarak yerleştirmektir. Geri kalan stiller ise (Below-the-Fold)
asenkron olarak yüklenmelidir.21.2.1. 14 KB Kuralı ve TCP Yavaş
Başlangıç (Slow Start)Kritik CSS\'in boyutu neden önemlidir? TCP
protokolünün \"Slow Start\" (Yavaş Başlangıç) mekanizması nedeniyle,
sunucu ile istemci arasındaki ilk veri alışverişinde gönderilen paket
boyutu sınırlıdır. Genellikle bu sınır 14 KB (yaklaşık 10 TCP paketi)
civarındadır. Eğer HTML ve içindeki Kritik CSS toplamda 14 KB\'ı
aşmazsa, tarayıcı tek bir ağ döngüsünde (Round Trip Time - RTT) boyama
için gereken her şeye sahip olur.3 Bu, özellikle gecikmenin (latency)
yüksek olduğu mobil ağlarda LCP ve FCP (First Contentful Paint)
sürelerinde devasa bir iyileşme sağlar.Sıkıştırılmış (Gzipped) Kritik
CSS paketimizin hedefi kesinlikle 14 KB altında kalmak olmalıdır. Bu
pakete dahil edilecek bileşenler şunlardır:Global reset ve normalizasyon
kuralları (sitenin \"bozuk\" görünmemesi için).Header, navigasyon ve
logo stilleri.Hero bölümü (ana görsel, başlık, CTA butonları).Temel
tipografi ve renk tanımları.Bu paketin dışında kalan; footer, modal
pencereler, yorum bölümleri ve sadece etkileşimle (hover, click) ortaya
çıkan stiller Kritik CSS\'ten çıkarılmalıdır.21.2.2. Otomasyon ve Araç
Seti: critical NPM PaketiManuel olarak Kritik CSS ayıklamak
sürdürülebilir değildir. Bu işlem, CI/CD (Sürekli Entegrasyon/Dağıtım)
hattının bir parçası olarak otomatikleştirilmelidir. critical npm
paketi, bu işlem için endüstri standardı haline gelmiştir. Bu araç,
headless bir tarayıcı (Puppeteer) kullanarak sayfayı belirtilen
çözünürlüklerde render eder ve kullanılan stilleri ayıklar.4Aşağıda,
mevcut projemize entegre edilmesi gereken, mobil ve masaüstü görünümleri
kapsayan gelişmiş bir konfigürasyon örneği sunulmaktadır:JavaScript//
critical-css-generator.js import { generate } from \'critical\';

generate({ // CSS\'in aranacağı kök dizin base: \'dist/\',

// İşlenecek kaynak HTML dosyası src: \'index.html\',

// Çıktı dosyaları target: { // Kritik CSS\'in inline edildiği HTML
html: \'index-critical.html\', // Kritik stillerin çıkarıldığı asenkron
yüklenecek CSS dosyası uncritical: \'assets/css/async-styles.css\', },

// Inline edilip edilmeyeceği (Evet, \<head\> içine gömülmeli) inline:
true,

// Viewport boyutları: Mobil ve Desktop için ayrı ayrı tarama yapılmalı
dimensions:,

// Kritik stilleri orijinal CSS dosyasından çıkar (extract). // Bu,
kullanıcının aynı stili iki kere indirmesini engeller. extract: true,

// \@font-face kuralları genellikle kritik CSS\'e alınmaz çünkü font
dosyaları // zaten bir gecikme yaratır ve FOUT/FOIT stratejileriyle
yönetilir. ignore: { atrule: \[\'@font-face\'\], // Dinamik olarak
yüklenen veya regex ile eşleşen bazı kurallar hariç tutulabilir rule:
\[/some-regexp/\], },

// Inline CSS\'in sıkıştırılması (Minification) minify: true }); Kod
Kaynağı ve Konfigürasyon Referansları:.4Bu konfigürasyonda extract: true
parametresi hayati önem taşır. Eğer bu parametre false olursa, kritik
stiller hem HTML içinde inline olarak hem de harici CSS dosyasında
kalır, bu da gereksiz bayt transferine yol açar. dimensions dizisi ise
tek bir cihaz yerine geniş bir cihaz yelpazesinde sayfanın düzgün
görünmesini garanti altına alır.41.3. Kritik Olmayan CSS\'in Asenkron
Yüklenme StratejileriKritik CSS inline edildikten sonra, geriye kalan
stil dosyasının (yukarıdaki örnekte async-styles.css) oluşturmayı
engellemeden yüklenmesi gerekir. Bunun için kullanılan teknikler yıllar
içinde evrimleşmiştir ve 2025 yılı itibarıyla en geçerli yöntemler
şunlardır.1.3.1. preload Hack ve Modern YaklaşımEn yaygın ve
performanslı yöntem, link etiketinin rel=\"preload\" özelliği ile
as=\"style\" kullanarak tarayıcıya \"bu dosyayı indir ama hemen
uygulama\" demektir. Dosya indirmesi tamamlandığında (onload olayı), rel
değeri stylesheet olarak değiştirilerek stiller uygulanır.2HTML\<link
rel=\"preload\" href=\"/css/async-styles.css\" as=\"style\"
onload=\"this.onload=null;this.rel=\'stylesheet\'\"\> \<noscript\>
\<link rel=\"stylesheet\" href=\"/css/async-styles.css\"\> \</noscript\>
this.onload=null ifadesi, bazı tarayıcılarda olayın birden fazla kez
tetiklenmesini önlemek için bir güvenlik önlemidir. noscript etiketi ise
JavaScript\'in devre dışı olduğu durumlar için zorunlu bir geri dönüş
(fallback) mekanizmasıdır.21.3.2. Medya Sorgusu ManipülasyonuScott Jehl
tarafından popülerleştirilen ve hala geçerliliğini koruyan bir diğer
yöntem, tarayıcının \"eşleşmeyen medya tiplerini düşük öncelikle
yükleme\" davranışını kullanmaktır. Tarayıcı, media=\"print\" olarak
işaretlenmiş bir stil dosyasını render-blocking olarak değerlendirmez,
çünkü o an ekran (screen) için render yapmaktadır. Dosya yüklendiğinde
medya tipi all veya screen olarak değiştirilerek stiller aktif
edilir.7HTML\<link rel=\"stylesheet\" href=\"/css/site.css\"
media=\"print\" onload=\"this.media=\'all\'\"\> Bu yöntem, preload
desteği olmayan çok eski tarayıcılarda bile asenkron yüklemeyi garanti
eder. Ancak modern tarayıcılarda fetchpriority kontrolü açısından
preload yöntemi daha granüler bir kontrol sunar.1.4. CSS Seçici
Performansı ve Render MaliyetiLCP ve TBT\'yi etkileyen bir diğer faktör,
CSS seçicilerinin (selectors) karmaşıklığıdır. Tarayıcılar CSS
seçicilerini sağdan sola doğru okur. Örneğin .menu \> li \> a seçicisi
için tarayıcı önce sayfadaki tüm \<a\> etiketlerini bulur, sonra
bunların \<li\> içinde olup olmadığına, sonra da .menu içinde olup
olmadığına bakar.Verimsiz: div \> div \> ul \> li \> a (Derinlik
arttıkça hesaplama maliyeti artar).Verimli: .nav-link (Doğrudan sınıf
hedefleme, \"Match\" süresi çok daha kısadır).Derin iç içe geçmiş
yapılar, özellikle DOM boyutu büyüdükçe \"Recalculate Style\" işleminin
süresini uzatır ve main thread\'i meşgul ederek TBT\'yi artırır.91.4.1.
PurgeCSS ve Dinamik Sınıf GüvenliğiProjemizde Tailwind CSS veya
Bootstrap gibi frameworkler kullanılıyorsa, kullanılmayan CSS\'lerin
temizlenmesi (Tree Shaking for CSS) şarttır. Ancak JavaScript ile
dinamik olarak oluşturulan sınıflar (örneğin class=\"text-\${error?
\'red\' : \'green\'}\") PurgeCSS tarafından tespit edilemeyebilir ve
silinebilir. Bu durum, kritik hatalara ve görsel bozukluklara yol
açar.Bu sorunu önlemek için safelist (güvenli liste)
kullanılmalıdır:JavaScript// tailwind.config.js veya purgecss config
module.exports = { content: \[\'./src/\*\*/\*.html\',
\'./src/\*\*/\*.js\'\], safelist:, }, \], //\... } Bu konfigürasyon,
dinamik olarak üretilen sınıfların production build sırasında
silinmemesini garanti altına alır.102. JavaScript Main Thread
Optimizasyonu ve TBT İyileştirmesiMevcut 4.010 ms\'lik TBT değeri,
uygulamanın etkileşim açısından felç durumda olduğunu göstermektedir.
Mobil cihazların işlemci gücünün masaüstüne göre sınırlı olduğu
düşünüldüğünde, ana iş parçacığının (Main Thread) her milisaniyesi
değerlidir. Bu bölümde, JavaScript\'in tarayıcı üzerindeki yükünü
azaltacak ileri seviye teknikler incelenecektir.2.1. Düzen Bozulması
(Layout Thrashing) ve Zorunlu Senkron DüzenWeb performansının sessiz
katili \"Layout Thrashing\"dir. Tarayıcı, normal şartlarda DOM
değişikliklerini ve stil güncellemelerini bir kuyrukta toplar ve bir
sonraki kare (frame) çizilmeden hemen önce topluca uygular. Ancak,
JavaScript kodu içinde bir stil değişikliği yaptıktan hemen sonra, o
elementin hesaplanmış bir geometrik özelliğini (örneğin offsetWidth,
clientHeight, getComputedStyle) okumaya çalışırsanız, tarayıcı kuyruğu
bekletemez. Size doğru değeri verebilmek için o anki tüm değişiklikleri
uygular ve düzeni (layout) zorla yeniden hesaplar. Buna \"Forced
Synchronous Layout\" denir.132.1.1. Sorunun Tespiti ve Kod ÖrneğiEğer bu
işlem bir döngü içinde yapılırsa (Layout Thrashing), sayfa performansı
çakılır.Hatalı Kod (Layout Thrashing):JavaScriptconst boxes =
document.querySelectorAll(\'.box\');

// Her iterasyonda bir okuma ve bir yazma işlemi yapılıyor. // Yazma
işlemi DOM\'u kirletiyor (invalidate), sonraki okuma işlemi için //
tarayıcı mecburen layout hesaplıyor. for (let i = 0; i \< boxes.length;
i++) { const width = boxes\[i\].offsetWidth; // OKUMA (Burada Forced
Reflow tetiklenir) boxes\[i\].style.width = (width + 10) + \'px\'; //
YAZMA } Bu kodda boxes.length kadar reflow işlemi gerçekleşir. Eğer 100
kutu varsa, tarayıcı 100 kere sayfa düzenini baştan hesaplar.132.1.2.
Çözüm: Batching (Toplu İşlem) ve requestAnimationFrameÇözüm, okuma ve
yazma işlemlerini birbirinden ayırmaktır (Read-Write Separation). Önce
tüm değerler okunmalı, sonra hepsi tek seferde yazılmalıdır.Optimize
Edilmiş Kod (Batching):JavaScriptconst boxes =
document.querySelectorAll(\'.box\'); const widths =;

// Faz 1: Sadece OKUMA (Layout değişmiyor, hızlı) for (let i = 0; i \<
boxes.length; i++) { widths.push(boxes\[i\].offsetWidth); }

// Faz 2: Sadece YAZMA (Tarayıcı bunları tek seferde render edebilir) //
İdeal olarak requestAnimationFrame içinde yapılmalı
requestAnimationFrame(() =\> { for (let i = 0; i \< boxes.length; i++) {
boxes\[i\].style.width = (widths\[i\] + 10) + \'px\'; } });
requestAnimationFrame (rAF), yazdığımız DOM manipülasyon kodunun
tarayıcının render döngüsüyle (VSync) senkronize çalışmasını sağlar. Bu
sayede işlemler, tarayıcının boyama yapmaya hazırlandığı en uygun
zamanda (frame başlangıcında) yürütülür.16Büyük projelerde bu disiplini
sağlamak zordur. Bu nedenle FastDOM gibi kütüphaneler kullanılarak
okuma/yazma işlemleri otomatik olarak kuyruğa alınabilir ve rAF içinde
topluca çalıştırılabilir.182.2. Pasif Olay Dinleyicileri (Passive Event
Listeners)Mobil cihazlarda kaydırma (scrolling) performansı, kullanıcı
deneyiminin en kritik parçasıdır. Tarayıcılar, bir touchstart veya wheel
olayı tetiklendiğinde, JavaScript kodunun event.preventDefault() çağırıp
kaydırmayı iptal edip etmeyeceğini bilmek ister. Bu nedenle, varsayılan
olarak JS kodu bitene kadar kaydırma işlemini başlatmazlar. Bu bekleme
süresi, kaydırmada takılmalara (scroll jank) neden olur.Eğer olay
dinleyicisi içinde preventDefault() kullanmayacaksak, bunu tarayıcıya {
passive: true } opsiyonu ile bildirmeliyiz. Bu sayede tarayıcı JS kodunu
beklemeden, \"main thread\"den bağımsız olarak \"compositor thread\"
üzerinde kaydırmayı başlatır.20Uygulama:JavaScript// Kaydırma
performansını artıran pasif dinleyici
document.addEventListener(\'touchstart\', onTouchStart, { passive: true
}); document.addEventListener(\'wheel\', onWheel, { passive: true });
Google Lighthouse raporlarındaki \"Does not use passive listeners to
improve scrolling performance\" uyarısı bu yöntemle çözülür.222.3. Uzun
Görevlerin (Long Tasks) Parçalanması ve YieldingJavaScript\'in
\"Run-to-completion\" (tamamlanana kadar çalış) doğası gereği, 50ms\'den
uzun süren herhangi bir işlem (Long Task), ana iş parçacığını kilitler
ve kullanıcı girişlerini engeller. TBT\'yi düşürmek için bu görevlerin
parçalanması (chunking) ve aralarda ana iş parçacığının nefes almasına
(yielding) izin verilmesi gerekir.Geleneksel Yöntem
(setTimeout):JavaScriptfunction heavyTask() { // Görevin ilk parçası
processFirstPart();

// Kontrolü tarayıcıya geri ver, kalanı sonra yap setTimeout(() =\> {
processSecondPart(); }, 0); } Modern Yöntem (scheduler.postTask veya
requestIdleCallback):Düşük öncelikli işler (örneğin analitik verisi
gönderme) için requestIdleCallback kullanılarak, tarayıcının boş kaldığı
anlar değerlendirilmelidir. Yüksek öncelikli işler için ise
scheduler.postTask API\'si (destekleyen tarayıcılarda)
kullanılabilir.2.4. JavaScript Yükleme Stratejileri: defer vs
asyncScript etiketlerinin \<head\> içinde senkron olarak yüklenmesi,
HTML ayrıştırmasını durdurur. Bunu önlemek için defer veya async
kullanılmalıdır.6defer: Script, HTML ayrıştırması bitene kadar
(DOMContentLoaded öncesi) bekler ve HTML\'deki sırasına göre
çalıştırılır. DOM manipülasyonu yapan ve birbirine bağımlı scriptler
için idealdir.async: Script indiği anda HTML ayrıştırmasını durdurup
çalışır. Yüklenme sırası garanti edilmez. Google Analytics gibi
bağımsız, DOM\'a kritik müdahalesi olmayan scriptler için
kullanılmalıdır.Mevcut projede, render için kritik olmayan tüm JS
dosyaları defer edilmeli veya modül sistemi (type=\"module\")
kullanılarak (varsayılan olarak defer davranır) yüklenmelidir.3. LCP
Kaynak Önceliklendirme ve Ağ Şelalesi (Network Waterfall)
OptimizasyonuLCP\'nin 9.5 saniye olması, ağ üzerindeki kaynak yarışının
(resource contention) yönetilemediğini gösterir. LCP iyileştirmesi,
sadece dosya boyutunu küçültmek değil, doğru dosyanın doğru zamanda
yüklenmesini sağlamaktır.3.1. LCP Alt Bileşenleri ve TeşhisLCP süresi 4
alt bileşene ayrılır ve her biri için ayrı strateji gerekir 23:Time to
First Byte (TTFB): Sunucunun yanıt verme süresi. (Sunucu tarafı
optimizasyon, CDN kullanımı).Resource Load Delay: Tarayıcının LCP
görselini indirmeye başlaması için geçen süre. (En büyük sorun
genellikle budur).Resource Load Duration: Görselin indirilme süresi.
(Bant genişliği ve dosya boyutu ile ilgili).Element Render Delay: Görsel
indikten sonra ekrana çizilme süresi. (JS bloklaması ve render süreci
ile ilgili).3.2. fetchpriority=\"high\" ile Öncelik ArtırmaTarayıcılar
kaynaklara otomatik öncelik atar (Script ve CSS yüksek, İmg düşük). LCP
görseli genellikle bir \<img\> etiketi olduğundan, varsayılan olarak
düşük öncelikle başlar. fetchpriority=\"high\" özniteliği, tarayıcıya bu
görselin diğerlerinden daha önemli olduğunu ve öne alınması gerektiğini
söyler.25Uygulama:HTML\<img src=\"hero-banner.webp\" alt=\"Ana
Kampanya\" fetchpriority=\"high\"\> Google Flights örneğinde bu basit
değişiklik LCP\'yi 2.6 saniyeden 1.9 saniyeye düşürmüştür.27 Bu yöntem,
özellikle LCP görselinin HTML içinde tanımlı olduğu durumlarda
\"Resource Load Delay\"i minimize eder.3.3. CSS Arka Plan Görselleri ve
preload StratejisiEğer LCP öğesi bir CSS background-image ise, tarayıcı
CSS dosyasını indirip, parse edip, stil ağacını oluşturana kadar o
görseli indirmez. Bu durum devasa bir gecikmeye yol açar. Bunu çözmek
için görsel link rel=\"preload\" ile HTML\'de önceden
bildirilmelidir.Kritik Kombinasyon: preload + fetchpriority Sadece
preload kullanmak bazen yeterli olmaz çünkü preload edilen görseller de
düşük öncelikli olabilir. fetchpriority=\"high\" ile preload
birleştirilmelidir.28HTML\<link rel=\"preload\"
href=\"/images/hero-bg.webp\" as=\"image\" fetchpriority=\"high\"\> 3.4.
Görsel Kod Çözme (Decoding) ve Yükleme (Loading) AyarlarıLCP görseli
için asla loading=\"lazy\" kullanılmamalıdır. Lazy loading, görselin
viewport\'a girip girmediğini kontrol etmek için JS gerektirir ve
yüklemeyi geciktirir. LCP görseli eager (varsayılan) olmalıdır.Ayrıca,
decoding=\"async\" özelliği LCP görseli için riskli olabilir. Bu
özellik, görselin kod çözümünü ana thread\'den alır ancak paint işlemini
hafifçe geciktirebilir. LCP görseli için decoding=\"sync\" (varsayılan)
kullanımı genellikle daha iyi sonuç verirken, ekran dışı görseller için
async decoding önerilir.25Özet Tablo: LCP vs Diğer GörsellerÖzellikLCP
GörseliDiğer Görsellerloadingeager (veya boş)lazyfetchpriorityhighlow
veya autodecodingsync (veya boş)asyncPreloadGerekirse (CSS BG
ise)Hayır4. Font ve Görsel Stratejisi: Yeni Nesil Formatlar ve
TeslimatGörseller ve yazı tipleri, sayfa ağırlığının büyük kısmını
oluşturur. Mobil skorun 63\'te kalmasının ana nedenlerinden biri, mobil
cihazlara masaüstü için optimize edilmiş (veya edilmemiş) varlıkların
gönderilmesidir.4.1. Font Mimarisi: Self-Hosting ve PerformansGoogle
Fonts gibi CDN\'ler, her yeni ziyaretçide ekstra DNS sorgusu, TCP
bağlantısı ve SSL el sıkışması (TLS Handshake) gerektirir. Ayrıca,
gizlilik (GDPR) riskleri taşır.31 Performans testleri, fontların
\"self-host\" (kendi sunucumuzda barındırma) edilmesinin daha hızlı
olduğunu kanıtlamaktadır.324.1.1. WOFF2 ve Subset KullanımıYalnızca
WOFF2 formatı kullanılmalıdır. WOFF2, WOFF\'a göre %30 daha iyi
sıkıştırma sağlar ve modern tarayıcıların %98\'i tarafından desteklenir.
Eski formatlar (TTF, EOT) tamamen kaldırılmalıdır. Ayrıca, font
dosyalarından kullanılmayan karakter setlerinin (örneğin Kiril veya Asya
karakterleri) çıkarılması (subsetting) dosya boyutunu %50\'den fazla
küçültebilir.4.1.2. Cache-Control: immutableStatik varlıklar (fontlar,
görseller) için sunucu yanıtlarında immutable direktifi kullanılmalıdır.
Bu, tarayıcıya dosyanın asla değişmeyeceğini ve sunucuya \"değişti mi?\"
(revalidate) sorusunu sormadan doğrudan disk önbelleğinden kullanması
gerektiğini söyler.Nginx Konfigürasyonu:Nginxlocation \~\*
\\.(woff2\|woff\|css\|js\|webp\|avif)\$ { \# 1 Yıl (31536000 saniye)
önbellek ve immutable add_header Cache-Control \"public,
max-age=31536000, immutable\"; access_log off; } Bu ayar, tekrar eden
ziyaretlerde ağ trafiğini sıfıra indirir.344.2. Responsive Görseller ve
sizes MatematiğiMobil cihazlara 1920px genişliğinde görsel göndermek,
bant genişliği israfıdır. srcset ve sizes nitelikleri ile tarayıcıya
seçenekler sunulmalı ve en uygun görseli seçmesi sağlanmalıdır.4.2.1.
sizes Özniteliğinin ÖnemiÇoğu geliştirici srcset kullanır ancak sizes
özniteliğini ihmal eder veya yanlış kullanır. sizes, görselin ekrandaki
render genişliğini tarayıcıya bildirir. Eğer sizes belirtilmezse,
tarayıcı varsayılan olarak 100vw (ekranın tamamı) değerini kullanır ve
gereğinden büyük bir görseli indirebilir.36Formül: Görselin Layout
Genişliği / Viewport Genişliği.Örnek Senaryo:3 kolonlu bir ürün grid
yapısı. Mobilde tek kolon, tablette 2, masaüstünde 3.Mobil (0-600px):
Görsel genişliği ekranın %90\'ı.Tablet (600-900px): Görsel genişliği
ekranın %45\'i.Desktop (900px+): Görsel genişliği ekranın %30\'u (veya
sabit 300px).Doğru HTML Yapısı:HTML\<img src=\"urun-800.jpg\"
srcset=\"urun-400.jpg 400w, urun-800.jpg 800w, urun-1200.jpg 1200w\"
sizes=\"(max-width: 600px) 90vw, (max-width: 900px) 45vw, 300px\"
alt=\"Ürün Detayı\" loading=\"lazy\"\> Bu yapı sayesinde, 400px
genişliğindeki bir mobil ekranda tarayıcı 90vw (360px) hesaplar ve
srcset içinden 400w olan en uygun küçük görseli indirir. 1200w\'luk
görsel indirilmez.374.2.2. AVIF FormatıJPEG ve PNG yerine, yeni nesil
AVIF formatı kullanılmalıdır. AVIF, WebP\'den bile %20 daha iyi
sıkıştırma sunar. \<picture\> etiketi ile \"Graceful Degradation\"
sağlanmalıdır.HTML\<picture\> \<source srcset=\"image.avif\"
type=\"image/avif\"\> \<source srcset=\"image.webp\"
type=\"image/webp\"\> \<img src=\"image.jpg\" alt=\"Fallback\"\>
\</picture\> 5. Geleceğe Yönelik Optimizasyon: Speculation Rules APIWeb
performansının yeni sınırı, sayfaların hızlı yüklenmesi değil, anında
(instant) yüklenmesidir. 2025 yılı itibarıyla Chromium tabanlı
tarayıcılarda olgunlaşan Speculation Rules API, kullanıcının bir sonraki
adımda nereye gideceğini tahmin ederek (veya işaret edilerek) o sayfayı
arka planda tamamen oluşturur (Prerender).39Eski \<link
rel=\"prerender\"\> metodundan farklı olarak, Speculation Rules API çok
daha esnek ve güçlüdür. JavaScript nesneleri ile kurallar
tanımlanır.Örnek Senaryo: Kullanıcı \"Sepetim\" ikonunun üzerine
geldiğinde (hover), sepet sayfası arka planda yüklenir. Kullanıcı
tıkladığında sayfa 0 ms gecikmeyle (network beklemesi olmadan)
açılır.Uygulama:HTML\<script type=\"speculationrules\"\> {
\"prerender\": }, \"eagerness\": \"moderate\" // Hover veya etkileşim
anında tetikle } \] } \</script\> Bu teknik, LCP ve CLS (Cumulative
Layout Shift) sorunlarını, sonraki sayfa geçişleri için tamamen ortadan
kaldırır. Ancak veri kullanımı ve sunucu yükü dikkate alınarak dikkatli
kullanılmalıdır (\"eagerness\" ayarı ile kontrol edilir).406. Teknik
Uygulama Planı ve Yol HaritasıBu kapsamlı dönüşüm projesi, riskleri
yönetmek ve etkileri ölçmek adına 3 fazda uygulanmalıdır.Faz 1: Hızlı
Kazanımlar ve Konfigürasyon (Hafta 1)Amaç: Kodda mimari değişiklik
yapmadan metrikleri iyileştirmek.LCP Görseli: fetchpriority=\"high\"
eklenecek, loading=\"lazy\" kaldırılacak.Fontlar: Self-host edilecek,
CSS içinde \@font-face tanımları yapılacak ve font-display: swap
eklenecek.Cache: Nginx konfigürasyonuna immutable header eklenecek.Pasif
Listener: Scroll eventleri { passive: true } ile güncellenecek.Faz 2:
Mimari Dönüşüm (Hafta 2-3)Amaç: Build sürecini ve kaynak yükleme
sırasını değiştirmek.Kritik CSS: critical paketi CI/CD hattına entegre
edilecek. HTML şablonları inline style ve preload link yapısına
dönüştürülecek.Görsel Pipeline: Tüm görseller için AVIF dönüşümü ve
srcset/sizes otomasyonu kurulacak.JS Temizliği: webpack-bundle-analyzer
ile gereksiz paketler temizlenecek, Layout Thrashing noktaları
requestAnimationFrame ile düzeltilecek.Faz 3: İleri Seviye Optimizasyon
(Hafta 4)Amaç: \"Instant\" deneyim sunmak.Speculation Rules: Navigasyon
linkleri için prerender kuralları tanımlanacak.Code Splitting: Rota
bazlı JS yüklemesi (Dynamic Import) optimize edilecek.İzleme: RUM (Real
User Monitoring) araçları ile sahadan veri toplanarak LCP alt
kırılımları (TTFB vs Load Delay) takip edilecek.Bu stratejik planın
uygulanmasıyla, LCP süresinin 2.5 saniyenin altına inmesi, TBT\'nin
200ms seviyelerine çekilmesi ve Mobil Skorun 90+ bandına yükselmesi
teknik olarak mümkündür ve hedeflenmelidir.
