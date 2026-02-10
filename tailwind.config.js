module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Incluye todos los archivos .html y .ts dentro de src/
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      animation: {
        bounce: 'bounce 1s infinite',
        pulse: 'pulse 1s infinite',
      },
      colors: {
        primary: "#fdcd44",   // Amarillo dorado (Botones y elementos llamativos)
        textSecondary: "#C4B7A6", // Beige grisáceo para texto secundario
        secondary: "#f05e7b", // Rosa coral (Acentos y hover en botones)
        accent: "#6c5b7b",    // Púrpura grisáceo (Fondos secundarios)
        background: "#2c2e3e", // Fondo oscuro general
        details: "#1b2021",      // Texto y detalles oscuros
      },
    },
  },
  plugins: [
    require('flowbite/plugin')
  ]
};
