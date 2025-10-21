import { AppDataSource } from '../src/data-source';
import { ItemInventario } from '../src/entity/ItemInventario';

/**
 * Script to update existing inventory items with missing fields.
 * This fills in empty or null values for categoria, unidadeMedida, and localizacao
 * with sensible defaults so items can be displayed properly in the frontend.
 */
async function updateInventoryFields() {
  try {
    await AppDataSource.initialize();
    console.log('Database connection established');

    const itemRepository = AppDataSource.getRepository(ItemInventario);
    const items = await itemRepository.find();

    console.log(`Found ${items.length} inventory items to check`);

    let updatedCount = 0;

    for (const item of items) {
      let needsUpdate = false;

      // Fill missing categoria
      if (!item.categoria || item.categoria.trim() === '') {
        item.categoria = 'Geral';
        needsUpdate = true;
      }

      // Fill missing unidadeMedida
      if (!item.unidadeMedida || item.unidadeMedida.trim() === '') {
        item.unidadeMedida = 'unidades';
        needsUpdate = true;
      }

      // Fill missing localizacao
      if (!item.localizacao || item.localizacao.trim() === '') {
        item.localizacao = 'Armazém Principal';
        needsUpdate = true;
      }

      // Fill missing descricao if null (but allow empty string)
      if (item.descricao === null) {
        item.descricao = '';
        needsUpdate = true;
      }

      // Ensure status is valid
      if (!item.status || item.status.trim() === '') {
        item.status = 'ATIVO';
        needsUpdate = true;
      }

      if (needsUpdate) {
        await itemRepository.save(item);
        updatedCount++;
        console.log(`Updated item ${item.id}: ${item.nome}`);
        console.log(`  - categoria: "${item.categoria}"`);
        console.log(`  - unidadeMedida: "${item.unidadeMedida}"`);
        console.log(`  - localizacao: "${item.localizacao}"`);
      }
    }

    console.log(`\nSuccessfully updated ${updatedCount} items`);
    
    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    console.error('Error updating inventory items:', error);
    process.exit(1);
  }
}

updateInventoryFields();
