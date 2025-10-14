import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

async function main(){
  try{
    await AppDataSource.initialize();
    const userRepo = AppDataSource.getRepository(User);
    const users = await userRepo.find();
    if(!users.length){
      console.log('No users found in the database.');
    } else {
      console.log(`Found ${users.length} users:`);
      for(const u of users){
        console.log({ id: u.id, username: u.username, role: u.role, passwordHashPreview: (u.password_hash ? (u.password_hash.length>10 ? u.password_hash.slice(0,10)+"..." : u.password_hash) : null) });
      }
    }
    await AppDataSource.destroy();
  }catch(err){
    console.error('Error querying users:', err);
    process.exit(1);
  }
}

main();
