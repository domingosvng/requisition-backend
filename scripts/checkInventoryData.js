const { AppDataSource } = require('../src/data-source.ts');
const { ItemInventario } = require('../src/entity/ItemInventario.ts');

async function checkInventoryData() {
    try {
        if (!AppDataSource.isInitialized) {
            await AppDataSource.initialize();
        }
        
        const itemRepository = AppDataSource.getRepository(ItemInventario);
        const items = await itemRepository.find();
        
        console.log(`Found ${items.length} inventory items:`);
        items.forEach(item => {
            console.log(`- ${item.id}: ${item.nome} (${item.quantidade} ${item.unidadeMedida})`);
        });
        
        if (items.length === 0) {
            console.log('No inventory items found. Creating a test item...');
            
            const testItem = itemRepository.create({
                nome: 'Test Item',
                descricao: 'A test inventory item',
                categoria: 'Consumíveis',
                quantidade: 10,
                unidadeMedida: 'un (unidade)',
                localizacao: 'Armazém A',
                status: 'ACTIVO',
                valorUnitario: 100
            });
            
            await itemRepository.save(testItem);
            console.log('Test item created successfully!');
        }
        
    } catch (error) {
        console.error('Error:', error);
    } finally {
        if (AppDataSource.isInitialized) {
            await AppDataSource.destroy();
        }
    }
}

checkInventoryData();