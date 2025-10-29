import { AppDataSource } from '../src/data-source';
import { User } from '../src/entity/User';
import bcrypt from 'bcrypt';

async function main(){
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  let user = await userRepo.findOne({ where: { username: 'testadmin' } });
  if(!user){
    const hash = await bcrypt.hash('testadmin', 10);
    const newUser = userRepo.create({ username: 'testadmin', role: 'ADMIN', password_hash: hash } as any);
    await userRepo.save(newUser as any);
    console.log('Created testadmin with default password (testadmin)');
  } else {
    user.role = 'ADMIN';
    if (!user.password_hash) user.password_hash = await bcrypt.hash('testadmin', 10);
    await userRepo.save(user as any);
    console.log('Updated testadmin role to ADMIN and ensured password hash');
  }
  process.exit(0);
}

main().catch(err=>{ console.error(err); process.exit(1); });
