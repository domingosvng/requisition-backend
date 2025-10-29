const { AppDataSource } = require('../dist/data-source');
const { ItemInventario } = require('../dist/entity/ItemInventario');

(async () => {
  try {
    await AppDataSource.initialize();
    console.log('Data source initialized');
    const repo = AppDataSource.getRepository(ItemInventario);
    const items = await repo.find();
    console.log('Found', items.length, 'items');
    const now = new Date();
    let updated = 0;
    for (const item of items) {
      let changed = false;
      if (item.categoria === null || item.categoria === undefined) { item.categoria = ''; changed = true; }
      if (item.unidadeMedida === null || item.unidadeMedida === undefined) { item.unidadeMedida = ''; changed = true; }
      if (item.localizacao === null || item.localizacao === undefined) { item.localizacao = ''; changed = true; }
      if (!item.dataEntrada) { item.dataEntrada = now; changed = true; }
      if (item.valorUnitario === null || item.valorUnitario === undefined) { item.valorUnitario = 0; changed = true; }
      if (!item.status) { item.status = 'ATIVO'; changed = true; }
      if (changed) {
        await repo.save(item);
        updated++;
        console.log('Updated item', item.id);
      }
    }
    console.log('Done. Updated', updated, 'items');
    await AppDataSource.destroy();
    process.exit(0);
  } catch (err) {
    console.error('Error', err);
    process.exit(1);
  }
})();
