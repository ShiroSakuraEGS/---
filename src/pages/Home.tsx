import { Link } from 'react-router-dom';
import { ArrowRight, Leaf, Users, Building2, MapPin, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Calculator from '@/components/Calculator';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-emerald-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2832&auto=format&fit=crop')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-900/80 to-transparent" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 lg:py-48 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              投資綠色能源，<br />
              共創永續未來。
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 mb-10 leading-relaxed">
              北港溪沼氣發電眾包平台，連結大眾、企業與畜牧業者。
              減少農業廢水，創造穩定收益與碳權價值。
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/projects">
                <Button size="lg" className="bg-white text-emerald-900 hover:bg-emerald-50 h-14 px-8 text-lg font-semibold">
                  探索投資專案 <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <a href="#calculator">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 h-14 px-8 text-lg font-semibold">
                  畜牧業者試算
                </Button>
              </a>
            </div>
          </div>
          <div className="hidden lg:flex w-80 h-80 items-center justify-center p-8 bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20">
            <img src="/logo.png" alt="北港溪沼氣發電眾包平台 Logo" className="w-full h-auto object-contain brightness-0 invert" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">多方共贏的生態系</h2>
            <p className="text-lg text-slate-600">
              透過創新的群眾募資模式，我們將畜牧業的環保挑戰轉化為綠色投資機會，結合政府資源確保計畫穩健運行。
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">大眾投資人</h3>
              <p className="text-slate-600 leading-relaxed">
                參與綠能建設，獲得來自台電躉購的穩定金錢回報，讓您的資金為地球盡一份心力。
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                <Building2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">企業參與</h3>
              <p className="text-slate-600 leading-relaxed">
                透過投資取得減碳效益證明與碳權憑證，達成企業 ESG 目標，同時享有彈性的收益比例。
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
                <Leaf className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">畜牧業者</h3>
              <p className="text-slate-600 leading-relaxed">
                零出資升級廢水處理設備，解決環保法規壓力，改善農場環境，專注於本業經營。
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3 text-balance">農業部 沼氣發電推動計畫辦公室</h3>
              <p className="text-slate-600 leading-relaxed">
                平台聯繫辦公室進行實地考察與專業顧問服務，並對接優質設備商，確保工程符合技術標準。
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-24 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-6">深耕雲林與嘉義北港溪流域</h2>
              <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                北港溪流域是台灣畜牧業的重鎮，同時也面臨著嚴峻的河川污染挑戰。我們專注於此區域，透過設立獨立專案公司 (SPV)，偕同「農業部 沼氣發電推動計畫辦公室」進行實地考察與專業顧問諮詢，協助在地農場對接優質設備商並完成建置，從源頭減少廢水排放。
              </p>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                  <div>
                    <strong className="block text-slate-900">雲林縣</strong>
                    <span className="text-slate-600">全台養豬頭數最多的縣市，具備極大的沼氣發電潛力。</span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-6 h-6 text-emerald-600 shrink-0 mt-1" />
                  <div>
                    <strong className="block text-slate-900">嘉義縣</strong>
                    <span className="text-slate-600">北港溪南岸，我們已成功輔導多家農場完成初步評估。</span>
                  </div>
                </li>
              </ul>
            </div>
            <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl border border-slate-200 bg-white p-4 flex items-center justify-center">
              <img 
                src="/biological_Beigang.svg" 
                alt="台灣雲林與嘉義北港溪地圖" 
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Calculator Section */}
      <section id="calculator" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">畜牧業者專屬評估</h2>
            <p className="text-lg text-slate-600">
              想了解您的農場是否適合建置沼氣發電？使用我們的基礎換算器，一秒獲得預估報告。
            </p>
          </div>
          <Calculator />
        </div>
      </section>
    </div>
  );
}
