const { AppDataSource } = require('../dist/data-source');
const { User } = require('../dist/entity/User');
const bcrypt = require('bcrypt');

async function main(){
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  let user = await userRepo.findOne({ where: { username: 'admin' } });
  if(!user){
    const hash = await bcrypt.hash('admin', 10);
    user = userRepo.create({ username: 'admin', role: 'ADMIN', password_hash: hash });
    await userRepo.save(user);
    console.log('Created admin user with password "admin" (please change)');
  } else {
    user.role = 'ADMIN';
    // ensure admin has a password hash
    if (!user.password_hash) {
      user.password_hash = await bcrypt.hash('admin', 10);
    }
    await userRepo.save(user);
    console.log('Updated admin role to ADMIN and ensured password hash');
  }
  process.exit(0);
}

main().catch(err=>{ console.error(err); process.exit(1); });
