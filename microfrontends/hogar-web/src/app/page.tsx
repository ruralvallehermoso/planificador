import { CheckCircle2, Utensils, Calendar as CalendarIcon, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Hola, Familia! 👋</h1>
          <p className="text-gray-500 mt-1">Aquí tenéis el resumen de hoy</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-gray-500">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tareas Card */}
        <Link href="/apps/hogar/tareas" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">
              2 Pendientes
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Tareas</h3>
          <p className="text-sm text-gray-500">Recoger juguetes, Poner mesa...</p>
        </Link>

        {/* Comidas Card */}
        <Link href="/apps/hogar/comidas" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-orange-50 rounded-xl text-orange-600 group-hover:bg-orange-600 group-hover:text-white transition-colors">
              <Utensils className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Cena de hoy</h3>
          <p className="text-sm text-gray-500">Tortilla de patatas</p>
        </Link>

        {/* Calendario Card */}
        <Link href="/apps/hogar/calendario" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-pink-50 rounded-xl text-pink-600 group-hover:bg-pink-600 group-hover:text-white transition-colors">
              <CalendarIcon className="w-6 h-6" />
            </div>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Eventos</h3>
          <p className="text-sm text-gray-500">Cumpleaños Abuela (Sáb)</p>
        </Link>

        {/* Lista Compra Card */}
        <Link href="/apps/hogar/lista-compra" className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <Package className="w-6 h-6" />
            </div>
            <span className="text-xs font-semibold bg-red-100 text-red-700 px-2 py-1 rounded-full">
              Falta leche
            </span>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Lista compra</h3>
          <p className="text-sm text-gray-500">3 artículos apuntados</p>
        </Link>
      </div>

      {/* Main Content Area - Placeholder for now */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-8 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">¡Sigue así, Campeón! 🌟</h2>
            <p className="text-indigo-100 mb-6 max-w-md">
              Has completado 15 misiones esta semana. ¡Estás a solo 5 puntos de elegir la cena del viernes!
            </p>
            <button className="bg-white text-indigo-600 px-6 py-2 rounded-full font-bold text-sm hover:bg-opacity-90 transition-opacity">
              Ver mis puntos
            </button>
          </div>
          {/* Decoration circles */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500 opacity-20 rounded-full translate-y-1/4 -translate-x-1/4 blur-2xl"></div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100">
          <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-gray-400" />
            Próximos días
          </h3>
          <div className="space-y-4">
            {[
              { day: 'Mañana', event: 'Excursión Colegio', color: 'bg-green-100 text-green-700' },
              { day: 'Sábado', event: 'Comida familiar', color: 'bg-orange-100 text-orange-700' },
              { day: 'Domingo', event: 'Partido Fútbol', color: 'bg-blue-100 text-blue-700' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{item.event}</h4>
                  <p className="text-xs text-gray-500">{item.day}</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${item.color.split(' ')[0].replace('bg-', 'bg-')}`}></div>
              </div>
            ))}
            <button className="w-full mt-2 text-sm text-center text-gray-400 hover:text-indigo-600 py-2 transition-colors flex items-center justify-center gap-1 group">
              Ver todo el calendario
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
