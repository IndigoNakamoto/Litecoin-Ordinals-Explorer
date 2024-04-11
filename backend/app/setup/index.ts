//app/database/index.ts
// import sequelize from '../../config/database';
// import Inscription from '../models/Inscription';
import InscriptionsUpdateProgress from '../models/InscriptionsUpdateProgress';
import Invoice from '../models/Invoice';
// import User from '../models/User';
// import UserProfile from '../models/UserProfile';
// import UserSetting from '../models/UserSetting';

// Buggy imports below
// import PromoCode from '../models/PromoCode';
// import PromoCodeRedemption from '../models/PromoCodeRedemption';
// import Wallet from '../models/Wallet';
import WalletAccount from '../models/WalletAccount';


// Call sync on each model individually if you want to force their creation


// Inscription.sync()
//     .then(() => {
//         console.log('Inscription table created successfully');
//     })
//     .catch(err => {
//         console.error('Error creating Inscription table:', err);
//     });

// User.sync()
//     .then(() => {
//         console.log('User table created successfully');
//         UserProfile.sync()
//             .then(() => {
//                 console.log('UserProfile table created successfully');
//                 UserSetting.sync()
//                     .then(() => {
//                         console.log('UserSetting table created successfully');
//                     })
//                     .catch(err => {
//                         console.error('Error creating UserSetting table:');
//                     });
//             })
//             .catch(err => {
//                 console.error('Error creating UserProfile table:');
//             });
//     })
//     .catch(err => {
//         console.error('Error creating User table:');
//     });

Invoice.sync({ alter: true })
    .then(() => {
        console.log('Invoice table created successfully');
    })
    .catch(err => {
        console.error('Error creating InscriptionsUpdateProgress table:');
    });

InscriptionsUpdateProgress.sync({ alter: true })
    .then(() => {
        console.log('InscriptionsUpdateProgress table created successfully');
    })
    .catch(err => {
        console.error('Error creating InscriptionsUpdateProgress table:');
    });


// Wallet.sync({ alter: true })
//     .then(() => {
//         console.log('Wallet table created successfully');
//         WalletAccount.sync({ alter: true })
//             .then(() => {
//                 console.log('WalletAccount table created successfully');
//             })
//             .catch(err => {
//                 console.error('Error creating WalletAccount table:');
//             });
//     })
//     .catch(err => {
//         console.error('Error creating Wallet table:');
//     });

WalletAccount.sync({ alter: true })
    .then(() => {
        console.log('WalletAccount table created successfully');
    })
    .catch(err => {
        console.error('Error creating WalletAccount table:');
    });


// PromoCode.sync()
//     .then(() => {
//         console.log('PromoCode table created successfully');
//     })
//     .catch(err => {
//         console.error('Error creating PromoCode table:');
//     });

// PromoCodeRedemption.sync()
//     .then(() => {
//         console.log('PromoCodeRedemption table created successfully');
//     })
//     .catch(err => {
//         console.error('Error creating PromoCodeRedemption table:');
//     });

// Use sync method to create tables
// sequelize.sync()
//     .then(() => {
//         console.log('Tables created successfully');
//     })
//     .catch(err => {
//         console.error('Error creating tables:');
//     });
