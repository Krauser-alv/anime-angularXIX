module.exports = {
  content: [
    "./src/**/*.{html,ts}", // Incluye todos los archivos .html y .ts dentro de src/
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {},
  },
  plugins: [
    require('flowbite/plugin')
  ]
};
