'use client';

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#2563eb', '#16a34a', '#eab308', '#dc2626', '#8b5cf6', '#06b6d4', '#f97316', '#ec4899', '#6366f1'];

interface DashboardChartsProps {
  salesByLocation: { name: string; count: number; total: number }[];
  expensesByCategory: { label: string; total: number; count: number }[];
  leadsByStatus: { label: string; count: number }[];
  vehiclesByStatus: { label: string; count: number }[];
}

export function DashboardCharts({
  salesByLocation,
  expensesByCategory,
  leadsByStatus,
  vehiclesByStatus,
}: DashboardChartsProps) {
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      {/* Sales by Location */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ventas por ubicación (30 días)</CardTitle>
        </CardHeader>
        <CardContent>
          {salesByLocation.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={salesByLocation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} fontSize={11} />
                <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Bar dataKey="total" fill="#2563eb" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">Sin datos</p>
          )}
        </CardContent>
      </Card>

      {/* Expenses by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Gastos por categoría (30 días)</CardTitle>
        </CardHeader>
        <CardContent>
          {expensesByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  dataKey="total"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ label }) => label}
                  fontSize={11}
                >
                  {expensesByCategory.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">Sin datos</p>
          )}
        </CardContent>
      </Card>

      {/* Leads by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Leads por estado</CardTitle>
        </CardHeader>
        <CardContent>
          {leadsByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={leadsByStatus} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="label" type="category" width={100} fontSize={12} />
                <Tooltip />
                <Bar dataKey="count" fill="#16a34a" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">Sin datos</p>
          )}
        </CardContent>
      </Card>

      {/* Vehicles by Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Vehículos por estado</CardTitle>
        </CardHeader>
        <CardContent>
          {vehiclesByStatus.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={vehiclesByStatus}
                  dataKey="count"
                  nameKey="label"
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  label={({ label, count }) => `${label}: ${count}`}
                  fontSize={11}
                >
                  {vehiclesByStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">Sin datos</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
