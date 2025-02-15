import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Brain, Calendar, Flame, Target, Clock, TrendingUp } from 'lucide-react'
import { usePomodoro } from '../../hooks/usePomodoro'
import { useTimeFilter } from '../../contexts/TimeFilterContext'
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import PropTypes from 'prop-types'

const COLORS = ['#FF6B6B', '#4ECDC4', '#45B7D1']

const StatCard = ({ icon: Icon, title, value, description, trend }) => (
  <Card className="overflow-hidden">
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <div className="flex items-center gap-2">
            <h3 className="text-2xl font-bold">{value}</h3>
            {trend !== undefined && (
              <span className={`text-sm ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                {trend > 0 ? '+' : ''}{trend}%
              </span>
            )}
          </div>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

StatCard.propTypes = {
  icon: PropTypes.elementType.isRequired,
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  description: PropTypes.string,
  trend: PropTypes.number
}

const TimeChart = ({ data, dataKey = "hours" }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <defs>
          <linearGradient id="colorHours" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="name" className="text-muted-foreground" />
        <YAxis className="text-muted-foreground" />
        <Tooltip
          formatter={(value) => [`${value} horas`, "Tempo Focado"]}
          labelFormatter={(label) => `Dia: ${label}`}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
          }}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="hsl(var(--primary))"
          fillOpacity={1}
          fill="url(#colorHours)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
)

TimeChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    hours: PropTypes.number.isRequired
  })).isRequired,
  dataKey: PropTypes.string
}

const DistributionChart = ({ data }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          fill="#8884d8"
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value) => [`${value} minutos`, ""]}
          contentStyle={{
            backgroundColor: "hsl(var(--background))",
            border: "1px solid hsl(var(--border))",
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  </div>
)

DistributionChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.shape({
    name: PropTypes.string.isRequired,
    value: PropTypes.number.isRequired
  })).isRequired
}

const PomodoroReport = () => {
  const { timeFilter } = useTimeFilter()
  const {
    getTotalFocusTime,
    getAccessDays,
    getStreak,
    getWeeklyChartData,
    getMonthlyChartData,
    getSemesterChartData,
    getDistributionData,
    getProductivityTrend,
    getDailyAverage,
    formatTime,
  } = usePomodoro()

  const totalFocusTime = getTotalFocusTime()
  const accessDays = getAccessDays()
  const streak = getStreak()
  const dailyAverage = getDailyAverage()
  const productivityTrend = getProductivityTrend()
  const distributionData = getDistributionData()

  const getChartData = () => {
    switch (timeFilter) {
      case 'week':
        return getWeeklyChartData()
      case 'month':
        return getMonthlyChartData()
      case 'semester':
        return getSemesterChartData()
      default:
        return getWeeklyChartData()
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          icon={Brain}
          title="Horas Focadas"
          value={formatTime(totalFocusTime)}
          description="Tempo total de foco"
          trend={productivityTrend}
        />
        <StatCard
          icon={Calendar}
          title="Dias Acessados"
          value={accessDays}
          description="Total de dias de estudo"
        />
        <StatCard
          icon={Flame}
          title="Dias em Sequência"
          value={streak}
          description="Sua sequência atual"
        />
        <StatCard
          icon={Clock}
          title="Média Diária"
          value={formatTime(dailyAverage)}
          description="Tempo médio por dia"
        />
        <StatCard
          icon={Target}
          title="Taxa de Conclusão"
          value="85%"
          description="Sessões completadas"
        />
        <StatCard
          icon={TrendingUp}
          title="Produtividade"
          value={`${productivityTrend > 0 ? '+' : ''}${productivityTrend}%`}
          description="Em relação à semana anterior"
        />
      </div>

      <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>
              Análise de Tempo Focado - {timeFilter === 'week' ? 'Semana' : timeFilter === 'month' ? 'Mês' : 'Semestre'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeChart data={getChartData()} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição do Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <DistributionChart data={distributionData} />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {distributionData.map((item, index) => (
                <div key={item.name} className="text-center">
                  <div className="text-sm font-medium">{item.name}</div>
                  <div 
                    className="text-2xl font-bold"
                    style={{ color: COLORS[index] }}
                  >
                    {item.value}m
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

PomodoroReport.propTypes = {
  // Adicione aqui se houver props
}

export default PomodoroReport 