import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: '00:00', power: 120 },
  { time: '04:00', power: 110 },
  { time: '08:00', power: 140 },
  { time: '12:00', power: 155 },
  { time: '16:00', power: 160 },
  { time: '20:00', power: 145 },
  { time: '24:00', power: 130 },
];

export default function IoTChart() {
  return (
    <div className="h-full w-full min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{
            top: 10,
            right: 10,
            left: -20,
            bottom: 0,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.2)" />
          <XAxis dataKey="time" stroke="rgba(255,255,255,0.7)" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}kW`} />
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', backgroundColor: 'rgba(255,255,255,0.9)', color: '#000' }}
            itemStyle={{ color: '#d97706' }}
          />
          <Area type="monotone" dataKey="power" stroke="#fff" fill="rgba(255,255,255,0.3)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
