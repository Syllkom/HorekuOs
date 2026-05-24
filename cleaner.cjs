const depcheck = require('depcheck');
const path = require('path');
const fs = require('fs');

const projectPath = process.cwd();

const options = {
  ignoreBinPackage: false,
  skipMissing: false,
  specials: [
    depcheck.special.eslint,
    depcheck.special.babel
  ],
};

console.log('🔍 Analizando dependencias del proyecto...\n');

depcheck(projectPath, options).then((unused) => {
  let clean = true;

  // Leer package.json para saber qué dependencias totales tienes declaradas
  const packageJsonPath = path.join(projectPath, 'package.json');
  let declaredDeps = [];
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    // Unir dependencias normales y de desarrollo si existen
    declaredDeps = [
      ...Object.keys(packageJson.dependencies || {}),
      ...Object.keys(packageJson.devDependencies || {})
    ];
  }

  // 1. DEPENDENCIAS QUE SÍ SE USAN
  // Filtramos las declaradas que NO están en las listas de no usadas
  const allUnused = new Set([...unused.dependencies, ...unused.devDependencies]);
  const usedDeps = declaredDeps.filter(dep => !allUnused.has(dep));

  if (usedDeps.length > 0) {
    console.log('✅ Dependencias que SÍ se están usando correctamente:');
    usedDeps.forEach(dep => console.log(`  - ${dep}`));
    console.log('');
  } else {
    console.log('ℹ️ No se detectaron dependencias declaradas en uso.\n');
  }

  // 2. Dependencias no utilizadas
  if (unused.dependencies.length > 0) {
    clean = false;
    console.log('❌ Dependencias declaradas en package.json que NO se usan:');
    unused.dependencies.forEach(dep => console.log(`  - ${dep}`));
    console.log('');
  }

  // 3. DevDependencies no utilizadas
  if (unused.devDependencies.length > 0) {
    clean = false;
    console.log('⚠️ DevDependencies declaradas que NO se usan:');
    unused.devDependencies.forEach(dep => console.log(`  - ${dep}`));
    console.log('');
  }

  // 4. Dependencias faltantes (Usadas pero no declaradas)
  const missingDeps = Object.keys(unused.missing);
  if (missingDeps.length > 0) {
    clean = false;
    console.log('🚨 ¡Cuidado! Dependencias usadas en el código pero FALTAN en package.json:');
    missingDeps.forEach(dep => {
      console.log(`  - ${dep} (usada en: ${unused.missing[dep].map(f => path.relative(projectPath, f)).join(', ')})`);
    });
    console.log('');
  }

  if (clean) {
    console.log('🚀 ¡Análisis completo! Todo el package.json está optimizado.');
  }
}).catch((err) => {
  console.error('❌ Error al analizar las dependencias:', err);
});
