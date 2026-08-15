import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CloudRain, CloudSun, Droplets, HardHat, Info, Sun, Thermometer, Wind } from "lucide-react";
import { CITIES_WEST_AFRICA, getWeatherForCity } from "@/lib/weather";

export function WeatherSiteWidget() {
  const [city, setCity] = useState<string>("Cotonou");
  const weather = getWeatherForCity(city);

  return (
    <Card className="border-primary/20 shadow-sm bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <CardHeader className="pb-2 flex flex-row items-center justify-between space-y-0">
        <div className="flex items-center gap-2">
          <HardHat className="h-5 w-5 text-amber-600" />
          <CardTitle className="text-sm font-semibold">Météo & Coulage Béton</CardTitle>
        </div>
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger className="h-7 w-[140px] text-xs">
            <SelectValue placeholder="Ville" />
          </SelectTrigger>
          <SelectContent>
            {CITIES_WEST_AFRICA.map((c) => (
              <SelectItem key={c} value={c} className="text-xs">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {weather.condition === "sunny" ? (
              <Sun className="h-8 w-8 text-amber-500 animate-pulse" />
            ) : weather.condition === "rain" || weather.condition === "thunderstorm" ? (
              <CloudRain className="h-8 w-8 text-blue-500" />
            ) : (
              <CloudSun className="h-8 w-8 text-sky-500" />
            )}
            <div>
              <div className="text-xl font-bold">{weather.temperature}°C</div>
              <div className="text-xs text-muted-foreground">{weather.conditionLabel}</div>
            </div>
          </div>

          <Badge
            variant={
              weather.concretingStatus === "favorable"
                ? "default"
                : weather.concretingStatus === "caution_rain"
                  ? "destructive"
                  : "secondary"
            }
            className="text-[11px] py-0.5"
          >
            {weather.concretingStatus === "favorable"
              ? "✓ Coulage Favorable"
              : weather.concretingStatus === "caution_rain"
                ? "⚠️ Risque Pluie"
                : "⚡ Vigilance Chaleur"}
          </Badge>
        </div>

        <div className="grid grid-cols-3 gap-2 text-center text-[11px] bg-slate-100 dark:bg-slate-800/80 p-2 rounded-md">
          <div className="flex items-center justify-center gap-1">
            <Droplets className="h-3.5 w-3.5 text-blue-500" />
            <span>Humidité {weather.humidity}%</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Wind className="h-3.5 w-3.5 text-slate-500" />
            <span>Vent {weather.windSpeedKmh} km/h</span>
          </div>
          <div className="flex items-center justify-center gap-1">
            <Thermometer className="h-3.5 w-3.5 text-amber-500" />
            <span>Pluie {weather.rainProbabilityPercent}%</span>
          </div>
        </div>

        <div className="text-xs bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 p-2 rounded text-amber-900 dark:text-amber-200 flex items-start gap-1.5">
          <Info className="h-4 w-4 shrink-0 mt-0.5 text-amber-600" />
          <span>{weather.concretingAdvice}</span>
        </div>
      </CardContent>
    </Card>
  );
}
