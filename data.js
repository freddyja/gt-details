// Prices: [small, midsize, large]
window.GT_SERVICES = [
  { id: "stage1", name: { en: "Stage 1 – Wash & Wax", es: "Paquete Etapa 1 – Lavado y Cera" }, prices: [105,125,145], mins: 150,
    desc: { en: "Designed for repeat clients and/or properly maintained vehicles.", es: "Diseñado para clientes frecuentes y/o vehículos bien mantenidos." },
    groups: [
      { t: "exterior", items: { en: ["2 bucket wash","Bug removal","Wheel cleaning","Spray wax","Windows","Tire dressing"], es: ["Lavado de 2 cubetas","Remoción de insectos","Limpieza de rines","Cera en spray","Ventanas","Abrillantado de llantas"] } },
      { t: "interior", items: { en: ["Interior wipe down","Dust & vacuum"], es: ["Limpieza interior de superficies","Desempolvado y aspirado"] } } ] },
  { id: "stage2", name: { en: "Stage 2 – Full Detail", es: "Paquete Etapa 2 – Detallado Completo" }, prices: [175,205,235], mins: 225,
    desc: { en: "Designed to restore interior/exterior condition & protect against future contamination. Recommended for new clients.", es: "Diseñado para restaurar el interior/exterior y proteger contra contaminación futura. Recomendado para clientes nuevos." },
    groups: [
      { t: "exterior", items: { en: ["2 bucket hand wash","Bug removal","Wheel cleaning","Iron fall-out removal","Engine bay wash","Windows","Tire dressing"], es: ["Lavado a mano de 2 cubetas","Remoción de insectos","Limpieza de rines","Remoción de partículas de hierro","Lavado del motor","Ventanas","Abrillantado de llantas"] } },
      { t: "interior", items: { en: ["Plastic wipe down","Vacuum","Headliner clean","Shampoo seats & carpet"], es: ["Limpieza de plásticos","Aspirado","Limpieza del techo interior","Champú de asientos y alfombra"] } } ] },
  { id: "extstd", name: { en: "Exterior Only – Standard", es: "Solo Exterior – Estándar" }, prices: [45,55,65], mins: 60, desc: null,
    groups: [ { t: "exterior", items: { en: ["2 bucket wash","Bug removal","Wheel cleaning","Spray wax","Windows","Tire dressing"], es: ["Lavado de 2 cubetas","Remoción de insectos","Limpieza de rines","Cera en spray","Ventanas","Abrillantado de llantas"] } } ] },
  { id: "extfull", name: { en: "Exterior Only – Full", es: "Solo Exterior – Completo" }, prices: [75,85,95], mins: 90, desc: null,
    groups: [ { t: "exterior", items: { en: ["2 bucket hand wash","Bug removal","Wheel cleaning","Iron fall-out removal","Engine bay wash","Windows","Tire dressing"], es: ["Lavado a mano de 2 cubetas","Remoción de insectos","Limpieza de rines","Remoción de partículas de hierro","Lavado del motor","Ventanas","Abrillantado de llantas"] } } ] },
  { id: "intstd", name: { en: "Interior Only – Standard", es: "Solo Interior – Estándar" }, prices: [75,90,105], mins: 75, desc: null,
    groups: [ { t: "interior", items: { en: ["Scrub & wipe down all surfaces","Dust & vacuum","Clean windows"], es: ["Tallado y limpieza de todas las superficies","Desempolvado y aspirado","Limpieza de ventanas"] } } ] },
  { id: "intfull", name: { en: "Interior Only – Full", es: "Solo Interior – Completo" }, prices: [125,145,165], mins: 120, desc: null,
    groups: [ { t: "interior", items: { en: ["Scrub & wipe down all surfaces","Dust & vacuum","Headliner gentle clean","Shampoo seats & carpet"], es: ["Tallado y limpieza de todas las superficies","Desempolvado y aspirado","Limpieza suave del techo interior","Champú de asientos y alfombra"] } } ] }
];
