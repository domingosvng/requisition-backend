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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const data_source_1 = require("../src/data-source");
const User_1 = require("../src/entity/User");
const bcrypt_1 = __importDefault(require("bcrypt"));
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        yield data_source_1.AppDataSource.initialize();
        const userRepo = data_source_1.AppDataSource.getRepository(User_1.User);
        let user = yield userRepo.findOne({ where: { username: 'testadmin' } });
        if (!user) {
            const hash = yield bcrypt_1.default.hash('testadmin', 10);
            const newUser = userRepo.create({ username: 'testadmin', role: 'ADMIN', password_hash: hash });
            yield userRepo.save(newUser);
            console.log('Created testadmin with default password (testadmin)');
        }
        else {
            user.role = 'ADMIN';
            if (!user.password_hash)
                user.password_hash = yield bcrypt_1.default.hash('testadmin', 10);
            yield userRepo.save(user);
            console.log('Updated testadmin role to ADMIN and ensured password hash');
        }
        process.exit(0);
    });
}
main().catch(err => { console.error(err); process.exit(1); });
