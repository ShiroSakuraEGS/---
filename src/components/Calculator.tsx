import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Calculator as CalcIcon, PiggyBank, Zap, Wrench, Coins } from 'lucide-react';

export default function Calculator() {
  const [heads, setHeads] = useState<number | ''>('');
  const [results, setResults] = useState<any>(null);

  const calculate = () => {
    const N = Number(heads);
    if (!N || N <= 0) return;

    // Formulas
    const dailyBiogas = N * 0.06; // m³/day
    const annualPower = N * 0.0062; // 10k kWh/year
    const setupCost = N * 0.2282; // 10k TWD
    const annualMaintenance = N * 0.0246; // 10k TWD/year
    const annualSales = N * 0.04356; // 10k TWD/year
    
    // Assuming subsidy is 120 for 2000 heads, so 0.06 per head
    const subsidy = N * 0.06; // 10k TWD
    
    const paybackYears = (setupCost - subsidy) / (annualSales - annualMaintenance);

    setResults({
      dailyBiogas: dailyBiogas.toFixed(1),
      annualPower: annualPower.toFixed(2),
      setupCost: setupCost.toFixed(1),
      subsidy: subsidy.toFixed(1),
      annualMaintenance: annualMaintenance.toFixed(1),
      annualSales: annualSales.toFixed(1),
      paybackYears: paybackYears.toFixed(1)
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-emerald-100">
      <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
            <CalcIcon className="w-6 h-6" />
          </div>
          <CardTitle className="text-2xl text-emerald-900">畜牧業者基礎換算器</CardTitle>
        </div>
        <CardDescription className="text-emerald-700/70 text-base">
          輸入您的飼養頭數，一秒評估沼氣發電建置成本與預估收益。
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-8">
        <div className="flex gap-4 items-end mb-8">
          <div className="flex-1 space-y-2">
            <label className="text-sm font-medium text-slate-700">飼養頭數 (豬隻)</label>
            <Input 
              type="number" 
              placeholder="例如：2000" 
              value={heads} 
              onChange={(e) => setHeads(e.target.value ? Number(e.target.value) : '')}
              className="text-lg py-6"
            />
          </div>
          <Button onClick={calculate} size="lg" className="h-12 px-8 text-lg">
            開始試算
          </Button>
        </div>

        {results && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-4">
              <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">
                <Wrench className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">預估建置成本</p>
                <p className="text-2xl font-bold text-slate-900">{results.setupCost} <span className="text-base font-normal text-slate-500">萬元</span></p>
                <p className="text-sm text-emerald-600 mt-1">可獲農業部補助約 {results.subsidy} 萬元</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-4">
              <div className="p-2 bg-amber-100 text-amber-600 rounded-lg shrink-0">
                <Coins className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">預估年化收益 (售電)</p>
                <p className="text-2xl font-bold text-slate-900">{results.annualSales} <span className="text-base font-normal text-slate-500">萬元/年</span></p>
                <p className="text-sm text-slate-500 mt-1">扣除維護費 {results.annualMaintenance} 萬元/年</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-4">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg shrink-0">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-slate-500 font-medium mb-1">預估年發電量</p>
                <p className="text-2xl font-bold text-slate-900">{results.annualPower} <span className="text-base font-normal text-slate-500">萬度/年</span></p>
                <p className="text-sm text-slate-500 mt-1">每日沼氣產量 {results.dailyBiogas} m³</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-4">
              <div className="p-2 bg-emerald-200 text-emerald-700 rounded-lg shrink-0">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-emerald-800 font-medium mb-1">預估成本回收年限</p>
                <p className="text-3xl font-bold text-emerald-600">{results.paybackYears} <span className="text-lg font-normal">年</span></p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
