# 🎌 AnimeAngularXIX

Una aplicación web moderna para descubrir, explorar y seguir tus animes favoritos. Construida con Angular 19 y diseñada con las mejores prácticas de desarrollo frontend.

![Angular](https://img.shields.io/badge/Angular-19.1.3-red?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue?style=flat-square&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.x-38B2AC?style=flat-square&logo=tailwind-css)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías](#-tecnologías)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Instalación](#-instalación)
- [Desarrollo](#-desarrollo)
- [Buenas Prácticas](#-buenas-prácticas)
- [Componentes Principales](#-componentes-principales)
- [API](#-api)

## ✨ Características

### 🏠 Página Principal (Home)
- Hero section moderno con estadísticas
- Carrusel de episodios recientes
- Recomendaciones de anime
- Top animes del día
- Navegación rápida a directorio y calendario

### 📚 Directorio de Animes
- Búsqueda en tiempo real
- Filtros avanzados:
  - Por género
  - Por año
  - Ordenamiento (popularidad, rating, fecha)
- Paginación optimizada
- Grid responsive de cards

### 📅 Calendario Semanal
- Vista semanal de estrenos
- Agrupación por fecha de emisión
- Cards con efecto flip 3D al hacer hover
- Información detallada de episodios:
  - Fecha de emisión
  - Temporada y número de episodio
  - Rating con estrellas
  - Sinopsis

### 🎨 Temas
- Modo claro y oscuro
- Transiciones suaves entre temas
- Gradientes personalizados
- Diseño coherente en todas las páginas

### 📱 Responsive Design
- Optimizado para móvil, tablet y desktop
- Grid adaptativo
- Navegación móvil optimizada

## 🛠 Tecnologías

### Core
- **Angular 19.1.3** - Framework principal
- **TypeScript 5.x** - Lenguaje de programación
- **RxJS** - Programación reactiva
- **Signals** - Gestión de estado moderna de Angular

### Estilos
- **TailwindCSS 3.x** - Framework de utilidades CSS
- **PostCSS** - Procesamiento de CSS
- **CSS3** - Animaciones y transiciones personalizadas

### APIs
- **TMDB API** - The Movie Database para información de animes
- **AnimeHack API** - Backend personalizado para episodios y contenido

### Herramientas de Desarrollo
- **Angular CLI** - Herramientas de línea de comandos
- **ESLint** - Linting de código
- **Prettier** - Formateo de código

## 📁 Estructura del Proyecto

```
anime-angular-xix/
├── src/
│   ├── app/
│   │   ├── core/                    # Servicios y modelos core
│   │   │   ├── guards/              # Guards de rutas
│   │   │   ├── interceptors/        # HTTP interceptors
│   │   │   ├── models/              # Interfaces y tipos
│   │   │   │   ├── anime-slider.ts
│   │   │   │   ├── episode.ts
│   │   │   │   └── player.ts
│   │   │   ├── services/            # Servicios globales
│   │   │   │   └── animes.service.ts
│   │   │   └── utils/               # Utilidades
│   │   │
│   │   ├── features/                # Módulos de características
│   │   │   └── anime/
│   │   │       ├── components/      # Componentes específicos
│   │   │       ├── models/          # Modelos del feature
│   │   │       ├── pages/           # Páginas del feature
│   │   │       │   ├── home/
│   │   │       │   ├── directory/
│   │   │       │   ├── calendar/
│   │   │       │   ├── anime-detail/
│   │   │       │   └── episode-watch/
│   │   │       └── services/        # Servicios del feature
│   │   │
│   │   ├── shared/                  # Componentes compartidos
│   │   │   ├── components/
│   │   │   │   ├── navbar/
│   │   │   │   ├── footer/
│   │   │   │   ├── poster-card/
│   │   │   │   ├── episode-card/
│   │   │   │   ├── anime-carousel/
│   │   │   │   ├── episode-carousel/
│   │   │   │   ├── star-rating/
│   │   │   │   ├── neon-loader/
│   │   │   │   ├── search-input/
│   │   │   │   ├── genre-filter/
│   │   │   │   ├── year-filter/
│   │   │   │   └── order-filter/
│   │   │   ├── directives/
│   │   │   │   ├── img-missing.directive.ts
│   │   │   │   └── swiper.directive.ts
│   │   │   ├── interceptors/
│   │   │   │   └── progress-bar.interceptor.ts
│   │   │   └── services/
│   │   │       └── progress-bar.service.ts
│   │   │
│   │   ├── app.component.ts         # Componente raíz
│   │   ├── app.config.ts            # Configuración de la app
│   │   ├── app.routes.ts            # Rutas de la aplicación
│   │   └── custom-theme.scss        # Tema personalizado
│   │
│   ├── environments/                # Variables de entorno
│   │   ├── environments.ts
│   │   └── environments.prod.ts
│   │
│   ├── assets/                      # Recursos estáticos
│   │   ├── img/
│   │   └── svg/
│   │
│   ├── index.html                   # HTML principal
│   ├── main.ts                      # Punto de entrada
│   └── styles.css                   # Estilos globales
│
├── angular.json                     # Configuración de Angular
├── tailwind.config.js              # Configuración de Tailwind
├── tsconfig.json                   # Configuración de TypeScript
└── package.json                    # Dependencias del proyecto
```

## 🚀 Instalación

### Prerrequisitos
- Node.js 18.x o superior
- npm 9.x o superior
- Angular CLI 19.x

### Pasos

1. **Clonar el repositorio**
```bash
git clone https://github.com/tu-usuario/anime-angular-xix.git
cd anime-angular-xix
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
# Editar src/environments/environments.ts
# Agregar tu API key de TMDB
```

4. **Iniciar el servidor de desarrollo**
```bash
ng serve
```

5. **Abrir en el navegador**
```
http://localhost:4200/
```

## 💻 Desarrollo

### Servidor de Desarrollo
```bash
ng serve
```
La aplicación se recargará automáticamente cuando modifiques los archivos fuente.

### Generar Componentes
```bash
# Componente
ng generate component features/anime/components/nombre-componente

# Servicio
ng generate service core/services/nombre-servicio

# Directiva
ng generate directive shared/directives/nombre-directiva

# Pipe
ng generate pipe shared/pipes/nombre-pipe
```

### Build de Producción
```bash
ng build --configuration production
```
Los archivos compilados se guardarán en `dist/`.

### Build de Desarrollo
```bash
ng build --configuration development
```

### Linting
```bash
ng lint
```

### Tests
```bash
# Unit tests
ng test

# E2E tests
ng e2e
```

## 📐 Buenas Prácticas

### Arquitectura
- **Standalone Components**: Todos los componentes son standalone para mejor tree-shaking
- **Lazy Loading**: Las rutas cargan módulos bajo demanda
- **Signals**: Uso de signals para gestión de estado reactiva
- **Feature Modules**: Organización por características (features)
- **Core/Shared Pattern**: Separación clara entre servicios core y componentes compartidos

### Código
- **TypeScript Strict Mode**: Tipado estricto habilitado
- **Interfaces**: Todas las estructuras de datos tienen interfaces definidas
- **Naming Conventions**: 
  - Componentes: `nombre.component.ts`
  - Servicios: `nombre.service.ts`
  - Modelos: `nombre.ts` (interfaces)
- **Single Responsibility**: Cada componente/servicio tiene una única responsabilidad
- **DRY (Don't Repeat Yourself)**: Reutilización de código mediante componentes compartidos

### Estilos
- **Utility-First**: Uso de clases de Tailwind CSS
- **Dark Mode**: Soporte nativo con `dark:` prefix
- **Responsive**: Mobile-first approach
- **BEM cuando sea necesario**: Para estilos personalizados complejos
- **CSS Scoping**: Estilos encapsulados por componente

### Performance
- **Lazy Loading**: Carga diferida de rutas
- **OnPush Change Detection**: Donde sea aplicable
- **TrackBy**: En todos los `@for` loops
- **Image Lazy Loading**: `loading="lazy"` en imágenes
- **Debounce**: En búsquedas y filtros

### Accesibilidad
- **Semantic HTML**: Uso de etiquetas semánticas
- **ARIA Labels**: Donde sea necesario
- **Keyboard Navigation**: Soporte completo
- **Color Contrast**: Cumple con WCAG 2.1

## 🧩 Componentes Principales

### Shared Components

#### `poster-card`
Card reutilizable para mostrar animes con poster, título, rating y fecha.

#### `star-rating`
Componente de rating con estrellas, soporta modo interactivo y solo lectura.

#### `neon-loader`
Loader animado con efecto neón para estados de carga.

#### `anime-carousel` / `episode-carousel`
Carruseles con navegación para mostrar listas de animes/episodios.

#### Filtros
- `search-input`: Búsqueda con debounce
- `genre-filter`: Selector múltiple de géneros
- `year-filter`: Selector de años
- `order-filter`: Ordenamiento de resultados

### Feature Components

#### `home`
Página principal con hero section y carruseles de contenido.

#### `directory`
Directorio completo con búsqueda, filtros y paginación.

#### `calendar`
Calendario semanal con cards flip y agrupación por fecha.

#### `anime-detail`
Vista detallada de un anime con toda su información.

#### `episode-watch`
Reproductor de episodios con controles personalizados.

## 🔌 API

### TMDB API
```typescript
// Discover animes
GET https://api.themoviedb.org/3/discover/tv
  ?api_key={key}
  &language=es-MX
  &with_genres=16
  &with_origin_country=JP

// Detalles de anime
GET https://api.themoviedb.org/3/tv/{id}
  ?api_key={key}
  &language=es-MX
```

### AnimeHack API
```typescript
// Slider de animes
GET https://animehack.net/wp-json/api/animes

// Top animes
GET https://animehack.net/wp-json/api/animes/tops

// Episodios recientes
GET https://animehack.net/wp-json/api/episodes/dropped
```

## 📝 Scripts Disponibles

```json
{
  "start": "ng serve",
  "build": "ng build",
  "build:prod": "ng build --configuration production",
  "watch": "ng build --watch --configuration development",
  "test": "ng test",
  "lint": "ng lint"
}
```

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está basado en [Anime Online - AnimeHack](https://animehack.net/). Todos los derechos reservados.

## 🙏 Agradecimientos

- [TMDB](https://www.themoviedb.org/) por su excelente API
- [AnimeHack](https://animehack.net/) por el contenido de anime
- [Angular Team](https://angular.dev/) por el increíble framework
- [Tailwind CSS](https://tailwindcss.com/) por el sistema de diseño

## 📞 Contacto

Para preguntas o sugerencias, por favor abre un issue en el repositorio.

---

Hecho con ❤️ y Angular
