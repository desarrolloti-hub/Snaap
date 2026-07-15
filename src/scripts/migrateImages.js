// src/scripts/migrateImages.js
import { storageService } from '../services/storageService.js';
import { userService } from '../services/userService.js';

// 🔥 Imágenes del carrusel a migrar
const imagenesCarrusel = [
  {
    id: 1,
    title: "Los XV de Rusi",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 2,
    title: "Boda Legendaria",
    url: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop"
  },
  {
    id: 3,
    title: "Fiesta Locura Total",
    url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=600&auto=format&fit=crop"
  }
];

export async function migrateImages() {
  console.log('🚀 Iniciando migración de imágenes...');
  
  if (!userService.isAuthenticated()) {
    console.log('🔑 Iniciando sesión como admin...');
    const loginResult = await userService.loginUsuario('admin123@gmail.com', 'Tuya5703');
    if (!loginResult.success) {
      console.error('❌ Error al iniciar sesión:', loginResult.error);
      return;
    }
    console.log('✅ Admin autenticado');
  }
  
  const user = userService.getCurrentUser();
  storageService.setUsuarioActual(user);
  
  console.log('📸 Migrando imágenes del carrusel...');
  
  const resultados = [];
  for (const img of imagenesCarrusel) {
    console.log(`⬆️ Migrando: ${img.title}...`);
    const result = await storageService.migrarImagenDesdeUrl(
      img.url,
      'carrusel',
      `carrusel_${img.id}_${img.title.replace(/\s/g, '_')}`
    );
    
    resultados.push({
      ...img,
      success: result.success,
      nuevaUrl: result.url || null,
      path: result.path || null,
      error: result.error || null
    });
    
    if (result.success) {
      console.log(`✅ ${img.title} migrado correctamente`);
    } else {
      console.log(`❌ Error al migrar ${img.title}:`, result.error);
    }
  }
  
  console.log('\n📊 RESUMEN DE MIGRACIÓN:');
  console.log('=====================================');
  const exitosos = resultados.filter(r => r.success);
  const fallidos = resultados.filter(r => !r.success);
  console.log(`✅ Exitosos: ${exitosos.length}`);
  console.log(`❌ Fallidos: ${fallidos.length}`);
  
  return resultados;
}

if (import.meta.url === document.baseURI) {
  migrateImages();
}