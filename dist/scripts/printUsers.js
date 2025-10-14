"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../data-source");
const User_1 = require("../entity/User");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield data_source_1.AppDataSource.initialize();
            const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
            const users = yield userRepo.find();
            if (!users.length) {
                console.log('No users found in the database.');
            }
            else {
                console.log(`Found ${users.length} users:`);
                for (const u of users) {
                    console.log({ id: u.id, username: u.username, role: u.role, passwordHashPreview: (u.password_hash ? (u.password_hash.length > 10 ? u.password_hash.slice(0, 10) + "..." : u.password_hash) : null) });
                }
            }
            yield data_source_1.AppDataSource.destroy();
        }
        catch (err) {
            console.error('Error querying users:', err);
            process.exit(1);
        }
    });
}
main();
