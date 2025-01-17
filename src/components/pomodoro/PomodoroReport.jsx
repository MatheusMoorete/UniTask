import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs'
import { Brain, Calendar, Flame } from 'lucide-react'
import { usePomodoro } from '../../hooks/usePomodoro'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts'

const StatCard = ({ icon: Icon, title, value, description }) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </CardContent>
  </Card>
)

const TimeChart = ({ data, dataKey = "hours" }) => (
  <div className="h-[300px] w-full">
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip
          formatter={(value) => [`${value} horas`, "Tempo Focado"]}
          labelFormatter={(label) => `Dia: ${label}`}
        />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

const PomodoroReport = () => {
  const {
    getTotalFocusTime,
    getAccessDays,
    getStreak,
    getWeeklyChartData,
    getMonthlyChartData,
    getSemesterChartData,
    formatTime
  } = usePomodoro()

  const totalFocusTime = getTotalFocusTime()
  const accessDays = getAccessDays()
  const streak = getStreak()

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          icon={Brain}
          title="Horas Focadas"
          value={formatTime(totalFocusTime)}
          description="Tempo total de foco"
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
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Análise de Tempo Focado</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="week">
            <TabsList className="mb-4">
              <TabsTrigger value="week">Semana</TabsTrigger>
              <TabsTrigger value="month">Mês</TabsTrigger>
              <TabsTrigger value="semester">Semestre</TabsTrigger>
            </TabsList>
            <TabsContent value="week">
              <TimeChart data={getWeeklyChartData()} />
            </TabsContent>
            <TabsContent value="month">
              <TimeChart data={getMonthlyChartData()} />
            </TabsContent>
            <TabsContent value="semester">
              <TimeChart data={getSemesterChartData()} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

export default PomodoroReport 