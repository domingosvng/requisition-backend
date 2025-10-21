const { AppDataSource } = require('../dist/data-source');
const { User } = require('../dist/entity/User');
const bcrypt = require('bcrypt');

async function main() {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  
  let user = await userRepo.findOne({ where: { username: 'testadmin' } });
  if (!user) {
    const hash = await bcrypt.hash('testadmin', 10);
    const newUser = userRepo.create({ username: 'testadmin', role: 'ADMIN', password_hash: hash });
    await userRepo.save(newUser);
    console.log('Created testadmin with default password (testadmin)');
  } else {
    user.role = 'ADMIN';
    if (!user.password_hash) user.password_hash = await bcrypt.hash('testadmin', 10);
    await userRepo.save(user);
    console.log('Updated testadmin role to ADMIN and ensured password hash');
  }
  
  await AppDataSource.destroy();
  process.exit(0);
}

main().catch(err => { console.error(err); process.exit(1); });
